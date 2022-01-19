import { Button, Container } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { useParams } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import Resources from '../resources.js';
import RecentMatchesTable from './recent_matches_table.js';
import EnhancedTable from './users_table.js';
import LiveGameTable from './live_game_table_desktop.js';

const fetch = require('node-fetch');
const moment = require('moment');
const globals = require('../../../globals.js');

moment().format();

const UPDATE_STATE = {
  UPDATE: 'UPDATE',
  UPDATING: 'UPDATING...',
  UPDATED: 'UPDATED',
};

const TAB_STATE = {
  SUMMARY: 'SUMMARY',
  LIVE_GAME: 'LIVE_GAME',
};

const resources = Resources.Resources;
const useStyles = makeStyles({
  paperRoot: {
    'background-color': 'rgba(66,66,66,.8)',
  },
  update: {
    'margin-top': '30px',
    'margin-bottom': '5px',
  },
  largeContainer: {
    'min-width': '1200px',
    'max-width': '1200px',
  },

  resizeSummonerIcon: {
    minWidth: '130px',
    maxWidth: '130px',
    height: 'auto',
    width: '100%',
    borderRadius: '50%',
    padding: '5px',
  },

  resizeRankBadge: {
    minWidth: '50px',
    maxWidth: '80px',
    height: 'auto',
    padding: '5px',
  },
  row: {
    display: 'flex',
  },
  column_half: {
    flex: '50%',
  },
  tabButton: {
    height: 50,
  },
  in_live_game: {},
  no_live_game: {},
});

export default function UserPageReady({ props }) {
  const classes = useStyles();
  const params = useParams();
  const [state, setState] = useState(props);
  const [updateState, setUpdateState] = useState(UPDATE_STATE.UPDATE);
  const [tab, setTab] = useState(TAB_STATE.SUMMARY);
  const [fullLiveGameData, setFullLiveGameData] = useState(null);

  // Nested to access params
  function handleUpdateClick() {
    setUpdateState(UPDATE_STATE.UPDATING);

    fetch(
      `/api/update/${
        encodeURI(params.region)
      }/${
        encodeURI(params.summonerName)}`
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
      live_game_data: json.live_game_data,
    });
  }

  function handleSummaryClick() {
    setTab(TAB_STATE.SUMMARY);
  }

  function handleLiveGameClick() {
    setTab(TAB_STATE.LIVE_GAME);
    if (fullLiveGameData === null) {
      fetch(
        `/api/live_game/${
          encodeURI(params.region)
        }/${
          encodeURI(params.summonerName)}`
      )
        .then((response) => response.json())
        .then((json) => {
          setFullLiveGameData(json.full_data);
        });
    }
  }

  const overall = state.user_data.per_champion_data.filter(
    (r) => r.champion === 'overall'
  )[0];

  const rank_badge = (
    <img
      className={classes.resizeRankBadge}
      alt="ranked badge"
      src={resources.ranked_badges[state.rank]}
    />
  );

  let wins = 0;
  let losses = 0;
  state.user_data.recent_games.forEach((game) => {
    if (game.win) {
      wins += 1;
    } else {
      losses += 1;
    }
  });

  const LiveGameComponent = () => {
    let in_live_game = true;
    if (state.live_game_status === globals.LIVE_GAME_STATES.NO_MATCH) {
      in_live_game = false;
    }

    return (
      <div className={classes.row}>
        <div className={classes.column_half}>
          <Button
            variant="text"
            size="large"
            onClick={handleSummaryClick}
            fullWidth
            className={classes.tabButton}
          >
            Summary
          </Button>
        </div>
        <div className={classes.column_half}>
          <Button
            variant={in_live_game ? 'contained' : 'outlined'}
            size="large"
            color="secondary"
            onClick={handleLiveGameClick}
            fullWidth
            className={classes.tabButton}
          >
            Live Game
          </Button>
        </div>
      </div>
    );
  };

  const MainTable = () => {
    switch (tab) {
      case TAB_STATE.SUMMARY:
        return (
          <EnhancedTable
            per_champion_data={state.user_data.per_champion_data}
          />
        );
      case TAB_STATE.LIVE_GAME:
        return (
          <LiveGameTable
            summoner_name={state.user_data.true_summoner_name}
            live_game_status={state.live_game_status}
          />
        );
    }
  };

  const now = moment.utc();
  // var last_updated = moment.utc(state.user_data.last_updated_timestamp_ms);
  // var last_updated_string = moment.utc(lastUpdatedTimestamp).fromNow();
  return (
    <div>
      <div style={{ height: '100px' }} />
      <Container fixed className={classes.largeContainer}>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: '25%' }}>
            <div style={{ marginRight: '15px' }}>
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
                      />
                      {' '}
                    </div>
                    <div style={{ flex: '60%' }}>
                      <Container style={{ padding: '0px' }}>
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
                          Last updated:
                          {' '}
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
                    marginBottom: '10px',
                  }}
                >
                  {rank_badge}

                  <p style={{ marginBottom: '0px' }}>
                    Total ARAMs:
                    {' '}
                    {overall.total_games}
                    <br />
                    Winrate:
                    {' '}
                    {Math.round(
                      (overall.wins / Math.max(1, overall.total_games)) * 10000
                    ) / 100}
                    %
                    <br />
                    MMR:
                    {' '}
                    {state.mmr}
                  </p>
                </Container>
                {/* {LiveGameComponent()} */}
              </Paper>

              <Paper classes={{ root: classes.paperRoot }}>
                <Typography variant="h6" style={{ padding: '3px' }}>
                  Recent Matches
                </Typography>
                {wins + losses > 0 && (
                  <PieChart
                    style={{
                      height: '130px',
                      padding: '0px',
                      border: 'solid',
                      borderWidth: '0px 0px 1px',
                      color: '#515151',
                      paddingBottom: '10px',
                    }}
                    paddingAngle={5}
                    lineWidth={20}
                    data={[
                      {
                        title: 'Wins',
                        value: wins,
                        color: '#208ECD',
                      },
                      {
                        title: 'Losses',
                        value: losses,
                        color: '#EE5A51',
                      },
                    ]}
                  />
                )}

                <RecentMatchesTable
                  recent_games={state.user_data.recent_games}
                />
              </Paper>
            </div>
          </div>
          <div style={{ flex: '75%' }}>{MainTable()}</div>
        </div>
      </Container>
    </div>
  );
}
