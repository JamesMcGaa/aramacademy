const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const schema = new mongoose.Schema({
  accountId: String,
  true_summoner_name: String,
  region: String,
  standardized_summoner_name: String,
  last_updated_timestamp_ms: Number,
  last_processed_game_timestamp_ms: Number,
  per_champion_data: [
    {
      champion: String,
      wins: Number,
      total_games: Number,
      kills: Number,
      deaths: Number,
      assists: Number,
      pentakills: Number,
    },
  ],
  recent_games: [
    {
      champion: String,
      win: Boolean,
      kills: Number,
      deaths: Number,
      assists: Number,
    },
  ],
  icon_id: Number,
});

//Third argument to prevent pluralization
const user_model = mongoose.model('user_data', schema, 'user_data');

module.exports = user_model;
