import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import TierlistTable from './tierlist_table.js';
import Typography from '@material-ui/core/Typography';

import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';

import Grid from '@material-ui/core/Grid';

import Resources from '../resources.js';

var resources = Resources.Resources;

import { Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  largeContainer: {
    'min-width': '1200px',
    'max-width': '1200px',
  },
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  paperRoot: {
    'background-color': 'rgba(66,66,66,.8)',
  },
}));

export default function TierlistPageDesktop() {
  const classes = useStyles();
  const params = useParams();

  const [state, setState] = useState({
    patch: undefined,
  });

  const row = { champion: 'Zed', wins: 1231, tier: 'S', total_games: 1234 };
  const row2 = { champion: 'Ahri', wins: 500, tier: 'A', total_games: 1234 };
  const row3 = { champion: 'KogMaw', wins: 623, tier: 'B', total_games: 1434 };
  const row4 = { champion: 'LeeSin', wins: 623, tier: 'C', total_games: 12224 };
  const row5 = { champion: 'Viego', wins: 3123, tier: 'D', total_games: 3984 };

  const per_champion_data = [row, row2, row3, row4, row5];

  function handleTierlistDataResponse(json) {
    setState({
      patch: json.patch,
    });
  }
  if (state.patch === undefined) {
    fetch('/api/tierlist')
      .then((response) => response.json())
      .then((json) => {
        handleTierlistDataResponse(json);
      });
  }
  return (
    <div>
      <div style={{ height: '100px' }}></div>
      <Container fixed className={classes.largeContainer}>
        <h1 className="cover-heading">ARAM Tier List Patch {state.patch}</h1>
        <Typography variant="h4" align="left" style={{ marginBottom: '4px' }}>
          ARAM Tier List Patch {state.patch}
        </Typography>
        <Typography variant="body1" align="left">
          We tabulate a tier list from high MMR games across the leaderboards of
          NA, EUW, and EUNE
        </Typography>
      </Container>
      <Container fixed className={classes.largeContainer}>
        <TierlistTable tierlist_data={per_champion_data} />
      </Container>
    </div>
  );
}
