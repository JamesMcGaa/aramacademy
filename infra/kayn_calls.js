const { Kayn, REGIONS } = require('kayn');
const { ViewArrayRounded } = require('@material-ui/icons');
const kayn = Kayn(process.env.RIOT_API_KEY)({
  requestOptions: {
    shouldRetry: true,
    numberOfRetriesBeforeAbort: 3,
    delayBeforeRetry: 500,
    burst: false,
    shouldExitOn403: false,
  },
});
const utils = require('./utils.js');

async function get_champ_dict() {
  //gets a dictionary mapping champ_id -> champ name, e.g. 420 -> taric or whatever taric's number is
  payload = await kayn.DDragon.Champion.listFull();
  champ_list = payload.data;
  champ_dict = {};
  for (champ in champ_list) {
    champ_dict[champ_list[champ].key] = champ;
  }
  return champ_dict;
}

async function get_account_id(username, region) {
  //gets account_id from username
  const account_id = await kayn.Summoner.by
    .name(username)
    .region(region)
    .then((summoner) => {
      return summoner.accountId;
    });
  return account_id;
}

async function get_true_summoner_name(username, region) {
  //gets account_id from username
  const true_summoner_name = await kayn.Summoner.by
    .name(username)
    .region(region)
    .then((summoner) => {
      return summoner.name;
    });
  return true_summoner_name;
}

async function get_last_processed_game_timestamp(account_id, region) {
  //gets last processed game timestamp for this account
  const matchlist = await kayn.Matchlist.by
    .accountID(account_id)
    .region(region)
    .query({
      queue: [utils.ARAM],
      beginIndex: 0,
      endIndex: 1,
    })
    .then((matchlist) => {
      return matchlist;
    });
  if (matchlist.matches.length === 0) {
    return null;
  }
  const timestamp = matchlist.matches[0].timestamp;
  return timestamp;
}
async function get_icon_id(username, region) {
  const icon_id = await kayn.Summoner.by
    .name(username)
    .region(region)
    .then((summoner) => {
      return summoner.profileIconId;
    });
  return icon_id;
}

async function get_recent_matches(account_id, region, champ_dict, username) {
  //Gets most recent 10 games - just champ, KDA
  const start_index = 0;
  const num_matches = 10;
  const args = [account_id, region, start_index, num_matches, 0];
  matchlist = await utils.retry_async_function(get_subsection_matchlist, args);
  let match_infos_must_await = [];
  let recent_matches = [];
  for (let j = 0; j < matchlist.matches.length; j++) {
    let match_id = matchlist.matches[j].gameId;
    let platform_id = matchlist.matches[j].platformId;
    const match_args = [match_id, platform_id, account_id, region, username];
    const match_info_must_await = utils.retry_async_function(
      get_match_info,
      match_args
    );
    match_infos_must_await.push(match_info_must_await);
  }
  let match_infos = await Promise.all(match_infos_must_await);
  match_infos = match_infos.filter((match_info) => {
    return !(match_info instanceof utils.SummonerNotInMatchError);
  });
  for (let i = 0; i < match_infos.length; i++) {
    let match_info = match_infos[i];
    let match_entry = {};
    match_entry['champion'] = champ_dict[match_info['champ']];
    match_entry['win'] = match_info['win'];
    match_entry['kills'] = match_info['kills'];
    match_entry['deaths'] = match_info['deaths'];
    match_entry['assists'] = match_info['assists'];
    recent_matches.push(match_entry);
  }
  return recent_matches;
}
async function get_subsection_matchlist(
  account_id,
  region,
  start_index,
  num_matches = 100,
  start_timestamp
) {
  //Riot api only allows up to 100 matches to be returned at a time, so this function is recursively called on groups
  //of 100 matches to get the full desired matchlist. see get_full_matchlist for additional comment
  const matchlist = await kayn.Matchlist.by
    .accountID(account_id)
    .region(region)
    .query({
      queue: [utils.ARAM],
      beginIndex: start_index,
      endIndex: start_index + num_matches,
      beginTime: start_timestamp,
    })
    .then((matchlist) => {
      console.log(
        'found',
        matchlist.startIndex,
        ' to ',
        matchlist.endIndex,
        'matches'
      );
      return matchlist;
    })
    .catch((error) => {
      //the reason this is here is because when we ask riot api
      //for a matchlist with a timestamp that is too large (i.e. this player has no games since then)
      //riot api returns a 404 error specifically. This deals with it.
      if (error.statusCode === 404) {
        const matchlist = { matches: [] };
        return matchlist;
      }
      throw error;
    });
  return matchlist;
}

