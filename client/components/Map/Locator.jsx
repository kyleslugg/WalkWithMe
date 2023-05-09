import React, { useContext } from 'react';
import MapContext from './MapContext';
import { fromLonLat, get } from 'ol/proj.js';

const Locator = (props) => {
  const { map } = useContext(MapContext);

  //Setting up geolocation API
  const geolocationOptions = {
    enableHighAccuracy: true,
    timeout: 1500,
    maximumAge: 0
  };

  const geolocationSuccess = (position) => {
    const [lat, long] = [position.coords.latitude, position.coords.longitude];
    console.log([lat, long]);
    map.getView().setCenter(fromLonLat([long, lat]));
  };

  const geolocationFailure = (err) => {
    console.log(err);
    console.log('Failed to fetch location');
  };

  const getAndSetGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        geolocationSuccess,
        geolocationFailure,
        geolocationOptions
      );
    }
  };

  //Setting up call to geocoding API

  const searchAddress = () => {
    const textBoxElement = document.querySelector('#address-input-box');
    const queryString = textBoxElement.value;
    textBoxElement.value = '';

    if (queryString) {
      fetch(`/geocode/${encodeURIComponent(queryString)}`)
        .then((response) => response.json())
        .then((response) => {
          const [long, lat] = [response.longitude, response.latitude];
          if (long && lat) {
            map.getView().setCenter(fromLonLat([long, lat]));
          } else {
            console.log(
              'Invalid or missing coordinates on response to geocode request'
            );
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  return (
    <div className="locator">
      <div id="project-branding"></div>
      <div id="addr-lookup">
        <div className="text-box">
          <input type="text" id="address-input-box"></input>
          <button onClick={getAndSetGeolocation}>
            <img src="../../assets/gps.png" />
          </button>
        </div>
        <div className="button-row">
          <button onClick={searchAddress}>Search</button>
        </div>
      </div>
      <div id="layers-and-legend">
        <div className="title">Layers</div>
        <div id="layer-selector-holder"></div>
      </div>
    </div>
  );
};

export default Locator;
