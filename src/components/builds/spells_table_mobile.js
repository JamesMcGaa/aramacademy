import _ from 'lodash';
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Resources from '../resources.js';
import { Button, Container } from '@material-ui/core';
import { Header, Winrate } from './utils.js';

var resources = Resources.Resources;
const fetch = require('node-fetch');

const useStyles = makeStyles({
  section: {
    padding: 20,
  },
  table: {
    display: 'flex',
  },
  row: {
    display: 'flex',
    marginTop: 20,
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summonerSpellIcon: {
    minWidth: 40,
    maxWidth: 40,
    height: 'auto',
    borderRadius: 2,
    padding: 0,
  },
});

function getFullDDragonPath(patch, spell_name, sums_json) {
  let path = null;
  for (var id in sums_json.data) {
    const sum_json = sums_json.data[id];
    if (sum_json.name === spell_name) {
      path = sum_json.image.full;
    }
  }
  return (
    'https://ddragon.leagueoflegends.com/cdn/' + patch + '/img/spell/' + path
  );
}

export default function SpellsTableMobile({ spells_data }) {
  if (spells_data.loaded === false) {
    return null;
  }

  const classes = useStyles();
  const summoner_spells = spells_data.summoner_spells;
  const sums_json = spells_data.sums_json;
  const SpellsTableBody = () => {
    const rows = _.map(summoner_spells, (summoners) => {
      return SpellsTableRow(summoners);
    });
    return <div>{rows}</div>;
  };

  const SpellsTableRow = ({ spells, spells_winrate }) => {
    return (
      <div className={classes.row}>
        <div>
          <img
            className={classes.summonerSpellIcon}
            alt="summoner icon"
            src={getFullDDragonPath(spells_data.patch, spells[0], sums_json)}
          />{' '}
          <img
            className={classes.summonerSpellIcon}
            alt="summoner icon"
            src={getFullDDragonPath(spells_data.patch, spells[1], sums_json)}
          />
        </div>
        {Winrate(spells_winrate)}
      </div>
    );
  };

  return (
    <div className={classes.section}>
      {Header('Summoner Spells')}
      {SpellsTableBody()}
    </div>
  );
}
