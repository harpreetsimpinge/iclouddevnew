'use strict';

// Articles controller
angular.module('template').controller('templatesListController', ['$scope', '$stateParams', '$location', 'Authentication','$http','ngDialog','$filter', '$compile','toastr','FileUploader',
  function ($scope, $stateParams, $location, Authentication, $http, ngDialog, $filter, $compile, toastr, FileUploader) {

  $scope.docs = [];
  $scope.getDocs = function(){
      $http.get('/api/templates').
        then(function(response) {
          $scope.docs = response.data;
          $scope.filteredItems = response.data;
          $scope.figureOutItemsToDisplay();
        },function(response) {
          
        }); 
  };
  $scope.getDocs();
  
  $scope.figureOutItemsToDisplay = function () {
    $scope.filteredItems = $filter('filter')($scope.docs, {
      $: $scope.search
    });
  };
  
  $scope.deleteDoc = function(doc){
      $http.delete('/api/templates/'+doc._id).
        then(function(response) {
          $scope.getDocs();
        },function(response) {
        }); 
    };
}]);
