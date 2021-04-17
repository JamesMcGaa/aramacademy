import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Button, Container } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';

import PropTypes from 'prop-types';

import Resources from '../resources.js';
import RunesTable from './runes_table.js';
import ItemsTable from './items_table.js';
import SpellsTable from './spells_table.js';
import AbilitiesOrder from './abilities_order.js';
import AbilitiesPath from './abilities_path.js';
import BuildHeader from './build_header.js';
var resources = Resources.Resources;

import tierlist_json from '../../jsons/tierlist.json';

import { makeStyles } from '@material-ui/core/styles';

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

const useStyles = makeStyles((theme) => ({
  largeContainer: {
    'min-width': '1200px',
    'max-width': '1200px',
    marginBottom: 10,
  },
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  paperRoot: {
    'background-color': 'rgba(66,66,66,.8)',
  },
  runesAndSpells: {
    display: 'flex',
    flexDirection: 'row',
  },
  abilities: {
    display: 'flex',
    flexDirection: 'row',
  },
  abilities_order: {
    flexGrow: 1,
    borderRight: '1px solid #555555',
  },
  abilities_path: {
    flexGrow: 3,
  },
  runes: {
    flexGrow: 3,
    borderRight: '1px solid #555555',
  },
  spells: {
    flexGrow: 1,
  },
}));

export default function Champions() {
  const classes = useStyles();
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

  return (
    <div>
      <div style={{ height: '100px' }}></div>
      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          <BuildHeader
            data={state}
            champion_name={params.champion}
            tierlist_data={getChampionTierlistData(
              tierlist_json,
              params.champion
            )}
            total_games={getTotalGames(tierlist_json)}
          />
        </Paper>
      </Container>

      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          <div className={classes.runesAndSpells}>
            <div className={classes.runes}>
              <RunesTable runes_data={state} />
            </div>
            <div className={classes.spells}>
              <SpellsTable spells_data={state} />
            </div>
          </div>
        </Paper>
      </Container>
      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          <ItemsTable items_data={state} />
        </Paper>
      </Container>
      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          <div className={classes.abilities}>
            <div className={classes.abilities_order}>
              <AbilitiesOrder data={state} champion_name={params.champion} />
            </div>
            <div className={classes.abilities_path}>
              <AbilitiesPath data={state} champion_name={params.champion} />
            </div>
          </div>
        </Paper>
      </Container>
    </div>
  );
}
