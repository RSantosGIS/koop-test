const github = require('@koopjs/provider-github')
const craigslist = require('koop-provider-craigslist')
const ogcProvider = require ('./provider-ogcapi-features')
const geoserverProvider = require('./provider-geoserver')

// list different types of plugins in order
const outputs = []
const auths = []
const caches = []
const plugins = [
  {
    instance: github
  },
  {
    instance: craigslist
  },
  {
    instance: ogcProvider
  },
  {
    instance: geoserverProvider
  }
]

module.exports = [...outputs, ...auths, ...caches, ...plugins]
