import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';

import Grid from '@material-ui/core/Grid';

import ChampionsGrid from './champions_grid.js';
import ChampionsGridMobile from './champions_grid_mobile.js';
import Resources from '../resources.js';

var resources = Resources.Resources;

import { Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
const mobile = require('is-mobile');

const useStyles = makeStyles((theme) => ({
  largeContainer: {
    'min-width': '1200px',
    'max-width': '1200px',
  },
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    minWidth: '1000px',
    maxWidth: '1000px',
  },
  mobileRoot: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  paperRoot: {
    'background-color': 'rgba(66,66,66,.8)',
  },
}));

export default function ChampionsPage() {
  const classes = useStyles();
  const params = useParams();
  //we put some CSS here for BG color - this is bad design, but i couldn't fix this quickly so its still here
  if (mobile()) {
    return (
      <div
        className={classes.mobileRoot}
        style={{
          marginTop: '100px',
          backgroundColor: 'rgba(66, 66, 66, .6)',
        }}
      >
        <ChampionsGridMobile />
      </div>
    );
  } else {
    return (
      <div
        className={classes.root}
        style={{
          marginTop: '100px',
          backgroundColor: 'rgba(66, 66, 66, .6)',
        }}
      >
        <ChampionsGrid />
      </div>
    );
  }
}
