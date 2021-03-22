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
    margin: 5,
  },
  header: {
    position: 'relative',
    display: 'flex',
    marginBottom: 10,
    width: '100%',
    fontSize: 14,
    fontWeight: 700,
    borderBottom: '1px solid #3f51b5',
  },
  items: {
    display: 'flex',
    flexDirection: 'row',
  },
  itemSection: {
    flexGrow: 1,
    padding: 20,
  },
  itemBlockContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemBlock: {
    display: 'flex',
    marginBottom: 5,
    justifyContent: 'space-between',
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
  const items_json = items_data.items_json;
  console.log(items_json);

  const Header = (title) => {
    return <div className={classes.header}>{title}</div>;
  };

  const SingleChoiceItemsBlock = (category) => {
    let path_list = [];
    for (var index in items_json[category]) {
      const item_json = items_json[category][index];
      path_list.push(getFullDDragonPath(items_data.patch, item_json));
    }
    const icons = _.map(path_list, path => (
      <img
        className={classes.resizeChampIcon}
        alt="summoner icon"
        src={path}
      />
    ));
    return (
      <div className={classes.itemSection}>
        {Header(category)}
        {icons}
        <div>
          WR: 50.0
        </div>
      </div>
    );
  }
  const MultiChoiceItemBlock = (category) => {
    let path_list = [];
    for (var index in items_json[category]) {
      const item_json = items_json[category][index];
      path_list.push(getFullDDragonPath(items_data.patch, item_json));
    }
    const ItemBlock = (path) => {
      return (
        <div className={classes.itemBlock}>
          <img
            className={classes.resizeChampIcon}
            alt="summoner icon"
            src={path}
          />
          <div>
            WR: 50.0
          </div>
        </div>
      );
    }
    const blocks = _.map(path_list, path => ItemBlock(path));
    console.log(category);
    console.log(path_list);
    console.log(blocks);
    return (
      <div className={classes.itemSection}>
        {Header(category)}
        <div className={classes.itemBlockContainer}>
          {blocks}
        </div>
      </div>
    );
  }

  return (
    <div className={classes.items}>
      {SingleChoiceItemsBlock('Starting Items')}
      {SingleChoiceItemsBlock('Mythic and Core Items')}
      {MultiChoiceItemBlock('Fourth Item Options')}
      {MultiChoiceItemBlock('Fifth Item Options')}
      {MultiChoiceItemBlock('Sixth Item Options')}
    </div>
  );
}
