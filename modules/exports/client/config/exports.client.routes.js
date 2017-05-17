'use strict';

// Setting up route
angular.module('exports').config(['$stateProvider',
  function ($stateProvider) {
    // Exports state routing
    $stateProvider
      .state('exports', {
        abstract: true,
        url: '/exports',
        template: '<ui-view/>'
      })
      .state('exports.list', {
        templateUrl: 'modules/exports/client/views/exports.client.view.html',
        url: '/'
      })
      .state('exports.create', {
        url: '/create',
        templateUrl: 'modules/exports/client/views/create-article.client.view.html',
        data: {
          roles: ['user', 'user2', 'admin1', 'admin2', 'admin']
        }
      })
      .state('exports.edit', {
        url: '/:articleId/edit',
        templateUrl: 'modules/exports/client/views/edit-article.client.view.html',
        data: {
          roles: ['user', 'user2', 'admin1', 'admin2', 'admin']
        }
      })
      .state('exports.diplicates', {
        url: '/duplicates',
        templateUrl: 'modules/exports/client/views/duplicates.client.view.html',
        data: {
          roles: ['admin1', 'admin2', 'admin']
        }
      });
  }
]);
