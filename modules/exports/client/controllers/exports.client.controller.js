'use strict';

// Articles controller
angular.module('exports').controller('ExportsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles','$http','$filter','toastr',
  function ($scope, $stateParams, $location, Authentication, Articles, $http, $filter, toastr) {
  $scope.spinner = false;
  $scope.smartList = [];
  $scope.cats = [];
  
    $scope.csv = function(note){
      $scope.spinner = true;
      $http.get('/api/exports/contacttocsv').
        then(function(response) {
          $scope.spinner = false;
          console.log(response);
          var blob = new Blob([response.data], { type: "application/CSV"});
          var fileName = "test.csv";
          saveAs(blob, fileName);
        }, function(response) {

        }
        );  
    };
    
    $scope.getFields = function(){
      $http.get('/api/fields/all-fields').
        then(function(response) {
          //console.log(response.data);
          $scope.fields  = response.data;
          $scope.requiredFileds = [];
          $scope.otherFileds = [];
          
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
        }
        
        ); 
    };
    $scope.getFields();
    
    $scope.addLineToSmartSearch = function(){
      //console.log($scope.smartSearch.currentField);
      /*if($scope.smartSearch.currentField === undefined){
        toastr.warning("Please select searching field");
        return;
      }*/    
      if($scope.smartSearch.option === "" || !$scope.smartSearch.option){
        toastr.warning("Please select searching option");
        return;
      }
      
      if($scope.smartSearch.currentField === "" || !$scope.smartSearch.currentField){
        toastr.warning("Please select field");
        return;
      }
      if($scope.smartSearch.option === "no"){
        
      } else if($scope.smartSearch.input === "" || !$scope.smartSearch.input){
        toastr.warning("Please insert a date/text");
        return;
      }
      $scope.smartList.push({
        "type"  : $scope.smartSearch.currentField.type,
        "field" : $scope.smartSearch.currentField.key,
        "link"  : $scope.smartSearch.link,
        "option": $scope.smartSearch.option,
        "text"  : $scope.smartSearch.input,
        "fieldName"  : $scope.smartSearch.currentField.name,
        "endingDate" : $scope.smartSearch.endingDate
      });
      $scope.smartSearch.field = "";
      $scope.smartSearch.option = "";
      $scope.smartSearch.currentField = "";
      $scope.smartSearch.input = "";
      console.log($scope.smartList);
      
    };
    
    $scope.removeFromSmartList = function(index){
      console.log(index);
      $scope.smartList.splice(index, 1);
    };
    
    $scope.doSmartSearch = function(){
      if($scope.smartList.length  < 1){
        toastr.warning("Please insert at list one searching row");
        return;
      }
      var found = false;
      for(var k in $scope.smartList){
        if($scope.smartList[k].field === "DateClosedFocusInformation" && $scope.smartList[k].option !== "no")
          found = true;
      }
      if(!found){
        $scope.smartList.push({
          "field"  : "closed",
          "text"  : $scope.closed
        });
      }
      $http.post('/api/exports/contacttocsv', $scope.smartList).
        then(function(response) {
          $scope.search = false;
          var blob = new Blob([response.data], { type: "application/CSV"});
          var fileName = "export.csv";
          saveAs(blob, fileName);
        }, function(response) {
          
          $scope.data = response.data || "Request failed";
        }
      ); 
    };
    
    $scope.doCalculate = function(){
      if($scope.smartList.length  < 1){
        toastr.warning("Please insert at list one searching row");
        return;
      }
      $scope.search = true;
      $scope.smartList.push({
        "field"  : "closed",
        "text"  : $scope.closed,
        "endingDate" : $scope.smartSearch.endingDate
      });
      $http.post('/api/exports/csvcaculator', $scope.smartList).
        then(function(response) {
          $scope.removeFromSmartList($scope.smartList.length-1);
          $scope.search = false;
          var blob = new Blob([response.data], { type: "application/CSV"});
          var fileName = "calculator.csv";
          saveAs(blob, fileName);
        }, function(response) {
          
          $scope.data = response.data || "Request failed";
        }
      ); 
    };
    
  }]);
