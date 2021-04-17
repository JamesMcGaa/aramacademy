const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const fetch = require('node-fetch');

const user_model = require('../models/user_model.js');
const leaderboard_model = require('../models/leaderboard_model.js');

const eune_distribution = require('../src/images/distributions/eune_distribution.json');
const euw_distribution = require('../src/images/distributions/euw_distribution.json');
const na_distribution = require('../src/images/distributions/na_distribution.json');
const AbortController = require('abort-controller');

const globals = require('../globals.js');

const REGION_CODE_TO_DISTRIBUTION_FILE = {
  eune: eune_distribution,
  euw: euw_distribution,
  na: na_distribution,
};

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

let infra = require('../infra/infra_entrypoint.js');

//https://dev.to/ycmjason/limit-concurrent-asynchronous-calls-5bae
const asyncLimit = (fn, n) => {
  let pendingPromises = [];
  //let argSet = new Set();
  //Commented code here is for stopping spam reload from being an issue -> creating multiple processUser promises makes a bunch of infra calls

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

const asyncLimitProcessUser = infra.processUser; //asyncLimit(processUser, MAX_ASYNC_USERS_QUEUE);

async function getUserData(standardized_summoner_name, region) {
  standardized_summoner_name = standardized_summoner_name.toLowerCase();
  console.log('getuserdata sumname', standardized_summoner_name);
  let user_data = await user_model.find({
    standardized_summoner_name: standardized_summoner_name,
    region: region,
  });
  return user_data;
}

async function issueUpdate(username, region, existing_user_data = null) {
  let user_data = await asyncLimitProcessUser(
    username,
    region,
    existing_user_data
  );
  return user_data;
}

async function getLeaderboardData(region) {
  let mongo_docs = await leaderboard_model.find({
    region: region,
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

function getRankEstimate(region, mmr) {
  if (mmr === globals.UNAVAILABLE) {
    return RANKS.UNRANKED;
  }
  lowercase_region = region.toLowerCase();

  if (!(lowercase_region in REGION_CODE_TO_DISTRIBUTION_FILE)) {
    return RANKS.UNRANKED;
  }
  let distribution = REGION_CODE_TO_DISTRIBUTION_FILE[lowercase_region];

  lower_mmr_count = 0;
  for (const bucket in distribution.dist) {
    if (bucket < mmr) {
      lower_mmr_count += distribution.dist[bucket];
    }
  }
  percentile = lower_mmr_count / distribution.total;

  let rank;
  if (percentile > 0.999) {
    rank = RANKS.CHALLENGER;
  } else if (percentile > 0.997) {
    rank = RANKS.GRANDMASTER;
  } else if (percentile > 0.994) {
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
    let patch_url = 'https://ddragon.leagueoflegends.com/api/versions.json';
    let patch_response = await fetch(patch_url, { signal: controller.signal });
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
async function getMMR(region, summoner_name) {
  let mmr_response = null;
  let mmr_json = null;
  let formatted_URI =
    'https://' +
    region +
    '.whatismymmr.com/api/v1/summoner?name=' +
    encodeURI(summoner_name);
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_EXTERNAL_FETCH_MS);
  try {
    mmr_response = await fetch(formatted_URI, { signal: controller.signal });
    mmr_json = await mmr_response.json();
  } catch (error) {
  } finally {
    clearTimeout(timeout);
  }

  if (
    mmr_json &&
    'ARAM' in mmr_json &&
    'avg' in mmr_json.ARAM &&
    mmr_json.ARAM.avg !== null
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
    //sanitize the sumname
    const standardized_summoner_name = sanitizeSummonerName(
      req.params.unsanitized_summoner_name
    );
    let [matching_user_data, patch, mmr, live_game_status] = await Promise.all([
      getUserData(standardized_summoner_name, req.params.region),
      getCurrentPatch(),
      getMMR(req.params.region, standardized_summoner_name),
      getLiveGameStatus(standardized_summoner_name, req.params.region),
    ]);
    let user_data = null;
    if (matching_user_data.length === 0) {
      user_data = await issueUpdate(
        standardized_summoner_name,
        req.params.region
      );
    } else {
      user_data = matching_user_data[0];
    }
    if (
      user_data === globals.ERRORS.SUMMONER_DOES_NOT_EXIST ||
      user_data === globals.ERRORS.SUMMONER_HAS_NO_GAMES
    ) {
      // user doesnt exist in region
      user_data_response = {
        status: globals.USER_PAGE_STATES.DOES_NOT_EXIST,
      };
      res.send(user_data_response);
      return;
    }

    let rank = getRankEstimate(req.params.region, mmr);
    const icon_id = user_data.icon_id;
    const icon_path =
      'https://ddragon.leagueoflegends.com/cdn/' +
      patch +
      '/img/profileicon/' +
      user_data.icon_id +
      '.png';

    user_data_response = {
      user_data: user_data,
      status: globals.USER_PAGE_STATES.SUCCESS,
      icon_path: icon_path,
      mmr: mmr,
      rank: rank,
      live_game_status: live_game_status,
    };
    res.send(user_data_response);
    return;
  }
);

/*
 * Places a given (region, standardized_summoner_name) on the update queue
 */
router.get('/update/:region/:unsanitized_summoner_name', async (req, res) => {
  const standardized_summoner_name = sanitizeSummonerName(
    req.params.unsanitized_summoner_name
  );
  let [matching_user_data, patch, mmr] = await Promise.all([
    getUserData(standardized_summoner_name, req.params.region),
    getCurrentPatch(),
    getMMR(req.params.region, standardized_summoner_name),
  ]);

  user_data = await issueUpdate(
    standardized_summoner_name,
    req.params.region,
    matching_user_data[0]
  );

  let rank = getRankEstimate(req.params.region, mmr);
  const icon_id = user_data.icon_id;
  const icon_path =
    'https://ddragon.leagueoflegends.com/cdn/' +
    patch +
    '/img/profileicon/' +
    user_data.icon_id +
    '.png';

  user_data_response = {
    user_data: user_data,
    status: globals.USER_PAGE_STATES.SUCCESS,
    icon_path: icon_path,
    mmr: mmr,
    rank: rank,
    in_live_game: true,
  };
  res.send(user_data_response);
  return;
});

/*
 * Returns the current leaderboard for a (region)
 */
router.get('/leaderboard/:region', async (req, res) => {
  let matches = await getLeaderboardData(req.params.region);
  res.send(matches);
  return;
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
  return;
});

function sanitizeSummonerName(unsanitized_summoner_name) {
  const lower_summoner_name = unsanitized_summoner_name.toLowerCase();
  let standardized_summoner_name = lower_summoner_name.replace(/\s/g, '');

  console.log('standardized', standardized_summoner_name);
  return standardized_summoner_name;
}

async function getLiveGameStatus(summoner_name, region) {
  const player_list = await infra.getLiveGame(summoner_name, region);
  if (player_list === null) {
    //not in aram game or not found
    return globals.LIVE_GAME_STATES.NO_MATCH;
  }
  return globals.LIVE_GAME_STATES.MATCH;
}
async function getLiveGameBasicData(summoner_name, region) {
  return await infra.getLiveGame(summoner_name, region);
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
    let live_game_status = globals.LIVE_GAME_STATES.MATCH;
    let resp;
    if (full_data === globals.LIVE_GAME_STATES.NO_MATCH) {
      resp = {
        live_game_status: globals.LIVE_GAME_STATES.NO_MATCH,
        full_data: null,
      };
    } else {
      resp = {
        live_game_status: live_game_status,
        full_data: full_data,
      };
    }
    res.send(resp);
    return;
  }
);

async function getLiveGameFullData(summoner_name, region) {
  //this function is run when you click on live game button
  //it is run separately because it has to do up to 9 fetches on player, so we
  // dont want to run all 9 to load this particular players user page
  const player_list = await getLiveGameBasicData(summoner_name, region);
  if (player_list === null) {
    //not in aram game
    return globals.LIVE_GAME_STATES.NO_MATCH;
  }
  let name_array = [];
  for (let i = 0; i < player_list.length; i++) {
    const standardized_summoner_name = sanitizeSummonerName(
      player_list[i].summonerName
    );
    matching_user_data = await getUserData(standardized_summoner_name, region);
    if (matching_user_data.length === 0) {
      console.log('issuing update on new user', standardized_summoner_name);
      const user_data = await issueUpdate(standardized_summoner_name, region);
    }
    name_array.push(standardized_summoner_name);
  }

  const mongo_per_champ_data = await infra.multifetchMongoDataForLiveGame(
    name_array,
    region
  );

  let final_player_data_list = [];
  for (let i = 0; i < player_list.length; i++) {
    const true_summoner_name = player_list[i].summonerName;
    const desired_champ = player_list[i].champion;
    const team_id = player_list[i].teamId;
    let found_matching_player = false;
    live_game_row_data = {};
    for (let j = 0; j < mongo_per_champ_data.length; j++) {
      //check for correct summoner name
      if (true_summoner_name === mongo_per_champ_data[j].true_summoner_name) {
        found_matching_player = true;
        per_champ_data = mongo_per_champ_data[j].per_champion_data;
        live_game_row_data.champion = desired_champ;
        live_game_row_data.summoner_name = true_summoner_name;
        const mmr = await getMMR(region, true_summoner_name);
        const rank = getRankEstimate(region, mmr);

        live_game_row_data.mmr = mmr;
        live_game_row_data.rank = rank;
        live_game_row_data.side = team_id;
        //looking for the right champ and overall
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
    //no matching player found in mongo - this means this player has no aram games
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
      const rank = getRankEstimate(region, mmr);
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
