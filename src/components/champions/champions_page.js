import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';

import Grid from '@material-ui/core/Grid';

import ChampionsGrid from './champions_grid.js';
import Resources from '../resources.js';
import RoleTable from './role_table.js';

var resources = Resources.Resources;

import { Container } from '@material-ui/core';
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

export default function ChampionsPage() {
  const classes = useStyles();
  const params = useParams();

  return (
    <div className="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
      <Container fixed classes={{ root: classes.largeContainer }}>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <div
              className={classes.root}
              style={{
                marginTop: '100px',
                backgroundColor: 'rgba(66, 66, 66, .6)',
                marginRight: '15px',
              }}
            >
              <ChampionsGrid />
            </div>
          </Grid>
          <Grid item xs={4} style={{ marginTop: '100px' }}>
            <Paper classes={{ root: classes.paperRoot }}>
              <RoleTable role_winrate_data={null} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
