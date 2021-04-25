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
const builds_json = require('../src/jsons/champ_data_11_8.json');

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
const MAX_ASYNC_USERS_QUEUE = 5;

let processUser = require('../infra/infra_entrypoint.js');

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

const asyncLimitProcessUser = asyncLimit(processUser, MAX_ASYNC_USERS_QUEUE);

async function getUserData(standardized_summoner_name, region) {
  standardized_summoner_name = standardized_summoner_name.toLowerCase();
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
 * this patch gets the current patch prefix, e.g. getCurrentPatch returns 11.3.1, and this returns 11.3, the patch number people want to see\
 */
async function getCurrentPatchPrefix() {
  const patch = await getCurrentPatch();
  const tokens = patch.split('.');
  return tokens.slice(0, 2).join('.');
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
  '/winrate_data/:region/:standardized_summoner_name',
  async (req, res) => {
    let [matching_user_data, patch, mmr] = await Promise.all([
      getUserData(req.params.standardized_summoner_name, req.params.region),
      getCurrentPatch(),
      getMMR(req.params.region, req.params.standardized_summoner_name),
    ]);
    let user_data = null;
    if (matching_user_data.length === 0) {
      user_data = await issueUpdate(
        req.params.standardized_summoner_name,
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
    };
    res.send(user_data_response);
    return;
  }
);

/*
 * Places a given (region, standardized_summoner_name) on the update queue
 */
router.get('/update/:region/:standardized_summoner_name', async (req, res) => {
  let [matching_user_data, patch, mmr] = await Promise.all([
    getUserData(req.params.standardized_summoner_name, req.params.region),
    getCurrentPatch(),
    getMMR(req.params.region, req.params.standardized_summoner_name),
  ]);

  user_data = await issueUpdate(
    req.params.standardized_summoner_name,
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
 * Returns current tierlist and patch
 */
router.get('/tierlist', async (req, res) => {
  const current_patch = await getCurrentPatchPrefix();
  const resp = {
    patch: current_patch,
  };
  res.send(resp);
  return;
});
module.exports = router;
/*
 * Returns current tierlist and patch
 */
router.get('/patch', async (req, res) => {
  const current_patch = await getCurrentPatch();
  const resp = {
    patch: current_patch,
  };
  res.send(resp);
  return;
});
/*
 * Returns builds/runes/sum spells for this champion
 */

/*we want to feed the following back to the champion.js client
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
  //console.log('full builds', builds_json);
  //console.log(champ, builds_json[champ]);
  // const build_json = {
  //   runes: [
  //     {
  //       runes_primary: 'Resolve',
  //       runes_primary_list: [
  //         'GraspOfTheUndying',
  //         'Demolish',
  //         'BonePlating',
  //         'Overgrowth',
  //       ],
  //       runes_secondary: 'Sorcery',
  //       runes_secondary_list: ['NimbusCloak', 'GatheringStorm'],
  //       runes_stats: [0, 1, 2],
  //       runes_index: 0,
  //       runes_winrate: 52.2,
  //     },
  //     {
  //       runes_primary: 'Precision',
  //       runes_primary_list: [
  //         'Conqueror',
  //         'PresenceOfMind',
  //         'LegendTenacity',
  //         'LastStand',
  //       ],
  //       runes_secondary: 'Domination',
  //       runes_secondary_list: ['SuddenImpact', 'RavenousHunter'],
  //       runes_stats: [0, 0, 2],
  //       runes_index: 1,
  //       runes_winrate: 51.1,
  //     },
  //     {
  //       runes_primary: 'Precision',
  //       runes_primary_list: [
  //         'LethalTempo',
  //         'PresenceOfMind',
  //         'LegendTenacity',
  //         'LastStand',
  //       ],
  //       runes_secondary: 'Domination',
  //       runes_secondary_list: ['SuddenImpact', 'RavenousHunter'],
  //       runes_stats: [0, 0, 2],
  //       runes_index: 2,
  //       runes_winrate: 49.1,
  //     },
  //     {
  //       runes_primary: 'Precision',
  //       runes_primary_list: [
  //         'PressTheAttack',
  //         'PresenceOfMind',
  //         'LegendTenacity',
  //         'LastStand',
  //       ],
  //       runes_secondary: 'Inspiration',
  //       runes_secondary_list: ['MagicalFootwear', 'BiscuitDelivery'],
  //       runes_stats: [1, 0, 2],
  //       runes_index: 3,
  //       runes_winrate: 48.9,
  //     },
  //     {
  //       runes_primary: 'Inspiration',
  //       runes_primary_list: [
  //         'GlacialAugment',
  //         'HextechFlashtraption',
  //         'FuturesMarket',
  //         'ApproachVelocity',
  //       ],
  //       runes_secondary: 'Domination',
  //       runes_secondary_list: ['SuddenImpact', 'RavenousHunter'],
  //       runes_stats: [0, 0, 2],
  //       runes_index: 4,
  //       runes_winrate: 48.7,
  //     },
  //   ],
  //   abilities_order: ['Q', 'E', 'W'],
  //   abilities_levels: {
  //     Q: [1, 4, 5, 7, 9],
  //     W: [3, 14, 15, 17, 18],
  //     E: [2, 8, 10, 12, 13],
  //     R: [6, 11, 16],
  //   },
  //   items_json: {
  //     'Starting Items': [
  //       {
  //         items: ["Guardian's Hammer", 'Boots', 'Refillable Potion'],
  //         items_winrate: 51.3,
  //       },
  //       {
  //         items: ["Serrated Dirk", 'Boots'],
  //         items_winrate: 50.3,
  //       },
  //     ],
  //     'Mythic and Core Items': [
  //       {
  //         items: [
  //           'Kraken Slayer',
  //           "Runaan's Hurricane",
  //           "Berserker's Greaves",
  //         ],
  //         items_winrate: 51.5,
  //       },
  //       {
  //         items: [
  //           'Galeforce',
  //           "Rapid Firecannon",
  //           "Boots of Swiftness",
  //         ],
  //         items_winrate: 50.5,
  //       },
  //     ],
  //     'Fourth Item Options': [
  //       {
  //         items: [
  //           'Infinity Edge',
  //         ],
  //         items_winrate: 51.5,
  //       },
  //       {
  //         items: [
  //           'Bloodthirster',
  //         ],
  //         items_winrate: 50.5,
  //       },
  //       {
  //         items: [
  //           'The Collector',
  //         ],
  //         items_winrate: 49.5,
  //       },
  //     ],
  //     'Fifth Item Options': [
  //       {
  //         items: [
  //           'Bloodthirster',
  //         ],
  //         items_winrate: 51.5,
  //       },
  //       {
  //         items: [
  //           'Maw of Malmortius',
  //         ],
  //         items_winrate: 50.5,
  //       },
  //       {
  //         items: [
  //           'The Collector',
  //         ],
  //         items_winrate: 49.5,
  //       },
  //     ],
  //     'Sixth Item Options': [
  //       {
  //         items: [
  //           'Mercurial Scimitar',
  //         ],
  //         items_winrate: 51.5,
  //       },
  //       {
  //         items: [
  //           'Mortal Reminder',
  //         ],
  //         items_winrate: 50.5,
  //       },
  //       {
  //         items: [
  //           "Lord Dominik's Regards",
  //         ],
  //         items_winrate: 49.5,
  //       },
  //     ],
  //   },
  //   summoner_spells: [
  //     {
  //       spells: ['SummonerExhaust', 'SummonerFlash'],
  //       spells_winrate: 69.1,
  //     },
  //     {
  //       spells: ['SummonerSnowball', 'SummonerFlash'],
  //       spells_winrate: 51.1,
  //     },
  //     {
  //       spells: ['SummonerBarrier', 'SummonerFlash'],
  //       spells_winrate: 50.1,
  //     },
  //   ],
  // };
  let two_word_champs = new Map();
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
    console.log('found champ', champ);
    champ = two_word_champs.get(champ);
  }
  const build_json = builds_json[champ];
  console.log(champ);
  console.log(build_json);
  const runes_json = await getRunesJson();
  const item_json = await getItemJson();
  const sums_json = await getSummonerSpellsJson();
  const item_build_json = build_json.items_json;
  let item_build_json_full = {};
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
        items: items,
        items_winrate: item_build_json[key][index].items_winrate,
      });
    }
  }
  const runes = build_json.runes;
  let runes_full = [];
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
    runes_full: runes_full,
    items_json_full: item_build_json_full,
    sums_json: sums_json,
    champion_json: champion_json,
    patch: patch,
  };
  res.send(build_response);
});

function getRuneTreeJson(tree_name, runes_json) {
  for (var i = 0; i < runes_json.length; i++) {
    var tree = runes_json[i];
    if (tree.key === tree_name) {
      return tree;
    }
  }
  return null;
}
async function getItemJson() {
  let item_json = null;
  const patch = await getCurrentPatch();
  let formatted_URI =
    'https://ddragon.leagueoflegends.com/cdn/' +
    patch +
    '/data/en_US/item.json';
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
  for (var id in item_json.data) {
    if (item_json.data[id].name === item_name) {
      return item_json.data[id];
    }
  }
  return null;
}

async function getRunesJson() {
  const patch = await getCurrentPatch();

  const runes_path =
    'https://ddragon.leagueoflegends.com/cdn/' +
    patch +
    '/data/en_US/runesReforged.json';
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

  const path =
    'https://ddragon.leagueoflegends.com/cdn/' +
    patch +
    '/data/en_US/summoner.json';
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

  const path =
    'https://ddragon.leagueoflegends.com/cdn/' +
    patch +
    '/data/en_US/champion/' +
    champ_name +
    '.json';
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
