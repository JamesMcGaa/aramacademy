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
  resizeRuneIcon: {
    minWidth: '29px',
    maxWidth: '33px',
    minHeight: '29px',
    maxHeight: '33px',
    width: '100%',
    borderRadius: '50%',
    padding: '0px',
  },
  resizeSecondaryRuneIcon: {
    minWidth: '25px',
    maxWidth: '28px',
    minHeight: '25px',
    maxHeight: '28px',
    width: '100%',
    borderRadius: '50%',
    padding: '0px',
  },
  resizeKeystoneIcon: {
    minWidth: '35px',
    maxWidth: '43px',
    minHeight: '35px',
    maxHeight: '43px',
    width: '100%',
    borderRadius: '50%',
    padding: '0px',
    marginLeft: '-4px',
  },
  keystoneRow: {
    display: 'flex',
    justifyContent: 'space-between',
    //minWidth: '160px',
    //maxWidth: '160px',
    marginBottom: '12px',
    borderBottom: '1px solid #8e793e',
    padding: '5px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    //minWidth: '160px',
    //maxWidth: '160px',
    //marginBottom: '12px',
    padding: '12px',
  },
  secondaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    //minWidth: '140px',
    //maxWidth: '140px',
    //marginBottom: '5px',
    padding: '5px',
  },
  unselected: {
    filter: 'grayscale(1)',
  },
});

function getRuneIconPath(rune_icon_path) {
  return 'https://ddragon.leagueoflegends.com/cdn/img/' + rune_icon_path;
}
export default function KeystoneRowMobile({
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
      const standardized_key = rune.key
        .replaceAll(':', '')
        .replaceAll(' ', '')
        .toLowerCase();
      const standardized_name = selected_rune
        .replaceAll(':', '')
        .replaceAll(' ', '')
        .toLowerCase();
      if (standardized_key === standardized_name) {
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

          var grayed_out = { filter: 'grayscale(1)', opacity: '0.5' };
          if (selected) {
            if (!is_keystone) {
              grayed_out = { border: '2px solid #8e793e' };
            } else {
              grayed_out = null;
            }
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
