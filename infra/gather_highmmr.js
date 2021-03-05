/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable require-jsdoc */
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const { Kayn, REGIONS } = require('kayn');
const kayn = Kayn(process.env.RIOT_API_KEY)();
const leaderboard_model = require('../models/leaderboard_model.js');
const BACKOFF_FOR_ERROR_SECONDS = 5;
const cliProgress = require('cli-progress');
const sleep = require('sleep');
const high_mmr_playerset_model = require('../models/high_mmr_playerset_model.js');

async function getLeaderboardData(region) {
  return await leaderboard_model.find({
    region: region,
  });
}

async function retry_async_function_with_wait(func, args, retry_num = 0) {
  // retries func with args up to 5 times
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
  const region_leaders = await getLeaderboardData(region);
  summoners = {};
  const match_ids = new Set();
  let prospect_account_ids = new Set();

  console.log('Converting current leaderboard into matchlist');
  let progress_bar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progress_bar.start(region_leaders.length, 0);
  await Promise.all(
    region_leaders.map(async (region_leader) => {
      const account_id = await kayn.Summoner.by
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

      let unixtimestamp_in_milliseconds = Date.now() - 10 * 1000 * 60 * 60 * 24;
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

  console.log('Fetching other player statistics');
  progress_bar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progress_bar.start([...prospect_account_ids].length, 0);
  prospectives_complete_statistics = [];
  prospect_account_ids = [...prospect_account_ids];
  while (prospect_account_ids.length) {
    await Promise.all(
      prospect_account_ids.splice(0, 30).map(async (prospect_account_id) => {
        await kayn.Summoner.by
          .accountID(prospect_account_id)
          .region(region)
          .then(async (res) => {
            prospectives_complete_statistics.push({
              true_summoner_name: res.name,
              accountId: prospect_account_id,
              region: region,
            });
          })
          .catch((err) => {
            console.log(err);
          });
        progress_bar.increment();
      })
    );
  }
  progress_bar.stop();
  console.log(prospectives_complete_statistics.length);

  await high_mmr_playerset_model.insertMany(prospectives_complete_statistics);
  return match_ids;
}

async function updateAllRegions() {
  await getRecentLeadersMatchlistForRegion(REGIONS.NORTH_AMERICA);
  await getRecentLeadersMatchlistForRegion(REGIONS.EUROPE);
  await getRecentLeadersMatchlistForRegion(REGIONS.EUROPE_WEST);
}

function logDate() {
  const date_ob = new Date();
  const date = ('0' + date_ob.getDate()).slice(-2);
  const month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
  const year = date_ob.getFullYear();
  const hours = date_ob.getHours();
  const minutes = date_ob.getMinutes();
  const seconds = date_ob.getSeconds();
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

async function entrypoint() {
  console.log('Started');
  logDate();
  await mongoose.connect(
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

logDate();
entrypoint().then().catch();
