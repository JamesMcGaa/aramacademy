import React from 'react';
import amumu_gif from '../../images/amumu_crying.gif';

export default function UserPageDoesNotExist({ summonerName, region }) {
  return (
    <div>
      <div style={{ height: '100px' }}></div>
      <h3>
        <img src={amumu_gif} style={{ width: '100%' }} alt="loading..." />
      </h3>
      <h4>
        {' '}
        Could not find {summonerName} in {region.toUpperCase()}.
        <br /> Double check your spelling and region.
      </h4>
    </div>
  );
}
