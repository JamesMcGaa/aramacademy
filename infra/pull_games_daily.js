//this script has a function that takes in a timestamp and fetches games for past day
const dotenv = require('dotenv');

dotenv.config();
const mongoose = require('mongoose');
const { Kayn } = require('kayn');
const kayn = Kayn(process.env.RIOT_API_KEY)();
const fs = require('fs');
const high_mmr_playerset_model = require('../models/high_mmr_playerset_model.js');
const utils = require('./utils.js');

async function getMatchlist(account_id, region, begin, end) {
  const response = await kayn.Matchlist.by
    .accountID(account_id)
    .region(region)
    .query({
      queue: [utils.ARAM],
      beginTime: begin,
      endTime: end,
    })
    .then((matchlist) => {
      return matchlist;
    });
  return response.matches;
}

function getStartEndTimestamp() {
  const end = Date.now();
  const begin = end - 60 * 60 * 1000;
  return { begin, end };
}

async function pullGamesFromPlayers(begin, end) {
  const player_set = await high_mmr_playerset_model.find({});
  var game_set = new Set();
  await Promise.all(
    player_set.map(async ({ accountId, region }) =>
      getMatchlist(accountId, region, begin, end)
    )
  ).then((all_games_lists) => {
    all_games_lists.forEach((game_list) => {
      game_list.forEach(game_set.add, game_set);
    });
  });
  return game_set;
}

async function getMatch(game_id, platform_id) {
  const query_region = utils.PLATFORM_ID_TO_REGION[platform_id];
  const match = await kayn.Match.get(game_id).region(query_region);
  const timeline = await kayn.Match.timeline(game_id).region(query_region);
  return { match, timeline };
}

async function pullAndSavePerGameData(game_set) {
  await Promise.all(
    [...game_set].map(async ({ gameId, platformId }) => {
      const match_info = await getMatch(gameId, platformId);
      console.log(match_info);
    })
  );
}

async function setupMongoose() {
  mongoose.connect(
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
}

async function pullGamesLastDay(timestamp) {}

setupMongoose();
var timestamps = getStartEndTimestamp();
console.log('elo');
async () => {
  const game_set = await pullGamesFromPlayers(timestamps.begin, timestamps.end);
  console.log(game_set);
  await pullAndSavePerGameData(game_set);
};

module.exports = { pullGamesLastDay };
