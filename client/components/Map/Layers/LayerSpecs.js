import React from 'react';
import VectorTileSource from 'ol/source/VectorTile';
import XYZ from 'ol/source/XYZ';
import MVT from 'ol/format/MVT';
import { Fill, Stroke, Style, Circle } from 'ol/style.js';
import TileLayer from './TileLayer';
import VectorTileLayer from './VectorTileLayer';
import LayerGroup from './LayerGroup';
import Feature from 'ol/Feature';
import layerIdGen from './layerIdGen';

const groups = {};

const layers = {};

const styles = {};

const sources = {};

//Define vector tile layer sources
sources.edges = new VectorTileSource({
  format: new MVT({ featureClass: Feature }),
  url: '/layers/ways/{z}/{x}/{y}.mvt'
});

sources.nodes = new VectorTileSource({
  format: new MVT({ featureClass: Feature }),
  url: '/layers/ways_vertices_pgr/{z}/{x}/{y}.mvt'
});

sources.nyccsl = new VectorTileSource({
  format: new MVT({ featureClass: Feature }),
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

styles.selectedLine = new Style({
  stroke: new Stroke({
    color: 'yellow',
    width: 5
  })
});

//Compose Layers

//Create basemap layer group

// groups.basemaps = (
//   <LayerGroup
//     layers={groups.basemaps}
//     groupName={'basemaps'}
//     properties={{ title: 'Basemaps', type: 'base', fold: 'open' }}
//   />
// );
layers.edges = (
  <VectorTileLayer
    key={layerIdGen()}
    source={sources.edges}
    style={styles.edges}
    options={{ minZoom: 14, visible: false, title: 'OSM Routes' }}
  />
);
layers.nodes = (
  <VectorTileLayer
    key={layerIdGen()}
    source={sources.nodes}
    style={styles.nodes}
    options={{ minZoom: 14, visible: false, title: 'OSM Nodes' }}
  />
);
layers.nyccsl = (
  <VectorTileLayer
    key={layerIdGen()}
    source={sources.nyccsl}
    style={styles.nyccsl}
    options={{ minZoom: 14, title: 'Street Centerlines' }}
  />
);
layers.stamenTerrain = (
  <TileLayer
    key={layerIdGen()}
    source={sources.stamenTerrain}
    options={{ title: 'Stamen Terrain', type: 'base' }}
  />
);

// layers.nyccslSelection = (
//   <VectorTileSelectionLayer
//     source={sources.nyccsl}
//     style={styles.selectedLine}
//     options={{
//       minZoom: 14,
//       renderMode: 'vector',
//       visible: true,
//       idField: 'id'
//     }}
//   />
// );
//Assign Layers to Groups
groups.basemaps = [layers.stamenTerrain];
groups.featureLayers = [layers.nyccsl, layers.edges, layers.nodes];
//FIXME: Layers are not associated with layer groups on the map
//Have tried passing down a callback function to add layers, but
//no success yet. Removing layerGroup for now, but may add upon repair
const LayerSpecs = [
  ...groups.basemaps,
  ...groups.featureLayers
  // <LayerGroup
  //   key={layerIdGen()}
  //   properties={{
  //     title: 'Roads and Intersections',
  //     fold: 'close',
  //     combine: false
  //   }}
  // >
  //   {groups.featureLayers}
  // </LayerGroup>
  //layers.nyccslSelection
];

export { LayerSpecs as default, styles, groups, layers, sources };
