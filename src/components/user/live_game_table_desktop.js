import Paper from '@material-ui/core/Paper';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import PropTypes from 'prop-types';
import React from 'react';
import Resources from '../resources.js';
import Link from '@material-ui/core/Link';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import nunu_gif from '../../images/nunu_dancing_compressed.gif';
import amumu_gif from '../../images/amumu_crying.gif';

const globals = require('../../../globals.js');

var resources = Resources.Resources;
const DARK_GREEN_WINRATE_CUTOFF = 55.0;
const DARK_GREEN_KDA_CUTOFF = 6.0;
const DARK_GREEN_COLOR = '#00ff00'; //'#fc9d03';

const GREEN_WINRATE_CUTOFF = 52.5;
const GREEN_KDA_CUTOFF = 4.0;
const GREEN_COLOR = '#75ff75';

const WHITE_WINRATE_CUTOFF = 49.9;
const WHITE_KDA_CUTOFF = 2.5;
const WHITE_COLOR = 'white';

const PINK_WINRATE_CUTOFF = 48.0;
const PINK_KDA_CUTOFF = 1.8;
const PINK_COLOR = '#ff8595';

const RED_WINRATE_CUTOFF = 45.0;
const RED_KDA_CUTOFF = 1.3;
const RED_COLOR = '#fc354f';

function winrateColor(winrate) {
  if (winrate > DARK_GREEN_WINRATE_CUTOFF) {
    return DARK_GREEN_COLOR;
  } else if (winrate > GREEN_WINRATE_CUTOFF) {
    return GREEN_COLOR;
  } else if (winrate > WHITE_WINRATE_CUTOFF) {
    return WHITE_COLOR;
  } else if (winrate > PINK_WINRATE_CUTOFF) {
    return PINK_COLOR;
  } else {
    return RED_COLOR;
  }
}

function kdaColor(kda) {
  if (kda > DARK_GREEN_KDA_CUTOFF) {
    return DARK_GREEN_COLOR;
  } else if (kda > GREEN_KDA_CUTOFF) {
    return GREEN_COLOR;
  } else if (kda > WHITE_KDA_CUTOFF) {
    return WHITE_COLOR;
  } else if (kda > PINK_KDA_CUTOFF) {
    return PINK_COLOR;
  } else {
    return RED_COLOR;
  }
}

const TEAM_SIDE = {
  BLUE: 100,
  RED: 200,
};

function descendingComparator(a, b, orderBy) {
  //Hardcoded for tier rank sorting - kinda monka
  let a_value = a[orderBy];
  let b_value = b[orderBy];

  if (orderBy == 'tier') {
    a_value = a['winrate'];
    b_value = b['winrate'];
  }

  if (b_value < a_value) {
    return -1;
  }
  if (b_value > a_value) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;

    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'image', numeric: false, disablePadding: false, label: '' },
  { id: 'name', numeric: false, disablePadding: true, label: 'Summoner Name' },

  { id: 'mmr', numeric: true, disablePadding: false, label: 'MMR' },
  { id: 'winrate', numeric: true, disablePadding: false, label: 'Winrate' },
  {
    id: 'champion_winrate',
    numeric: true,
    disablePadding: false,
    label: 'Champ WR',
  },
  {
    id: 'champion_games',
    numeric: true,
    disablePadding: false,
    label: 'Champ Games',
  },
  {
    id: 'kda',
    numeric: true,
    disablePadding: false,
    label: 'K/D/A',
  },
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  var head_class;
  switch (props.side) {
    case TEAM_SIDE.BLUE:
      head_class = classes.blueSide;
      break;
    case TEAM_SIDE.RED:
      head_class = classes.redSide;
      break;
  }
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
            className={head_class}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              hideSortIcon={true}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
  side: PropTypes.number.isRequired,
};

const EnhancedTableToolbar = (props) => {
  return <div></div>;
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
    'background-color': 'rgba(66, 66, 66, .85)',
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  iconCell: {
    'min-width': '60px',
    width: '60px',
    'max-width': '80px',
    height: 'auto',
    padding: '12px',
  },
  rankCell: {
    width: '130px',
    paddingLeft: '5px',
    paddingRight: '5px',
  },
  resizeChampIcon: {
    minWidth: '40px',
    maxWidth: '40px',
    height: 'auto',
    width: '100%',
    borderRadius: '50%',
    padding: '0px',
  },
  redSide: {
    backgroundColor: 'rgba(238, 90, 81, .9)',
  },
  blueSide: {
    backgroundColor: 'rgba(32, 142, 205, .9)',
  },
  rankBadge: {
    width: '40px',
    marginRight: '5px',
    marginTop: -5,
    marginBottom: -5,
  },
}));

function nice_round(num) {
  return Math.round(num * 10000) / 10000;
}

function getUserRoute(true_summoner_name) {
  const params = useParams();

  return '/users/' + params.region + '/' + encodeURI(true_summoner_name) + '/';
}

