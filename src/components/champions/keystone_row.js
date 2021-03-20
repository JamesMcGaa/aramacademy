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
  resizeChampIcon: {
    minWidth: '40px',
    maxWidth: '40px',
    height: 'auto',
    width: '100%',
    borderRadius: '50%',
    padding: '0px',
  },
});

// function getRuneIconPath(rune_name, runes_json) {
//     if (runes_json.key === rune_name) {
//         return runes_json.icon;
//     }
//     for (var i = 0; i < runes_json.slots.length; i++) {
//         var row = runes_json.slots[i];
//         for (var j = 0; j < row.runes.length; j++) {
//             var rune = row.runes[j];
//             if (rune.key === rune_name) {
//                 return rune.icon;
//             }
//         }
//     }
//     return null;
// }

// function getFullDDragonPath(rune_name, runes_json) {
//     return (
//         'https://ddragon.leagueoflegends.com/cdn/img/' +
//         getRuneIconPath(rune_name, runes_json)
//     );
// }

function getRuneIconPath(rune_icon_path) {
  return 'https://ddragon.leagueoflegends.com/cdn/img/' + rune_icon_path;
}
export default function KeystoneRow({ selected, row_json }) {
  const classes = useStyles();

  console.log('k', selected);
  console.log('rowjson', row_json);
  var icon_paths = [];
  for (var id in row_json.runes) {
    var rune = row_json.runes[id];
    console.log(rune.icon);
    icon_paths.push(getRuneIconPath(rune.icon));
  }
  return (
    <Container>
      <React.Fragment>
        {icon_paths.map(function (path) {
          return (
            <Grid container spacing={3}>
              <Grid item xs>
                <img
                  className={classes.resizeChampIcon}
                  alt="summoner icon"
                  src={path}
                />{' '}
              </Grid>
            </Grid>
          );
        })}
      </React.Fragment>
    </Container>
  );
}
