const express = require('express');

const router = express.Router();
const fetch = require('node-fetch');

const AbortController = require('abort-controller');
const user_model_v5 = require('../models/user_model_v5.js');
const user_model = require('../models/user_model.js');
const leaderboard_model = require('../models/leaderboard_model.js');

const globals = require('../globals.js');
const builds_json = require('../src/jsons/champ_data_11_8.json');
const mmr_distribution = require('../src/jsons/mmr_distribution.json');

const RANKS = {
  CHALLENGER: 'challenger',
  GRANDMASTER: 'grandmaster',
  MASTER: 'master',
  DIAMOND: 'diamond',
  PLATINUM: 'platinum',
  GOLD: 'gold',
  SILVER: 'silver',
  BRONZE: 'bronze',
  IRON: 'iron',
  UNRANKED: 'unranked',
};

const REQUEST_TIMEOUT_EXTERNAL_FETCH_MS = 15000;
const MAX_ASYNC_USERS_QUEUE = 20;

const infra = require('../infra/infra_entrypoint.js');
const galeforceCalls = require('../infra/galeforce_calls.js');

// https://dev.to/ycmjason/limit-concurrent-asynchronous-calls-5bae
const asyncLimit = (fn, n) => {
  let pendingPromises = [];
  // let argSet = new Set();
  // Commented code here is for stopping spam reload from being an issue -> creating multiple processUser promises makes a bunch of infra calls

  return async function (...args) {
    // let args_already_in_set = false;
    // argSet.forEach( item => {
    //   if(item.toString() == args.toString()){
    //     args_already_in_set = true;
    //   }
    // });
    // if(args_already_in_set){
    //   console.log('args', args, 'already in argSet', argSet);
    //   //This means that we already created a promise for this user and should not make a new one

    // }
    // else{
    //   console.log('args', args, 'not in argSet', argSet);
    //   argSet.add(args);
    // }

    while (pendingPromises.length >= n) {
      await Promise.race(pendingPromises).catch(() => {
        console.log('asynclimit error');
      });
    }

    const p = fn.apply(this, args);
    pendingPromises.push(p);
    await p.catch(() => {
      console.log('asynclimit error');
    });
    pendingPromises = pendingPromises.filter((pending) => pending !== p);
    return p;
  };
};

const asyncLimitProcessUser = infra.processUser; // asyncLimit(processUser, MAX_ASYNC_USERS_QUEUE);

async function getUserDataForUpdate(puuid) {
  const results = await user_model_v5.find({
    puuid,
  }, '-_id -__v');
  return results[0].toObject();
}

async function getWinrateDataWithMigration(standardized_summoner_name, region, raw_summoner_name) {
  const { puuid, name, accountId } = await galeforceCalls.get_summoner_from_name(raw_summoner_name, region);
  const migrated_user_data = await user_model_v5.find({
    puuid,
  }, '-_id -__v');
  if (migrated_user_data.length > 0) {
    const result = migrated_user_data[0].toObject(); // TODO LOG MULTIPLES
    result.true_summoner_name = name;
    return result;
  }

  const deprecated_user_data_by_name = await user_model.find({
    true_summoner_name: name,
    region,
  }, '-_id -__v');
  const deprecated_user_data_by_account_id = await user_model.find({
    accountId
  }, '-_id -__v');
  const deprecated_user_data = deprecated_user_data_by_name.concat(deprecated_user_data_by_account_id);
  if (deprecated_user_data.length === 0) {
    return null;
  }

  const oldest_user_data = deprecated_user_data.sort((a, b) => a.last_processed_game_timestamp_ms - b.last_processed_game_timestamp_ms)[0].toObject(); // Furthest back first
  oldest_user_data.puuid = puuid;

  await user_model.deleteMany({ true_summoner_name: name });
  await user_model_v5.insertMany(
    [oldest_user_data]
  );
  oldest_user_data.true_summoner_name = name;

  return oldest_user_data;
}

async function getLeaderboardData(region) {
  const mongo_docs = await leaderboard_model.find({
    region,
  });
  return mongo_docs;
}

/*
 * this patch gets the current patch prefix, e.g. getCurrentPatch returns 11.3.1, and this returns 11.3, the patch number people want to see\
 */
async function getCurrentPatchPrefix() {
  const patch = await getCurrentPatch();
  const tokens = patch.split('.');
  return tokens.slice(0, 2).join('.');
}

