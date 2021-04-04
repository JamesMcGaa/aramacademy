import _ from 'lodash';
import React, { useState } from 'react';
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
import { Button, Container } from '@material-ui/core';

const useStyles = makeStyles({
  header: {
    position: 'relative',
    display: 'flex',
    marginBottom: 10,
    width: '100%',
    fontSize: 14,
    fontWeight: 700,
    borderBottom: '1px solid #3f51b5',
  },
  itemWinrate: {
    fontSize: 13,
    fontWeight: 600,
  },
});

export const Header = (title) => {
  const classes = useStyles();
  return <div className={classes.header}>{title}</div>;
};

export const Winrate = (winrate) => {
  const classes = useStyles();
  return (
    <div className={classes.itemWinrate}>
      {winrate.toFixed(1) + '% WR'}
    </div>
  );
};
