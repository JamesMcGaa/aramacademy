const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new mongoose.Schema({
  accountId: String,
  true_summoner_name: String,
  mmr: Number,
  region: String,
});

//Third argument to prevent pluralization
const leaderboard_model = mongoose.model('leaderboard', schema, 'leaderboard');

module.exports = leaderboard_model;
