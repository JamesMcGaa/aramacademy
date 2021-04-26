import _ from 'lodash';
import React, { useState } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Resources from '../resources.js';
import { Button, Container } from '@material-ui/core';
import { Header, Winrate } from './utils.js';
import Tooltip from '@material-ui/core/Tooltip';

var resources = Resources.Resources;
const fetch = require('node-fetch');

const DARK_GREEN_WINRATE_CUTOFF = 55.0;
const DARK_GREEN_COLOR = '#00ff00'; //'#fc9d03';
const GREEN_WINRATE_CUTOFF = 52.5;
const GREEN_COLOR = '#75ff75';
const WHITE_WINRATE_CUTOFF = 50.0;
const WHITE_COLOR = 'white';
const PINK_WINRATE_CUTOFF = 48.0;
const PINK_COLOR = '#ff8595';
const RED_WINRATE_CUTOFF = 45.0;
const RED_COLOR = '#fc354f';

function winrateColor(winrate) {
  if (winrate > DARK_GREEN_WINRATE_CUTOFF) {
    return DARK_GREEN_COLOR;
  } else if (winrate > GREEN_WINRATE_CUTOFF) {
    return GREEN_COLOR;
  } else if (winrate > WHITE_WINRATE_CUTOFF) {
    return WHITE_COLOR;
  } else if (winrate > PINK_WINRATE_CUTOFF) {
    return PINK_COLOR;
  } else {
    return RED_COLOR;
  }
}
const useStyles = makeStyles({
  section: {
    padding: 20,
  },
  header: {
    position: 'relative',
    display: 'flex',
    marginBottom: 20,
    width: '100%',
    fontSize: 14,
    fontWeight: 700,
    borderBottom: '1px solid #3f51b5',
  },
  table: {
    display: 'flex',
  },
  row: {
    display: 'flex',
    marginBottom: 10,
  },
  image: {
    flex: '25%',
  },
  text: {
    flex: '43%',
    textAlign: 'left',
    padding: 15,
    borderRight: '1px solid #555555',
  },
  winrateText: {
    flex: '11%',
    textAlign: 'left',
    padding: 15,
    borderRight: '1px solid #555555',
  },
  pickrateText: {
    flex: '11%',
    textAlign: 'left',
    padding: 15,
    borderRight: '1px solid #555555',
  },
  tierText: {
    flex: '10%',
    textAlign: 'left',
    padding: 15,
  },
  resizeChampIcon: {
    minWidth: '160px',
    maxWidth: '160px',
    height: 'auto',
    width: '100%',
    //borderRadius: '50%',
    padding: '10px',
  },
  resizeTierIcon: {
    minWidth: '35px',
    maxWidth: '35px',
    height: 'auto',
    width: '100%',
    //borderRadius: '50%',
    //marginTop: 12,
  },
  resizeAbilityIcon: {
    minWidth: '45px',
    maxWidth: '45px',
    height: 'auto',
    width: '100%',
    padding: '0px',
  },
  overlay: {
    verticalAlign: 'bottom',
    minWidth: '15px',
    maxWidth: '15px',
    marginLeft: '-15px',
  },
  spellRow: {
    display: 'flex',
    marginTop: 20,
  },
  spellIcon: {
    marginRight: 10,
  },
  tooltip: {
    backgroundColor: '#f5f5f9',
  },
});

function getFullPassivePath(patch, spell_path) {
  return (
    'https://ddragon.leagueoflegends.com/cdn/' +
    patch +
    '/img/passive/' +
    spell_path
  );
}
function getFullSpellPath(patch, spell_path) {
  return (
    'https://ddragon.leagueoflegends.com/cdn/' +
    patch +
    '/img/spell/' +
    spell_path
  );
}

const AbilityTooltip = withStyles((theme) => ({
  tooltip: {
    //backgroundColor: 'rgba(66,66,66,.9)',
    //color: 'rgba(0, 0, 0, 0.87)',
    color: theme.palette.common.white,
    //boxShadow: theme.shadows[1],
    fontSize: 12,
    textAlign: 'left',
    arrow: true,
  },
  arrow: {
    //color: theme.palette.common.white,
  },
}))(Tooltip);

export default function BuildHeader({ data, champion_name }) {
  if (data.loaded === false) {
    return null;
  }

  const AbilityIcon = ({ path, key, tooltip }) => {
    console.log(key);
    console.log('path', path);

    return (
      <div className={classes.spellIcon}>
        <img className={classes.resizeAbilityIcon} alt="ability" src={path} />
        <img
          className={classes.overlay}
          alt="key"
          src={resources.abilities_icons[key]}
        />{' '}
      </div>
    );
  };

  const Spells = ({
    passive_path,
    spells_paths,
    passive_tooltip,
    tooltip_list,
  }) => {
    return (
      <div className={classes.spellRow}>
        {AbilityIcon({
          path: passive_path,
          key: 'p',
          tooltip: passive_tooltip,
        })}
        {AbilityIcon({
          path: spells_paths[0],
          key: 'q',
          tooltip: tooltip_list[0],
        })}
        {AbilityIcon({
          path: spells_paths[1],
          key: 'w',
          tooltip: tooltip_list[1],
        })}
        {AbilityIcon({
          path: spells_paths[2],
          key: 'e',
          tooltip: tooltip_list[2],
        })}
        {AbilityIcon({
          path: spells_paths[3],
          key: 'r',
          tooltip: tooltip_list[3],
        })}
      </div>
    );
  };

  const classes = useStyles();
  const tier = data.tier;
  const lowercaseTier = tier.toLowerCase();
  //const champion_blurb = data.champion_json.data[champion_name].title;
  const champion_json = data.champion_json;
  const champion_data = champion_json.data[champion_name];
  const passive_path = champion_data.passive.image.full;
  const passive_full_path = getFullPassivePath(data.patch, passive_path);
  const passive_tooltip = champion_data.passive.description;
  let path_list = [];
  let tooltip_list = [];
  for (var i = 0; i < champion_data.spells.length; i++) {
    var spell = champion_data.spells[i];
    const spell_path = spell.image.full;
    console.log('tooltip', spell.tooltip);
    console.log('description', spell.description);
    tooltip_list.push(spell.description);
    path_list.push(getFullSpellPath(data.patch, spell_path));
  }
  var stylizedChampName = resources.two_word_champs.has(champion_name)
    ? resources.two_word_champs.get(champion_name)
    : champion_name;
  return (
    <div className={classes.row}>
      <div>
        <img
          className={classes.resizeChampIcon}
          src={resources.champ_icons[champion_name]}
        />
      </div>

      <div className={classes.text}>
        <Typography variant="h3">{stylizedChampName} </Typography>
        {Spells({
          passive_path: passive_full_path,
          spells_paths: path_list,
          passive_tooltip: passive_tooltip,
          tooltip_list: tooltip_list,
        })}
      </div>

      <div className={classes.winrateText}>
        {Header('Winrate')}
        <span
          style={{
            color: winrateColor(data.winrate * 100),
          }}
        >
          <Typography variant="h5">
            {(data.winrate * 100).toFixed(2)}%
          </Typography>
        </span>
      </div>
      <div className={classes.pickrateText}>
        {Header('Pickrate')}

        <Typography variant="h5">
          {(data.pickrate * 100).toFixed(2)}%
        </Typography>
      </div>
      <div className={classes.tierText}>
        {Header('Tier')}
        <Typography>
          <a href="/tierlist">
            <img
              className={classes.resizeTierIcon}
              src={resources.tier_badges[lowercaseTier]}
            />
          </a>
        </Typography>
      </div>
    </div>
  );
}
