import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import LeaderboardPageDesktop from './leaderboard_page_desktop.js';
import LeaderboardPageMobile from './leaderboard_page_mobile';
const fetch = require('node-fetch');

var mobile = require('is-mobile');

function handleWinrateData(json) {
  if (response.status === 'enqueued') {
    console.log('enqueued');
  } else {
    setData(json);
  }
}

export default function Leaderboards() {
  const params = useParams();
  const [leaderboard, setLeaderboard] = useState([]);

  if (leaderboard.length === 0) {
    fetch('/api/leaderboard/' + params.region)
      .then((response) => response.json())
      .then((leaderboard) => {
        let unique_summoner_names = new Set();
        let unique_leaderboard = [];
        for (var i = 0; i < leaderboard.length; i++) {
          if (!unique_summoner_names.has(leaderboard[i].true_summoner_name)) {
            unique_summoner_names.add(leaderboard[i].true_summoner_name);
            unique_leaderboard.push(leaderboard[i]);
          }
        }
        let sorted_sliced = unique_leaderboard
          .sort(function (a, b) {
            return parseInt(b.mmr, 10) - parseInt(a.mmr, 10);
          })
          .slice(0, 500);
        setLeaderboard(sorted_sliced);
      });
  }
  if (mobile()) {
    return (
      <LeaderboardPageMobile region={params.region} leaderboard={leaderboard} />
    );
  } else {
    console.log(params.region);
    return (
      <LeaderboardPageDesktop
        region={params.region}
        leaderboard={leaderboard}
      />
    );
  }
}
