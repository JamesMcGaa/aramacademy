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

var resources = Resources.Resources;
const fetch = require('node-fetch');

const useStyles = makeStyles({
  table: {
    minWidth: 100,
  },
  iconCell: {
    'min-width': '60px',
    width: '60px',
    'max-width': '80px',
    padding: '8px',
  },
  resizeChampIcon: {
    minWidth: '40px',
    maxWidth: '40px',
    height: 'auto',
    width: '100%',
    borderRadius: '50%',
    padding: '0px',
  },
});

function getFullDDragonPath(patch, spell_name, sums_json) {
  let path = null;
  for (var id in sums_json.data) {
    const sum_json = sums_json.data[id];
    if (sum_json.id === spell_name) {
      path = sum_json.image.full;
    }
  }
  console.log(path);
  return (
    'https://ddragon.leagueoflegends.com/cdn/' + patch + '/img/spell/' + path
  );
}

export default function SpellsTable({ spells_data }) {
  if (spells_data.loaded === false) {
    return null;
  }

  const classes = useStyles();
  const summoner_spells = spells_data.summoner_spells;
  const sums_json = spells_data.sums_json;
  let path_list = [];
  for (var id in summoner_spells) {
    const name = summoner_spells[id];
    path_list.push(getFullDDragonPath(spells_data.patch, name, sums_json));
  }

  return (
    <Container>
      <img
        className={classes.resizeChampIcon}
        alt="summoner icon"
        src={path_list[0]}
      />{' '}
      <img
        className={classes.resizeChampIcon}
        alt="summoner icon"
        src={path_list[1]}
      />{' '}
    </Container>
  );
}