function getRankEstimate(mmr) {
  if (mmr === globals.UNAVAILABLE) {
    return RANKS.UNRANKED;
  }

  let lower_mmr_count = 0;
  let total = 0;
  for (const bucket in mmr_distribution) {
    if (bucket < mmr) {
      lower_mmr_count += mmr_distribution[bucket];
    }
    total += mmr_distribution[bucket];
  }
  const percentile = lower_mmr_count / total;

  let rank;
  if (percentile > 0.9995) {
    rank = RANKS.CHALLENGER;
  } else if (percentile > 0.9984) {
    rank = RANKS.GRANDMASTER;
  } else if (percentile > 0.996) {
    rank = RANKS.MASTER;
  } else if (percentile > 0.99) {
    rank = RANKS.DIAMOND;
  } else if (percentile > 0.95) {
    rank = RANKS.PLATINUM;
  } else if (percentile > 0.8) {
    rank = RANKS.GOLD;
  } else if (percentile > 0.55) {
    rank = RANKS.SILVER;
  } else if (percentile > 0.25) {
    rank = RANKS.BRONZE;
  } else {
    rank = RANKS.IRON;
  }

  return rank;
}

/*
 * Fetches the patch from DDragon, if timeout is exceeded it defaults
 */
async function getCurrentPatch() {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_EXTERNAL_FETCH_MS);
  let patch_json = ['11.5.1'];
  try {
    const patch_url = 'https://ddragon.leagueoflegends.com/api/versions.json';
    const patch_response = await fetch(patch_url, {
      signal: controller.signal,
    });
    patch_json = await patch_response.json();
  } catch (error) {
  } finally {
    clearTimeout(timeout);
  }
  return patch_json[0];
}

/*
 * Fetches the patch from whatismymmr, if timeout is exceeded it defaults
 */
async function getMMR(region, unsanitized_summoner_name) {
  let mmr_response = null;
  let mmr_json = null;
  const formatted_URI = `https://${region}.whatismymmr.com/api/v1/summoner?name=${encodeURI(
    unsanitized_summoner_name
  )}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_EXTERNAL_FETCH_MS);
  try {
    mmr_response = await fetch(formatted_URI, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ARAM-ACADEMY-USER-PAGE' },
    });
    mmr_json = await mmr_response.json();
  } catch (error) {
  } finally {
    clearTimeout(timeout);
  }

  if (
    mmr_json
    && 'ARAM' in mmr_json
    && 'avg' in mmr_json.ARAM
    && mmr_json.ARAM.avg !== null
  ) {
    return mmr_json.ARAM.avg;
  }
  return globals.UNAVAILABLE;
}

/*
 * Main method that matching a (region, standardized_summoner_name), otherwise it places them on our queue
 */
router.get(
  '/winrate_data/:region/:unsanitized_summoner_name',
  async (req, res) => {
    const standardized_summoner_name = sanitizeSummonerName(
      req.params.unsanitized_summoner_name
    );
    const [matching_user_data, patch, mmr, live_game_status] = await Promise.all([
      getWinrateDataWithMigration(standardized_summoner_name, req.params.region, req.params.unsanitized_summoner_name),
      getCurrentPatch(),
      getMMR(req.params.region, req.params.unsanitized_summoner_name), // Fetch whatismymmr using unsanitized name
      null,
    ]);
    let user_data = null;
    if (matching_user_data === null) {
      user_data = await asyncLimitProcessUser(
        standardized_summoner_name,
        req.params.region
      );
    } else {
      user_data = matching_user_data;
    }
    if (
      user_data === globals.ERRORS.SUMMONER_DOES_NOT_EXIST
      || user_data === globals.ERRORS.SUMMONER_HAS_NO_GAMES
    ) {
      // user doesnt exist in region
      const user_data_response = {
        status: globals.USER_PAGE_STATES.DOES_NOT_EXIST,
      };
      res.send(user_data_response);
      return;
    }
    const rank = getRankEstimate(mmr);
    const icon_path = `https://ddragon.leagueoflegends.com/cdn/${patch}/img/profileicon/${user_data.icon_id}.png`;
    const user_data_response = {
      user_data,
      status: globals.USER_PAGE_STATES.SUCCESS,
      icon_path,
      mmr,
      rank,
      live_game_status,
    };
    res.send(user_data_response);
  }
);

