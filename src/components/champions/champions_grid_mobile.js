import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';

import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';
import Typography from '@material-ui/core/Typography';

import Resources from '../resources.js';
var resources = Resources.Resources;
import full_champ_data from '../../jsons/champ_data_11_8.json';

import {
  FormGroup,
  Select,
  FilledInput,
  MenuItem,
  Button,
  Container,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
function getChampTierData(full_champ_data) {
  var champ_tiers = new Object();
  champ_tiers['S'] = [];
  champ_tiers['A'] = [];
  champ_tiers['B'] = [];
  champ_tiers['C'] = [];
  champ_tiers['D'] = [];
  for (var i = 0; i < Object.values(full_champ_data).length; i++) {
    const json_entry = Object.values(full_champ_data)[i];
    const champ_name = resources.reversed_two_word_champs.has(
      json_entry.champion
    );
    champ_tiers[json_entry.tier].push(champ_name);
  }
  return champ_tiers;
}
const MAX_CHAMP_NAME_LENGTH = 4;
function truncateChampName(champ) {
  return champ.substring(0, MAX_CHAMP_NAME_LENGTH) + '..';
}
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  tab: {
    minWidth: '50px',
    maxWidth: '70px',
    //fontSize: 24,
  },
  champIcon: {
    minWidth: '45px',
    maxWidth: '45px',
  },
  leftAlign: {
    textAlign: 'left',
  },
  classTab: {
    marginLeft: -3,
    //marginRight: 19,
  },
  overlay: {
    verticalAlign: 'bottom',
    minWidth: '24px',
    maxWidth: '24px',
    marginLeft: '-24px',
    border: '2px solid black',
  },
  tierIcon: {
    width: 20,
  },
  appBar: {
    'background-color': 'rgba(66,66,66,.9)',
  },
  champName: {
    marginTop: 3,
    // overflow: 'hidden',
    // textOverflow: 'ellipsis',
    textAlign: 'left',
    marginLeft: 0,
  },
}));

function sortChampNames() {
  return function (a, b) {
    const a_real_name = resources.two_word_champs.has(a)
      ? resources.two_word_champs.get(a)
      : a;
    const b_real_name = resources.two_word_champs.has(b)
      ? resources.two_word_champs.get(b)
      : b;
    return (a_real_name > b_real_name) - (a_real_name < b_real_name);
  };
}
function FormGrid({ list }) {
  const classes = useStyles();
  list.sort(sortChampNames());

  return (
    <React.Fragment>
      {list.map(function (champ) {
        return (
          <Grid key={champ} item xs={2}>
            {ChampIcon({ champ })}
            {ChampName({ champ })}
          </Grid>
        );
      })}
    </React.Fragment>
  );
}
const ChampName = ({ champ }) => {
  const classes = useStyles();
  var champName = resources.two_word_champs.has(champ)
    ? resources.two_word_champs.get(champ)
    : champ;
  if (champName.length > MAX_CHAMP_NAME_LENGTH) {
    champName = truncateChampName(champName);
  }
  return (
    <Typography className={classes.champName} variant="caption">
      {champName}
    </Typography>
  );
};
const ChampIcon = ({ champ }) => {
  // const champion_tierlist_data = getChampionTierlistData(tierlist_json, champ);
  // const tier = champion_tierlist_data.tier.toLowerCase();
  const classes = useStyles();
  return (
    <div>
      <a href={'/champions/' + champ}>
        <img className={classes.champIcon} src={resources.champ_icons[champ]} />
      </a>
      {/* <img
      className={classes.overlay}
      alt="tier"
      src={resources.tier_badges[tier]}
    /> */}
    </div>
  );
};
function ClassTab({ champ_list }) {
  const classes = useStyles();

  return (
    <div className={classes.classTab}>
      <Grid containerspacing={2}>
        <Grid item xs={12}>
          <Grid justify="flex-start" container spacing={2}>
            <FormGrid list={champ_list} />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
//24, 1.5 works
function TierIcon({ tier }) {
  const classes = useStyles();
  return (
    <div>
      <img
        className={classes.tierIcon}
        alt="tier"
        src={resources.tier_badges[tier]}
      />
    </div>
  );
}

export default function ChampionGridMobile() {
  const classes = useStyles();
  const [value, setValue] = React.useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const tieredChamps = getChampTierData(full_champ_data);
  return (
    <TabContext value={value}>
      <AppBar position="relative" className={classes.appBar}>
        <TabList onChange={handleChange} variant="fullWidth" aria-label="Tabs">
          <Tab classes={{ root: classes.tab }} label="All" value="1" />
          <Tab
            classes={{ root: classes.tab }}
            label={TierIcon({ tier: 's' })}
            value="2"
          />
          <Tab
            classes={{ root: classes.tab }}
            label={TierIcon({ tier: 'a' })}
            value="3"
          />
          <Tab
            classes={{ root: classes.tab }}
            label={TierIcon({ tier: 'b' })}
            value="4"
          />
          <Tab
            classes={{ root: classes.tab }}
            label={TierIcon({ tier: 'c' })}
            value="5"
          />
          <Tab
            classes={{ root: classes.tab }}
            label={TierIcon({ tier: 'd' })}
            value="6"
          />
        </TabList>
      </AppBar>
      <TabPanel value="1">
        <ClassTab champ_list={Object.keys(resources.champ_icons)} />{' '}
      </TabPanel>
      <TabPanel value="2">
        <ClassTab champ_list={tieredChamps['S']} />
      </TabPanel>
      <TabPanel value="3">
        <ClassTab champ_list={tieredChamps['A']} />
      </TabPanel>
      <TabPanel value="4">
        <ClassTab champ_list={tieredChamps['B']} />
      </TabPanel>
      <TabPanel value="5">
        <ClassTab champ_list={tieredChamps['C']} />
      </TabPanel>
      <TabPanel value="6">
        <ClassTab champ_list={tieredChamps['D']} />
      </TabPanel>
    </TabContext>
  );
}
