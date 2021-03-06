import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({});

export default function AuthorTab({ lad }) {
  return (
    <Link href={lad.link} style={{ textDecoration: 'none' }}>
      <Card>
        <CardActionArea>
          <CardMedia
            component="img"
            alt="Favorite Champion"
            height="200px"
            image={lad.img}
            title="Favorite Champion"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2" align="left">
              {lad.name}
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              component="p"
              align="left"
            >
              {lad.bio}
              {lad.hasOwnProperty('twitch') ? (
                <div>
                  {' '}
                  <a href={lad.twitch} target="_blank">
                    {' '}
                    Twitch
                  </a>{' '}
                </div>
              ) : null}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  );
}
