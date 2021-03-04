import { Container } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';

const mobile = require('is-mobile');
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    marginTop: '40px',
  },
}));

export default function ResearchList() {
  const classes = useStyles();
  return (
    <Container>
      <Container
        style={{
          width: '80%',
          marginTop: '80px',
          marginBottom: '80px',
        }}
      >
        <Typography variant="h4" align="left" style={{ marginBottom: '4px' }}>
          Research
        </Typography>
        <Typography variant="body1" align="left">
          Through the user of our data aggregation, ARAM Academy is able to
          derive interesting statistics. We intend to share our major findings
          with the broader community here in blog format. Have a theory you want
          tested? Drop us a message in the ARAM Academy Discord.
        </Typography>
        <List className={classes.root}>
          <ListItem button>
            <ListItemText primary="Winrates by ADCs, Supports" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Drafts" />
          </ListItem>
        </List>
      </Container>{' '}
    </Container>
  );
}
