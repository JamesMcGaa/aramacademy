import React from 'react';
import nunu_gif from '../../images/nunu_dancing_compressed.gif';

export default function UserPageLoading({ summonerName }) {
  return (
    <div>
      <div style={{ height: '100px' }}></div>
      <h3>
        <img src={nunu_gif} style={{ width: '100%' }} alt="loading..." />
      </h3>
      <h4>
        {' '}
        We are aggregating data for {summonerName}.
        <br /> This process may take up to a few minutes.
      </h4>
    </div>
  );
}
