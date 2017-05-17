'use strict';

// Setting up route
angular.module('calendar').config(['$stateProvider',
  function ($stateProvider) {
    // Calendar state routing
    $stateProvider
      .state('calendar', {
        abstract: true,
        url: '/calendar',
        template: '<ui-view/>'
      })
      .state('calendar.list', {
        templateUrl: 'modules/calendar/client/views/calendar.client.view.html',
        url: '/',
        data: {
          roles: ['user', 'user2', 'admin2', 'admin']
        }
      });
  }
]);
