import React from 'react';
import tierlist_json from '../../jsons/tierlist.json';
import TierlistPageDesktop from './tierlist_page_desktop.js';
import TierlistPageMobile from './tierlist_page_mobile.js';

const mobile = require('is-mobile');

function getTotalGames(tierlist_json) {
  let total_games = 0;
  tierlist_json.forEach((champion) => {
    total_games += champion.total_games;
  });
  return total_games / 10; // 10 champs per game
}

export default function TierlistPage() {
  if (mobile()) {
    return (
      <TierlistPageMobile
        total_games={getTotalGames(tierlist_json)}
        per_champion_data={tierlist_json}
      />
    );
  } else {
    return (
      <TierlistPageDesktop
        total_games={getTotalGames(tierlist_json)}
        per_champion_data={tierlist_json}
      />
    );
  }
}
