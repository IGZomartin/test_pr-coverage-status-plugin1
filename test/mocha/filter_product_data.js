'use strict';
let _ = require('lodash');

function getCompilationIds(productsArray) {
  return _.pluck(_.flatten(_.pluck(productsArray, 'compilations')), '_id');
}

function getCompilationIdsWithFilter(productsArray, compilationFilter) {
  return _.pluck(_.where(_.flatten(_.pluck(productsArray, 'compilations')), compilationFilter), '_id');
}

function getCompilationItems(productsArray, itemKey) {
  return _.pluck(_.flatten(_.pluck(productsArray, 'compilations')), itemKey);
}

function getCompilationItemsWithFilter(productsArray, compilationFilter, itemKey) {
  return _.pluck(_.where(_.flatten(_.pluck(productsArray, 'compilations')), compilationFilter), itemKey);
}

function getProductIds(productsArray) {
  return _.map(productsArray, function(item) {
    return item._id.toString();
  });

}

module.exports = {
  getCompilationIds: getCompilationIds,
  getCompilationIdsWithFilter: getCompilationIdsWithFilter,
  getProductIds: getProductIds,
  getCompilationItems: getCompilationItems,
  getCompilationItemsWithFilter: getCompilationItemsWithFilter
};
