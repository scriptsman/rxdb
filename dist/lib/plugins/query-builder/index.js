"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runBuildingStep = runBuildingStep;
exports.applyBuildingStep = applyBuildingStep;
exports.RxDBQueryBuilderPlugin = void 0;

var _nosqlQueryBuilder = require("./mquery/nosql-query-builder");

var _rxQuery = require("../../rx-query");

var _util = require("../../util");

// if the query-builder plugin is used, we have to save it's last path
var RXQUERY_OTHER_FLAG = 'queryBuilderPath';

function runBuildingStep(rxQuery, functionName, value) {
  var queryBuilder = (0, _nosqlQueryBuilder.createQueryBuilder)((0, _util.clone)(rxQuery.mangoQuery));

  if (rxQuery.other[RXQUERY_OTHER_FLAG]) {
    queryBuilder._path = rxQuery.other[RXQUERY_OTHER_FLAG];
  }

  queryBuilder[functionName](value); // run

  var queryBuilderJson = queryBuilder.toJSON();
  var newQuery = new _rxQuery.RxQueryBase(rxQuery.op, queryBuilderJson.query, rxQuery.collection);

  if (queryBuilderJson.path) {
    newQuery.other[RXQUERY_OTHER_FLAG] = queryBuilderJson.path;
  }

  var tunneled = (0, _rxQuery.tunnelQueryCache)(newQuery);
  return tunneled;
}

function applyBuildingStep(proto, functionName) {
  proto[functionName] = function (value) {
    return runBuildingStep(this, functionName, value);
  };
}

var RxDBQueryBuilderPlugin = {
  rxdb: true,
  prototypes: {
    RxQuery: function RxQuery(proto) {
      ['where', 'equals', 'eq', 'or', 'nor', 'and', 'mod', 'exists', 'elemMatch', 'sort'].forEach(function (attribute) {
        applyBuildingStep(proto, attribute);
      });

      _nosqlQueryBuilder.OTHER_MANGO_ATTRIBUTES.forEach(function (attribute) {
        applyBuildingStep(proto, attribute);
      });

      _nosqlQueryBuilder.OTHER_MANGO_OPERATORS.forEach(function (operator) {
        applyBuildingStep(proto, operator);
      });
    }
  }
};
exports.RxDBQueryBuilderPlugin = RxDBQueryBuilderPlugin;

//# sourceMappingURL=index.js.map