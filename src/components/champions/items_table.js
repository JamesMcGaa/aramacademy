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

function getFullDDragonPath(patch, item_json) {
  return (
    'https://ddragon.leagueoflegends.com/cdn/' +
    patch +
    '/img/item/' +
    item_json.image.full
  );
}

export default function ItemsTable({ items_data }) {
  if (items_data.loaded === false) {
    return null;
  }
  const classes = useStyles();
  const item_json_list = items_data.item_json_list;

  let path_list = [];
  for (var id in item_json_list) {
    const item_json = item_json_list[id];
    path_list.push(getFullDDragonPath(items_data.patch, item_json));
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
