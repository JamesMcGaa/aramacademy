const GaleForceModule = require('galeforce');
const utils = require('./utils.js');
const dotenv = require('dotenv').config();
const fetch = require('node-fetch');
const AbortController = require('abort-controller');

const REQUEST_TIMEOUT_EXTERNAL_FETCH_MS = 15000;

const galeforce = new GaleForceModule('infra/galeforce_config.yaml');

const PLATFORM_ID_TO_GALEFORCE_REGION = Object.freeze({
  EUW1: galeforce.region.lol.EUROPE_WEST,
  NA1: galeforce.region.lol.NORTH_AMERICA,
  BR1: galeforce.region.lol.BRAZIL,
  EUN1: galeforce.region.lol.EUROPE_NORTHEAST,
  LA1: galeforce.region.lol.LATIN_AMERICA_NORTH,
  LA2: galeforce.region.lol.LATIN_AMERICA_SOUTH,
  OC1: galeforce.region.lol.OCEANIA,
  RU: galeforce.region.lol.RUSSIA,
  TR1: galeforce.region.lol.TURKEY,
  JP1: galeforce.region.lol.JAPAN,
  KR: galeforce.region.lol.KOREA,
});

const DB_REGION_TO_GALEFORCE_LEAGUE_REGION = Object.freeze({
  euw: galeforce.region.lol.EUROPE_WEST,
  na: galeforce.region.lol.NORTH_AMERICA,
  br: galeforce.region.lol.BRAZIL,
  eune: galeforce.region.lol.EUROPE_NORTHEAST,
  lan: galeforce.region.lol.LATIN_AMERICA_NORTH,
  las: galeforce.region.lol.LATIN_AMERICA_SOUTH,
  oce: galeforce.region.lol.OCEANIA,
  ru: galeforce.region.lol.RUSSIA,
  tr: galeforce.region.lol.TURKEY,
  jp: galeforce.region.lol.JAPAN,
  kr: galeforce.region.lol.KOREA,
});

const DB_REGION_TO_GALEFORCE_RIOT_REGION = Object.freeze({
  euw: galeforce.region.riot.EUROPE,
  na: galeforce.region.riot.AMERICAS,
  br: galeforce.region.riot.AMERICAS,
  eune: galeforce.region.riot.EUROPE,
  lan: galeforce.region.riot.AMERICAS,
  las: galeforce.region.riot.AMERICAS,
  oce: galeforce.region.riot.AMERICAS,
  ru: galeforce.region.riot.EUROPE,
  tr: galeforce.region.riot.EUROPE,
  jp: galeforce.region.riot.ASIA,
  kr: galeforce.region.riot.ASIA,
});

// Return summoner dto
async function get_summoner_from_name(summoner_name, region) {
  return galeforce.lol
    .summoner()
    .region(DB_REGION_TO_GALEFORCE_LEAGUE_REGION[region])
    .name(summoner_name)
    .exec();
}

// Return summoner dto
async function get_summoner_from_id(account_id, region) {
  return galeforce.lol
    .summoner()
    .region(DB_REGION_TO_GALEFORCE_LEAGUE_REGION[region])
    .accountId(account_id)
    .exec();
}

// Return puuid from account_id + region
async function get_puuid(account_id, region) {
  return get_summoner_from_id(account_id, region).then((res) => {
    return res.puuid;
  });
}

// Return accountId from name + region
async function get_account_id(summoner_name, region) {
  return get_summoner_from_name(summoner_name, region).then((res) => {
    return res.accountId;
  });
}

// Return formatted summoner name from name + region
async function get_true_summoner_name(summoner_name, region) {
  return get_summoner_from_name(summoner_name, region).then((res) => {
    return res.name;
  });
}

async function get_icon_id(summoner_name, region) {
  return get_summoner_from_name(summoner_name, region).then((res) => {
    return res.profileIconId;
  });
}

// Return list of matchids
async function get_recent_matches(account_id, region, begin_time_unix) {
  const puuid = await get_puuid(account_id, region);
  return galeforce.lol.match
    .list()
    .region(DB_REGION_TO_GALEFORCE_LEAGUE_REGION[region])
    .puuid(puuid)
    .query({
      queue: 450,
      count: 10,
    })
    .exec();
}

async function get_match_list(
  account_id,
  region,
  start,
  count,
  start_timestamp
) {
  const puuid = await get_puuid(account_id, region);

  const result = await galeforce.lol.match
    .list()
    .region(DB_REGION_TO_GALEFORCE_RIOT_REGION[region])
    .puuid(puuid)
    .query({
      queue: 450,
      start: start,
      count: count,
      startTime: start_timestamp,
    })
    .exec();
  return result;
}

// Return match dto from matchid
async function get_match(match_id, region) {
  return galeforce.lol.match
    .match()
    .region(DB_REGION_TO_GALEFORCE_RIOT_REGION[region])
    .matchId(match_id)
    .exec();
}

