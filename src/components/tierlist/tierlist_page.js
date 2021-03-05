import React, { useState } from 'react';

import TierlistPageDesktop from './tierlist_page_desktop.js';
import TierlistPageMobile from './tierlist_page_mobile.js';

const mobile = require('is-mobile');

import tierlist_json from '../../jsons/tierlist.json';

export default function TierlistPage() {
  if (mobile()) {
    return <TierlistPageMobile props={tierlist_json} />;
  } else {
    return <TierlistPageDesktop props={tierlist_json} />;
  }
}
