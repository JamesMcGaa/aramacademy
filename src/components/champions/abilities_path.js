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
import { ProxyAuthenticationRequired } from 'http-errors';
import { Header } from './utils.js';

var resources = Resources.Resources;
const fetch = require('node-fetch');

const QWER_MAP = {
  Q: 0,
  W: 1,
  E: 2,
  R: 3,
};
const useStyles = makeStyles({
  section: {
    padding: 20,
  },
  table: {
    display: 'flex',
    minWidth: 100,
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  iconCell: {
    'min-width': '60px',
    width: '60px',
    'max-width': '80px',
    padding: '8px',
  },
  resizeAbilityIcon: {
    minWidth: '28px',
    maxWidth: '28px',
    height: 'auto',
    width: '100%',
    padding: '0px',
  },
  overlay: {
    verticalAlign: 'bottom',
    minWidth: '12px',
    maxWidth: '12px',
    marginLeft: '-12px',
  },
  arrow: {
    width: '15px',
    height: '15px',
    marginLeft: '-23px',
    marginRight: '-23px',
    marginTop: '15px',
  },
  abilityName: {
    width: '185px',
    //backgroundColor: 'rgba(36, 37, 130, 0.6)',
    marginBottom: 0,
    fontSize: 14,
    borderBottom: '1px solid #8e793e',
    textAlign: 'left',
    padding: '4px',
  },
  abilityYes: {
    width: '28px',
    padding: '4px',
    marginLeft: '4px',
    backgroundColor: '#4056a1',
  },
  abilityNo: {
    width: '28px',
    padding: '4px',
    marginLeft: '4px',

    backgroundColor: 'rgba(66,66,66,.8)',
  },
});
const MAX_ABILITY_NAME_LENGTH = 21;
function truncateString(text) {
  return text.substring(0, MAX_ABILITY_NAME_LENGTH) + '...';
}
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
const levels = Array.from({ length: 18 }, (_, i) => i + 1);

export default function AbilitiesOrder({ data, champion_name }) {
  if (data.loaded === false) {
    return null;
  }

  const AbilityIcon = ({ path, key }) => {
    return (
      <div>
        <img className={classes.resizeAbilityIcon} alt="ability" src={path} />
        <img
          className={classes.overlay}
          alt="key"
          src={resources.abilities_icons[key]}
        />{' '}
      </div>
    );
  };

  const AbilityName = ({ name }) => {
    var abilityName = name;
    if (abilityName.length > MAX_ABILITY_NAME_LENGTH) {
      abilityName = truncateString(abilityName);
    }
    return <Paper className={classes.abilityName}>{abilityName}</Paper>;
  };
  const AbilityLevels = ({ skill_level }) => {
    const boxes = _.map(levels, (level) => {
      if (skill_level.includes(level)) {
        return AbilityBoxYes({ level });
      } else {
        return AbilityBoxNo();
      }
    });
    return boxes;
  };

  const AbilityBoxYes = ({ level }) => {
    console.log('level', level);
    return <Paper className={classes.abilityYes}>{level}</Paper>;
  };

  const AbilityBoxNo = () => {
    return <Paper className={classes.abilityNo}></Paper>;
  };
  const Path = ({ json, key }) => {
    const path = getFullSpellPath(data.patch, json.image.full);
    const name = json.name;
    const levels = data.abilities_levels;
    var skill_level;
    if (key === 'q') {
      skill_level = levels.Q;
    } else if (key === 'w') {
      skill_level = levels.W;
    } else if (key === 'e') {
      skill_level = levels.E;
    } else {
      skill_level = levels.R;
    }
    return (
      <div className={classes.row}>
        {AbilityIcon({ path, key })}
        {AbilityName({ name })}
        {AbilityLevels({ skill_level })}
      </div>
    );
  };

  const Passive = () => {
    return null;
  };

  const classes = useStyles();
  const champion_json = data.champion_json;
  const champion_data = champion_json.data[champion_name];
  const passive_path = champion_data.passive.image.full;
  const full_passive = getFullPassivePath(data.patch, passive_path);
  const abilities_order = data.abilities_order;
  let spell_json_list = [];
  for (var i = 0; i < champion_data.spells.length; i++) {
    var spell = champion_data.spells[i];
    console.log('spell', spell);
    console.log('name', spell.name);
    spell_json_list.push(spell);
  }

  //   for (var i = 0; i < abilities_order.length; i++) {
  //     var ability = abilities_order[i];
  //     const spell = champion_data.spells[QWER_MAP[ability]];
  //     const spell_path = spell.image.full;
  //     path_list.push(getFullSpellPath(data.patch, spell_path));
  //   }

  return (
    <div className={classes.section}>
      {Header('Ability Path')}
      {Path({ json: spell_json_list[0], key: 'q' })}
      {Path({ json: spell_json_list[1], key: 'w' })}
      {Path({ json: spell_json_list[2], key: 'e' })}
      {Path({ json: spell_json_list[3], key: 'r' })}
    </div>
  );
}
