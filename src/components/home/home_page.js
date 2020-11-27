import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import CloseIcon from '@material-ui/icons/Close';
import {
  FormGroup,
  FormHelperText,
  Select,
  FilledInput,
  MenuItem,
  Container,
  Snackbar,
  Button,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useCookies } from 'react-cookie';
var mobile = require('is-mobile');

const UPPERCASE_REGIONS_FOR_SELECTOR = [
  'NA',
  'BR',
  'EUW',
  'EUNE',
  'LAN',
  'LAS',
  'OCE',
  'RU',
  'TR',
  'JP',
  'KR',
];

const useStyles = makeStyles({
  select: {
    'padding-top': '10px',
  },
  'select-root': {
    width: '40px',
    background: 'rgba(34,34,34,1)',
    '&:focus': {
      background: 'rgba(34,34,34,1)',
    },
    '&:hover': {
      background: 'rgba(34,34,34,.2)',
    },
  },
  input: {
    'font-size': '16px',
    'padding-top': '10px',
    width: '300px',
  },
  'input-root': {
    background: 'rgba(34,34,34,1)',
    '&:hover': {
      'background-color': 'rgba(255, 255, 255, 0.09)',
    },
    '&:focused': {
      'background-color': 'rgba(255, 255, 255, 0.09)',
    },
  },
  label: {
    textTransform: 'capitalize',
  },
  icon: {
    color: '#6495ED',
  },
  center: {
    'justify-content': 'center',
  },
  error: {
    'margin-left': 'calc(50% - 234px)',
    'font-size': '.9rem',
    'margin-top': '10px',
  },
  previousSearches: {
    'margin-left': 'calc(50% - 234px)',
    'font-size': '.9rem',
    'margin-top': '10px',
  },
});

export default function Home() {
  const classes = useStyles();
  const history = useHistory();

  const [summonerName, setSummonerName] = useState('');
  const [region, setRegion] = useState('NA');
  const [error, setError] = useState(false);
  const [focused, setFocused] = useState(false);
  const [cookies, setCookie] = useCookies(['recentlySearched']);
  const [open, setOpen] = useState(true);

  const COOKIE_EXPIRATION_IN_DAYS = 365;
  const SECONDS_TO_DAYS = 24 * 60 * 60;

  const handleClose = () => {
    setOpen(false);
  };

  function handleSearchCookie(search) {
    let searched_array;
    if (cookies.recentlySearched !== undefined) {
      searched_array = cookies.recentlySearched;
    } else {
      searched_array = [];
    }

    if (!searched_array.includes(search)) {
      searched_array.push(search.trim());
      if (searched_array.length > 5) {
        searched_array.shift();
      }
    } else {
      let idx = searched_array.indexOf(search);
      searched_array.splice(idx, 1);
      searched_array.push(search.trim());
    }

    setCookie('recentlySearched', JSON.stringify(searched_array), {
      path: '/',
      maxAge: COOKIE_EXPIRATION_IN_DAYS * SECONDS_TO_DAYS,
    });
  }

  const analyzeHandler = () => {
    if (summonerName) {
      handleSearchCookie(summonerName.trim());
      history.push(`/users/${region.toLowerCase()}/${summonerName.trim()}`);
    } else {
      setError(true);
    }
  };

  return (
    <Container>
      <header
        className="masthead"
        style={mobile() ? { marginBottom: '30vh' } : { marginBottom: '40vh' }}
      >
        <div className="inner"></div>
      </header>
      <main role="main" className="inner cover">
        <h1 className="cover-heading">Welcome to the Howling Abyss</h1>
        <p className="lead" style={mobile() ? { fontSize: '16px' } : {}}>
          ARAM Academy helps you analyze your performance, identify winning
          strategies, and climb the ARAM ladder.
        </p>

        <FormGroup row={true} classes={{ root: classes.center }}>
          <FilledInput
            placeholder="Summoner name"
            error={error}
            id=""
            classes={{
              root: classes['input-root'],
              focused: classes['input-root'],
              input: classes['input'],
            }}
            style={mobile() ? { width: '40%' } : {}}
            onChange={(event) => {
              setSummonerName(event.target.value);
              setError(false);
            }}
            onKeyUp={(event) => {
              if (event.key == 'Enter') analyzeHandler();
            }}
            onFocus={(event) => {
              setFocused(true);
            }}
            onBlur={(event) => {
              setFocused(false);
            }}
          />
          <Select
            variant="filled"
            classes={{
              root: classes['select-root'],
              select: classes['select'],
            }}
            defaultValue="NA"
            onChange={(event) => setRegion(event.target.value)}
          >
            {UPPERCASE_REGIONS_FOR_SELECTOR.map((region, index) => (
              <MenuItem value={region} key={region}>
                {region}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            color="primary"
            classes={{ label: classes.label }}
            onClick={analyzeHandler}
          >
            Analyze
          </Button>
        </FormGroup>

        {focused &&
          cookies.recentlySearched !== undefined &&
          cookies.recentlySearched
            .slice()
            .reverse()
            .map((searchTerm) => (
              <FormHelperText
                onMouseDown={function (event) {
                  let url = `/users/${region.toLowerCase()}/`;
                  url += searchTerm.trim();
                  handleSearchCookie(searchTerm.trim());
                  history.push(url);
                }}
                key={searchTerm}
                classes={{ root: classes.previousSearches }}
                style={mobile() ? { textAlign: 'center' } : {}}
              >
                {searchTerm}
              </FormHelperText>
            ))}

        {error && (
          <FormHelperText
            error={true}
            classes={{ root: classes.error }}
            style={mobile() ? { textAlign: 'center' } : {}}
          >
            Summoner name is required!
          </FormHelperText>
        )}
      </main>
      <Snackbar
        open={open}
        onClose={handleClose}
        message="Make feature requests, share bugs, or contribute to open source"
        action={
          <Container>
            <Button
              color="primary"
              size="medium"
              href="https://discord.gg/MydvqhqWmM"
            >
              Join the ARAM Academy Discord
            </Button>
            <IconButton
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          </Container>
        }
      />
    </Container>
  );
}
