function importAll(r) {
  return r.keys().map(r);
}
const ranks = importAll(
  require.context('../../images/ranked_badges/', false, /\.(png|jpe?g|svg)$/)
);
var rankedBadgeDict = new Object();

ranks.forEach(function (item, index) {
  const rank = item['default'].split('/')[2].split('.')[0];
  rankedBadgeDict[rank] = item['default'];
});

const champs = importAll(
  require.context('../../images/champ_icons/', false, /\.(png|jpe?g|svg)$/)
);
var champImageDict = new Object();

champs.forEach(function (item, index) {
  const champName = item['default'].split('/')[2].split('.')[0];
  champImageDict[champName] = item['default'];
});

const champs_about = importAll(
  require.context('../../images/about_page/', false, /\.(png|jpe?g|svg)$/)
);

export default {
  Images: { ranked_badges: rankedBadgeDict, champ_icons: champImageDict },
};
