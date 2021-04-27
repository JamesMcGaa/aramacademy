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
import KeystoneRowMobile from './keystone_row_mobile.js';
import { Header, Winrate } from './utils.js';

var resources = Resources.Resources;
const fetch = require('node-fetch');

const useStyles = makeStyles({
  section: {
    padding: 20,
  },
  table: {
    minWidth: 100,
    height: 300,
  },
  iconCell: {
    'min-width': '60px',
    width: '60px',
    'max-width': '80px',
    padding: '8px',
  },
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: '4px',
    textAlign: 'center',
  },
  runes_all: {
    display: 'flex',
  },
  runes_box: {
    display: 'flex',
    //minWidth: '550px',
    //maxWidth: '550px',
    //marginLeft: '50px',
  },
  runes_primary_header: {
    display: 'flex',
    marginBottom: 5,
    marginLeft: 4,
    // marginRight: 20,
    alignItems: 'center',

    width: '100%',
    fontSize: 16,
    fontWeight: 700,
    //borderBottom: '1px solid white',
  },
  runes_secondary_header: {
    display: 'flex',
    marginBottom: 5,
    // marginLeft: 20,
    // marginRight: 20,
    alignItems: 'center',

    width: '100%',
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 7,

    //borderBottom: '1px solid white',
  },
  resizeKeystoneIcon: {
    minWidth: '40px',
    maxWidth: '40px',
    height: '40px',
    width: '100%',
    borderRadius: '50%',
    padding: '3px',
    paddingRight: '5px',
  },
  resizeStatIcon: {
    minWidth: '20px',
    maxWidth: '20px',
    height: '20px',
    width: '100%',
    borderRadius: '50%',
    border: '2px solid #8e793e',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    //minWidth: '160px',
    //maxWidth: '160px',
    //marginBottom: '5px',
    padding: '3px',
    marginLeft: 14,
    marginRight: 10,
  },
  statHeader: {
    // minWidth: '190px',
    // maxWidth: '190px',
    borderTop: '1px solid #8e793e',
    marginTop: '9px',
    paddingTop: '9px',
  },
  runepageActiveRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
    height: 65,
    borderLeft: '2px solid white',
    padding: '5px 12px',
    paddingLeft: '11px',
  },
  runepageRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 65,
    borderLeft: '1px solid #8e793e',
    padding: '5px 12px',
  },
  runepageIcons: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  runepageKeystoneIcon: {
    minWidth: 50,
    maxWidth: 50,
    height: 50,
    borderRadius: '50%',
    padding: 0,
  },
  runepageIcon: {
    minWidth: 25,
    maxWidth: 25,
    height: 25,
    padding: 0,
  },
});

function getRuneIconPath(rune_name, runes_json) {
  if (runes_json.key === rune_name) {
    return runes_json.icon;
  }
  for (var i = 0; i < runes_json.slots.length; i++) {
    var row = runes_json.slots[i];
    for (var j = 0; j < row.runes.length; j++) {
      var rune = row.runes[j];
      const standardized_key = rune.key
        .replaceAll(':', '')
        .replaceAll(' ', '')
        .toLowerCase();
      const standardized_name = rune_name
        .replaceAll(':', '')
        .replaceAll(' ', '')
        .toLowerCase();
      console.log('k', standardized_key);
      console.log('name', standardized_name);
      console.log(rune);
      if (standardized_key === standardized_name) {
        return rune.icon;
      }
    }
  }
  return null;
}

function getFullDDragonPath(rune_name, runes_json) {
  return (
    'https://ddragon.leagueoflegends.com/cdn/img/' +
    getRuneIconPath(rune_name, runes_json)
  );
}

function getStatIconPath(stat_name) {
  //AdaptiveForce, Armor, AttackSpeed, CDRScaling, HealthScaling, MagicRes
  return (
    'https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/' +
    'StatMods' +
    stat_name +
    'Icon.png'
  );
}

const MAX_RUNEPAGES = 2;

