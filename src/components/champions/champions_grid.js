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
import tierlist_json from '../../jsons/tierlist.json';

import {
  FormGroup,
  Select,
  FilledInput,
  MenuItem,
  Button,
  Container,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
function getChampionTierlistData(tierlist_json, champion_name) {
  for (var i = 0; i < tierlist_json.length; i++) {
    const data = tierlist_json[i];
    if (data.champion === champion_name) {
      return data;
    }
  }
}

function getTieredChampions(tierlist_json) {
  var champ_tiers = new Object();
  champ_tiers['S'] = [];
  champ_tiers['A'] = [];
  champ_tiers['B'] = [];
  champ_tiers['C'] = [];
  champ_tiers['D'] = [];
  for (var i = 0; i < tierlist_json.length; i++) {
    const data = tierlist_json[i];
    champ_tiers[data.tier].push(data.champion);
  }
  return champ_tiers;
}
const MAX_CHAMP_NAME_LENGTH = 12;
function truncateChampName(champ) {
  return champ.substring(0, MAX_CHAMP_NAME_LENGTH) + '...';
}
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  tab: {
    //minWidth: '110px',
    //maxWidth: '110px',
    fontSize: 24,
  },
  champIcon: {
    minWidth: '100px',
    maxWidth: '100px',
  },
  leftAlign: {
    textAlign: 'left',
  },
  classTab: {
    marginLeft: 19,
    marginRight: 18,
  },
  overlay: {
    verticalAlign: 'bottom',
    minWidth: '24px',
    maxWidth: '24px',
    marginLeft: '-24px',
    border: '2px solid black',
  },
  tierIcon: {
    width: 33,
  },
  appBar: {
    'background-color': 'rgba(66,66,66,.9)',
  },
  champName: {
    marginTop: 3,
    // overflow: 'hidden',
    // textOverflow: 'ellipsis',
    textAlign: 'left',
    marginLeft: 3,
  },
}));
// <Link href={'/champions/' + champ} style={{ textDecoration: 'none' }}>
//   <Card className={classes.root} >
//     <CardActionArea >
//       <CardMedia
//         component="img"
//         alt="Champion"
//         height="100px"
//         image={resources.champ_icons[champ]}
//         title="Champion"
//       />
//       <CardContent>
//
//                     <Typography>                         {resources.two_word_champs.has(champ)
//                                               ? resources.two_word_champs.get(champ)
//                                               : champ} </Typography>
//       </CardContent>
//     </CardActionArea>
//   </Card>
// </Link>
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
          <Grid item xs={1.5}>
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
    <Typography className={classes.champName} variant="body2">
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
      <Grid container spacing={3}>
        <Grid container item xs={24} spacing={2}>
          <FormGrid list={champ_list} />
        </Grid>
      </Grid>
    </div>
  );
}

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

export default function ChampionGrid() {
  const classes = useStyles();
  const [value, setValue] = React.useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const tieredChamps = getTieredChampions(tierlist_json);
  return (
    <TabContext value={value}>
      <AppBar position="static" className={classes.appBar}>
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
