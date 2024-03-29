/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable require-jsdoc */
const dotenv = require('dotenv');

dotenv.config();
const mongoose = require('mongoose');

const WHATISMYMMR_RATELIMIT_RPS = 1;
const BACKOFF_FOR_ERROR_SECONDS = 5;
const axios = require('axios');
const rateLimit = require('axios-rate-limit');

const axios_limited = rateLimit(axios.create(), {
  maxRPS: WHATISMYMMR_RATELIMIT_RPS,
});
const cliProgress = require('cli-progress');
const sleep = require('sleep');
const schedule = require('node-schedule');
const leaderboard_model = require('../models/leaderboard_model.js');
const galeforce_calls = require('./galeforce_calls.js');

async function getLeaderboardData(region) {
  return leaderboard_model.find({
    region,
  });
}

// https://stackoverflow.com/questions/2631001/test-for-existence-of-nested-javascript-object-key
function getNested(obj, ...args) {
  return args.reduce((obj, level) => obj && obj[level], obj);
}

async function retry_async_function_with_wait(func, args, retry_num = 0) {
  // retries func with args up to 5 times
  if (retry_num > 5) {
    return 0;
  }
  try {
    const func_return = await func(...args);
    return func_return;
  } catch (error) {
    if (error.response.status === 404) {
      return 0;
    }
    console.log(error);
    await sleep.sleep(BACKOFF_FOR_ERROR_SECONDS);
    console.log('retrying', func, '. attempt: ', retry_num);
    return retry_async_function_with_wait(func, args, retry_num + 1);
  }
}

async function getRecentLeadersMatchlistForRegion(region) {
  console.log('Starting for region: ', region);
  const region_leaders = await getLeaderboardData(region);
  const match_ids = new Set();
  let prospect_puuids = new Set();

  console.log('Converting current leaderboard into matchlist');
  let progress_bar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progress_bar.start(region_leaders.length, 0);
  await Promise.all(
    region_leaders.map(async (region_leader) => {
      const puuid = region_leader.puuid;
      prospect_puuids.add(puuid);

      if (puuid === undefined) {
        progress_bar.increment();
        return;
      }
      const unixtimestamp_in_milliseconds =
        Date.now() - 1.5 * 1000 * 60 * 60 * 24;

      const recent_matches = await galeforce_calls
        .get_recent_matches_leaderboard(
          puuid,
          region,
          Math.floor(unixtimestamp_in_milliseconds / 1000)
        )
        .then((res) => res)
        .catch((err) => {});

      if (recent_matches === undefined) {
        progress_bar.increment();
        return;
      }
      recent_matches.forEach((match_id) => {
        match_ids.add(match_id);
      });
      progress_bar.increment();
    })
  );
  progress_bar.stop();

  console.log('Converting matches into accounts');
  progress_bar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progress_bar.start(match_ids.size, 0);
  await Promise.all(
    [...match_ids].map(async (match_id) => {
      await galeforce_calls
        .get_match(match_id, region)
        .then((res) => {
          res.info.participants.forEach((participant) => {
            prospect_puuids.add(participant.puuid);
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
  progress_bar.start([...prospect_puuids].length, 0);
  const prospectives_complete_statistics = {};
  prospect_puuids = [...prospect_puuids];
  while (prospect_puuids.length) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(
      prospect_puuids.splice(0, 30).map(async (prospect_puuid) => {
        await galeforce_calls
          .get_summoner_from_puuid(prospect_puuid, region) // Seems redundant
          .then(async (res) => {
            const args = [
              `https://${region}.whatismymmr.com/api/v1/summoner?name=${encodeURI(
                res.name
              )}`,
              { headers: { 'User-Agent': 'ARAM-ACADEMY-LEADERBOARD-UPDATE' } },
            ];
            const mmr_res = await retry_async_function_with_wait(
              axios_limited.get,
              args
            );
            const mmr = getNested(mmr_res, 'data', 'ARAM', 'avg');
            prospectives_complete_statistics[prospect_puuid] = {
              true_summoner_name: res.name,
              puuid: prospect_puuid,
              mmr,
              region,
            };
          })
          .catch((err) => {});

        progress_bar.increment();
      })
    );
  }
  progress_bar.stop();

  let null_filtered_prospectives_complete_statistics = [];
  Object.values(prospectives_complete_statistics).forEach((value) => {
    if (Number.isInteger(value.mmr)) {
      null_filtered_prospectives_complete_statistics.push(value);
    }
  });
  console.log(null_filtered_prospectives_complete_statistics.length);

  null_filtered_prospectives_complete_statistics = null_filtered_prospectives_complete_statistics
    .sort((a, b) => b.mmr - a.mmr)
    .slice(0, 1000);

  await leaderboard_model.deleteMany({ region });
  await leaderboard_model.insertMany(
    null_filtered_prospectives_complete_statistics
  );

  return match_ids;
}

async function updateAllRegions() {
  await getRecentLeadersMatchlistForRegion('na');
  await getRecentLeadersMatchlistForRegion('euw');
  await getRecentLeadersMatchlistForRegion('eune');
}

function logDate() {
  const date_ob = new Date();
  const date = `0${date_ob.getDate()}`.slice(-2);
  const month = `0${date_ob.getMonth() + 1}`.slice(-2);
  const year = date_ob.getFullYear();
  const hours = date_ob.getHours();
  const minutes = date_ob.getMinutes();
  const seconds = date_ob.getSeconds();
  console.log(`${year}-${month}-${date} ${hours}:${minutes}:${seconds}`);
}

async function entrypoint() {
  console.log('Started');
  logDate();
  await mongoose.connect(
    process.env.DB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Connected to Mongoose');
      }
    }
  );
  updateAllRegions().then((_) => {
    console.log('Finished');
    logDate();
    mongoose.connection.close();
  });
}

const job = schedule.scheduleJob('0 30 7 * * *', entrypoint); // 7:30AM UTC
