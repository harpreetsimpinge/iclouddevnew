'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('template').factory('template', ['$resource',
  function ($resource) {
    return $resource('api/template/:templateId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
