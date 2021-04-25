import React from 'react';
const mobile = require('is-mobile');
import { useHistory, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import rolesMarkdown from './rolesMarkdown.txt';

const ResearchNamesToPost = Object.freeze({
  roles: rolesMarkdown,
});

const useStyles = makeStyles({
  paperRoot: {
    'background-color': 'rgba(45,45,45,.95)',
    textAlign: 'left',
    color: 'none',
    padding: mobile() ? '20px' : '60px',
  },
});

const renderers = {
  //This custom renderer changes how images are rendered
  //we use it to constrain the max width of an image to its container
  thematicBreak: () => <hr style={{ backgroundColor: 'white' }} />,
  image: ({ alt, src, title }) => (
    <div style={{ maxWidth: '100%', textAlign: 'center' }}>
      <img
        alt={alt}
        src={src}
        title={title}
        style={{ maxWidth: '100%', textAlign: 'center' }}
      />
    </div>
  ),
};

export default function ResearchPost() {
  console.log(ReactMarkdown.Renderers);
  const classes = useStyles();
  const params = useParams();

  return (
    <div
      className={classes.paperRoot}
      style={{ marginTop: mobile() ? '80px' : '100px' }}
    >
      <ReactMarkdown
        children={ResearchNamesToPost[params.article]}
        renderers={renderers}
      />
    </div>
  );
}
