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

const tiers = importAll(
  require.context('../images/tier_badges/', false, /\.(png|jpe?g|svg)$/)
);
let tierBadgeDict = new Object();
tiers.forEach(function (item, index) {
  const tier = item['default'].split('/')[2].split('.')[0];
  tierBadgeDict[tier] = item['default'];
});

const champs = importAll(
  require.context('../images/champ_icons/', false, /\.(png|jpe?g|svg)$/)
);
let champImageDict = new Object();

champs.forEach(function (item, index) {
  const champName = item['default'].split('/')[2].split('.')[0];
  champImageDict[champName] = item['default'];
});

const abilities_icons = importAll(
  require.context('../images/abilities/', false, /\.(png|jpe?g|svg)$/)
);
let abilitiesIconsDict = new Object();

abilities_icons.forEach(function (item, index) {
  const ability = item['default'].split('/')[2].split('.')[0];
  abilitiesIconsDict[ability] = item['default'];
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

var champ_classes = new Object();
champ_classes['adc'] = [
  'Aphelios',
  'Ashe',
  'Caitlyn',
  'Draven',
  'Ezreal',
  'Graves',
  'Jhin',
  'Jinx',
  'Kaisa',
  'Kalista',
  'Kayle',
  'Kindred',
  'KogMaw',
  'Lucian',
  'MasterYi',
  'MissFortune',
  'Quinn',
  'Senna',
  'Sivir',
  'Tristana',
  'Twitch',
  'Varus',
  'Vayne',
  'Xayah',
  'Yasuo',
];
champ_classes['burst mage'] = [
  'Ahri',
  'Akali',
  'Annie',
  'Brand',
  'Diana',
  'Ekko',
  'Elise',
  'Evelynn',
  'Fizz',
  'Galio',
  'Karma',
  'Karthus',
  'Kassadin',
  'Katarina',
  'Kennen',
  'Lissandra',
  'Leblanc',
  'Malphite',
  'Mordekaiser',
  'Neeko',
  'Nidalee',
  'Sylas',
  'Syndra',
  'Taliyah',
  'Vladimir',
  'Zoe',
];
champ_classes['control mage'] = [
  'Anivia',
  'AurelionSol',
  'Azir',
  'Bard',
  'Cassiopeia',
  'Chogath',
  'Ekko',
  'Fiddlesticks',
  'Gangplank',
  'Heimerdinger',
  'Lux',
  'Malzahar',
  'Morgana',
  'Neeko',
  'Ryze',
  'Shaco',
  'Swain',
  'Taliyah',
  'Teemo',
  'Veigar',
  'Velkoz',
  'Viktor',
  'Ziggs',
  'Zilean',
  'Zyra',
];
champ_classes['artillery'] = [
  'Corki',
  'Jayce',
  'Kaisa',
  'KogMaw',
  'Nidalee',
  'Teemo',
  'Velkoz',
  'Xerath',
  'Zoe',
];
//support engage tank bruiser
champ_classes['support'] = [
  'Alistar',
  'Bard',
  'Braum',
  'Ivern',
  'Janna',
  'Karma',
  'Leona',
  'Lulu',
  'Lux',
  'Morgana',
  'Nami',
  'Nunu',
  'Rakan',
  'Senna',
  'Sona',
  'Soraka',
  'TahmKench',
  'Taric',
  'Thresh',
  'Yuumi',
];
champ_classes['engage'] = [
  'Alistar',
  'Amumu',
  'Annie',
  'Ashe',
  'Bard',
  'Blitzcrank',
  'Diana',
  'Fiddlesticks',
  'Fizz',
  'Gangplank',
  'Gnar',
  'Gragas',
  'Hecarim',
  'JarvanIV',
  'Kennen',
  'Kled',
  'Leona',
  'Lissandra',
  'Malphite',
  'Maokai',
  'Mordekaiser',
  'Nautilus',
  'Nunu',
  'Ornn',
  'Pantheon',
  'Rakan',
  'Rumble',
  'Sejuani',
  'Sett',
  'Singed',
  'Sion',
  'Skarner',
  'Sylas',
  'Thresh',
  'Vi',
  'Volibear',
  'Warwick',
  'MonkeyKing',
  'XinZhao',
  'Zac',
];
champ_classes['ad assassin'] = [
  'Kayn',
  'Khazix',
  'MasterYi',
  'Nocturne',
  'Pantheon',
  'Pyke',
  'Qiyana',
  'Quinn',
  'Rengar',
  'Riven',
  'Shaco',
  'Talon',
  'Tryndamere',
  'Yasuo',
  'Zed',
];
champ_classes['tank'] = [
  'Alistar',
  'Amumu',
  'Blitzcrank',
  'Braum',
  'Chogath',
  'Darius',
  'DrMundo',
  'Fiddlesticks',
  'Galio',
  'Garen',
  'Gnar',
  'Gragas',
  'JarvanIV',
  'Malphite',
  'Maokai',
  'Nasus',
  'Nautilus',
  'Nunu',
  'Olaf',
  'Ornn',
  'Poppy',
  'Rammus',
  'Sejuani',
  'Sett',
  'Shen',
  'Singed',
  'Sion',
  'TahmKench',
  'Taric',
  'Trundle',
  'Udyr',
  'Volibear',
  'Warwick',
  'Zac',
];
champ_classes['bruiser'] = [
  'Aatrox',
  'Darius',
  'DrMundo',
  'Garen',
  'Gnar',
  'Hecarim',
  'Illaoi',
  'Irelia',
  'Jax',
  'Kayn',
  'Kled',
  'LeeSin',
  'Nasus',
  'Olaf',
  'Pantheon',
  'RekSai',
  'Renekton',
  'Riven',
  'Sett',
  'Shen',
  'Singed',
  'Skarner',
  'Sylas',
  'Trundle',
  'Udyr',
  'Urgot',
  'Vi',
  'Volibear',
  'Warwick',
  'MonkeyKing',
  'XinZhao',
  'Yorick',
];
champ_classes['waveclear'] = [
  'Ahri',
  'Anivia',
  'AurelionSol',
  'Azir',
  'Brand',
  'Caitlyn',
  'Cassiopeia',
  'Corki',
  'Ekko',
  'Graves',
  'Heimerdinger',
  'Janna',
  'Karma',
  'KogMaw',
  'Lux',
  'Malzahar',
  'MissFortune',
  'Mordekaiser',
  'Morgana',
  'Neeko',
  'Orianna',
  'Ryze',
  'Sion',
  'Sivir',
  'Syndra',
  'Taliyah',
  'Talon',
  'TwistedFate',
  'Varus',
  'Veigar',
  'Velkoz',
  'Viktor',
  'Xerath',
  'Ziggs',
  'Zilean',
  'Zyra',
];
export default {
  Resources: {
    ranked_badges: rankedBadgeDict,
    tier_badges: tierBadgeDict,
    champ_icons: champImageDict,
    two_word_champs: two_word_champs,
    abilities_icons: abilitiesIconsDict,
    champ_classes,
  },
};
