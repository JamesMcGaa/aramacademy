import _ from 'lodash';
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
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

const MAX_CHAMP_NAME_LENGTH = 11;
function truncateChampName(champ) {
  return champ.substring(0, MAX_CHAMP_NAME_LENGTH + 1) + '..';
}
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
    padding: 8,
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
    minWidth: '118px',
    maxWidth: '128px',
    height: 'auto',
    width: '100%',
    //borderRadius: '50%',
    padding: '10px',
  },
  resizeTierIcon: {
    minWidth: '30px',
    maxWidth: '30px',
    height: 'auto',
    width: '100%',
    //borderRadius: '50%',
    //marginTop: 12,
  },
  resizeAbilityIcon: {
    minWidth: '29px',
    maxWidth: '40px',
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
    marginRight: 5,
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
export default function BuildHeaderMobile({
  data,
  champion_name,
  tierlist_data,
  total_games,
}) {
  if (data.loaded === false) {
    return null;
  }

  const AbilityIcon = ({ path, key }) => {
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

  const Spells = ({ passive_path, spells_paths }) => {
    return (
      <div className={classes.spellRow}>
        {AbilityIcon({ path: passive_path, key: 'p' })}
        {AbilityIcon({ path: spells_paths[0], key: 'q' })}
        {AbilityIcon({ path: spells_paths[1], key: 'w' })}
        {AbilityIcon({ path: spells_paths[2], key: 'e' })}
        {AbilityIcon({ path: spells_paths[3], key: 'r' })}
      </div>
    );
  };

  const classes = useStyles();
  console.log(tierlist_data);
  const tier = tierlist_data.tier;
  const lowercaseTier = tier.toLowerCase();
  //const champion_blurb = data.champion_json.data[champion_name].title;
  const champion_json = data.champion_json;
  const champion_data = champion_json.data[champion_name];
  const passive_path = champion_data.passive.image.full;
  const passive_full_path = getFullPassivePath(data.patch, passive_path);
  let path_list = [];
  for (var i = 0; i < champion_data.spells.length; i++) {
    var spell = champion_data.spells[i];
    const spell_path = spell.image.full;
    path_list.push(getFullSpellPath(data.patch, spell_path));
  }
  var stylizedChampName = resources.two_word_champs.has(champion_name)
    ? resources.two_word_champs.get(champion_name)
    : champion_name;

  if (stylizedChampName.length > MAX_CHAMP_NAME_LENGTH) {
    stylizedChampName = truncateChampName(stylizedChampName);
  }
  return (
    <div>
      <div className={classes.row}>
        <div className={classes.image}>
          <img
            className={classes.resizeChampIcon}
            src={resources.champ_icons[champion_name]}
          />
        </div>

        <div className={classes.text}>
          <Typography variant="h5">{stylizedChampName} </Typography>
          {Spells({ passive_path: passive_full_path, spells_paths: path_list })}
        </div>
      </div>
      <div className={classes.row}>
        <div className={classes.winrateText}>
          {Header('Winrate')}
          <span
            style={{
              color: winrateColor(tierlist_data.wins * 100),
            }}
          >
            <Typography variant="h5">
              {(tierlist_data.wins * 100).toFixed(2)}%
            </Typography>
          </span>
        </div>
        <div className={classes.pickrateText}>
          {Header('Pickrate')}

          <Typography variant="h5">
            {((tierlist_data.total_games * 100) / total_games).toFixed(2)}%
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
    </div>
  );
}
