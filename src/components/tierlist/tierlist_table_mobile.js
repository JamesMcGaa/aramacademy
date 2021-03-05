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

var resources = Resources.Resources;
const DARK_GREEN_WINRATE_CUTOFF = 55.0;
const DARK_GREEN_COLOR = '#00ff00'; //'#fc9d03';
const GREEN_WINRATE_CUTOFF = 52.5;
const GREEN_COLOR = '#75ff75';
const WHITE_WINRATE_CUTOFF = 50.0;
const WHITE_COLOR = 'white';
const PINK_WINRATE_CUTOFF = 48.0;
const PINK_COLOR = '#ff8595';
const RED_WINRATE_CUTOFF = 45.0;
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

// const TIER_SORT_MAP = {
//   S: 0,
//   A: 1,
//   B: 2,
//   C: 3,
//   D: 4,
// };

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
  { id: 'champion', numeric: false, disablePadding: true, label: 'Champion' },
  { id: 'tier', numeric: true, disablePadding: false, label: 'Tier' },
  { id: 'winrate', numeric: true, disablePadding: false, label: 'Winrate' },
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            className={classes.headCell}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
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
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: '1 1 100%',
  },
}));

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
  resizeChampIcon: {
    minWidth: '30px',
    maxWidth: '30px',
    height: 'auto',
    width: '100%',
    borderRadius: '50%',
    padding: '0px',
  },
  resizeTierIcon: {
    minWidth: '25px',
    maxWidth: '25px',
    height: 'auto',
    width: '100%',
    //borderRadius: '50%',
    padding: '0px',
  },
  mobileCell: {
    paddingRight: '5px',
    paddingLeft: '5px',
    fontSize: '.8rem',
    paddingTop: '8px',
    paddingBottom: '8px',
  },
  nameCell: {
    paddingRight: '5px',
    paddingLeft: '5px',
    fontSize: '.8rem',
  },
  headCell: {
    paddingRight: '10px',
    paddingLeft: '5px',
    fontSize: '.8rem',
  },
  winrateCell: {
    paddingRight: '15px',
    paddingLeft: '5px',
    fontSize: '.8rem',
  },
}));

function nice_round(num) {
  return Math.round(num * 10000) / 10000;
}

export default function TierlistTableMobile({
  per_champion_data,
  total_games,
}) {
  // const rows = raw_rows.filter(
  //     (r) => r.champion !== 'overall' && r.total_games !== 0
  // );
  const rows = per_champion_data;
  rows.forEach((row) => {
    row.winrate = nice_round(row.wins * 100);
  });

  const classes = useStyles();
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('winrate');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(rows.length);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';

    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
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
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
          />
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.champion}
                  >
                    <TableCell
                      //classes={{ root: classes.iconCell }}
                      className={classes.mobileCell}
                      align="center"
                    >
                      <img
                        className={classes.resizeChampIcon}
                        src={resources.champ_icons[row.champion]}
                      />
                    </TableCell>
                    <TableCell align="left" className={classes.nameCell}>
                      {resources.two_word_champs.has(row.champion)
                        ? resources.two_word_champs.get(row.champion)
                        : row.champion}
                    </TableCell>

                    <TableCell
                      align="right"
                      //classes={{ root: classes.iconCell }}
                      className={classes.mobileCell}
                    >
                      <img
                        className={classes.resizeTierIcon}
                        src={resources.tier_badges[row.tier.toLowerCase()]}
                      />
                    </TableCell>

                    <TableCell
                      align="right"
                      className={classes.winrateCell}
                      // width={'45%'}
                    >
                      <span
                        style={{
                          color: winrateColor(row.winrate),
                        }}
                      >
                        {row.winrate.toFixed(2)}%
                      </span>
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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, rows.length]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
