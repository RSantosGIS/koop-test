const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const config = require("config");
const arcgisParser = require("terraformer-arcgis-parser");
const toBbox = require("@turf/bbox");

const collections = new NodeCache();

// Public function to return data from the
// Return: GeoJSON FeatureCollection
//
// URL path parameters:
// req.params.host
// req.params.layer
function getData(req, callback) {
  const {
    params: { id }
  } = req;

  if (id) {
    getCollectionItems(req, callback);
  } else {
    callback(new Error("No collection ID is provided"));
  }
}

async function getCollectionItems(req, callback) {
  const {
    params: { host, id },
    query: { num }
  } = req;
  const hostConfig = config["provider-geoserver"].hosts[host];
  const maxFeatures = config["provider-geoserver"].hosts[host]['maxFeatures'];
  const version = config["provider-geoserver"].hosts[host]['version'];

  try {
    // construct the request URL
    const collectionId = id;
    const hostURL = hostConfig.url;
    const requestURL = new URL(`${hostURL}`);
    requestURL.searchParams.set("outputFormat", "application/json");
    requestURL.searchParams.set("typeNames", collectionId);
    requestURL.searchParams.set("service", "wfs");
    requestURL.searchParams.set("request", "GetFeature");
    requestURL.searchParams.set("version", version);

    //version specific parameters
    if (version ==='1.0.0') {
      requestURL.searchParams.set("maxFeatures", maxFeatures);
    } else if (version==='1.1.0' || version==='1.1.1') {
      requestURL.searchParams.set("maxFeatures", maxFeatures);
    } else {
      //default behavior is 2.0
      requestURL.searchParams.set("count", maxFeatures);
    }


    // get request result
    const result = await fetchJSON(requestURL.href);

    // construct geojson
    const idField = hostConfig.idField ? hostConfig.idField : "";
    const geojson = {
      type: "FeatureCollection",
      features: result.features,
      metadata: {
        name: collectionId,
        description: "",
        idField
      }
    };

    callback(null, geojson);
  } catch (error) {
    callback(error);
  }
}

async function fetchJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
}

function Model(koop) {}

Model.prototype.getData = getData;

module.exports = Model;
