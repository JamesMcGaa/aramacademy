import { Container } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { useHistory } from 'react-router-dom';

const mobile = require('is-mobile');

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    marginTop: '40px',
  },
}));

export default function ResearchList() {
  const classes = useStyles();
  const history = useHistory();

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
          The nature of ARAM Academy allows us to test advanced theories on what
          makes a team composition successful. We intend to share our major
          findings with the broader community here in blog format. Have a theory
          you want tested? Drop us a message in the ARAM Academy Discord.
        </Typography>
        <List className={classes.root}>
          <ListItem button onClick={() => history.push('/research/roles')}>
            <ListItemText primary="Winrates by Role" />
          </ListItem>
          <ListItem button onClick={() => history.push('/research/rerolls')}>
            <ListItemText primary="Rerolls" />
          </ListItem>
        </List>
      </Container>
    </Container>
  );
}
