import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import SimpleAccordion from './accordion.js';

const useStyles = makeStyles({});

export default function About() {
  const classes = useStyles();

  return (
    <div style={{ marginBottom: '50px' }}>
      <Typography
        variant="h3"
        style={{ marginBottom: '50px', marginTop: '100px' }}
      >
        FAQ
      </Typography>
      <SimpleAccordion />
    </div>
  );
}
