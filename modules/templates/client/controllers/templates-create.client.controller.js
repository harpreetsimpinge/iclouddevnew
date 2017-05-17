'use strict';

// Articles controller
angular.module('template').controller('templatesCreateController', ['$scope', '$stateParams', '$location', 'Authentication','$http','ngDialog','$filter', '$compile','toastr',
  function ($scope, $stateParams, $location, Authentication, $http, ngDialog, $filter, $compile, toastr) {
    //new Clipboard('.copypaste');
    
    
    $scope.getDoc = function(){
      $http.get('/api/templates/'+$stateParams.docId).
        then(function(response) {
          $scope.doc = response.data[0];
        },function(response) {
          
          
        }); 
    }; 
    if($stateParams.docId){
      $scope.getDoc();
    }
    
    $scope.getFields = function(){
      $http.get('/api/fields/all-fields').
        then(function(response) {
          //console.log(response.data);
          $scope.fields  = response.data;
          $scope.requiredFileds = [];
          $scope.otherFileds = [];
          $scope.cats = [];
          for(var k in $scope.fields){
            if(k === "_id" || k === "user")
              continue;
            if($scope.fields[k].category === "Contact"){
              $scope.requiredFileds.push($scope.fields[k]);
            }
            else
              $scope.otherFileds.push($scope.fields[k]);
          }
          
          for(var j in response.data){
             var found = false;
             for(var i in $scope.cats){
               if($scope.cats[i] === response.data[j].category)
                 found = true;
             }
             if(found === false)
               $scope.cats.push(response.data[j].category);
           }

          
        }, function(response) {
          $scope.data = response.data || "Request failed";
        }); 

    };
    $scope.getFields();
    
    $scope.createDoc = function(){
      $http.post('/api/templates', $scope.doc).
        then(function(response) {
          $scope.doc = response.data;
        },function(response) {
        }); 
    };
    
    $scope.updateDoc = function(){
      $http.put('/api/templates', $scope.doc).
        then(function(response) {
          $scope.doc = response.data;
        },function(response) {
        }); 
    };
    
    $scope.deleteDoc = function(doc){
      $http.delete('/api/templates/'+$scope.doc._id).
        then(function(response) {
          $scope.getDocs();
        },function(response) {
        }); 
    };
    
   
    
}]);
