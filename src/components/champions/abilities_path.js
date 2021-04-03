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
    minWidth: 100,
  },
  row: {
    display: 'flex',
    marginBottom: 10,
    justifyContent: 'space-between',
    marginLeft: 20,
    marginRight: 20,
  },
  iconCell: {
    'min-width': '60px',
    width: '60px',
    'max-width': '80px',
    padding: '8px',
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
  arrow: {
    width: '15px',
    height: '15px',
    marginLeft: '-23px',
    marginRight: '-23px',
    marginTop: '15px',
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

export default function AbilitiesOrder({ data, champion_name }) {
  if (data.loaded === false) {
    return null;
  }
  const AbilitiesPathHeader = () => {
    return <div className={classes.header}>Ability Path</div>;
  };

  const AbilityIcon = ({ path, key }) => {
    console.log(key);
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

  const classes = useStyles();
  const champion_json = data.champion_json;
  console.log(resources.abilities_icons);
  const champion_data = champion_json.data[champion_name];
  const passive_path = champion_data.passive.image.full;
  const full_passive = getFullPassivePath(data.patch, passive_path);
  const abilities_order = data.abilities_order;
  let path_list = [];
  // for (var i = 0; i < champion_data.spells.length; i++) {
  //     var spell = champion_data.spells[i];
  //     const spell_path = spell.image.full;
  //     path_list.push(getFullSpellPath(data.patch, spell_path));
  // }

  for (var i = 0; i < abilities_order.length; i++) {
    var ability = abilities_order[i];
    const spell = champion_data.spells[QWER_MAP[ability]];
    const spell_path = spell.image.full;
    path_list.push(getFullSpellPath(data.patch, spell_path));
  }

  return (
    <div className={classes.section}>
      {AbilitiesPathHeader()}
      <div className={classes.row}>
        {AbilityIcon({
          path: path_list[0],
          key: abilities_order[0].toLowerCase(),
        })}
        <img
          className={classes.arrow}
          alt="arrow"
          src={resources.abilities_icons['arrow']}
        />
        {AbilityIcon({
          path: path_list[1],
          key: abilities_order[1].toLowerCase(),
        })}
        <img
          className={classes.arrow}
          alt="arrow"
          src={resources.abilities_icons['arrow']}
        />
        {AbilityIcon({
          path: path_list[2],
          key: abilities_order[2].toLowerCase(),
        })}
      </div>

      <div>WR: 58</div>
    </div>
  );
}
