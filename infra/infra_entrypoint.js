const dotenv = require('dotenv');
const user_model_v5 = require('../models/user_model_v5.js');
const utils = require('./utils.js');
const galeforce_calls = require('./galeforce_calls.js');

dotenv.config();

async function create_summoner_entry(
  puuid,
  region,
  champ_dict,
  last_game_timestamp = null
) {
  /**
   * Given unique account information and the champion dictionary for the current patch, returns a db entry of
   * per champion data, recent games, etc. last_game_timestamp is optional paramater - if provided, this will
   * search games only after this timestamp
   */
  const account_args = [puuid, region];
  let last_processed_game_timestamp;

  try {
    last_processed_game_timestamp = await galeforce_calls.get_last_processed_game_timestamp(
      puuid,
      region
    );
    console.log('timestamp in args', last_game_timestamp);
    console.log('last processed game timestamp', last_game_timestamp);
  } catch (error) {
    throw new utils.SummonerHasNoGamesError(
      `User ${puuid} in ${region} has no ARAM games played.`
    );
  }
  const recent_matches = await galeforce_calls.get_ten_recent_matches(
    puuid,
    region,
    champ_dict,
  );
  const icon_id = await utils.retry_async_function(
    galeforce_calls.get_icon_id,
    account_args
  );
  let aggregate_stats;
  if (last_game_timestamp === null) {
    // new user
    aggregate_stats = await create_or_update_user(puuid, region, champ_dict);
  } else {
    // existing user
    aggregate_stats = await create_or_update_user(
      puuid,
      region,
      champ_dict,
      last_game_timestamp
    );
  }
  const per_champion_data = utils.convert_aggregate_stats_to_list(
    aggregate_stats
  );
  const db_entry = {};
  db_entry.puuid = puuid;
  db_entry.last_processed_game_timestamp_ms = last_processed_game_timestamp;
  db_entry.per_champion_data = per_champion_data;
  db_entry.recent_games = recent_matches;
  db_entry.icon_id = icon_id;

  return db_entry;
}

async function create_or_update_user(
  puuid,
  region,
  champ_dict,
  last_game_timestamp = null
) {
  /**
   * returns aggregate winrate data for all champs for new user for all games if last_game_timestamp is null
   * if timestamp is provided, only provides aggregate champ data for games after this timestamp
   */
  let matchlist_to_add;
  if (last_game_timestamp === null) {
    matchlist_to_add = await get_full_matchlist(puuid, region);
  } else {
    console.log('updating from last_game_timestamp', last_game_timestamp);
    matchlist_to_add = await get_full_matchlist(
      puuid,
      region,
      last_game_timestamp + 1
    );
  }
  return convert_matchlist_to_aggregate_champ_data(
    matchlist_to_add,
    puuid,
    champ_dict,
    region,
  );
}

async function convert_matchlist_to_aggregate_champ_data(
  full_matchlist,
  puuid,
  champ_dict,
  region,
) {
  /**
   * Data manipulation function that converts a raw list of matchlists (returned from Riot API) to aggregate per champion
   * data in the form that we want to store
   */
  const match_infos_must_await = [];
  for (let i = 0; i < full_matchlist.length; i++) {
    const matchlist = full_matchlist[i];
    for (let j = 0; j < matchlist.length; j++) {
      const match_id = matchlist[j].metadata.matchId;
      const platform_id = matchlist[j].info.platformId;
      // ISSUE with users who have transferred regions - platform_id and region may not be the same - need to query platform_id instead of region in this case
      const match_args = [match_id, platform_id, puuid, region];
      const match_info = utils.retry_async_function(
        galeforce_calls.get_match_info,
        match_args
      );
      match_infos_must_await.push(match_info);
    }
  }
  let match_infos = await Promise.all(match_infos_must_await);
  // filter out the notinmatcherror returns
  match_infos = match_infos.filter((match_info) => !(match_info instanceof utils.SummonerNotInMatchError));
  const aggregate = utils.get_aggregate_stats_from_match_infos(
    match_infos,
    champ_dict
  );
  return aggregate;
}

