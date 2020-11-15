import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import LeaderboardTableMobile from './leaderboard_table_mobile.js';

const useStyles = makeStyles({
  paperRoot: {
    'background-color': 'rgba(66,66,66,.8)',
  },
  select: {
    'padding-top': '10px',
  },
  'select-root': {
    width: '40px',
    background: 'rgba(34,34,34,1)',
    '&:focus': {
      background: 'rgba(34,34,34,1)',
    },
    '&:hover': {
      background: 'rgba(34,34,34,.2)',
    },
  },
  input: {
    'font-size': '16px',
    'padding-top': '10px',
    width: '300px',
  },
  'input-root': {
    background: 'rgba(34,34,34,1)',
    '&:hover': {
      'background-color': 'rgba(255, 255, 255, 0.09)',
    },
    '&:focused': {
      'background-color': 'rgba(255, 255, 255, 0.09)',
    },
  },
  label: {
    textTransform: 'capitalize',
  },
  icon: {
    color: '#6495ED',
  },
  center: {
    'justify-content': 'center',
  },
  update: {
    width: '100%',
  },
});

export default function LeaderboardPageDesktop({ region, leaderboard }) {
  const classes = useStyles();

  return (
    <div>
      <div style={{ height: '100px' }}></div>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: '100%' }}>
          <LeaderboardTableMobile region={region} leaderboard={leaderboard} />
        </div>
      </div>
    </div>
  );
}
