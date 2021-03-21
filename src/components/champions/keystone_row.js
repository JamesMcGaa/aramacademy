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
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles({
  table: {
    minWidth: 100,
  },
  iconCell: {
    'min-width': '60px',
    width: '60px',
    'max-width': '80px',
    padding: '8px',
  },
  resizeRuneIcon: {
    minWidth: '43px',
    maxWidth: '43px',
    height: 'auto',
    width: '100%',
    borderRadius: '50%',
    padding: '0px',
  },
  resizeSecondaryRuneIcon: {
    minWidth: '40px',
    maxWidth: '40px',
    height: 'auto',
    width: '100%',
    borderRadius: '50%',
    padding: '0px',
  },
  resizeKeystoneIcon: {
    minWidth: '58px',
    maxWidth: '58px',
    height: 'auto',
    width: '100%',
    borderRadius: '50%',
    padding: '0px',
    marginLeft: '-4px',
  },
  keystoneRow: {
    display: 'flex',
    justifyContent: 'space-between',
    minWidth: '215px',
    maxWidth: '215px',
    marginBottom: '12px',
    borderBottom: '1px solid #8e793e',
    padding: '5px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    minWidth: '215px',
    maxWidth: '215px',
    //marginBottom: '12px',
    padding: '9px',
  },
  secondaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    minWidth: '190px',
    maxWidth: '190px',
    //marginBottom: '5px',
    padding: '3px',
  },
  unselected: {
    filter: 'grayscale(1)',
  },
});

function getRuneIconPath(rune_icon_path) {
  return 'https://ddragon.leagueoflegends.com/cdn/img/' + rune_icon_path;
}
export default function KeystoneRow({
  is_keystone,
  is_secondary,
  selected_list,
  row_json,
}) {
  const classes = useStyles();
  var icon_paths_selected = [];
  for (var id in row_json.runes) {
    var rune = row_json.runes[id];

    var is_selected = false;
    for (var id in selected_list) {
      var selected_rune = selected_list[id];
      if (selected_rune === rune.key) {
        is_selected = true;
      }
    }
    var tup = [getRuneIconPath(rune.icon), is_selected];
    icon_paths_selected.push(tup);
  }

  var row_class = classes.row;
  var rune_class = classes.resizeRuneIcon;
  if (is_keystone) {
    rune_class = classes.resizeKeystoneIcon;
    row_class = classes.keystoneRow;
  }
  if (is_secondary) {
    rune_class = classes.resizeSecondaryRuneIcon;
    row_class = classes.secondaryRow;
  }
  return (
    <div className={row_class}>
      <React.Fragment>
        {icon_paths_selected.map(function (tup) {
          var path = tup[0];
          var selected = tup[1];

          var grayed_out = { filter: 'grayscale(1)' };
          if (selected) {
            grayed_out = null;
          }

          return (
            <img
              className={rune_class}
              style={grayed_out}
              alt="summoner icon"
              src={path}
            />
          );
        })}
      </React.Fragment>
    </div>
  );
}
