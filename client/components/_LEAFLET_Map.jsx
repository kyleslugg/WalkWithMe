import React, { Component } from 'react';
import { MapContainer, TileLayer, LayersControl, Pane } from 'react-leaflet';

const Map = () => {
  const initialPosition = [40.6739, -73.9358];
  //const firstMap = L.map('map').setView([40.6739, -73.9358], 13);

  return (
    <div className="map">
      <MapContainer
        center={initialPosition}
        zoom={15}
        style={{ height: '100vh' }}
      >
        <LayersControl>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
          />
        </LayersControl>
      </MapContainer>
    </div>
  );
};

export default Map;
