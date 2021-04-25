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
    borderRadius: 1,
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
    justifyContent: 'center',
  },
  items: {
    display: 'flex',
    flexDirection: 'row',
  },
  itemSection: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 10,
  },
  borderSection: {
    width: 0,
    borderRight: '1px solid #555555',
  },
  itemBlockContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemBlock: {
    display: 'flex',
    marginBottom: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  itemSingleBlock: {
    flexGrow: 1,
  },
  itemDivider: {
    borderTop: '1px solid #8e793e',
    marginTop: 10,
    marginBottom: 10,
  },
  itemMultiDivider: {
    borderTop: '1px solid #8e793e',
    marginBottom: 3,
  },
});

function getFullDDragonPath(patch, item_json) {
  if (item_json === null) {
    return null;
  }
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

  const SingleChoiceItemsRow = ({ items, items_winrate }) => {
    let path_list = [];
    for (var index in items) {
      const item_json = items[index];
      path_list.push(getFullDDragonPath(items_data.patch, item_json));
    }
    const icons = _.map(path_list, (path) => (
      <img className={classes.resizeChampIcon} alt="no item" src={path} />
    ));
    return (
      <div className={classes.itemSingleBlock}>
        {icons}
        {Winrate(items_winrate)}
      </div>
    );
  };

  const SingleChoiceItemsBlock = (category) => {
    console.log('items', items_json[category]);
    const itemsRows = _.map(items_json[category], SingleChoiceItemsRow);
    return (
      <div className={classes.itemSection}>
        {Header(category)}
        {itemsRows[0]}
        <div className={classes.itemDivider} />
        {itemsRows[1]}
      </div>
    );
  };
  const MultiChoiceItemBlock = (category) => {
    const ItemBlock = ({ items, items_winrate }) => {
      const item_json = items[0];
      const path = getFullDDragonPath(items_data.patch, item_json);
      return (
        <div className={classes.itemBlock}>
          <img
            className={classes.resizeChampIcon}
            alt="summoner icon"
            src={path}
          />
          {Winrate(items_winrate)}
        </div>
      );
    };
    const blocks = _.map(items_json[category], ItemBlock);
    return (
      <div className={classes.itemSection}>
        {Header(category)}
        <div className={classes.itemBlockContainer}>{blocks}</div>
      </div>
    );
  };

  const BorderBlock = () => {
    return <div className={classes.borderSection}></div>;
  };

  return (
    <div className={classes.items}>
      {SingleChoiceItemsBlock('Starting Items')}
      {BorderBlock()}
      {SingleChoiceItemsBlock('Mythic and Core Items')}
      {BorderBlock()}
      {MultiChoiceItemBlock('Fourth Item Options')}
      {BorderBlock()}
      {MultiChoiceItemBlock('Fifth Item Options')}
      {BorderBlock()}
      {MultiChoiceItemBlock('Sixth Item Options')}
    </div>
  );
}
