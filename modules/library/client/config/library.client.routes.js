'use strict';

// Setting up route
angular.module('library').config(['$stateProvider',
  function ($stateProvider) {
    // library state routing
    $stateProvider
      .state('library', {
        abstract: true,
        url: '/library',
        template: '<ui-view/>'
      })
      .state('library.list', {
        templateUrl: 'modules/library/client/views/library.client.view.html',
        url: '/',
        data: {
          roles: ['user2', 'admin2', 'admin']
        }
      });
  }
]);
