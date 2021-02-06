import React, { useState } from 'react';

import TierlistPageDesktop from './tierlist_page_desktop.js';
import TierlistPageMobile from './tierlist_page_mobile.js';

const mobile = require('is-mobile');

export default function TierlistPage() {
  const [state, setState] = useState({
    tierlist_data: undefined,
  });

  //return null;

  if (mobile()) {
    return <TierlistPageMobile />;
  } else {
    return <TierlistPageDesktop />;
  }
}
