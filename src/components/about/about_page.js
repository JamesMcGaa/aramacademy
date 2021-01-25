import React from 'react';

import AboutPageDesktop from './about_page_desktop.js';
import AboutPageMobile from './about_page_mobile';

const mobile = require('is-mobile');
import PaletteIcon from '@material-ui/icons/Palette';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import ShowChartIcon from '@material-ui/icons/ShowChart';

export default function About() {
  const ladData = [
    [
      {
        img: '/static/MonkeyKing_about_cropped.png',
        link: '/users/na/DeusExAnimo/',
        bio:
          'DeusExAnimo is a fullstack engineer. He also manages the AWS hosting and MongoDB clusters.',
        name: 'DeusExAnimo',
        icon: <KeyboardIcon />,
      },
      {
        img: '/static/Zed_about_cropped.png',
        link: '/users/na/Kirito%20Sensei/',
        bio:
          'Kirito Sensei is a fullstack engineer. He helped create the frontend components and backend Riot calls.',
        name: 'Kirito Sensei',
        icon: <KeyboardIcon />,
      },
      {
        img: '/static/Draven_about_cropped.png',
        link: '/users/na/Dsetreg/',
        bio:
          'Dsetreg is a fullstack engineer. He helped design our technology stack, configuration, and system flow.',
        name: 'Dsetreg',
        icon: <KeyboardIcon />,
      },
      {
        img: '/static/Vayne_about_cropped.png',
        link: '/users/na/crushsquid/',
        bio:
          'Crushsquid is an infra engineer. He developed the initial prototype that eventually became ARAM Academy.',
        name: 'crushsquid',
        icon: <KeyboardIcon />,
      },
    ],
    [
      {
        img: '/static/Samira_about_cropped.png',
        link: '/users/na/Gated/',
        bio:
          "Gated is ARAM Academy's product manager. He is also the coach for Penn State D1 League. Find him at",
        name: 'Gated',
        twitch: 'https://www.twitch.tv/gatedlol',
        icon: <ShowChartIcon />,
      },
      {
        img: '/static/Heimerdinger_about_cropped.png',
        link: '/users/na/cake%20id/',
        bio:
          'cake id is our marketing manager, and creates many of the memes and advertisements used by ARAM Academy. ',
        name: 'cake id',
        icon: <PaletteIcon />,
      },
      {
        img: '/static/Ashe_about_cropped.png',
        link: '/users/na/ionviv/',
        bio:
          'Ionviv is our graphic design lead. She produces the art and assets for ARAM Academy. Find her at',
        name: 'ionviv',
        twitch: 'https://www.twitch.tv/ianviv',
        icon: <PaletteIcon />,
      },
    ],
  ];
  if (mobile()) {
    return <AboutPageMobile data={ladData} />;
  } else {
    return <AboutPageDesktop data={ladData} />;
  }
}
