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
var mobile = require('is-mobile');

var resources = Resources.Resources;
const COLORED_WINRATE_CUTOFF = 60.0;
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
  { id: 'image', numeric: false, disablePadding: false, label: '' },
  //{ id: 'champion', numeric: false, disablePadding: true, label: 'Champion' },

  {
    id: 'total_games',
    numeric: true,
    disablePadding: false,
    label: 'ARAMs',
  },
  { id: 'winrate', numeric: true, disablePadding: false, label: 'Winrate' },
  { id: 'kda', numeric: true, disablePadding: false, label: 'K/D/A' },
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
            className={classes.mobileCell}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              hideSortIcon={headCell.id === 'kda'}
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
  root: {},
  paper: {
    marginBottom: theme.spacing(2),
    'background-color': 'rgba(66, 66, 66, .8)',
    padding: '0px',
  },
  mobileCell: {
    paddingRight: '5px',
    paddingLeft: '5px',
    fontSize: '.7rem',
    paddingTop: '8px',
    paddingBottom: '8px',
  },
  table: {},
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
  },
  iconCell: {
    padding: '12px',
  },
  resizeChampIcon: {
    minWidth: '34px',
    maxWidth: '34px',
    height: 'auto',
    width: '100%',
    borderRadius: '50%',
    padding: '0px',
  },
  totalAramsCell: {
    paddingRight: '30px',
    paddingLeft: '5px',
    fontSize: '.7rem',
    paddingTop: '8px',
    paddingBottom: '8px',
  },
}));

function nice_round(num) {
  return Math.round(num * 10) / 10;
}

export default function UserTableMobile({ per_champion_data }) {
  if (mobile()) {
    document.body.style.backgroundImage = 'none';
  }
  console.log('render mobile table');
  const raw_rows = per_champion_data;
  const rows = raw_rows.filter(
    (r) => r.champion !== 'overall' && r.total_games !== 0
  );
  rows.forEach((row) => {
    row.winrate = nice_round((row.wins * 100) / row.total_games);
    row.average_gold = nice_round(row.gold / row.total_games);
    row.average_cs = nice_round(row.cs / row.total_games);
    row.average_kills = nice_round(row.kills / row.total_games);
    row.average_deaths = nice_round(row.deaths / row.total_games);
    row.average_assists = nice_round(row.assists / row.total_games);
  });

  const classes = useStyles();
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('total_games');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(rows.length);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    if (property === 'kda') {
      return;
    }
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
                    <TableCell className={classes.mobileCell}>
                      {/* <a href={'/champions/' + row.champion}> */}
                      <img
                        className={classes.resizeChampIcon}
                        src={resources.champ_icons[row.champion]}
                      />
                      {/* </a> */}
                    </TableCell>
                    {/* <TableCell className={classes.mobileCell} >
                      {resources.two_word_champs.has(row.champion)
                        ? resources.two_word_champs.get(row.champion)
                        : row.champion}
                    </TableCell> */}

                    <TableCell
                      className={classes.totalAramsCell}
                      style={{
                        textAlign: 'center',
                      }}
                    >
                      {row.total_games}
                    </TableCell>

                    <TableCell
                      className={classes.mobileCell}
                      style={{
                        color:
                          row.winrate > COLORED_WINRATE_CUTOFF
                            ? '#73ed53'
                            : 'white',
                      }}
                    >
                      {row.winrate}%
                    </TableCell>
                    <TableCell
                      className={classes.mobileCell}
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                      }}
                    >
                      <span style={{ color: 'deepskyblue' }}>
                        {row.average_kills}
                      </span>
                      <span>{' / '}</span>
                      <span style={{ color: 'red' }}>{row.average_deaths}</span>
                      <span>{' / '}</span>
                      <span style={{ color: 'yellow' }}>
                        {row.average_assists}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
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
