'use strict';

// Setting up route
angular.module('template').config(['$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('templates', {
        abstract: true,
        url: '/templates',
        template: '<ui-view/>'
      })
      .state('templates.list', {
        templateUrl: 'modules/templates/client/views/templates-list.client.view.html',
        url: '/list'
      })
      .state('templates.create', {
        url: '/create',
        templateUrl: 'modules/templates/client/views/templates-create.client.view.html',
        data: {
          roles: ['user', 'user2', 'admin2', 'admin']
        }
      })
      .state('templates.edit', {
        url: '/edit/:docId',
        templateUrl: 'modules/templates/client/views/templates-create.client.view.html',
        //controller: 'templatesCreateController',
        /*resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              docId: $stateParams.docId
            });
          }]
        }*/
      });
  }
]);
