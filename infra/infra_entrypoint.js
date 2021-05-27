const user_model = require('../models/user_model.js');
const utils = require('./utils.js');
const kayn_calls = require('./kayn_calls.js');

const dotenv = require('dotenv');
dotenv.config();

async function create_summoner_entry(
  username,
  region,
  champ_dict,
  last_game_timestamp = null
) {
  /**
   * Given unique account information and the champion dictionary for the current patch, returns a db entry of
   * per champion data, recent games, etc. last_game_timestamp is optional paramater - if provided, this will
   * search games only after this timestamp
   */
  const account_args = [username, region];
  let account_id;
  let true_summoner_name;
  let last_processed_game_timestamp;
  try {
    account_id = await utils.retry_async_function(
      kayn_calls.get_account_id,
      account_args
    );
    true_summoner_name = await utils.retry_async_function(
      kayn_calls.get_true_summoner_name,
      account_args
    );
  } catch (error) {
    throw new utils.SummonerDoesNotExistError(
      'User ' + username + ' does not exist in ' + region
    );
  }

  try {
    const timestamp_args = [account_id, region];
    last_processed_game_timestamp = await utils.retry_async_function(
      kayn_calls.get_last_processed_game_timestamp,
      timestamp_args
    );
  } catch (error) {
    throw new utils.SummonerHasNoGamesError(
      'User ' + username + ' in ' + region + ' has no ARAM games played.'
    );
  }
  const recent_matches = await kayn_calls.get_recent_matches(
    account_id,
    region,
    champ_dict,
    username
  );
  const icon_id = await utils.retry_async_function(
    kayn_calls.get_icon_id,
    account_args
  );
  let aggregate_stats;
  if (last_game_timestamp === null) {
    //new user
    aggregate_stats = await create_or_update_user(username, region, champ_dict);
  } else {
    //existing user
    aggregate_stats = await create_or_update_user(
      username,
      region,
      champ_dict,
      last_game_timestamp
    );
  }
  const per_champion_data = utils.convert_aggregate_stats_to_list(
    aggregate_stats
  );
  let db_entry = {};
  db_entry['accountId'] = account_id;
  db_entry['true_summoner_name'] = true_summoner_name;
  db_entry['last_processed_game_timestamp_ms'] = last_processed_game_timestamp;
  db_entry['per_champion_data'] = per_champion_data;
  db_entry['recent_games'] = recent_matches;
  db_entry['icon_id'] = icon_id;

  return db_entry;
}

async function create_or_update_user(
  username,
  region,
  champ_dict,
  last_game_timestamp = null
) {
  /**
   * returns aggregate winrate data for all champs for new user for all games if last_game_timestamp is null
   * if timestamp is provided, only provides aggregate champ data for games after this timestamp
   */

  const account_args = [username, region];
  let account_id;
  try {
    account_id = await utils.retry_async_function(
      kayn_calls.get_account_id,
      account_args
    );
  } catch (error) {
    throw new utils.SummonerDoesNotExistError(
      'User ' + username + ' does not exist in ' + region
    );
  }
  let matchlist_to_add;
  if (last_game_timestamp === null) {
    matchlist_to_add = await get_full_matchlist(account_id, region);
  } else {
    matchlist_to_add = await get_full_matchlist(
      account_id,
      region,
      last_game_timestamp + 1
    );
  }
  return await convert_matchlist_to_aggregate_champ_data(
    matchlist_to_add,
    account_id,
    champ_dict,
    region,
    username
  );
}

async function convert_matchlist_to_aggregate_champ_data(
  full_matchlist,
  account_id,
  champ_dict,
  region,
  username
) {
  /**
   * Data manipulation function that converts a raw list of matchlists (returned from Riot API) to aggregate per champion
   * data in the form that we want to store
   */
  let match_infos_must_await = [];
  for (let i = 0; i < full_matchlist.length; i++) {
    matchlist = full_matchlist[i];
    for (let j = 0; j < matchlist.matches.length; j++) {
      match_id = matchlist.matches[j].gameId;
      platform_id = matchlist.matches[j].platformId;
      //ISSUE with users who have transferred regions - platform_id and region may not be the same - need to query platform_id instead of region in this case
      const match_args = [match_id, platform_id, account_id, region, username];

      const match_info = utils.retry_async_function(
        kayn_calls.get_match_info,
        match_args
      );
      match_infos_must_await.push(match_info);
    }
  }
  let match_infos = await Promise.all(match_infos_must_await);
  //filter out the notinmatcherror returns
  match_infos = match_infos.filter((match_info) => {
    return !(match_info instanceof utils.SummonerNotInMatchError);
  });
  const aggregate = utils.get_aggregate_stats_from_match_infos(
    match_infos,
    champ_dict
  );
  return aggregate;
}

