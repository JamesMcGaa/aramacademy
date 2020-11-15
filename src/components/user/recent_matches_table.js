import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Resources from '../resources.js';

var resources = Resources.Resources;

const useStyles = makeStyles({
  table: {
    minWidth: 100,
  },
  iconCell: {
    'min-width': '60px',
    width: '60px',
    'max-width': '80px',
    padding: '8px',
  },
  resizeChampIcon: {
    minWidth: '40px',
    maxWidth: '40px',
    height: 'auto',
    width: '100%',
    borderRadius: '50%',
    padding: '0px',
  },
});

function createData(champion, win, kills, deaths, assists) {
  return { champion, win, kills, deaths, assists };
}

export default function RecentMatchesTable({ recent_games }) {
  const classes = useStyles();
  const rows = recent_games;
  const BLUE_WIN = 'rgba(32, 142, 205, .7)';
  const RED_LOSS = 'rgba(238, 90, 81, .7)';

  return (
    <TableContainer>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow key="header">
            <TableCell></TableCell>
            <TableCell align="left" style={{ paddingLeft: '0px' }}>
              Champion
            </TableCell>
            <TableCell align="right">K/D/A</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={index}
              style={
                row.win === true
                  ? { background: BLUE_WIN }
                  : { background: RED_LOSS }
              }
            >
              <TableCell classes={{ root: classes.iconCell }} align="left">
                <img
                  className={classes.resizeChampIcon}
                  src={resources.champ_icons[row.champion]}
                />
              </TableCell>
              <TableCell align="left" style={{ paddingLeft: '0px' }}>
                {resources.two_word_champs.has(row.champion)
                  ? resources.two_word_champs.get(row.champion)
                  : row.champion}
              </TableCell>

              <TableCell align="right">
                {row.kills}
                <span>{' / '}</span>
                {row.deaths}
                <span>{' / '}</span>
                {row.assists}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
