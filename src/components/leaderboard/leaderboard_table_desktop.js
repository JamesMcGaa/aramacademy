import { FilledInput } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import Images from './images.js';

var champImageDict = Images.Images.champ_icons;

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
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
  { id: 'rank', numeric: true, disablePadding: false, label: 'Rank' },
  { id: 'name', numeric: false, disablePadding: false, label: 'Summoner Name' },
  { id: 'mmr', numeric: true, disablePadding: false, label: 'MMR' },
];

function EnhancedTableHead(props) {
  const {
    classes,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const input = null;
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
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

const useStyles = makeStyles((theme) => ({
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
    'background-color': 'rgba(66, 66, 66, .8)',
  },
  table: {
    minWidth: 750,
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
  rankCell: {
    'min-width': '90px',
    width: '90px',
    'max-width': '90px',
    height: 'auto',
    padding: '12px',
  },
  filterBox: {
    align: 'left',
    width: '30%',
  },
}));
function createData(rank, true_summoner_name, mmr) {
  var obj = {
    rank: rank,
    true_summoner_name: true_summoner_name,
    mmr: mmr,
  };
  return obj;
}

function getUserRoute(region, true_summoner_name) {
  return '/users/' + region + '/' + encodeURI(true_summoner_name) + '/';
}
export default function LeaderboardTableDesktop({ region, leaderboard }) {
  const [filter, setFilter] = React.useState('');
  console.log(leaderboard);
  const rows = leaderboard
    .map((summoner, index) => {
      return createData(index + 1, summoner.true_summoner_name, summoner.mmr);
    })
    .filter((row) =>
      row.true_summoner_name.toLowerCase().includes(filter.toLowerCase())
    );

  const classes = useStyles();
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('games played');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(50);

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div>
      <Paper classes={{ root: classes.paper }}>
        <div>
          <Typography variant="h5" style={{ padding: '10px', float: 'left' }}>
            {region.toUpperCase() + ' Leaderboard'}
          </Typography>
          <FilledInput
            placeholder="Filter by Name"
            id=""
            classes={{
              root: classes.filterBox,
              focused: classes['input-root'],
              input: classes['input'],
            }}
            style={{ marginTop: '5px' }}
            onChange={(event) => {
              setPage(0);
              setFilter(event.target.value);
            }}
          />
          <TablePagination
            rowsPerPageOptions={[5, 10, 50, rows.length]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            style={{ float: 'right' }}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </div>
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
            />

            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.true_summoner_name);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.true_summoner_name}
                      selected={isItemSelected}
                    >
                      <TableCell
                        classes={{ root: classes.rankCell }}
                        align="right"
                      >
                        {row.rank}
                      </TableCell>

                      <TableCell align="left">
                        <Link
                          href={getUserRoute(region, row.true_summoner_name)}
                          style={{ textDecoration: 'none' }}
                          color="inherit"
                        >
                          {row.true_summoner_name}
                        </Link>
                      </TableCell>

                      <TableCell align="right">{row.mmr}</TableCell>
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
          rowsPerPageOptions={[5, 10, 50, rows.length]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
