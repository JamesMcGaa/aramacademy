import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import TierlistTableMobile from './tierlist_table_mobile.js';
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

export default function TierlistPageMobile(props) {
  const classes = useStyles();
  const params = useParams();

  const [state, setState] = useState({
    patch: undefined,
  });

  function handleTierlistDataResponse(json) {
    setState({
      patch: json.patch,
    });
  }
  if (state.patch === undefined) {
    fetch('/api/patch')
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
          style={{ marginBottom: '10px', padding: '15px' }}
          classes={{ root: classes.paperRoot }}
        >
          <Typography variant="h6" style={{ fontWeight: 'bold' }}>
            {' '}
            ARAM Tier List{' '}
            {state.patch !== undefined ? 'Patch ' + state.patch : null}
          </Typography>
          {/* <Typography variant="h4" align="left" style={{ marginBottom: '4px' }}>
          ARAM Tier List Patch {state.patch}
        </Typography> */}
          <Typography
            variant="body2"
            align="left"
            style={{ marginTop: '10px' }}
          >
            Generated exclusively from the top 1% of ARAM players.
          </Typography>
        </Paper>
      </Container>
      <Container fixed className={classes.mediumContainer}>
        <TierlistTableMobile
          per_champion_data={props.per_champion_data}
          total_games={props.total_games}
        />
      </Container>
    </div>
  );
}
