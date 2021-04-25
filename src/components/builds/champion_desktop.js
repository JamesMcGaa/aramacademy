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
import { makeStyles } from '@material-ui/core/styles';

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

export default function ChampionsDesktop({ data, champion_name }) {
  const classes = useStyles();
  return (
    <div>
      <div style={{ height: '100px' }}></div>
      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          <BuildHeader data={data} champion_name={champion_name} />
        </Paper>
      </Container>

      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          <div className={classes.runesAndSpells}>
            <div className={classes.runes}>
              <RunesTable runes_data={data} />
            </div>
            <div className={classes.spells}>
              <SpellsTable spells_data={data} />
            </div>
          </div>
        </Paper>
      </Container>
      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          <ItemsTable items_data={data} />
        </Paper>
      </Container>
      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          <div className={classes.abilities}>
            <div className={classes.abilities_order}>
              <AbilitiesOrder data={data} champion_name={champion_name} />
            </div>
            <div className={classes.abilities_path}>
              <AbilitiesPath data={data} champion_name={champion_name} />
            </div>
          </div>
        </Paper>
      </Container>
    </div>
  );
}
