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

function getFullPassivePath(patch, spell_path) {
  return (
    'https://ddragon.leagueoflegends.com/cdn/' +
    patch +
    '/img/passive/' +
    spell_path
  );
}
function getFullSpellPath(patch, spell_path) {
  return (
    'https://ddragon.leagueoflegends.com/cdn/' +
    patch +
    '/img/spell/' +
    spell_path
  );
}

export default function AbilitiesTable({ data, champion_name }) {
  if (data.loaded === false) {
    return null;
  }

  const classes = useStyles();
  const summoner_spells = data.summoner_spells;
  const sums_json = data.sums_json;

  const champion_json = data.champion_json;
  // let path_list = [];
  // for (var id in summoner_spells) {
  //     const name = summoner_spells[id];
  //     path_list.push(getFullDDragonPath(data.patch, name, sums_json));
  // }

  const champion_data = champion_json.data[champion_name];
  const passive_path = champion_data.passive.image.full;
  const full_passive = getFullPassivePath(data.patch, passive_path);

  let path_list = [];
  for (var i = 0; i < champion_data.spells.length; i++) {
    var spell = champion_data.spells[i];
    const spell_path = spell.image.full;
    path_list.push(getFullSpellPath(data.patch, spell_path));
  }

  return (
    <Container>
      <img
        className={classes.resizeChampIcon}
        alt="summoner icon"
        src={full_passive}
      />{' '}
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
      <img
        className={classes.resizeChampIcon}
        alt="summoner icon"
        src={path_list[2]}
      />{' '}
      <img
        className={classes.resizeChampIcon}
        alt="summoner icon"
        src={path_list[3]}
      />{' '}
    </Container>
  );
}
