import React from 'react';
import { Helmet } from 'react-helmet';
import TierlistPageDesktop from './tierlist_page_desktop.js';
import TierlistPageMobile from './tierlist_page_mobile.js';
import full_champ_json from '../../jsons/champ_data_11_8.json';
import Resources from '../resources.js';

const mobile = require('is-mobile');

const resources = Resources.Resources;

function TierlistPage() {
  const tierlist_data = [];
  for (let i = 0; i < Object.values(full_champ_json).length; i++) {
    const json_entry = Object.values(full_champ_json)[i];
    const champ_name = resources.reversed_two_word_champs.has(
      json_entry.champion,
    )
      ? resources.reversed_two_word_champs.get(json_entry.champion)
      : json_entry.champion;
    const champ_entry = {
      champion: champ_name,
      pickrate: json_entry.pickrate,
      winrate: json_entry.winrate,
      tier: json_entry.tier,
    };
    tierlist_data.push(champ_entry);
  }
  if (mobile()) {
    return <TierlistPageMobile per_champion_data={tierlist_data} />;
  }
  return <TierlistPageDesktop per_champion_data={tierlist_data} />;
}

export default function WrappedTierlistPage() {
  console.log(WrappedTierlistPage);
  return (
    <div>
      {TierlistPage()}
      <Helmet>
        <title>
          ARAM Tierlist - ARAM Academy
        </title>
        <meta
          name="description"
          content="ARAM Academy maintains the ultimate champion tierlist for ARAM, sourced exclusivly from the top 1% of ARAM players.
          Find the best ARAM builds, tierlists, leaderboards, and stats today."
        />
      </Helmet>
    </div>
  );
}
