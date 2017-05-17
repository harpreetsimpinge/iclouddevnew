'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('exports').factory('Exports', ['$resource',
  function ($resource) {
    return $resource('api/exports/:exportsId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
