import React from 'react';
import VectorTileSource from 'ol/source/VectorTile';
import XYZ from 'ol/source/XYZ';
import MVT from 'ol/format/MVT';
import { Fill, Stroke, Style, Circle } from 'ol/style.js';
import TileLayer from './TileLayer';
import VectorTileLayer from './VectorTileLayer';

const layers = {};

const styles = {};

const sources = {};

//Define vector tile layer sources
sources.edges = new VectorTileSource({
  format: new MVT(),
  url: '/layers/edges/{z}/{x}/{y}.mvt'
});

sources.nodes = new VectorTileSource({
  format: new MVT(),
  url: '/layers/ways_vertices_pgr/{z}/{x}/{y}.mvt'
});

sources.nyccsl = new VectorTileSource({
  format: new MVT(),
  url: '/layers/nyccsl/{z}/{x}/{y}.mvt',
  attributions:
    'Street centerlines by NYC OTI via <a href="https://data.cityofnewyork.us/City-Government/NYC-Street-Centerline-CSCL-/exjm-f27b">NYC OpenData</a>'
});

sources.stamenTerrain = new XYZ({
  url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
  attributions: `Base map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.`
});

//Define vector tile layer styles

styles.edges = new Style({
  stroke: new Stroke({
    color: 'green',
    width: 2
  })
});

styles.nodes = new Style({
  image: new Circle({
    stroke: new Stroke({
      color: 'grey',
      width: 1
    }),
    fill: new Fill({
      color: 'blue'
    }),
    radius: 3
  })
});

styles.nyccsl = new Style({
  stroke: new Stroke({
    color: 'green',
    width: 4
  })
});

//Compose Layers
layers.edges = (
  <VectorTileLayer
    source={sources.edges}
    style={styles.edges}
    options={{ minZoom: 14 }}
  />
);
layers.nodes = (
  <VectorTileLayer
    source={sources.nodes}
    style={styles.nodes}
    options={{ minZoom: 14 }}
  />
);
layers.nyccsl = (
  <VectorTileLayer
    source={sources.nyccsl}
    style={styles.nyccsl}
    options={{ minZoom: 14 }}
  />
);
layers.stamenTerrain = <TileLayer source={sources.stamenTerrain} />;

const LayerSpecs = [layers.stamenTerrain, layers.nyccsl];

export default LayerSpecs;
