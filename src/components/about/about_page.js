import React from 'react';

import AboutPageDesktop from './about_page_desktop.js';
import AboutPageMobile from './about_page_mobile';

const mobile = require('is-mobile');

export default function About() {
  const ladData = [
    {
      img: '/static/MonkeyKing_about_cropped.png',
      link: '/users/na/DeusExAnimo/',
      bio:
        "I'm DeusExAnimo. On the Rift I play support but on ARAM I play mostly ADC. My favorite ARAM champion is the reworked Wukong. Somehow my total Shen winrate is 21.7%",
      name: 'DeusExAnimo',
    },
    {
      img: '/static/Zed_about_cropped.png',
      link: '/users/na/Kirito%20Sensei/',
      bio:
        "I'm Kirito Sensei. I'm a big fan of engage tanks and assassins. I love starting the fight with a flashy engage or one shot, but if you give me a ranged ADC, I'll consistently run it down.",
      name: 'Kirito Sensei',
    },
    {
      img: '/static/Draven_about_cropped.png',
      link: '/users/na/Dsetreg/',
      bio:
        "I'm Dsetreg. Since I could walk, I've dreamed of growing up to be like Tyler1. Unfortunately my bench press is low and I am a bottom feeder in silver, so now I'm a stinky minecraft player.",
      name: 'Dsetreg',
    },
    {
      img: '/static/Vayne_about_cropped.png',
      link: '/users/na/crushsquid/',
      bio:
        "I'm Crushsquid. There aren't any squid champions in League yet, but I'd main one if it were out there. Until that day, I'm a Vayne main. I am also a frequent OSU and chess player.",
      name: 'Crushsquid',
    },
  ];
  if (mobile()) {
    return <AboutPageMobile data={ladData} />;
  } else {
    return <AboutPageDesktop data={ladData} />;
  }
}
