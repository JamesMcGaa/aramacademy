import { Button, Container } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { useParams } from 'react-router-dom';
import Resources from '../resources.js';
import RecentMatchesTable from './recent_matches_table.js';
import UserTableMobile from './users_table_mobile.js';
import CircularProgress from '@material-ui/core/CircularProgress';

const fetch = require('node-fetch');
const moment = require('moment');
moment().format();

const UPDATE_STATE = {
  UPDATE: 'UPDATE',
  UPDATING: 'UPDATING...',
  UPDATED: 'UPDATED',
};

var resources = Resources.Resources;
const useStyles = makeStyles({
  paperRoot: {
    'background-color': 'rgba(66,66,66,.8)',
  },
  update: {},
  largeContainer: {
    marginTop: '75px',
  },

  resizeSummonerIcon: {
    height: 'auto',
    minWidth: '100px',
    maxWidth: '100px',
    borderRadius: '50%',
    paddingTop: '5px',
  },

  resizeRankBadge: {
    height: 'auto',
    minWidth: '80px',
    maxWidth: '80px',
  },
});

export default function UserPageReadyMobile({ props }) {
  const classes = useStyles();
  const params = useParams();
  const [state, setState] = useState(props);
  const [updateState, setUpdateState] = useState(UPDATE_STATE.UPDATE);

  // Nested to access params
  function handleUpdateClick() {
    setUpdateState(UPDATE_STATE.UPDATING);

    fetch(
      '/api/update/' +
        encodeURI(params.region) +
        '/' +
        encodeURI(params.summonerName)
    )
      .then((response) => response.json())
      .then((json) => {
        handleUserDataResponse(json);
        setUpdateState(UPDATE_STATE.UPDATED);
      });
  }

  function handleUserDataResponse(json) {
    setState({
      user_data: json.user_data,
      mmr: json.mmr,
      rank: json.rank,
      icon_path: json.icon_path,
      page_state: json.status,
    });
  }

  const overall = state.user_data.per_champion_data.filter(
    (r) => r.champion === 'overall'
  )[0];

  const rank_badge = (
    <img
      className={classes.resizeRankBadge}
      alt="ranked badge"
      src={resources.ranked_badges[state.rank]}
      style={{ margin: '2%' }}
    />
  );

  var wins = 0;
  var losses = 0;
  state.user_data.recent_games.forEach((game) => {
    if (game.win) {
      wins += 1;
    } else {
      losses += 1;
    }
  });

  var now = moment.utc();
  //var last_updated = moment.utc(state.user_data.last_updated_timestamp_ms);
  //var last_updated_string = moment.utc(lastUpdatedTimestamp).fromNow();
  return (
    <Container fixed className={classes.largeContainer}>
      <Paper
        style={{ marginBottom: '15px' }}
        classes={{ root: classes.paperRoot }}
      >
        <Container style={{ padding: '10px' }}>
          <Typography
            variant="h5"
            style={{
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {state.user_data.true_summoner_name}
          </Typography>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: '40%' }}>
              <img
                className={classes.resizeSummonerIcon}
                alt="summoner icon"
                src={state.icon_path}
              />{' '}
            </div>
            <div style={{ flex: '60%' }}>
              <Container style={{ padding: '10px', paddingTop: '23px' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  className={classes.update}
                  disabled={updateState === UPDATE_STATE.UPDATING}
                  onClick={handleUpdateClick}
                >
                  {updateState === UPDATE_STATE.UPDATING ? (
                    <CircularProgress color="secondary" />
                  ) : (
                    updateState
                  )}
                </Button>
                <Typography variant="body2">
                  Last updated:{' '}
                  {moment
                    .utc(state.user_data.last_updated_timestamp_ms)
                    .fromNow()}
                </Typography>
              </Container>
            </div>
          </div>
        </Container>
      </Paper>

      <Paper
        style={{ marginBottom: '15px' }}
        classes={{ root: classes.paperRoot }}
      >
        <Container
          style={{
            display: 'flex',
            alignItems: 'center',
            textAlign: 'left',
            placeContent: 'center',
          }}
        >
          <div style={{ marginRight: '15px' }}>{rank_badge}</div>
          <p style={{ marginBottom: '0px' }}>
            Total ARAMs: {overall.total_games}
            <br></br>
            Winrate:{' '}
            {Math.round(
              (overall.wins / Math.max(1, overall.total_games)) * 10000
            ) / 100}
            %<br></br>
            MMR: {state.mmr}
          </p>
        </Container>
      </Paper>
      <UserTableMobile per_champion_data={state.user_data.per_champion_data} />
    </Container>
  );
}
