//TODO, remove redundancy in backendapirouter
const dotenv = require('dotenv');
dotenv.config();
const util = require('util');
const mongoose = require('mongoose');
const { Kayn, REGIONS } = require('kayn');
const kayn = Kayn(process.env.RIOT_API_KEY)();
const leaderboard_model = require('../models/leaderboard_model.js');
const WHATISMYMMR_RATELIMIT_RPS = 30;
const WHATSISMYMMR_BATCHING = 30;
const BACKOFF_FOR_ERROR_SECONDS = 5;
const axios = require('axios');
const rateLimit = require('axios-rate-limit');
const http = rateLimit(axios.create(), { maxRPS: WHATISMYMMR_RATELIMIT_RPS });
const cliProgress = require('cli-progress');
const sleep = require('sleep');
const schedule = require('node-schedule');

async function getLeaderboardData(region) {
  let mongo_docs = await leaderboard_model.find({
    region: region,
  });
  return mongo_docs;
}

const REGION_TO_RIOT_PLATFORM_ID = {
  [REGIONS.NORTH_AMERICA]: 'NA1',
  [REGIONS.EUROPE]: 'EUN1',
  [REGIONS.EUROPE_WEST]: 'EUW1',
};

//https://stackoverflow.com/questions/2631001/test-for-existence-of-nested-javascript-object-key
function getNested(obj, ...args) {
  return args.reduce((obj, level) => obj && obj[level], obj);
}

async function retry_async_function_with_wait(func, args, retry_num = 0) {
  //retries func with args up to 5 times
  if (retry_num > 5) {
    return 0;
  }
  try {
    func_return = await func(...args);
    return func_return;
  } catch (error) {
    if (error.response.status == 404) {
      return 0;
    }
    console.log(error);
    await sleep.sleep(BACKOFF_FOR_ERROR_SECONDS);
    console.log('retrying', func, '. attempt: ', retry_num);
    return await retry_async_function_with_wait(func, args, retry_num + 1);
  }
}

async function getRecentLeadersMatchlistForRegion(region) {
  console.log('Starting for region: ', region);
  let region_leaders = await getLeaderboardData(region);
  summoners = {};
  let match_ids = new Set();
  let prospect_account_ids = new Set();

  console.log('Converting current leaderboard into matchlist');
  let progress_bar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progress_bar.start(region_leaders.length, 0);
  await Promise.all(
    region_leaders.map(async (region_leader) => {
      let account_id = await kayn.Summoner.by
        .name(region_leader.true_summoner_name)
        .region(region)
        .then((res) => {
          prospect_account_ids.add(res.accountId);
          return res.accountId;
        })
        .catch((err) => {});

      if (account_id === undefined) {
        progress_bar.increment();
        return;
      }

      let unixtimestamp_in_milliseconds =
        Date.now() - 1.5 * 1000 * 60 * 60 * 24;
      let recent_matches = await kayn.Matchlist.by
        .accountID(account_id)
        .region(region)
        .query({
          queue: [450],
          beginTime: unixtimestamp_in_milliseconds,
        })
        .then((res) => {
          return res;
        })
        .catch((err) => {});

      if (
        recent_matches === undefined ||
        recent_matches.matches === undefined
      ) {
        progress_bar.increment();
        return;
      }

      recent_matches.matches.forEach((match_info) => {
        match_ids.add(match_info.gameId);
      });
      progress_bar.increment();
      return;
    })
  );
  progress_bar.stop();

  console.log('Converting matches into accounts');
  progress_bar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progress_bar.start([...match_ids].length, 0);
  await Promise.all(
    [...match_ids].map(async (match_id) => {
      await kayn.Match.get(match_id)
        .region(region)
        .then((res) => {
          res.participantIdentities.forEach((participant_identity) => {
            prospect_account_ids.add(
              participant_identity.player.currentAccountId
            );
          });
        })
        .catch((err) => {});
      progress_bar.increment();
    })
  );
  progress_bar.stop();

  console.log('Fetching MMR');
  progress_bar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progress_bar.start([...prospect_account_ids].length, 0);
  prospectives_complete_statistics = {};
  prospect_account_ids = [...prospect_account_ids];
  while (prospect_account_ids.length) {
    await Promise.all(
      prospect_account_ids.splice(0, 30).map(async (prospect_account_id) => {
        await kayn.Summoner.by
          .accountID(prospect_account_id)
          .region(region)
          .then(async (res) => {
            const args = [
              'https://' +
                region +
                '.whatismymmr.com/api/v1/summoner?name=' +
                encodeURI(res.name),
            ];
            let mmr_res = await retry_async_function_with_wait(http.get, args);
            mmr = getNested(mmr_res, 'data', 'ARAM', 'avg');
            prospectives_complete_statistics[prospect_account_id] = {
              true_summoner_name: res.name,
              accountId: prospect_account_id,
              mmr: mmr,
              region: region,
            };
          })
          .catch((err) => {
            console.log(err);
          });

        progress_bar.increment();
      })
    );
  }
  progress_bar.stop();

  null_filtered_prospectives_complete_statistics = [];
  for (const [accountId, value] of Object.entries(
    prospectives_complete_statistics
  )) {
    if (Number.isInteger(value.mmr)) {
      null_filtered_prospectives_complete_statistics.push(value);
    }
  }
  console.log(null_filtered_prospectives_complete_statistics.length);

  null_filtered_prospectives_complete_statistics = null_filtered_prospectives_complete_statistics
    .sort(function (a, b) {
      return b.mmr - a.mmr;
    })
    .slice(0, 1000);

  await leaderboard_model.deleteMany({ region: region });
  await leaderboard_model.insertMany(
    null_filtered_prospectives_complete_statistics
  );

  return match_ids;
}

async function updateAllRegions() {
  await getRecentLeadersMatchlistForRegion(REGIONS.NORTH_AMERICA);
  await getRecentLeadersMatchlistForRegion(REGIONS.EUROPE);
  await getRecentLeadersMatchlistForRegion(REGIONS.EUROPE_WEST);
}

function logDate() {
  let date_ob = new Date();
  let date = ('0' + date_ob.getDate()).slice(-2);
  let month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  console.log(
    year +
      '-' +
      month +
      '-' +
      date +
      ' ' +
      hours +
      ':' +
      minutes +
      ':' +
      seconds
  );
}

var job = schedule.scheduleJob('0 30 3 * * *', entrypoint);

async function entrypoint() {
  console.log('Started');
  logDate();
  mongoose.connect(
    process.env.DB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Connected to Mongoose');
      }
    }
  );
  updateAllRegions().then((data) => {
    console.log('Finished');
    logDate();
    mongoose.connection.close();
  });
}