const LiveGameLoading = ({ summoner_name }) => {
  const classes = useStyles();
  return (
    <div>
      <h3>
        <img src={nunu_gif} style={{ width: '500px' }} alt="loading..." />
      </h3>
      <Typography variant="h5">
        Searching {summoner_name} in Live Game API
        <br /> This queries 10 users. It may take a while due to our slow API
        key
      </Typography>
    </div>
  );
};

const LiveGameNoMatch = ({ summoner_name }) => {
  const classes = useStyles();
  return (
    <div>
      <h3>
        <img src={amumu_gif} style={{ width: '500px' }} alt="loading..." />
      </h3>
      <Typography variant="h5">
        {summoner_name} is not in a live ARAM
      </Typography>
    </div>
  );
};

const LiveGameMatch = ({ full_live_game_data }) => {
  const classes = useStyles();

  function TeamTable({ rows, side }) {
    const RankBadge = (rank) => {
      return (
        <img
          className={classes.rankBadge}
          alt="ranked badge"
          src={resources.ranked_badges[rank.rank]}
        />
      );
    };
    console.log('teamtable rows', rows);
    console.log('rowslength', rows.length);

    const order = 'desc';
    const orderBy = 'n/a';
    const selected = [];
    const page = 0;
    const rowsPerPage = rows.length;

    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    const isSelected = (name) => selected.indexOf(name) !== -1;

    return (
      <Paper classes={{ root: classes.paper }}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={'medium'} //not small
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={() => {}}
              onRequestSort={() => {}}
              rowCount={rows.length}
              side={side}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.summoner_name);
                  console.log('rowtablebody', row);
                  const total_winrate =
                    row.total_games !== 0
                      ? (row.total_wins * 100) / row.total_games
                      : 'N/A';
                  const champ_winrate =
                    row.champion_games !== 0
                      ? (row.champion_wins * 100) / row.champion_games
                      : 'N/A';
                  const champ_kda =
                    row.champion_deaths !== 0
                      ? (row.champion_kills + row.champion_assists) /
                        row.champion_deaths
                      : 'N/A';
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.summoner_name}
                      selected={isItemSelected}
                    >
                      <TableCell
                        classes={{ root: classes.iconCell }}
                        align="center"
                      >
                        <img
                          className={classes.resizeChampIcon}
                          src={resources.champ_icons[row.champion]}
                        />
                      </TableCell>

                      <TableCell align="left">
                        <Link
                          href={getUserRoute(row.summoner_name)}
                          style={{ textDecoration: 'none' }}
                          color="inherit"
                        >
                          {row.summoner_name}
                        </Link>
                      </TableCell>

                      <TableCell
                        align="right"
                        classes={{ root: classes.rankCell }}
                      >
                        {RankBadge({ rank: row.rank })}
                        {row.mmr}
                      </TableCell>

                      <TableCell align="right">
                        {' '}
                        {typeof total_winrate === 'number' ? (
                          <span
                            style={{
                              color: winrateColor(total_winrate),
                            }}
                          >
                            {total_winrate.toFixed(2)}%
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>

                      <TableCell align="right">
                        {typeof champ_winrate === 'number' ? (
                          <span
                            style={{
                              color: winrateColor(champ_winrate),
                            }}
                          >
                            {champ_winrate.toFixed(2)}%
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell align="right">{row.champion_games}</TableCell>
                      <TableCell align="right">
                        {typeof champ_kda === 'number' ? (
                          <span
                            style={{
                              color: kdaColor(champ_kda),
                            }}
                          >
                            {champ_kda.toFixed(2)}:1
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  let blueTeam = [];
  let redTeam = [];
  for (let i = 0; i < full_live_game_data.length; i++) {
    const row = full_live_game_data[i];
    if (row.side === TEAM_SIDE.BLUE) {
      blueTeam.push(row);
    } else {
      redTeam.push(row);
    }
  }

  const blueSide = TeamTable({ rows: blueTeam, side: TEAM_SIDE.BLUE });
  const redSide = TeamTable({ rows: redTeam, side: TEAM_SIDE.RED });
  return (
    <div>
      {blueSide}
      {redSide}
    </div>
  );
};

export default function LiveGameTable({ summoner_name, live_game_status }) {
  function handleDataFetch(live_game_data) {
    if (fullLiveGameData === null) {
      setFullLiveGameData(live_game_data);
      console.log('full', fullLiveGameData);
    }
  }
  const params = useParams();
  const [fullLiveGameData, setFullLiveGameData] = useState(null);

  useEffect(() => {
    if (fullLiveGameData === null) {
      fetch(
        '/api/live_game/' +
          encodeURI(params.region) +
          '/' +
          encodeURI(params.summonerName)
      )
        .then((response) => response.json())
        .then((json) => {
          handleDataFetch(json.full_data);
        });
    }
  });

  if (live_game_status === globals.LIVE_GAME_STATES.NO_MATCH) {
    return LiveGameNoMatch({ summoner_name });
  } else if (
    live_game_status === globals.LIVE_GAME_STATES.MATCH &&
    fullLiveGameData === null
  ) {
    return LiveGameLoading({ summoner_name });
  } else {
    return LiveGameMatch({ full_live_game_data: fullLiveGameData });
  }
}
