import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Button, Container } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';

import PropTypes from 'prop-types';

import ChampionsGrid from './champions_grid.js';
import Resources from '../resources.js';
import RoleTable from './role_table.js';
import RunesTable from './runes_table.js';
import ItemsTable from './items_table.js';
import SpellsTable from './spells_table.js';
import AbilitiesTable from './abilities_table.js';
var resources = Resources.Resources;

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  largeContainer: {
    'min-width': '1200px',
    'max-width': '1200px',
  },
  resizeChampIcon: {
    minWidth: '130px',
    maxWidth: '130px',
    height: 'auto',
    width: '100%',
    //borderRadius: '50%',
    padding: '5px',
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
    winrate: undefined,
    pickrate: undefined,
    runes_primary: null,
    runes_primary_json: null,
    runes_primary_list: null,
    runes_secondary: null,
    runes_secondary_list: null,
    runes_secondary_json: null,
    runes_stats: null,
    item_json_list: null,
    sums_json: null,
    summoner_spells: null,
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
      winrate: json.winrate,
      pickrate: json.pickrate,
      runes_primary: json.runes_primary,
      runes_primary_json: json.runes_primary_json,
      runes_primary_list: json.runes_primary_list,
      runes_secondary: json.runes_secondary,
      runes_secondary_list: json.runes_secondary_list,
      runes_secondary_json: json.runes_secondary_json,
      runes_stats: json.runes_stats,
      item_json_list: json.item_json_list,
      sums_json: json.sums_json,
      summoner_spells: json.summoner_spells,
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
          <img
            className={classes.resizeChampIcon}
            src={resources.champ_icons[params.champion]}
          />
          <h1>{params.champion}</h1>
        </Paper>
      </Container>

      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          Runes items sum spells sample
          <h1>{params.champion}</h1>
        </Paper>
      </Container>
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
      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          <ItemsTable items_data={state} />
        </Paper>
      </Container>
      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          <AbilitiesTable data={state} champion_name={params.champion} />
        </Paper>
      </Container>
    </div>
  );
}
