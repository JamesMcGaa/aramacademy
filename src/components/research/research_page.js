import React from 'react';
const mobile = require('is-mobile');
import { useHistory } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import readme from './README.txt';

const markdown = `Here is some JavaScript code:

~~~js
console.log('It works!')
~~~
`;

const useStyles = makeStyles({
  paperRoot: {
    'background-color': 'rgba(67,67,67,.95)',
  },
});

export default function Research() {
  const classes = useStyles();
  return (
    <Container className={classes.paperRoot} style={{ marginTop: '100px' }}>
      <ReactMarkdown children={readme} />
    </Container>
  );
}
