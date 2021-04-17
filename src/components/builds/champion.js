import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Button, Container } from '@material-ui/core';
import ChampionDesktop from './champion_desktop.js';
import ChampionMobile from './champion_mobile.js';
const mobile = require('is-mobile');
import tierlist_json from '../../jsons/tierlist.json';

function getChampionTierlistData(tierlist_json, champion_name) {
  for (var i = 0; i < tierlist_json.length; i++) {
    const data = tierlist_json[i];
    if (data.champion === champion_name) {
      return data;
    }
  }
}
function getTotalGames(tierlist_json) {
  let total_games = 0;
  tierlist_json.forEach((champion) => {
    total_games += champion.total_games;
  });
  return total_games / 10; // 10 champs per game
}

export default function Champions() {
  const params = useParams();
  const [state, setState] = useState({
    runes: [],
    items_json: null,
    sums_json: null,
    summoner_spells: null,
    abilities_order: null,
    abilities_levels: null,
    champion_json: null,
    loaded: false,
    patch: undefined,
  });
  //We query mongo/static json for items/runes/sumspells, query ddragon for the specific assets we want after this

  function getBuilds(champion) {
    fetch('/api/builds/' + encodeURI(champion))
      .then((response) => response.json())
      .then((json) => {
        handleResponse(json);
      });
  }
  function handleResponse(json) {
    setState({
      runes: json.runes_full,
      items_json: json.items_json_full,
      sums_json: json.sums_json,
      summoner_spells: json.summoner_spells,
      abilities_order: json.abilities_order,
      abilities_levels: json.abilities_levels,
      champion_json: json.champion_json,
      patch: json.patch,
      loaded: true,
    });
  }
  if (state.loaded === false) {
    getBuilds(params.champion);
  }
  console.log(state);

  if (mobile()) {
    return (
      <ChampionMobile
        data={state}
        champion_name={params.champion}
        tierlist_data={getChampionTierlistData(tierlist_json, params.champion)}
        total_games={getTotalGames(tierlist_json)}
      />
    );
  } else {
    return (
      <ChampionDesktop
        data={state}
        champion_name={params.champion}
        tierlist_data={getChampionTierlistData(tierlist_json, params.champion)}
        total_games={getTotalGames(tierlist_json)}
      />
    );
  }
}
