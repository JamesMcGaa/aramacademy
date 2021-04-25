import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
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
});

function createData(role, winrate) {
  return { role: role, winrate: winrate };
}

const rows = [
  createData('adc', '50%'),
  createData('burst mage', '48%'),
  createData('control mage', '52%'),
  createData('artillery', '55%'),
  createData('ad assassin', '40%'),
  createData('support', '53%'),
  createData('tank', '52%'),
  createData('engage', '55%'),
  createData('bruiser', '48%'),
  createData('waveclear', '54%'),
];

export default function RoleTable({ role_winrate_data }) {
  const classes = useStyles();

  return (
    <TableContainer>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Role</TableCell>
            <TableCell align="right">Winrate</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell align="left">{row.role}</TableCell>

              <TableCell align="right">{row.winrate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
