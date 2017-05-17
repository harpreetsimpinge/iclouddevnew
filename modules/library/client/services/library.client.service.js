'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('library').factory('library', ['$resource',
  function ($resource) {
    return $resource('api/library/:libraryId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
