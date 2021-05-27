import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Container } from '@material-ui/core';
import { CookiesProvider } from 'react-cookie';
import { Helmet } from 'react-helmet';
import Home from './components/home/home_page.js';
import Users from './components/user/user_page.js';
import Navigation from './components/navigation.js';
import Leaderboards from './components/leaderboard/leaderboard_page.js';
import About from './components/about/about_page.js';
import Faq from './components/faq/faq_page.js';
import ChampionsPage from './components/champions/champions_page.js';
import Champion from './components/builds/champion.js';
import TierlistPage from './components/tierlist/tierlist_page.js';
import ResearchList from './components/research/research_list.js';
import ResearchPost from './components/research/research_post.js';
import './stylesheets/style.css';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
  typography: {
    useNextVariants: true,
  },
});

// Nullify console output
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};
}

function App() {
  return (
    <div>
      <Helmet>
        <title>ARAM Academy - League of Legends Builds + Stats</title>
        <meta
          name="description"
          content="ARAM Academy is the ultimate source of competitive ARAM statstics. Mirror the top ARAM-exclusive Builds, analyze the Tierlist, and climb the Leaderboards."
        />
      </Helmet>
      <CookiesProvider>
        <Router>
          <Container style={{ height: '100%' }}>
            <Navigation />
            <Switch>
              <Route path="/users/:region/:summonerName">
                <Users />
              </Route>
              <Route path="/leaderboards/:region">
                <Leaderboards />
              </Route>
              <Route path="/champions/:champion">
                <Champion />
              </Route>
              <Route path="/champions">
                <ChampionsPage />
              </Route>
              <Route path="/tierlist">
                <TierlistPage />
              </Route>
              <Route path="/about">
                <About />
              </Route>
              <Route path="/FAQ">
                <Faq />
              </Route>
              <Route path="/tierlist">
                <TierlistPage />
              </Route>
              <Route path="/research/:article">
                <ResearchPost />
              </Route>
              <Route path="/research">
                <ResearchList />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </Container>
        </Router>
      </CookiesProvider>
    </div>
  );
}

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </MuiThemeProvider>,
  document.getElementById('root'),
);