async function get_full_matchlist(account_id, region, start_timestamp = 0) {
  /**
   * Calls Riot's API for matchlists 100 at a time in order to get a full list of matchlists for this player starting from start_timestamp
   * full_matchlist is a list of matchlist objects returned by Riot API, which are themselves lists of matches, so is a nested list
   * This function awaits in a for loop, but this is actually what we want - there is no way to tell how many games an account has, as
   * the field total_games is currently busted from Riot API.
   */
  let full_matchlist = [];
  let start_index = 0;
  const num_matches = 100;
  let matchlist;
  do {
    const args = [
      account_id,
      region,
      start_index,
      num_matches,
      start_timestamp,
    ];
    matchlist = await utils.retry_async_function(
      kayn_calls.get_subsection_matchlist,
      args
    );
    if (matchlist.matches.length > 0) {
      full_matchlist.push(matchlist);
    }
    start_index += 100;
  } while (matchlist.matches.length === 100);
  return full_matchlist;
}

let processUser = async (username, region, existing_user_data = null) => {
  /**
   * Main entrypoint function from backendapirouter.js. Does a full summoner process for username in region
   * If existing_user_data is supplied from backend, this will only process new games after the last processed timestamp
   */
  let timestamp = null;
  let log_usecase = utils.LOGGING.CREATE;
  if (existing_user_data !== null) {
    //need to set timestamp and update user instead of creating new
    timestamp = existing_user_data.last_processed_game_timestamp_ms;
    log_usecase = utils.LOGGING.UPDATE;
    console.log('last processed game timestamp is ' + timestamp);
  }
  let db_entry;
  try {
    const champ_dict = await utils.retry_async_function(
      kayn_calls.get_champ_dict,
      []
    );
    db_entry = await create_summoner_entry(
      username,
      region,
      champ_dict,
      timestamp
    );
  } catch (error) {
    if (error instanceof utils.SummonerDoesNotExistError) {
      utils.sendErrorLog(
        username,
        region,
        utils.ERRORS.SUMMONER_DOES_NOT_EXIST,
        error
      );
      return utils.ERRORS.SUMMONER_DOES_NOT_EXIST;
    } else if (error instanceof utils.SummonerHasNoGamesError) {
      utils.sendErrorLog(
        username,
        region,
        utils.ERRORS.SUMMONER_HAS_NO_GAMES,
        error
      );
      return utils.ERRORS.SUMMONER_HAS_NO_GAMES;
    } else if (error instanceof utils.SummonerNotInMatchError) {
      utils.sendErrorLog(
        username,
        region,
        utils.ERRORS.SUMMONER_NOT_IN_MATCH,
        error
      );
      return utils.ERRORS.SUMMONER_NOT_IN_MATCH;
    } else if (error instanceof utils.RetryAsyncFunctionError) {
      utils.sendErrorLog(
        username,
        region,
        utils.ERRORS.RETRY_ASYNC_FUNCTION,
        error
      );
      return utils.ERRORS.RETRY_ASYNC_FUNCTION;
    } else {
      utils.sendErrorLog(username, region, utils.ERRORS.UNKNOWN, error);
      throw error;
    }
  }

  db_entry.last_updated_timestamp_ms = Date.now();
  db_entry.standardized_summoner_name = username.toLowerCase();
  db_entry.region = region;
  if (existing_user_data === null) {
    //new entry
    const filter = {
      standardized_summoner_name: db_entry.standardized_summoner_name,
      region: db_entry.region,
    };
    let doc = await user_model.findOneAndUpdate(filter, db_entry, {
      new: true,
      upsert: true,
    });
    console.log('finished creating new ' + username);
    return db_entry;
  } else {
    //update
    const updated_db_entry = utils.get_updated_user_data_with_delta(
      existing_user_data,
      db_entry
    );
    const filter = {
      standardized_summoner_name: updated_db_entry.standardized_summoner_name,
      region: updated_db_entry.region,
    };
    let doc = await user_model.findOneAndUpdate(filter, updated_db_entry, {
      new: true,
      upsert: true,
    });
    console.log('finished updating ' + username);
    return updated_db_entry;
  }
};

async function multifetchMongoDataForLiveGame(
  standardized_summoner_names_array,
  region
) {
  /**
   * Takes a list of standardized summoner names and returns a mapping of {true_summoner_name: per_champion_data}
   * Summoners not appearing in our data will not appear as a key in the returned object
   */
  const records = await user_model
    .find()
    .where('region')
    .equals(region)
    .where('standardized_summoner_name')
    .in(standardized_summoner_names_array)
    .exec();
  const results = {};
  records.map(
    (record) => (results[record.true_summoner_name] = record.per_champion_data)
  );
  return records;
}

let getLiveGame = async (username, region) => {
  console.log('live game infra');
  let account_args = [username, region];
  try {
    sum_id = await utils.retry_async_function(
      kayn_calls.get_summoner_id,
      account_args
    );
  } catch (error) {
    return null;
  }
  try {
    players = await utils.retry_async_function(kayn_calls.get_live_game, [
      sum_id,
    ]);
  } catch (error) {
    //no aram live game found
    return null;
  }
  return players;
};

module.exports = { processUser, getLiveGame, multifetchMongoDataForLiveGame };