// Returns last processed game timestamp for this account
async function get_last_processed_game_timestamp(account_id, region) {
  const puuid = await get_puuid(account_id, region);
  matchlist = await galeforce.lol.match
    .list()
    .region(DB_REGION_TO_GALEFORCE_RIOT_REGION[region])
    .puuid(puuid)
    .query({
      queue: 450,
    })
    .exec();
  const most_recent_match_id = matchlist[0];
  match = await galeforce.lol.match
    .match()
    .region(DB_REGION_TO_GALEFORCE_RIOT_REGION[region])
    .matchId(most_recent_match_id)
    .exec();
  return match.info.gameStartTimestamp;
}

async function get_subsection_matchlist(
  account_id,
  region,
  start_index,
  num_matches = 100,
  start_timestamp
) {
  const matchlist = await get_match_list(
    account_id,
    region,
    start_index,
    num_matches,
    start_timestamp
  );
  results = [];
  await Promise.all(
    matchlist.map(async (match_id) => {
      match = await get_match(match_id, region);
      results.push(match);
    })
  );
  return results;
}

async function get_match_info(
  match_id,
  platform_id,
  account_id,
  region,
  username,
  include_start_timestamp = false
) {
  // return dictionary of win, kills, deaths, assists, cs, etc for this match and this participant player
  // if account_id is not a participant in this match, throws error
  let query_region = region;
  if (utils.PLATFORM_ID_TO_REGION[platform_id] !== region) {
    query_region = utils.PLATFORM_ID_TO_REGION[platform_id];
  }
  const puuid = await get_puuid(account_id, region);

  return await get_match(match_id, region).then((match) => {
    const participant_identities = match.info.participants;
    let desired_id = null;
    for (i = 0; i < participant_identities.length; i++) {
      participant = participant_identities[i];
      if (participant['puuid'] === puuid) {
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
    const participants = match.info.participants;
    let desired_participant;
    for (i = 0; i < participants.length; i++) {
      if (participants[i]['participantId'] === desired_id) {
        desired_participant = participants[i];
      }
    }
    const match_stats = desired_participant;
    let match_info = {};

    champ_id = desired_participant['championId'];
    match_info['champ'] = champ_id;
    match_info['win'] = match_stats['win'];
    match_info['kills'] = match_stats['kills'];
    match_info['deaths'] = match_stats['deaths'];
    match_info['assists'] = match_stats['assists'];
    match_info['pentakills'] = match_stats['pentaKills'];
    match_info_return = match_info;
    if (include_start_timestamp) {
      match_info.gameStartTimestamp = match.info.gameStartTimestamp;
    }
    return match_info;
  });
}

// Returns most recent 10 games - just champ, KDA
async function get_ten_recent_matches(
  account_id,
  region,
  champ_dict,
  username
) {
  const start_index = 0;
  const num_matches = 10;
  matchlist = await get_subsection_matchlist(
    account_id,
    region,
    start_index,
    num_matches,
    0
  );
  let match_infos_must_await = [];
  let recent_matches = [];
  for (let j = 0; j < matchlist.length; j++) {
    let match_id = matchlist[j].metadata.matchId;
    let platform_id = matchlist[j].info.platformId;
    const match_info_must_await = get_match_info(
      match_id,
      platform_id,
      account_id,
      region,
      username,
      (include_start_timestamp = true)
    );
    match_infos_must_await.push(match_info_must_await);
  }
  let match_infos = await Promise.all(match_infos_must_await);

  match_infos = match_infos.filter((match_info) => {
    return !(match_info instanceof utils.SummonerNotInMatchError);
  });
  match_infos.sort(function (a, b) {
    return b.gameStartTimestamp - a.gameStartTimestamp;
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

async function getCurrentPatch() {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_EXTERNAL_FETCH_MS);
  let patch_json = ['11.5.1'];
  try {
    let patch_url = 'https://ddragon.leagueoflegends.com/api/versions.json';
    let patch_response = await fetch(patch_url, { signal: controller.signal });
    patch_json = await patch_response.json();
  } catch (error) {
  } finally {
    clearTimeout(timeout);
  }
  return patch_json[0];
}

async function get_champ_dict() {
  //gets a dictionary mapping (String) champ_id -> (String) champ name, e.g. 420 -> taric or whatever taric's number is\
  const patch = await getCurrentPatch();
  payload = await galeforce.lol.ddragon.champion
    .list()
    .version(patch)
    .locale('en_US')
    .exec();
  champ_list = payload.data;
  champ_dict = {};
  for (champ in champ_list) {
    champ_dict[champ_list[champ].key] = champ;
  }
  return champ_dict;
}

async function get_live_game(summoner_id) {
  //gets live game from summoner_id - only aram games. if aram game not available returns null
  return [];
}

module.exports = {
  get_summoner_from_name,
  get_summoner_from_id,
  get_account_id,
  get_true_summoner_name,
  get_recent_matches,
  get_ten_recent_matches,
  get_match,
  get_last_processed_game_timestamp,
  get_icon_id,
  get_match_info,
  get_subsection_matchlist,
  get_champ_dict,
  get_live_game,
};
