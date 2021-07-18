const dotenv = require('dotenv');

dotenv.config();
const mongoose = require('mongoose');
const { Kayn } = require('kayn');

const kayn = Kayn(process.env.RIOT_API_KEY)();
const fs = require('fs');
const high_mmr_playerset_model = require('../models/high_mmr_playerset_model.js');
const utils = require('./utils.js');

let game_set;
let player_set;
let begin_time_unix;
let end_time_unix;

dotenv.config();

async function setupValues() {
  mongoose.connect(
    process.env.DB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Connected to Mongoose');
      }
    },
  );
  game_set = new Set();
  player_set = await high_mmr_playerset_model.find({});
  if (process.argv.length !== 4) {
    console.log('Usage: node pull_games.js [start time] [end time]');
    console.log('Start and end time should both be unix timestamps');
    console.log('Behavior if undefined if timestamp range is large (>1d)');
    process.exit();
  }
  begin_time_unix = process.argv[2];
  end_time_unix = process.argv[3];
}

async function getMatchlist(account_id, region) {
  const response = await kayn.Matchlist.by.accountId(account_id)
    .region(region)
    .query({
      queue: [utils.ARAM],
      beginTime: begin_time_unix,
      endTime: end_time_unix,
    });
  return response.matches;
}

async function pullGamesFromPlayers() {
  await Promise.all(
    player_set.map(async ({ accountId, region }) => getMatchlist(accountId, region)),
  ).then((all_games_lists) => {
    all_games_lists.forEach((game_list) => {
      game_list.forEach(game_set.add, game_set);
    });
  });
}

async function getMatch(game_id, platform_id) {
  const query_region = utils.PLATFORM_ID_TO_REGION[platform_id];
  const match = await kayn.Match.get(game_id).region(query_region);
  const timeline = await kayn.Match.timeline(game_id).region(query_region);
  return { match, timeline };
}

async function writeJSONToFile(obj, path) {
  try {
    fs.writeFileSync(path, JSON.stringify(obj));
  } catch (err) {
    console.error(err);
  }
}

async function pullAndSavePerGameData() {
  await Promise.all([...game_set].map(async ({ gameId, platformId }) => {
    const match_info = await getMatch(gameId, platformId);
    await writeJSONToFile(match_info, `./games/${game.match.gameId}.json`);
  }));
}

async function main() {
  console.log('Loading player set...');
  await setupValues();
  console.log(`Player set loaded. Size=${player_set.length}`);
  console.log('Pulling game set...');
  await pullGamesFromPlayers();
  console.log(`Game set populated. Size=${game_set.length}`);
  console.log('Pulling per game data...');
  await pullAndSavePerGameData();
  console.log('Games saved to ./games/');
}

main();
