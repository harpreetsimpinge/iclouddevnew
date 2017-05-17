'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus','$timeout',
  function ($scope, $state, Authentication, Menus, $timeout) {
        
    $scope.showLoader = false;
    $scope.showSaved = false;
    $scope.showError = false;
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
    
    $scope.openMsg = function(type){
      $scope.showLoader = false;
      $scope.showSaved = false;
      $scope.showError = false;
      
      if(type === "err")
        $scope.showError = true;
      if(type === "saved")
        $scope.showSaved = true;
      
      $timeout(closeAll, 2000);
      
      function closeAll(){
        $scope.showLoader = false;
        $scope.showSaved = false;
        $scope.showError = false;
      }
    };
    $scope.loading = function(){
       $scope.showLoader =  ! $scope.showLoader;
    };
  }
]);
