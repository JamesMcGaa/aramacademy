const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new mongoose.Schema({
  accountId: String,
  true_summoner_name: String,
  region: String,
});

//Third argument to prevent pluralization
const high_mmr_playerset_model = mongoose.model(
  'high_mmr_playerset',
  schema,
  'high_mmr_playerset'
);

module.exports = high_mmr_playerset_model;