async function get_full_matchlist(puuid, region, start_timestamp = 0) {
  /**
   * Calls Riot's API for matchlists 100 at a time in order to get a full list of matchlists for this player starting from start_timestamp
   * full_matchlist is a list of matchlist objects returned by Riot API, which are themselves lists of matches, so is a nested list
   * This function awaits in a for loop, but this is actually what we want - there is no way to tell how many games an account has, as
   * the field total_games is currently busted from Riot API.
   */

  // Riot did some weird stuff with timestamps lol
  // Riot's hardcoded 1623975046 timestamp is in seconds BUT the timestamps returned from each matchlist match gameinfo are in milliseconds.
  // Additionally, when querying by startTime, seconds is required.
  // This means that we need to divide our stored timestamps by 1000.
  // Further note that this startTime queries against matchInfo.gameEndTimestamp

  const adjusted_start_timestamp = Math.max(Math.ceil(start_timestamp / 1000), 1623975046);
  console.log('start timestamp in full matchlist', start_timestamp);

  const full_matchlist = [];
  let start_index = 0;
  const num_matches = 100;
  let matchlist;
  do {
    const args = [
      puuid,
      region,
      start_index,
      num_matches,
      adjusted_start_timestamp,
    ];
    matchlist = await utils.retry_async_function(
      galeforce_calls.get_subsection_matchlist,
      args
    );
    if (matchlist.length > 0) {
      full_matchlist.push(matchlist);
    }
    start_index += 100;
  } while (matchlist.length === 100);
  return full_matchlist;
}

async function processUser(unsanitized_username, region, existing_user_data = null) {
  /**
   * Main entrypoint function from backendapirouter.js. Does a full summoner process for username in region
   * If existing_user_data is supplied from backend, this will only process new games after the last processed timestamp
   */
  let timestamp = null;
  if (existing_user_data !== null) {
    // need to set timestamp and update user instead of creating new
    timestamp = existing_user_data.last_processed_game_timestamp_ms;
  }
  let db_entry;
  let puuid;
  let name;
  try {
    // https://stackoverflow.com/questions/35576307/declaration-or-statement-expected-javascript-typescript/51547129
    ({ puuid, name } = await galeforce_calls.get_summoner_from_name(unsanitized_username, region));
  } catch (error) {
    return utils.ERRORS.SUMMONER_DOES_NOT_EXIST;
  }
  try {
    const champ_dict = await galeforce_calls.get_champ_dict();
    db_entry = await create_summoner_entry(
      puuid,
      region,
      champ_dict,
      timestamp
    );
  } catch (error) {
    if (error instanceof utils.SummonerDoesNotExistError) {
      utils.sendErrorLog(
        puuid,
        region,
        utils.ERRORS.SUMMONER_DOES_NOT_EXIST,
        error
      );
      return utils.ERRORS.SUMMONER_DOES_NOT_EXIST;
    } if (error instanceof utils.SummonerHasNoGamesError) {
      utils.sendErrorLog(
        puuid,
        region,
        utils.ERRORS.SUMMONER_HAS_NO_GAMES,
        error
      );
      return utils.ERRORS.SUMMONER_HAS_NO_GAMES;
    } if (error instanceof utils.SummonerNotInMatchError) {
      utils.sendErrorLog(
        puuid,
        region,
        utils.ERRORS.SUMMONER_NOT_IN_MATCH,
        error
      );
      return utils.ERRORS.SUMMONER_NOT_IN_MATCH;
    } if (error instanceof utils.RetryAsyncFunctionError) {
      utils.sendErrorLog(
        puuid,
        region,
        utils.ERRORS.RETRY_ASYNC_FUNCTION,
        error
      );
      return utils.ERRORS.RETRY_ASYNC_FUNCTION;
    }
    utils.sendErrorLog(puuid, region, utils.ERRORS.UNKNOWN, error);
    throw error;
  }

  db_entry.last_updated_timestamp_ms = Date.now();
  if (existing_user_data === null) {
    // new entry
    const filter = {
      puuid: db_entry.puuid,
    };
    await user_model_v5.findOneAndUpdate(filter, db_entry, {
      new: true,
      upsert: true,
    });
    console.log(`finished creating new ${puuid}`);
    db_entry.true_summoner_name = name;
    return db_entry;
  }
  // update
  const updated_db_entry = utils.get_updated_user_data_with_delta(
    existing_user_data,
    db_entry
  );
  const filter = {
    puuid: updated_db_entry.puuid,
  };
  await user_model_v5.findOneAndUpdate(filter, updated_db_entry, {
    new: true,
    upsert: true,
  });
  console.log(`finished updating ${puuid}`);
  updated_db_entry.true_summoner_name = name;
  return updated_db_entry;
}

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

const getLiveGame = async (username, region) => {
  console.log('live game infra');
  const account_args = [username, region];
  try {
    sum_id = await utils.retry_async_function(
      galeforce_calls.get_summoner_id,
      account_args
    );
  } catch (error) {
    return null;
  }
  try {
    players = await utils.retry_async_function(galeforce_calls.get_live_game, [
      sum_id,
    ]);
  } catch (error) {
    // no aram live game found
    return null;
  }
  return players;
};

module.exports = { processUser, getLiveGame, multifetchMongoDataForLiveGame };
