'use strict';

// Setting up route
angular.module('articles').config(['$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('articles', {
        abstract: true,
        url: '/articles',
        template: '<ui-view/>'
      })
      .state('articles.list', {
        templateUrl: 'modules/articles/client/views/list-articles.client.view.html',
        url: '/list',
        data: {
          roles: ['user', 'user2', 'admin2', 'admin']
        }
      })
      .state('articles.create', {
        url: '/create',
        templateUrl: 'modules/articles/client/views/create-article.client.view.html',
        data: {
          roles: ['admin1', 'admin2', 'admin']
        }
      })
      .state('articles.fields', {
        url: '/fields',
        templateUrl: 'modules/articles/client/views/edit-fields.client.view.html',
        data: {
          roles: [ 'admin1', 'admin2', 'admin']
        }
      })
      .state('articles.bulk', {
        url: '/bulk',
        templateUrl: 'modules/articles/client/views/bulk.client.view.html',
        data: {
          roles: [ 'admin1', 'admin2', 'admin']
        }
      });
  }
]);
