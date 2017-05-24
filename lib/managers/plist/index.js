'use strict';

const plist = require('plist');
const assert = require('assert');

function buildPlist(product, compilation, url) {
  let urlAsset, metadata;

  assert(product, 'Missing product information');
  assert(product.name, 'Missing product name ');
  assert(compilation, 'Missing compilation information');
  assert(compilation.version, 'Missing compilation version');
  assert(url, 'Missing compilation url');

  urlAsset = {
    kind: 'software-package',
    url: url
  };

  metadata = {

    // TODO: Completar este campo
    'bundle-identifier': compilation.bundleId,
    'bundle-version': compilation.version,
    kind: 'software',
    title: product.name
  };

  return plist.build({
    items: [{
      assets: [urlAsset],
      metadata: metadata
    }]
  });

}

module.exports = { buildPlist };
