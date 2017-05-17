'use strict';

// Articles controller
angular.module('exports').controller('DoplicatesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles','$http','$filter', 
  function ($scope, $stateParams, $location, Authentication, Articles, $http, $filter) {
    $scope.list = [];
    $scope.load = false;
    
    $scope.changeStatus = function(){
       $http.get('/api/exports/finddoplicates/0/8000').
        then(function(response) {
          for(var k in response.data){
            var last = [];
            for(var i in response.data[k]){
              last.push(response.data[k][i]);
            }
            $scope.list.push(last);
          }
          $scope.load = true;
        },function(response) {

        }); 
    };
    $scope.changeStatus();

    function addDup(list){

    }
    
    $scope.delete = function(item){
      $http.delete('/api/articles/'+item._id).
        then(function(response) {
          
          
        },function(response) {

        }); 
    };
    
  }]);
