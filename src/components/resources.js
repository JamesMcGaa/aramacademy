import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

function importAll(r) {
  return r.keys().map(r);
}
const ranks = importAll(
  require.context('../images/ranked_badges/', false, /\.(png|jpe?g|svg)$/)
);
let rankedBadgeDict = new Object();

ranks.forEach(function (item, index) {
  const rank = item['default'].split('/')[2].split('.')[0];
  rankedBadgeDict[rank] = item['default'];
});

const champs = importAll(
  require.context('../images/champ_icons/', false, /\.(png|jpe?g|svg)$/)
);
let champImageDict = new Object();

champs.forEach(function (item, index) {
  const champName = item['default'].split('/')[2].split('.')[0];
  champImageDict[champName] = item['default'];
});

let two_word_champs = new Map();
two_word_champs.set('AurelionSol', 'Aurelion Sol');
two_word_champs.set('Chogath', "Cho'Gath");

two_word_champs.set('DrMundo', 'Dr. Mundo');
two_word_champs.set('JarvanIV', 'Jarvan IV');
two_word_champs.set('Kaisa', "Kai'Sa");

two_word_champs.set('Khazix', "Kha'Zix");

two_word_champs.set('KogMaw', "Kog'Maw");
two_word_champs.set('Leblanc', 'LeBlanc');

two_word_champs.set('LeeSin', 'Lee Sin');
two_word_champs.set('MasterYi', 'Master Yi');
two_word_champs.set('MissFortune', 'Miss Fortune');
two_word_champs.set('MonkeyKing', 'Wukong');
two_word_champs.set('Nunu', 'Nunu & Willump');
two_word_champs.set('Reksai', "Rek'Sai");
two_word_champs.set('TahmKench', 'Tahm Kench');

two_word_champs.set('TwistedFate', 'Twisted Fate');
two_word_champs.set('Velkoz', "Vel'koz");
two_word_champs.set('XinZhao', 'Xin Zhao');

const social_svgs = importAll(
  require.context('../images/social_icons/', false, /\.(png|jpe?g|svg)$/)
);

export default {
  Resources: {
    ranked_badges: rankedBadgeDict,
    champ_icons: champImageDict,
    two_word_champs: two_word_champs,
  },
};
