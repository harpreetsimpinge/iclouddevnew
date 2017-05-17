'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('calendar').factory('Calendar', ['$resource',
  function ($resource) {
    return $resource('api/calendar/:calendarId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
