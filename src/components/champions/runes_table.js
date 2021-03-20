import React from 'react';
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
import KeystoneRow from './keystone_row.js';

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
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: '4px',
    textAlign: 'center',
  },
});

function getRuneIconPath(rune_name, runes_json) {
  if (runes_json.key === rune_name) {
    return runes_json.icon;
  }
  for (var i = 0; i < runes_json.slots.length; i++) {
    var row = runes_json.slots[i];
    for (var j = 0; j < row.runes.length; j++) {
      var rune = row.runes[j];
      if (rune.key === rune_name) {
        return rune.icon;
      }
    }
  }
  return null;
}

function getFullDDragonPath(rune_name, runes_json) {
  return (
    'https://ddragon.leagueoflegends.com/cdn/img/' +
    getRuneIconPath(rune_name, runes_json)
  );
}

export default function RunesTable({ runes_data }) {
  if (runes_data.loaded === false) {
    return null;
  }
  const classes = useStyles();
  console.log(runes_data);
  const runes_primary_json = runes_data.runes_primary_json;
  //const elec_path = "perk-images/Styles/Domination/Electrocute/Electrocute.png"
  //const dd_path = 'https://ddragon.leagueoflegends.com/cdn/img/' + elec_path;
  console.log(runes_data.runes_primary);

  console.log(runes_primary_json);

  const runes_primary_list = runes_data.runes_primary_list;

  const dom_path = getFullDDragonPath('Domination', runes_primary_json);
  const elec_path = getFullDDragonPath('Electrocute', runes_primary_json);
  const ult_path = getFullDDragonPath('UltimateHunter', runes_primary_json);
  console.log(elec_path);
  const keystoneRowData = {
    runes_row: 1,
  };

  var stack = [];
  for (var i = 0; i < runes_primary_json.slots.length; i++) {
    //looping over 4 rows of runes
    var row = runes_primary_json.slots[i];
    var selected = runes_primary_list[i];
    console.log(selected, row);
    if (i === 0) {
      var a = <KeystoneRow selected={selected} row_json={row}></KeystoneRow>;
      stack.push(a);
    }
  }
  return (
    <Container>
      <img
        className={classes.resizeChampIcon}
        alt="summoner icon"
        src={dom_path}
      />{' '}
      <img
        className={classes.resizeChampIcon}
        alt="summoner icon"
        src={elec_path}
      />{' '}
      <img
        className={classes.resizeChampIcon}
        alt="summoner icon"
        src={ult_path}
      />{' '}
      {stack}
    </Container>
  );
}
