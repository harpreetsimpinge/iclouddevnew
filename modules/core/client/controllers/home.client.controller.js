'use strict';

angular.module('core').controller('HomeController', ['$scope', '$location', 'Authentication',
  function($scope, $location, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    console.log($scope.authentication);
    if ($scope.authentication.user === "")
      $location.path('/');
    else if ($scope.authentication.user.roles.indexOf('admin1') === -1)
      $location.path('/articles/list');
    else
      $location.path('/articles/create');
  }
]);
