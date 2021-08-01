/* eslint-disable comma-dangle */
/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable require-jsdoc */
const dotenv = require('dotenv');

dotenv.config();
const mongoose = require('mongoose');
const { Kayn, REGIONS } = require('kayn');

const kayn = Kayn(process.env.RIOT_API_KEY)();
const cliProgress = require('cli-progress');
const leaderboard_model = require('../models/leaderboard_model.js');
const high_mmr_playerset_model = require('../models/high_mmr_playerset_model.js');

const MILLISECONDS_IN_10_DAYS = 10 * 1000 * 60 * 60 * 24;
async function getLeaderboardData(region) {
  return leaderboard_model.find({
    region,
  });
}

async function getRecentLeadersMatchlistForRegion(region, beginTimeMs) {
  console.log('Starting for region: ', region);
  const region_leaders = await getLeaderboardData(region);
  const match_ids = new Set();
  const high_mmr_player_info_map = {};

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
          high_mmr_player_info_map[res.accountId] = {
            true_summoner_name: res.name,
            accountId: res.accountId,
            region,
          };
          return res.accountId;
        })
        .catch(() => {});

      if (account_id === undefined) {
        progress_bar.increment();
        return;
      }
      const recent_matches = await kayn.Matchlist.by
        .accountID(account_id)
        .region(region)
        .query({
          queue: [450],
          beginTime: beginTimeMs,
        })
        .then((res) => res)
        .catch(() => {});

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
            high_mmr_player_info_map[
              participant_identity.player.currentAccountId
            ] = {
              true_summoner_name: participant_identity.player.summonerName,
              accountId: participant_identity.player.currentAccountId,
              region,
            };
          });
        })
        .catch(() => {});
      progress_bar.increment();
    })
  );
  progress_bar.stop();
  console.log(
    Object.size(high_mmr_player_info_map),
    randomProperty(high_mmr_player_info_map),
    randomProperty(high_mmr_player_info_map)
  );
  // await high_mmr_playerset_model.deleteMany({ region });
  // await high_mmr_playerset_model.insertMany(prospectives_complete_statistics);
  return match_ids;
}

async function updateAllRegions(beginTimeMs) {
  await getRecentLeadersMatchlistForRegion(REGIONS.NORTH_AMERICA, beginTimeMs);
  await getRecentLeadersMatchlistForRegion(REGIONS.EUROPE, beginTimeMs);
  await getRecentLeadersMatchlistForRegion(REGIONS.EUROPE_WEST, beginTimeMs);
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

// https://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
function randomProperty(obj) {
  const keys = Object.keys(obj);
  return obj[keys[(keys.length * Math.random()) << 0]];
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
  const unixtimestamp_in_milliseconds = Date.now() - MILLISECONDS_IN_10_DAYS;
  updateAllRegions(unixtimestamp_in_milliseconds).then(() => {
    console.log('Finished');
    logDate();
    mongoose.connection.close();
  });
}

entrypoint();
