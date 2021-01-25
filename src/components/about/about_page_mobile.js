import { Container } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
const useStyles = makeStyles((theme) => ({
  root: {},
}));

export default function AboutPageDesktop({ data }) {
  const classes = useStyles();
  return (
    <div style={{ width: '95%', margin: '0 auto', marginTop: '80px' }}>
      <Container style={{}}>
        <Typography variant="h4" align="left" style={{ marginBottom: '4px' }}>
          Our Mission
        </Typography>
        <Typography variant="body1" align="left">
          ARAM Academy is dedicated to providing an ARAM exclusive analytics
          page. Unlike other League statistics sites, ARAM Academy provides data
          of all ARAMs available from the Riot API.
        </Typography>
        <br></br>

        <Typography variant="h4" align="left" style={{ marginBottom: '4px' }}>
          Our Values
        </Typography>

        <Typography variant="body1" align="left">
          Above all, we want a site exclusive to ARAM. ARAM Academy provides a
          simple, ARAM focused UI without the complexity common to
          ranked-focused sites.
        </Typography>
        <br></br>

        <Typography variant="h4" align="left" style={{ marginBottom: '4px' }}>
          Our Team
        </Typography>

        <Typography variant="body1" align="left">
          We are a small team of ARAM players and software engineers. ARAM
          Academy is non-profit, our infra is funded by our team alone. Join our
          <a href="https://discord.gg/MydvqhqWmM" target="_blank">
            {' '}
            Discord{' '}
          </a>{' '}
          or Contact us at aramdotacademy@gmail.com.
        </Typography>
        <br></br>

        <Typography variant="h4" align="left" style={{ marginBottom: '4px' }}>
          Our Staff
        </Typography>

        <List component="nav" className={classes.root}>
          {data.flat().map(function (lad) {
            return (
              <Link href={lad.link} style={{ textDecoration: 'none' }}>
                <ListItem button style={{ textDecoration: 'none' }}>
                  <ListItemIcon>{lad.icon}</ListItemIcon>
                  <ListItemText
                    primary={lad.name}
                    style={{ textDecoration: 'none' }}
                  />
                </ListItem>
              </Link>
            );
          })}
        </List>
      </Container>
    </div>
  );
}
