import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LeaderboardPageDesktop from './leaderboard_page_desktop.js';
import LeaderboardPageMobile from './leaderboard_page_mobile';

const fetch = require('node-fetch');

const mobile = require('is-mobile');

function Leaderboards() {
  const params = useParams();
  const [leaderboard, setLeaderboard] = useState([]);

  if (leaderboard.length === 0) {
    fetch(`/api/leaderboard/${params.region}`)
      .then((response) => response.json())
      .then((api_leaderboard) => {
        const unique_summoner_names = new Set();
        const unique_leaderboard = [];
        for (let i = 0; i < api_leaderboard.length; i++) {
          if (!unique_summoner_names.has(api_leaderboard[i].true_summoner_name)) {
            unique_summoner_names.add(api_leaderboard[i].true_summoner_name);
            unique_leaderboard.push(api_leaderboard[i]);
          }
        }
        const sorted_sliced = unique_leaderboard
          .sort((a, b) => parseInt(b.mmr, 10) - parseInt(a.mmr, 10))
          .slice(0, 500);
        setLeaderboard(sorted_sliced);
      });
  }
  if (mobile()) {
    return (
      <LeaderboardPageMobile region={params.region} leaderboard={leaderboard} />
    );
  }
  return (
    <LeaderboardPageDesktop
      region={params.region}
      leaderboard={leaderboard}
    />
  );
}

export default function WrappedLeaderboards() {
  const params = useParams();
  return (
    <div>
      {Leaderboards()}
      <Helmet>
        <title>
          ARAM Leaderboards -
          {' '}
          {params.region.toUpperCase()}
          {' '}
          - ARAM Academy
        </title>
        <meta
          name="description"
          content={`ARAM Academy maintains the most accurate ARAM leaderboards for ${params.region.toUpperCase()}. 
        Find the best ARAM builds, tierlists, leaderboards, and stats today.`}
        />
      </Helmet>
    </div>
  );
}
