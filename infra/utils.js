const winston = require('winston');
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  defaultMeta: { service: 'infra_entrypoint' },
  transports: [new winston.transports.File({ filename: './logs/error.log' })],
});

const ARAM = '450';
// kayn gets matches in reverse chronological order

const ERRORS = Object.freeze({
  SUMMONER_DOES_NOT_EXIST: 'summoner_does_not_exist',
  SUMMONER_HAS_NO_GAMES: 'summoner_has_no_games',
  SUMMONER_NOT_IN_MATCH: 'summoner_not_in_match',
  RETRY_ASYNC_FUNCTION: 'retry_async_function',
  UNKNOWN: 'unknown',
});

const PLATFORM_ID_TO_REGION = Object.freeze({
  EUW1: 'euw',
  NA1: 'na',
  BR1: 'br',
  EUN1: 'eune',
  LA1: 'lan',
  LA2: 'las',
  OC1: 'oce',
  RU: 'ru',
  TR1: 'tr',
  JP1: 'jp',
  KR: 'kr',
});

const LOGGING = Object.freeze({
  CREATE: 'create',
  UPDATE: 'update',
});

class SummonerDoesNotExistError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SummonerDoesNotExistError';
  }
}
class SummonerHasNoGamesError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SummonerHasNoGamesError';
  }
}

class SummonerNotInMatchError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SummonerNotInMatchError';
  }
}

class RetryAsyncFunctionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RetryAsyncFunctionError';
  }
}

function sendErrorLog(username, region, error_name, error_object) {
  logger.log({
    level: 'error',
    username: username,
    region: region,
    time: Date.now(),
    error: error_name,
    error_stacktrace: error_object.stack,
  });
}

function convert_aggregate_stats_to_list(aggregate_stats) {
  /**
   * aggregate_stats is in dictionary form of {champion_name: [aggregate game data]}. This converts it to list format
   * where entries are [[aggregate game data which includes champion name as a field]]
   */
  let per_champion_data = [];
  for (let i in aggregate_stats) {
    let entry = aggregate_stats[i];
    entry['champion'] = i;
    per_champion_data.push(entry);
  }
  return per_champion_data;
}
async function retry_async_function(func, args, retry_num = 0) {
  //retries func with args up to 5 times
  if (retry_num > 5) {
    throw new RetryAsyncFunctionError(
      'Function ' + func.name + ' was retried 5 times and failed all 5'
    );
  }
  try {
    func_return = await func(...args);
    return func_return;
  } catch (error) {
    //console.log('retrying', func, '. attempt: ', retry_num);
    return await retry_async_function(func, args, retry_num + 1);
  }
}
function get_aggregate_stats_from_match_infos(match_infos, champ_dict) {
  //from match_infos dict, returns champ aggregated data in dictionary form
  function add_to_entry(entry, match) {
    entry['wins'] += match['win'];
    entry['total_games'] += 1;
    entry['kills'] += match['kills'];
    entry['deaths'] += match['deaths'];
    entry['assists'] += match['assists'];
    entry['cs'] += match['cs'];
    entry['gold'] += match['gold'];
    //entry['obj_dmg'] += match['obj_dmg'];
    entry['damage_dealt'] += match['dmg_dealt'];
    entry['damage_taken'] += match['dmg_taken'];
    entry['pentakills'] += match['pentakills'];
    entry['duration_in_seconds'] += match['duration'];
    return entry;
  }
  let rows = ['overall'];
  for (champ_id in champ_dict) {
    rows.push(champ_dict[champ_id]);
  }
  let champ_data = {};
  for (let i = 0; i < rows.length; i++) {
    const champ = rows[i];
    let stats = {
      wins: 0,
      total_games: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      cs: 0,
      gold: 0,
      //obj_dmg: 0,
      damage_dealt: 0,
      damage_taken: 0,
      pentakills: 0,
      duration_in_seconds: 0,
    };
    champ_data[champ] = stats;
  }
  for (let i = 0; i < match_infos.length; i++) {
    const match = match_infos[i];
    const champ = champ_dict[match['champ']];
    champ_data[champ] = add_to_entry(champ_data[champ], match);
    champ_data['overall'] = add_to_entry(champ_data['overall'], match);
  }
  return champ_data;
}

function get_updated_user_data_with_delta(existing_user_data, db_entry) {
  /**
   * updates existing_user_data with the db_entry created from create_or_update()
   */
  updated_db_entry = db_entry;

  for (let i = 0; i < updated_db_entry.per_champion_data.length; i++) {
    let champion = updated_db_entry.per_champion_data[i].champion;
    for (let j = 0; j < existing_user_data.per_champion_data.length; j++) {
      if (existing_user_data.per_champion_data[j].champion === champion) {
        //same champ
        updated_db_entry.per_champion_data[i].wins +=
          existing_user_data.per_champion_data[j].wins;
        updated_db_entry.per_champion_data[i].total_games +=
          existing_user_data.per_champion_data[j].total_games;
        updated_db_entry.per_champion_data[i].kills +=
          existing_user_data.per_champion_data[j].kills;
        updated_db_entry.per_champion_data[i].deaths +=
          existing_user_data.per_champion_data[j].deaths;
        updated_db_entry.per_champion_data[i].assists +=
          existing_user_data.per_champion_data[j].assists;
        updated_db_entry.per_champion_data[i].cs +=
          existing_user_data.per_champion_data[j].cs;
        updated_db_entry.per_champion_data[i].gold +=
          existing_user_data.per_champion_data[j].gold;
        updated_db_entry.per_champion_data[i].damage_dealt +=
          existing_user_data.per_champion_data[j].damage_dealt;
        updated_db_entry.per_champion_data[i].damage_taken +=
          existing_user_data.per_champion_data[j].damage_taken;
        updated_db_entry.per_champion_data[i].pentakills +=
          existing_user_data.per_champion_data[j].pentakills;
        updated_db_entry.per_champion_data[i].duration_in_seconds +=
          existing_user_data.per_champion_data[j].duration_in_seconds;
      }
    }
  }
  return updated_db_entry;
}
module.exports = {
  ERRORS,
  LOGGING,
  SummonerDoesNotExistError,
  SummonerHasNoGamesError,
  SummonerNotInMatchError,
  RetryAsyncFunctionError,
  ARAM,
  convert_aggregate_stats_to_list,
  retry_async_function,
  get_aggregate_stats_from_match_infos,
  get_updated_user_data_with_delta,
  PLATFORM_ID_TO_REGION,
  sendErrorLog,
};
