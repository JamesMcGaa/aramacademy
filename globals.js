const USER_PAGE_STATES = {
  LOADING: 'loading',
  SUCCESS: 'success',
  DOES_NOT_EXIST: 'does_not_exist',
};

const ERRORS = {
  SUMMONER_DOES_NOT_EXIST: 'summoner_does_not_exist',
  SUMMONER_HAS_NO_GAMES: 'summoner_has_no_games',
};

const UNAVAILABLE = 'Unavailable';

const LIVE_GAME_STATES = {
  LOADING: 'loading',
  NO_MATCH: 'no_match',
  MATCH: 'match',
};

module.exports = { USER_PAGE_STATES, ERRORS, UNAVAILABLE, LIVE_GAME_STATES };
