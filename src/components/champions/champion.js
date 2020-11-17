import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import PropTypes from 'prop-types';

import ChampionsGrid from './champions_grid.js';
import Resources from '../resources.js';
import RoleTable from './role_table.js';

var resources = Resources.Resources;

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  largeContainer: {
    'min-width': '1200px',
    'max-width': '1200px',
  },
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  paperRoot: {
    'background-color': 'rgba(66,66,66,.8)',
  },
}));

export default function Champions() {
  const classes = useStyles();
  const params = useParams();

  return (
    <div>
      <br></br>
      <br></br>
      <br></br>
      <h1>{params.champion}</h1>
    </div>
  );
}
