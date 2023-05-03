import React, { Component } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

//const firstMap = L.map('map').setView([40.6739, -73.9358], 13);

const Map = () => {
  const initialPosition = [40.6739, -73.9358];
  return (
    <div className="map">
      <MapContainer
        center={initialPosition}
        zoom={13}
        style={{ height: '100vh' }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
};

export default Map;