async function get_match_info(
  match_id,
  platform_id,
  account_id,
  region,
  username
) {
  //return dictionary of win, kills, deaths, assists, cs, etc for this match and this participant player
  //if account_id is not a participant in this match, throws error
  let query_region = region;
  if (utils.PLATFORM_ID_TO_REGION[platform_id] !== region) {
    //console.log('for match_id', match_id, 'account_id', account_id, 'played in ', platform_id, 'but his current region is ', region);
    query_region = utils.PLATFORM_ID_TO_REGION[platform_id];
  }
  return await kayn.Match.get(match_id)
    .region(query_region)
    .then((match) => {
      const participant_identities = match['participantIdentities'];

      let desired_id = null;
      for (i = 0; i < participant_identities.length; i++) {
        participant = participant_identities[i];
        if (
          participant['player']['accountId'] === account_id ||
          participant['player']['currentAccountId'] === account_id ||
          participant['player']['summonerName'].toLowerCase() ===
            username.toLowerCase() //checking lowercased username as well in case
        ) {
          desired_id = participant['participantId'];
        }
      }
      if (desired_id === null) {
        //Edge case: goodend4 in EUW1 played a few games in NA. Then he swapped to EUW1 (and got a new accountId). After he swapped,
        //his accountID was taken by a new NA player named Senná. When we query based on accountId, Senna games
        //come up. For now, when we do not find the desired participant, we just return an empty match info obj

        let error = new utils.SummonerNotInMatchError(
          'The match ' +
            match_id +
            ' does not contain the user ' +
            username +
            ' with account_id ' +
            account_id +
            ' as a participant. query_region is' +
            query_region
        );
        rand = Math.random();
        if (rand > 0.995) {
          //Logging 1/200
          utils.sendErrorLog(
            username,
            region,
            utils.ERRORS.SUMMONER_NOT_IN_MATCH,
            error
          );
        }
        return error;
      }
      const participants = match['participants'];
      let desired_participant;
      for (i = 0; i < participants.length; i++) {
        if (participants[i]['participantId'] === desired_id) {
          desired_participant = participants[i];
        }
      }
      const match_stats = desired_participant['stats'];
      let match_info = {};

      champ_id = desired_participant['championId'];
      match_info['champ'] = champ_id;
      match_info['duration'] = match['gameDuration'];
      match_info['win'] = match_stats['win'];
      match_info['kills'] = match_stats['kills'];
      match_info['deaths'] = match_stats['deaths'];
      match_info['assists'] = match_stats['assists'];
      match_info['cs'] = match_stats['totalMinionsKilled'];
      match_info['gold'] = match_stats['goldEarned'];
      match_info['obj_dmg'] = match_stats['damageDealtToObjectives'];
      match_info['dmg_dealt'] = match_stats['totalDamageDealtToChampions'];
      match_info['dmg_taken'] = match_stats['totalDamageTaken'];
      match_info['pentakills'] = match_stats['pentaKills'];
      match_info_return = match_info;
      return match_info;
    });
}

module.exports = {
  get_champ_dict,
  get_account_id,
  get_true_summoner_name,
  get_last_processed_game_timestamp,
  get_icon_id,
  get_subsection_matchlist,
  get_match_info,
  get_recent_matches,
};
