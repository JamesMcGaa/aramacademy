# ARAM Academy

ARAM Winrate Tracker

## Execution Instructions

1. Install [node.js](https://nodejs.org/en/download/)

2. Install node dependencies with `npm install` in top level directory

3. Install nodemon with `npm install nodemon -g` in same directory

4. Whitelist IP in MongoDB Atlas project

5. Start server with `npm run start` or `npm run prod`

6. Create a .env file in the root folder with the following definitions

```
RIOT_API_KEY=key

DEV_MODE=dev | prod

DB_URI=uri
```
## File Structure

- `src` - Front end UI. Written in React. app.js is the main entrypoint and index.js does the URL routing. resources.js contains some hardcoded champion data (e.g. converting DB names MonkeyKing => Wukong). A note about images: webpack grabs and packages images into the dist/static folder. It will automatically pick up any image references you make, but you must `require.context` them (like the resources.js file does)
- `backend` - backendAPIRouter.js handles API calls to our ARAM data infrastructure (`infra_entrypoint` and `leaderboard_update`) as well as other GET and POST requests for things like MMR from WhatIsMyMMR
- `dist` - webpack loaded stuff - don't manually touch
- `logs` - error logs collected by the infra
- `infra` - infra_entrypoint.js is the main entrypoint. Calls to Kayn API are sectioned into kayn_calls.js. Utility definitions of enums, constants, and data manipulation functions are found in utils.js. leaderboard_update.js handles updating the leaderboard on a daily basis. It grabs all high elo games from a recent time period and checks MMR from WhatIsMyMMR. champion_icons.py loads champion icons from DDragon (written in python because of tech debt, no real reason its in python)
- `models` - mongoDB table models

## Overview

When a user enters his username, site is directed to Users page and processUser from backendAPIRouter is called, which sends a request to the infra_entrypoint to run this user. Once infra_entrypoint returns back the data in dictionary format and saves in DB, Users page is redirected to your specific user page with loaded data. Update button runs very similarly - when update is clicked, we check for all ARAM games since the last processed game timestamp of this user. We do this by storing the `last_processed_game_timestamp` in unix time in our DB. this `last_processed_game_timestamp` is pulled directly from Riot API from the most recently played game, so there should be no bugs with this.

Currently, mobile UI is hardcoded as a check on if the user isMobile using an isMobile npm package. Our desktop UI has hardcoded pixel values for table width, icon width, etc

### Website

available at https://aram.academy
