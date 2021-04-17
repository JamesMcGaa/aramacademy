import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Button, Container } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';

import PropTypes from 'prop-types';

import Resources from '../resources.js';
import RunesTableMobile from './runes_table_mobile.js';
import ItemsTableMobile from './items_table_mobile.js';
import SpellsTableMobile from './spells_table_mobile.js';
import AbilitiesOrderMobile from './abilities_order_mobile.js';
import BuildHeaderMobile from './build_header_mobile.js';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  largeContainer: {
    //'min-width': '1200px',
    //'max-width': '1200px',
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

  runes: {
    flexGrow: 3,
    borderRight: '1px solid #555555',
  },
  spells: {
    flexGrow: 1,
  },
}));

export default function ChampionsMobile({
  data,
  champion_name,
  tierlist_data,
  total_games,
}) {
  const classes = useStyles();
  return (
    <div>
      <div style={{ height: '100px' }}></div>
      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          <BuildHeaderMobile
            data={data}
            champion_name={champion_name}
            tierlist_data={tierlist_data}
            total_games={total_games}
          />
        </Paper>
      </Container>
      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          <div className={classes.runes}>
            <RunesTableMobile runes_data={data} />
          </div>
        </Paper>
      </Container>
      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          <div className={classes.spells}>
            <SpellsTableMobile spells_data={data} />
          </div>
        </Paper>
      </Container>
      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          <ItemsTableMobile items_data={data} />
        </Paper>
      </Container>
      <Container fixed className={classes.largeContainer}>
        <Paper classes={{ root: classes.paperRoot }}>
          <AbilitiesOrderMobile data={data} champion_name={champion_name} />
        </Paper>
      </Container>
    </div>
  );
}
