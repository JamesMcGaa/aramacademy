import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import UserPageLoading from './user_page_loading.js';
import UserPageReady from './user_page_ready.js';
import UserPageDoesNotExist from './user_page_doesnotexist.js';
import UserPageReadyMobile from './user_page_ready_mobile.js';

const fetch = require('node-fetch');
const mobile = require('is-mobile');
const globals = require('../../../globals.js');

export default function Users() {
  const params = useParams();
  const history = useHistory();
  const [state, setState] = useState({
    user_data: undefined,
    mmr: globals.UNAVAILABLE,
    rank: globals.UNAVAILABLE,
    page_state: globals.USER_PAGE_STATES.LOADING,
    icon_path: globals.UNAVAILABLE,
  });

  function handleUserDataResponse(json) {
    setState({
      user_data: json.user_data,
      mmr: json.mmr,
      rank: json.rank,
      icon_path: json.icon_path,
      page_state: json.status,
      live_game_status: json.live_game_status,
    });
  }

  // if no summoner name set reroutes back to homepage
  if (params.summonerName.trim() === '') {
    history.push('/');
  }

  if (state.page_state === globals.USER_PAGE_STATES.LOADING) {
    fetch(
      `/api/winrate_data/${
        params.region
      }/${
        encodeURI(params.summonerName)}`
    )
      .then((response) => response.json())
      .then((json) => {
        handleUserDataResponse(json);
      });
    return <UserPageLoading summonerName={params.summonerName} />;
  } if (state.page_state === globals.USER_PAGE_STATES.DOES_NOT_EXIST) {
    return (
      <UserPageDoesNotExist
        summonerName={params.summonerName}
        region={params.region}
      />
    );
  } if (
    state.page_state === globals.USER_PAGE_STATES.SUCCESS
    && mobile()
  ) {
    return <UserPageReadyMobile props={state} />;
  }
  return <UserPageReady props={state} />;
}
