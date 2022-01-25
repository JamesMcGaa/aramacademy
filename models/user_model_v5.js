const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);

const schema = new mongoose.Schema({
  puuid: String,
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

// Third argument to prevent pluralization
const user_model_v5 = mongoose.model('user_data_v5', schema, 'user_data_v5');

module.exports = user_model_v5;