export default function RunesTableMobile({ runes_data }) {
  if (runes_data.loaded === false) {
    return null;
  }
  const classes = useStyles();
  const [runepageIndex, setRunepageIndex] = useState(0);
  const runepages = runes_data.runes;
  const runepage = runepages[runepageIndex];
  const runes_primary_json = runepage.runes_primary_json;
  const runes_secondary_json = runepage.runes_secondary_json;
  const runes_primary_list = runepage.runes_primary_list;
  const runes_secondary_list = runepage.runes_secondary_list;
  const selected_stats_names = runepage.runes_stats;
  const primary_tree_name = runepage.runes_primary;
  const secondary_tree_name = runepage.runes_secondary;
  const primary_path = getFullDDragonPath(
    primary_tree_name,
    runes_primary_json
  );
  const secondary_path = getFullDDragonPath(
    secondary_tree_name,
    runes_secondary_json
  );
  const stat_grid = [
    ['AdaptiveForce', 'AttackSpeed', 'CDRScaling'],
    ['AdaptiveForce', 'Armor', 'MagicRes'],
    ['HealthScaling', 'Armor', 'MagicRes'],
  ];
  const STAT_INDEX_MAP = {
    0: { Adaptive: 0, AttackSpeed: 1, CDRScaling: 2 },
    1: { Adaptive: 0, Armor: 1, MagicRes: 2 },
    2: { HealthScaling: 0, Armor: 1, MagicRes: 2 },
  };
  const RunesTableStats = () => {
    const input = [
      {
        stat_row: stat_grid[0],
        selected_index: STAT_INDEX_MAP[0][selected_stats_names[0]],
      },
      {
        stat_row: stat_grid[1],
        selected_index: STAT_INDEX_MAP[1][selected_stats_names[1]],
      },
      {
        stat_row: stat_grid[2],
        selected_index: STAT_INDEX_MAP[2][selected_stats_names[2]],
      },
    ];
    const rows = _.map(input, (row) => {
      return RunesTableRow(row);
    });
    return <div className={classes.statHeader}>{rows}</div>;
  };
  const RunesTableRow = ({ stat_row, selected_index }) => {
    return (
      <div className={classes.statRow}>
        <React.Fragment>
          {stat_row.map(function (stat, index) {
            var grayed_out = { filter: 'grayscale(1)', opacity: '0.5' };
            if (index === selected_index) {
              grayed_out = null;
            }
            return (
              <img
                className={classes.resizeStatIcon}
                style={grayed_out}
                alt="summoner icon"
                src={getStatIconPath(stat)}
              />
            );
          })}
        </React.Fragment>
      </div>
    );
  };
  const RunepageTableBody = () => {
    const rows = _.map(runepages, (runepage) => {
      if (runepage.runes_index < MAX_RUNEPAGES) {
        return RunepageTableRow(runepage);
      }
    });
    return <div>{rows}</div>;
  };

  const RunepageTableRow = (runepage) => {
    const active = runepageIndex == runepage.runes_index;
    return (
      <div
        className={active ? classes.runepageActiveRow : classes.runepageRow}
        onClick={() => setRunepageIndex(runepage.runes_index)}
      >
        <div className={classes.runepageIcons}>
          <img
            className={classes.runepageKeystoneIcon}
            alt="summoner icon"
            src={getFullDDragonPath(
              runepage.runes_primary_list[0],
              runepage.runes_primary_json
            )}
          />{' '}
          <img
            className={classes.runepageIcon}
            alt="summoner icon"
            src={getFullDDragonPath(
              runepage.runes_secondary,
              runepage.runes_secondary_json
            )}
          />
        </div>
        {Winrate(runepage.runes_winrate)}
      </div>
    );
  };

  var primary = [];
  for (var i = 0; i < runes_primary_json.slots.length; i++) {
    //looping over 4 rows of runes
    var row = runes_primary_json.slots[i];
    var selected = runes_primary_list[i];
    var is_keystone = false;
    if (i === 0) {
      is_keystone = true;
    }

    var rune_row = (
      <KeystoneRowMobile
        is_keystone={is_keystone}
        is_secondary={false}
        selected_list={[selected]}
        row_json={row}
      ></KeystoneRowMobile>
    );
    primary.push(rune_row);
  }
  var secondary = [];
  for (var i = 1; i < runes_secondary_json.slots.length; i++) {
    //looping over 3 rows of runes
    var row = runes_secondary_json.slots[i];
    var selected = runes_secondary_list;

    var rune_row = (
      <KeystoneRowMobile
        is_keystone={false}
        is_secondary={true}
        selected_list={selected}
        row_json={row}
      ></KeystoneRowMobile>
    );
    secondary.push(rune_row);
  }

  return (
    <div className={classes.section}>
      {Header('Runes')}
      <div className={classes.runes_box}>
        <div style={{ flex: '57' }}>
          <div className={classes.runes_primary_header}>
            <img
              className={classes.resizeKeystoneIcon}
              alt="summoner icon"
              src={primary_path}
            />
            {primary_tree_name}
          </div>

          {primary}
        </div>
        <div style={{ flex: '43', marginLeft: 5 }}>
          <div className={classes.runes_secondary_header}>
            <img
              className={classes.resizeKeystoneIcon}
              alt="summoner icon"
              src={secondary_path}
            />
            {secondary_tree_name}
          </div>
          {secondary}
          {RunesTableStats()}
        </div>
      </div>
      <div style={{ flexGrow: 1 }}>{RunepageTableBody()}</div>
    </div>
  );
}
