import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import TierlistTableDesktop from './tierlist_table_desktop.js';
import Typography from '@material-ui/core/Typography';

import Paper from '@material-ui/core/Paper';
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

export default function TierlistPageDesktop({ props }) {
  const classes = useStyles();
  const params = useParams();

  const [state, setState] = useState({
    patch: undefined,
  });
  const per_champion_data = props;

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

      <Container fixed className={classes.mediumContainer}>
        <Paper
          style={{ marginBottom: '15px', padding: '30px' }}
          classes={{ root: classes.paperRoot }}
        >
          <Typography variant="h4" style={{ fontWeight: 'bold' }}>
            {' '}
            ARAM Tier List Patch {state.patch}
          </Typography>
          {/* <Typography variant="h4" align="left" style={{ marginBottom: '4px' }}>
          ARAM Tier List Patch {state.patch}
        </Typography> */}
          <Typography
            variant="body1"
            align="center"
            style={{ marginTop: '20px' }}
          >
            We generate our tier list from top 1% MMR games across the
            leaderboards of NA, EUW, and EUNE
          </Typography>
        </Paper>
      </Container>
      <Container fixed className={classes.mediumContainer}>
        <TierlistTableDesktop tierlist_data={per_champion_data} />
      </Container>
    </div>
  );
}
