'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

    $scope.roles = {
      'admin': 'Super Admin',
      // 'admin1': 'Admin1',
      'admin2': 'Admin1',
      'user': 'User1',
      'user2': 'User2'
    };    

    $scope.user.$promise.then(function(v){
      $scope.user.block = v.block.toString();
      $scope.user.valid = v.valid.toString();
      $scope.user.roles = v.roles[0];
    });

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;
      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.getRoleName = function (role) {
      return $scope.roles[role];
    }
  }
]);
