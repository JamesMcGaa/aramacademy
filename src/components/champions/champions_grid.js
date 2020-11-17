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

import {
  FormGroup,
  Select,
  FilledInput,
  MenuItem,
  Button,
  Container,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  tab: {
    minWidth: '110px',
    maxWidth: '110px',
    //fontSize: theme.typography.pxToRem(12),
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
          <Grid item xs={2}>
            <Link href={'/champions/' + champ}>
              <img class="resizeChampGrid" src={resources.champ_icons[champ]} />
            </Link>
            <Typography variant="body2">
              {resources.two_word_champs.has(champ)
                ? resources.two_word_champs.get(champ)
                : champ}{' '}
            </Typography>
          </Grid>
        );
      })}
    </React.Fragment>
  );
}
function ClassTab({ champ_list }) {
  return (
    <div>
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={2}>
          <FormGrid list={champ_list} />
        </Grid>
      </Grid>
    </div>
  );
}
export default function ChampionGrid() {
  const classes = useStyles();
  const [value, setValue] = React.useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <TabContext value={value}>
      <AppBar position="static">
        <TabList
          onChange={handleChange}
          variant="scrollable"
          aria-label="simple tabs example"
        >
          <Tab classes={{ root: classes.tab }} label="All" value="1" />
          <Tab classes={{ root: classes.tab }} label="ADC" value="2" />
          <Tab classes={{ root: classes.tab }} label="Burst Mage" value="3" />
          <Tab classes={{ root: classes.tab }} label="Control Mage" value="4" />
          <Tab classes={{ root: classes.tab }} label="Artillery" value="5" />
          <Tab classes={{ root: classes.tab }} label="AD Assassin" value="6" />

          <Tab classes={{ root: classes.tab }} label="Support" value="7" />
          <Tab classes={{ root: classes.tab }} label="Tank" value="8" />
          <Tab classes={{ root: classes.tab }} label="Engage" value="9" />
          <Tab classes={{ root: classes.tab }} label="Bruiser" value="10" />
          <Tab classes={{ root: classes.tab }} label="Waveclear" value="11" />
        </TabList>
      </AppBar>
      <TabPanel value="1">
        <ClassTab champ_list={Object.keys(resources.champ_icons)} />{' '}
      </TabPanel>
      <TabPanel value="2">
        <ClassTab champ_list={resources.champ_classes['adc']} />
      </TabPanel>
      <TabPanel value="3">
        <ClassTab champ_list={resources.champ_classes['burst mage']} />
      </TabPanel>
      <TabPanel value="4">
        <ClassTab champ_list={resources.champ_classes['control mage']} />
      </TabPanel>
      <TabPanel value="5">
        <ClassTab champ_list={resources.champ_classes['artillery']} />{' '}
      </TabPanel>
      <TabPanel value="6">
        <ClassTab champ_list={resources.champ_classes['ad assassin']} />{' '}
      </TabPanel>
      <TabPanel value="7">
        <ClassTab champ_list={resources.champ_classes['support']} />
      </TabPanel>
      <TabPanel value="8">
        <ClassTab champ_list={resources.champ_classes['tank']} />
      </TabPanel>
      <TabPanel value="9">
        <ClassTab champ_list={resources.champ_classes['engage']} />
      </TabPanel>
      <TabPanel value="10">
        <ClassTab champ_list={resources.champ_classes['bruiser']} />
      </TabPanel>
      <TabPanel value="11">
        <ClassTab champ_list={resources.champ_classes['waveclear']} />
      </TabPanel>
    </TabContext>
  );
}
