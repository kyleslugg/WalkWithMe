import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { fromLonLat, get } from 'ol/proj.js';
import FeatureSaveLoad from './FeatureSaveLoad';

const Locator = ({ children }) => {
  const selection = useSelector((state: RootState) => state.mapSlice.selection);
  const map = useSelector((state: RootState) => state.mapSlice.map);

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
    map.getView().setZoom(16);
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
            map.getView().setZoom(16);
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

  //Establish handler for enter click on button
  const keyDownHandler = (event) => {
    if (!event.key == 'Enter') return;
    searchAddress();
  };

  return (
    <div className="locator">
      <div id="project-branding">
        <img src={require('../../assets/logo.png')}></img>
      </div>
      <div id="addr-lookup" className="control-pane">
        <div className="text-box">
          <input
            type="text"
            id="address-input-box"
            placeholder="Enter Adddress"
          ></input>
          <button onClick={getAndSetGeolocation}>
            <img src={require('../../assets/gps.png')} />
          </button>
        </div>
        <div className="button-row">
          <input
            className="full-width"
            type="submit"
            value={'Search'}
            onClick={searchAddress}
            onKeyDown={keyDownHandler}
          />
        </div>
      </div>
      <div id="layers-and-legend" className="control-pane">
        <div className="title">Layers</div>
        <div id="layer-selector"></div>
      </div>
      {children}
    </div>
  );
};

export default Locator;
