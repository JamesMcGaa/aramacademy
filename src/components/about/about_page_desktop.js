import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { Container } from '@material-ui/core';
import AuthorTab from './authortab.js';
export default function AboutPageDesktop({ data }) {
  return (
    <div style={{ width: '80%', margin: '0 auto', marginTop: '80px' }}>
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
        <br></br>
      </Container>

      {data.map(function (row, index) {
        return (
          <Grid
            container
            alignItems="stretch"
            style={{ placeContent: 'center' }}
          >
            {row.map(function (lad) {
              return (
                <Grid
                  item
                  component={Card}
                  key={lad.name}
                  xs
                  style={{ margin: '5px', maxWidth: '25%' }}
                >
                  <AuthorTab lad={lad} />
                </Grid>
              );
            })}
          </Grid>
        );
      })}
    </div>
  );
}
