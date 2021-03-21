import React from 'react';
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
import KeystoneRow from './keystone_row.js';

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
  resizeChampIcon: {
    minWidth: '40px',
    maxWidth: '40px',
    height: 'auto',
    width: '100%',
    borderRadius: '50%',
    padding: '0px',
  },
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: '4px',
    textAlign: 'center',
  },
  header: {
    position: 'center',
    display: 'flex',
    marginBottom: 20,
    width: '100%',
    fontSize: 14,
    fontWeight: 700,
    borderBottom: '1px solid #3f51b5',
  },

  runes_primary_header: {
    display: 'flex',
    marginBottom: 5,
    marginLeft: 8,
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
  runes_box: {
    minWidth: '500px',
    maxWidth: '500px',
    marginLeft: '0px',
  },
  resizeKeystoneIcon: {
    minWidth: '40px',
    maxWidth: '40px',
    height: 'auto',
    width: '100%',
    borderRadius: '50%',
    padding: '3px',
    paddingRight: '5px',
  },
  resizeStatIcon: {
    minWidth: '30px',
    maxWidth: '30px',
    height: 'auto',
    width: '100%',
    borderRadius: '50%',
    border: '1px solid #3f51b5',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    minWidth: '160px',
    maxWidth: '160px',
    //marginBottom: '5px',
    padding: '3px',
    marginLeft: '13px',
  },
  statHeader: {
    borderTop: '1px solid #8e793e',
    marginTop: '9px',
    paddingTop: '9px',
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
      if (rune.key === rune_name) {
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
export default function RunesTable({ runes_data }) {
  if (runes_data.loaded === false) {
    return null;
  }
  const classes = useStyles();
  const runes_primary_json = runes_data.runes_primary_json;
  const runes_secondary_json = runes_data.runes_secondary_json;

  const runes_primary_list = runes_data.runes_primary_list;
  const runes_secondary_list = runes_data.runes_secondary_list;
  const selected_stats_indices = runes_data.runes_stats;
  const primary_tree_name = runes_data.runes_primary;
  const secondary_tree_name = runes_data.runes_secondary;
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
  const RunesTableHeader = () => {
    return <div className={classes.header}>Runes</div>;
  };

  const RunesTableStats = () => {
    const input = [
      {
        stat_row: stat_grid[0],
        selected_index: selected_stats_indices[0],
      },
      {
        stat_row: stat_grid[1],
        selected_index: selected_stats_indices[1],
      },
      {
        stat_row: stat_grid[2],
        selected_index: selected_stats_indices[2],
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
            var grayed_out = { filter: 'grayscale(1)' };
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
      <KeystoneRow
        is_keystone={is_keystone}
        is_secondary={false}
        selected_list={[selected]}
        row_json={row}
      ></KeystoneRow>
    );
    primary.push(rune_row);
  }
  var secondary = [];
  for (var i = 1; i < runes_secondary_json.slots.length; i++) {
    //looping over 3 rows of runes
    var row = runes_secondary_json.slots[i];
    var selected = runes_secondary_list;

    var rune_row = (
      <KeystoneRow
        is_keystone={false}
        is_secondary={true}
        selected_list={selected}
        row_json={row}
      ></KeystoneRow>
    );
    secondary.push(rune_row);
  }

  return (
    <div className={classes.section}>
      {RunesTableHeader()}
      <Container className={classes.runes_box}>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: '50%', marginRight: '45px' }}>
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
          <div style={{ flex: '50%' }}>
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
      </Container>
    </div>
  );
}
