import React from 'react';
const mobile = require('is-mobile');
import { useHistory } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import readme from './README.txt';

const useStyles = makeStyles({
  paperRoot: {
    'background-color': 'rgba(45,45,45,.95)',
    textAlign: 'left',
    color: 'none',
    padding: mobile() ? '20px' : '60px',
  },
});

export default function Research() {
  const classes = useStyles();
  return (
    <div
      className={classes.paperRoot}
      style={{ marginTop: mobile() ? '80px' : '100px' }}
    >
      <ReactMarkdown children={readme} />
    </div>
  );
}
