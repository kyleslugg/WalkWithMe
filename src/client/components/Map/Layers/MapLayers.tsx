import React, { FC, ReactElement, ReactNode } from 'react';
import VectorTileSource from 'ol/source/VectorTile.js';
import XYZ from 'ol/source/XYZ.js';
import MVT from 'ol/format/MVT.js';
import { Fill, Stroke, Style, Circle } from 'ol/style.js';
import TileLayer from './TileLayer';
import VectorTileLayer from './VectorTileLayer';
import ModVectorLayer from './ModifiableVectorLayer';
import Feature from 'ol/Feature.js';
import layerIdGen from './layerIdGen';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { LayerDefinitionSet, LayerProps } from '../../../../types.js';
import TileSource from 'ol/source/Tile.js';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
//import LayerGroup from 'ol/layer/Group.js';

const groups: LayerDefinitionSet<ReactNode> = {};

const layers: LayerDefinitionSet<ReactElement> = {};

const styles: LayerDefinitionSet<Style> = {};

const sources: LayerDefinitionSet<
  VectorSource<any> | TileSource | VectorTileSource
> = {};

//TODO: Parameterize layer creation by hashed layer IDs
//Define vector tile layer sources
sources.geojsonHolder = new VectorSource({
  format: new GeoJSON()
});

sources.edges = new VectorTileSource({
  format: new MVT({ featureClass: Feature }),
  url: '/layers/public-ways/{z}/{x}/{y}.mvt'
});

sources.nodes = new VectorTileSource({
  format: new MVT({ featureClass: Feature }),
  url: '/layers/public-ways_vertices_pgr/{z}/{x}/{y}.mvt'
});

sources.nyccsl = new VectorTileSource({
  format: new MVT({ featureClass: Feature }),
  url: '/layers/public-nyccsl/{z}/{x}/{y}.mvt',
  attributions:
    'Street centerlines by NYC OTI via <a href="https://data.cityofnewyork.us/City-Government/NYC-Street-Centerline-CSCL-/exjm-f27b">NYC OpenData</a>'
});

sources.nyccsl_nodes = new VectorTileSource({
  format: new MVT({ featureClass: Feature }),
  url: '/layers/nyccsl_topo-node/{z}/{x}/{y}.mvt'
});

sources.nyccsl_edges = new VectorTileSource({
  format: new MVT({ featureClass: Feature }),
  url: '/layers/nyccsl_topo-edge_data/{z}/{x}/{y}.mvt',
  attributions:
    'Street centerlines by NYC OTI via <a href="https://data.cityofnewyork.us/City-Government/NYC-Street-Centerline-CSCL-/exjm-f27b">NYC OpenData</a>'
});

sources.stamenTerrain = new XYZ({
  url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
  attributions: `Base map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.`
});

//Define vector tile layer styles

const default_linestyle = new Style({
  stroke: new Stroke({
    color: 'green',
    width: 3
  })
});

const selected_linestyle = new Style({
  stroke: new Stroke({
    color: 'yellow',
    width: 4
  })
});

const default_nodestyle = new Style({
  image: new Circle({
    stroke: new Stroke({
      color: 'grey',
      width: 0.25
    }),
    fill: new Fill({
      color: 'blue'
    }),
    radius: 3
  })
});

const selected_nodestyle = new Style({
  image: new Circle({
    stroke: new Stroke({
      color: 'grey',
      width: 1
    }),
    fill: new Fill({
      color: 'yellow'
    }),
    radius: 3
  })
});

styles.edges = default_linestyle;

styles.nodes = default_nodestyle;

styles.nyccsl = default_linestyle;

styles.selectedLine = selected_linestyle;

styles.selectedNode = selected_nodestyle;

styles.loadedLine = new Style({
  stroke: new Stroke({
    color: 'purple',
    width: 4
  })
});

const MapLayers = () => {
  const map = useSelector((state: RootState) => state.mapSlice.map);

  layers.customGroups = (
    <ModVectorLayer
      map={map}
      key={layerIdGen()}
      layerId={layerIdGen()}
      modLayerInd={true}
      source={sources.geojsonHolder}
      style={styles.loadedLine}
      options={{ title: 'User Feature Groups' }}
    />
  );

  layers.edges = (
    <VectorTileLayer
      map={map}
      key={layerIdGen()}
      layerId={layerIdGen()}
      /**@todo As elsewhere, refactor LayerProps to distinguish between modifiable and unmodifiable layers */
      //@ts-ignore
      source={sources.edges}
      style={styles.edges}
      options={{ minZoom: 14, visible: false, title: 'OSM Routes' }}
    />
  );
  layers.nodes = (
    <VectorTileLayer
      map={map}
      key={layerIdGen()}
      layerId={layerIdGen()}
      //@ts-ignore
      source={sources.nodes}
      style={styles.nodes}
      options={{ minZoom: 14, visible: false, title: 'OSM Nodes' }}
    />
  );

  layers.nyccsl_edges = (
    <VectorTileLayer
      map={map}
      key={layerIdGen()}
      layerId={layerIdGen()}
      idField="edge_id"
      sourceTableId="TOPO_EDGES"
      //@ts-ignore
      source={sources.nyccsl_edges}
      style={styles.nyccsl}
      options={{ minZoom: 14, title: 'Street Centerlines' }}
    />
  );

  layers.nyccsl_nodes = (
    <VectorTileLayer
      map={map}
      key={layerIdGen()}
      layerId={layerIdGen()}
      idField="node_id"
      sourceTableId="TOPO_NODES"
      //@ts-ignore
      source={sources.nyccsl_nodes}
      style={styles.nodes}
      options={{
        minZoom: 14,
        title: 'Street Centerline Nodes'
      }}
    />
  );

  layers.stamenTerrain = (
    <TileLayer
      map={map}
      key={layerIdGen()}
      layerId={layerIdGen()}
      source={sources.stamenTerrain}
      options={{ title: 'Stamen Terrain', type: 'base' }}
    />
  );

  groups.basemaps = [layers.stamenTerrain];

  //Taking out excess feature layers for tentative deployment
  //groups.featureLayers = [layers.nyccsl, layers.edges, layers.nodes];
  groups.featureLayers = [layers.nyccsl_edges, layers.nyccsl_nodes];

  const theseLayers = [
    ...groups.basemaps,
    ...groups.featureLayers,
    layers.customGroups
  ];

  return <>{theseLayers}</>;
};

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

//FIXME: Layers are not associated with layer groups on the map
//Have tried passing down a callback function to add layers, but
//no success yet. Removing layerGroup for now, but may add upon repair

export { MapLayers as default, styles, groups, layers, sources };
