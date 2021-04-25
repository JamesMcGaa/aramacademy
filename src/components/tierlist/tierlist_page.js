import React from 'react';
import TierlistPageDesktop from './tierlist_page_desktop.js';
import TierlistPageMobile from './tierlist_page_mobile.js';
import full_champ_json from '../../jsons/champ_data_11_8.json';

const mobile = require('is-mobile');
import Resources from '../resources.js';

var resources = Resources.Resources;

export default function TierlistPage() {
  var tierlist_data = [];
  for (var i = 0; i < Object.values(full_champ_json).length; i++) {
    const json_entry = Object.values(full_champ_json)[i];
    const champ_name = resources.reversed_two_word_champs.has(
      json_entry.champion
    )
      ? resources.reversed_two_word_champs.get(json_entry.champion)
      : json_entry.champion;
    var champ_entry = {
      champion: champ_name,
      pickrate: json_entry.pickrate,
      winrate: json_entry.winrate,
      tier: json_entry.tier,
    };
    tierlist_data.push(champ_entry);
  }
  if (mobile()) {
    return <TierlistPageMobile per_champion_data={tierlist_data} />;
  } else {
    return <TierlistPageDesktop per_champion_data={tierlist_data} />;
  }
}
