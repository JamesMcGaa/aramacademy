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

var resources = Resources.Resources;
const fetch = require('node-fetch');

const useStyles = makeStyles({
  section: {
    padding: 20,
  },
  header: {
    position: 'relative',
    display: 'flex',
    marginBottom: 20,
    width: '100%',
    fontSize: 14,
    fontWeight: 700,
    borderBottom: '1px solid #3f51b5',
  },
  table: {
    display: 'flex',
  },
  row: {
    display: 'flex',
    marginBottom: 10,
  },
  image: {
    flex: '50%',
  },
  text: {
    flex: '50%',
    textAlign: 'left',
    padding: 15,
  },
  resizeChampIcon: {
    minWidth: '160px',
    maxWidth: '160px',
    height: 'auto',
    width: '100%',
    //borderRadius: '50%',
    padding: '5px',
  },
  resizeTierIcon: {
    minWidth: '31px',
    maxWidth: '31px',
    height: 'auto',
    width: '100%',
    //borderRadius: '50%',
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
  return (
    'https://ddragon.leagueoflegends.com/cdn/' + patch + '/img/spell/' + path
  );
}

export default function BuildHeader({ data, champion_name, tierlist_data }) {
  if (data.loaded === false) {
    return null;
  }
  const classes = useStyles();
  console.log(tierlist_data);
  const tier = tierlist_data.tier;
  const lowercaseTier = tier.toLowerCase();
  return (
    <div className={classes.row}>
      <div classNAme={classes.image}>
        <img
          className={classes.resizeChampIcon}
          src={resources.champ_icons[champion_name]}
        />
      </div>

      <div className={classes.text}>
        <Typography variant="h3">{champion_name}</Typography>
        <Typography variant="body2">
          generated exclusively from the top 1% of ARAM players
        </Typography>
        <Typography variant="body1">
          Tier{' '}
          <img
            className={classes.resizeTierIcon}
            src={resources.tier_badges[lowercaseTier]}
          />
        </Typography>
        <Typography variant="body1">winrate {tierlist_data.wins}</Typography>
        <Typography variant="body1">pickrate</Typography>
      </div>
    </div>
  );
}