/*
 * Places a given (region, puuid) on the update queue
 */
router.get('/update/:region/:puuid/:unsanitized_summoner_name', async (req, res) => {
  const [matching_user_data, patch, mmr] = await Promise.all([
    getUserDataForUpdate(req.params.puuid),
    getCurrentPatch(),
    getMMR(req.params.region, req.params.unsanitized_summoner_name), // Fetch whatismymmr using unsanitized name
  ]);
  const user_data = await asyncLimitProcessUser(
    req.params.unsanitized_summoner_name,
    req.params.region,
    matching_user_data
  );
  const rank = getRankEstimate(mmr);
  const icon_path = `https://ddragon.leagueoflegends.com/cdn/${patch}/img/profileicon/${user_data.icon_id}.png`;

  const user_data_response = {
    user_data,
    status: globals.USER_PAGE_STATES.SUCCESS,
    icon_path,
    mmr,
    rank,
    in_live_game: true,
  };
  res.send(user_data_response);
});

function sanitizeSummonerName(unsanitized_summoner_name) {
  const lower_summoner_name = unsanitized_summoner_name.toLowerCase();
  let standardized_summoner_name = lower_summoner_name.replace(/\s/g, '');
  standardized_summoner_name = standardized_summoner_name.replace(
    /[.,\/#!$%\^&\*;:{}=\-_`~()]/g,
    ''
  );
  console.log('standardized', standardized_summoner_name);
  return standardized_summoner_name;
}

/*
 * Returns the current leaderboard for a (region)
 */
router.get('/leaderboard/:region', async (req, res) => {
  const matches = await getLeaderboardData(req.params.region);
  res.send(matches);
});

/*
 * Returns current patch
 */
router.get('/patch', async (req, res) => {
  const current_patch = await getCurrentPatchPrefix();
  const resp = {
    patch: current_patch,
  };
  res.send(resp);
});

async function getLiveGameStatus(summoner_name, region) {
  const player_list = await infra.getLiveGame(summoner_name, region);
  if (player_list === null) {
    // not in aram game or not found
    return globals.LIVE_GAME_STATES.NO_MATCH;
  }
  return globals.LIVE_GAME_STATES.MATCH;
}
async function getLiveGameBasicData(summoner_name, region) {
  return infra.getLiveGame(summoner_name, region);
}

/*
 * Returns the full live game data for a summoner name and region
 */
router.get(
  '/live_game/:region/:unsanitized_summoner_name',
  async (req, res) => {
    const sanitized_summoner_name = sanitizeSummonerName(
      req.params.unsanitized_summoner_name
    );
    const full_data = await getLiveGameFullData(
      sanitized_summoner_name,
      req.params.region
    );
    const live_game_status = globals.LIVE_GAME_STATES.MATCH;
    let resp;
    if (full_data === globals.LIVE_GAME_STATES.NO_MATCH) {
      resp = {
        live_game_status: globals.LIVE_GAME_STATES.NO_MATCH,
        full_data: null,
      };
    } else {
      resp = {
        live_game_status,
        full_data,
      };
    }
    res.send(resp);
  }
);

async function getLiveGameFullData(summoner_name, region) {
  // this function is run when you click on live game button
  // it is run separately because it has to do up to 9 fetches on player, so we
  // dont want to run all 9 to load this particular players user page
  const player_list = await getLiveGameBasicData(summoner_name, region);
  if (player_list === null) {
    // not in aram game
    return globals.LIVE_GAME_STATES.NO_MATCH;
  }
  const name_array = [];
  for (let i = 0; i < player_list.length; i++) {
    const standardized_summoner_name = sanitizeSummonerName(
      player_list[i].summonerName
    );
    const matching_user_data = await getUserData(
      standardized_summoner_name,
      region

    );
    if (matching_user_data.length === 0) {
      console.log('issuing update on new user', standardized_summoner_name);
      await issueUpdate(standardized_summoner_name, region);
    }
    name_array.push(standardized_summoner_name);
  }

  const mongo_per_champ_data = await infra.multifetchMongoDataForLiveGame(
    name_array,
    region
  );

  const final_player_data_list = [];
  for (let i = 0; i < player_list.length; i++) {
    const true_summoner_name = player_list[i].summonerName;
    const desired_champ = player_list[i].champion;
    const team_id = player_list[i].teamId;
    let found_matching_player = false;
    live_game_row_data = {};
    for (let j = 0; j < mongo_per_champ_data.length; j++) {
      // check for correct summoner name
      if (true_summoner_name === mongo_per_champ_data[j].true_summoner_name) {
        found_matching_player = true;
        per_champ_data = mongo_per_champ_data[j].per_champion_data;
        live_game_row_data.champion = desired_champ;
        live_game_row_data.summoner_name = true_summoner_name;
        const mmr = await getMMR(region, true_summoner_name);
        const rank = getRankEstimate(mmr);

        live_game_row_data.mmr = mmr;
        live_game_row_data.rank = rank;
        live_game_row_data.side = team_id;
        // looking for the right champ and overall
        for (let k = 0; k < per_champ_data.length; k++) {
          if (per_champ_data[k].champion === desired_champ) {
            live_game_row_data.champion_games = per_champ_data[k].total_games;
            live_game_row_data.champion_wins = per_champ_data[k].wins;
            live_game_row_data.champion_kills = per_champ_data[k].kills;
            live_game_row_data.champion_deaths = per_champ_data[k].deaths;
            live_game_row_data.champion_assists = per_champ_data[k].assists;
          }
          if (per_champ_data[k].champion === 'overall') {
            live_game_row_data.total_wins = per_champ_data[k].wins;
            live_game_row_data.total_games = per_champ_data[k].total_games;
          }
        }
        final_player_data_list.push(live_game_row_data);
      }
    }
    // no matching player found in mongo - this means this player has no aram games
    if (!found_matching_player) {
      live_game_row_data.champion = desired_champ;
      live_game_row_data.summoner_name = true_summoner_name;
      live_game_row_data.champion_games = 0;
      live_game_row_data.champion_wins = 0;
      live_game_row_data.champion_kills = 0;
      live_game_row_data.champion_deaths = 0;
      live_game_row_data.champion_assists = 0;
      live_game_row_data.total_wins = 0;
      live_game_row_data.total_games = 0;
      const mmr = await getMMR(region, true_summoner_name);
      const rank = getRankEstimate(mmr);
      if (mmr === globals.UNAVAILABLE) {
        live_game_row_data.mmr = 'N/A';
      } else {
        live_game_row_data.mmr = mmr;
      }
      live_game_row_data.rank = rank;
      final_player_data_list.push(live_game_row_data);
    }
  }

  return final_player_data_list;
}
module.exports = router;
/*
 * Returns builds/runes/sum spells for this champion
 */

/* we want to feed the following back to the champion.js client
* winrate pickrate
* primary/secondary rune tree name
* primary/secondary rune tree name filepath
* full image filepaths for the entire rune primary/secondary
* a list of the chosen runes' keys, e.g. Electrocute
* full 2 sumspell filepaths
* q filepath
* w filepath
* e filepath
* r filepath
* starting item filepath
* first item filepath, etc
*
* champ json:
{
champion: khazix
winrate: .521
pickrate: .074
summ1: { name: flash, wr: .53}
summ2: { name: snowball, wr: .62}
runes_primary: "Domination",
runes_primary_list: ["Electrocute, TasteOfBlood, EyeballCollection, RavenousHunter"],
runes_secondary: "Sorcery",
runes_secondary_list: ["NimbusCloak, GatheringStorm"],
runes_winrate: .55,
   skill_order: ["R","Q","W","E"]
level_skill_order: {"Q", "W", "E", "Q", "Q", "R", "Q", "E", "Q", etc}
starting_items: ["guardian horn", reju reju reju]
mythic: Shieldbow
boots: mercs
first item: essence reaver
second item: navori quickblades

}

give champion.js the entire sorcery/resolve two trees worth of json and feed in the names of the 7 runes + 3 adaptive whatever you've chosen
champion.js displays the rune trees in a flexible manner such that name/icon changes are automatic from riot json
highlight the 10 choices
*/
router.get('/builds/:champion', async (req, res) => {
  let champ = req.params.champion;
  const two_word_champs = new Map();
  two_word_champs.set('AurelionSol', 'Aurelion Sol');
  two_word_champs.set('Chogath', "Cho'Gath");
  two_word_champs.set('DrMundo', 'Dr. Mundo');
  two_word_champs.set('JarvanIV', 'Jarvan IV');
  two_word_champs.set('Kaisa', "Kai'Sa");
  two_word_champs.set('Khazix', "Kha'Zix");
  two_word_champs.set('KogMaw', "Kog'Maw");
  two_word_champs.set('Leblanc', 'LeBlanc');
  two_word_champs.set('LeeSin', 'Lee Sin');
  two_word_champs.set('MasterYi', 'Master Yi');
  two_word_champs.set('MissFortune', 'Miss Fortune');
  two_word_champs.set('MonkeyKing', 'Wukong');
  two_word_champs.set('Nunu', 'Nunu & Willump');
  two_word_champs.set('RekSai', "Rek'Sai");
  two_word_champs.set('TahmKench', 'Tahm Kench');
  two_word_champs.set('TwistedFate', 'Twisted Fate');
  two_word_champs.set('Velkoz', "Vel'Koz");
  two_word_champs.set('XinZhao', 'Xin Zhao');
  if (two_word_champs.has(champ)) {
    champ = two_word_champs.get(champ);
  }
  const build_json = builds_json[champ];
  const runes_json = await getRunesJson();
  const item_json = await getItemJson();
  const sums_json = await getSummonerSpellsJson();
  const item_build_json = build_json.items_json;
  const item_build_json_full = {};
  for (key in item_build_json) {
    item_build_json_full[key] = [];
    for (index in item_build_json[key]) {
      const items = [];
      for (itemIndex in item_build_json[key][index].items) {
        items.push(
          getDesiredItemJson(
            item_build_json[key][index].items[itemIndex],
            item_json
          )
        );
      }
      item_build_json_full[key].push({
        items,
        items_winrate: item_build_json[key][index].items_winrate,
      });
    }
  }
  const runes = build_json.runes;
  const runes_full = [];
  for (index in runes) {
    runes_full.push({
      ...runes[index],
      runes_primary_json: getRuneTreeJson(
        runes[index].runes_primary,
        runes_json
      ),
      runes_secondary_json: getRuneTreeJson(
        runes[index].runes_secondary,
        runes_json
      ),
    });
  }
  const champion_json = await getChampionJson(req.params.champion);
  const patch = await getCurrentPatch();
  build_response = {
    ...build_json,
    runes_full,
    items_json_full: item_build_json_full,
    sums_json,
    champion_json,
    patch,
  };
  res.send(build_response);
});

function getRuneTreeJson(tree_name, runes_json) {
  for (let i = 0; i < runes_json.length; i++) {
    const tree = runes_json[i];
    if (tree.key === tree_name) {
      return tree;
    }
  }
  return null;
}
async function getItemJson() {
  let item_json = null;
  const patch = await getCurrentPatch();
  const formatted_URI = `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/item.json`;
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_EXTERNAL_FETCH_MS);
  try {
    const response = await fetch(formatted_URI, { signal: controller.signal });
    item_json = await response.json();
  } catch (error) {
  } finally {
    clearTimeout(timeout);
  }
  return item_json;
}

function getDesiredItemJson(item_name, item_json) {
  for (const id in item_json.data) {
    if (item_json.data[id].name === item_name) {
      return item_json.data[id];
    }
  }
  return null;
}

async function getRunesJson() {
  const patch = await getCurrentPatch();

  const runes_path = `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/runesReforged.json`;
  let runes_json = null;
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_EXTERNAL_FETCH_MS);
  try {
    const runes_response = await fetch(runes_path, {
      signal: controller.signal,
    });
    runes_json = await runes_response.json();
  } catch (error) {
  } finally {
    clearTimeout(timeout);
  }
  return runes_json;
}

async function getSummonerSpellsJson() {
  const patch = await getCurrentPatch();

  const path = `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/summoner.json`;
  let json = null;
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_EXTERNAL_FETCH_MS);
  try {
    const response = await fetch(path, { signal: controller.signal });
    json = await response.json();
  } catch (error) {
  } finally {
    clearTimeout(timeout);
  }
  return json;
}

async function getChampionJson(champ_name) {
  const patch = await getCurrentPatch();

  const path = `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion/${champ_name}.json`;
  console.log(path);
  let json = null;
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_EXTERNAL_FETCH_MS);
  try {
    const response = await fetch(path, { signal: controller.signal });
    json = await response.json();
  } catch (error) {
  } finally {
    clearTimeout(timeout);
  }
  return json;
}
