'use strict';

// Articles controller
angular.module('library').controller('libraryController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles','$http','ngDialog','$filter', '$compile','toastr','FileUploader','$sce',
  function ($scope, $stateParams, $location, Authentication, Articles, $http, ngDialog, $filter, $compile, toastr, FileUploader, $sce) {
    var fileUrl;
    $scope.jobs = [];
    $scope.loadFile = false;
    $scope.loadSuccess = false;
    $scope.newJob = {};
    $scope.file = false;
    $scope.uploader = new FileUploader({
      url: 'api/jobs/file',
      alias: 'libraryFile',
      removeAfterUpload: true
    });
    //Cancel Upload
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
    };
    //#
    $scope.uploadFile = function () {
      $scope.loadFile = true;
      $scope.uploader.uploadAll();
    };
    //#
    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
      console.log(response);
      $scope.loadFile = false;
      if(status === 200){
        toastr.success('File upload success');
        fileUrl = response;
        $scope.file = response;
        $scope.newJob.file = response;
        $scope.loadSuccess = false;
        $scope.loadFile = false;
      }
      else
        toastr.warning('Error file upload');
    };
    //#
    //End Upload Section
    //#
    $scope.getJobs = function(){
      $http.get('/api/jobs').
        then(function(response) {
          $scope.allJobs = response.data;
          $scope.searchAndDisplay();
        }
      );  
    };
    $scope.getJobs();
    
    $scope.addJob = function(){
      console.log($scope.newJob);
      if($scope.newJob.title === "" || $scope.newJob.descritpion === ""){
        toastr.warning('Please fill all fields');
        return;
      }
      $http.post('/api/jobs', $scope.newJob).
        then(function(response) {
          $scope.file = false;
          toastr.success('Job add success');
          $scope.newJob = "";
          $scope.jobs.push(response.data);
        }
      );  
    };
    
    $scope.deleteJob = function(job){
      console.log(job._id);
      $http.delete('/api/jobs/'+job._id).
        then(function(response) {
          if(response.statusText === "OK"){
            for(var k in $scope.jobs){
               if($scope.jobs[k]._id === job._id){
                 $scope.jobs.splice(k,1);
                 break;
               }
             }
          }
            
            toastr.warning('Job deleted');
        }, function(response) {
        }
        );  
    };
    
    $scope.searchAndDisplay = function () {
      $scope.jobs = $scope.allJobs;
      $scope.jobs = $filter('filter')($scope.allJobs, {
        $: $scope.search
      });
    };
    
    $scope.searchAndDisplay = function () {
      $scope.jobs = $scope.allJobs;
      $scope.jobs = $filter('filter')($scope.allJobs, {
        $: $scope.search
      });
    };
    
      $scope.showPdfDialog = function(url){
        console.log(url);
        var config = {
          headers:  {
            "X-Testing" : "testing",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Origin": "*",
            "responseType":'arraybuffer'
          },
          responseType:'arraybuffer'
        };
        $scope.loadingPdf = true;
        $http.get(url, config)
        .success(function (response) {
          $scope.loadingPdf = false;
          var file = new Blob([response], {type: 'application/pdf'});
          var fileURL = URL.createObjectURL(file);
          $scope.url = $sce.trustAsResourceUrl(fileURL);
        });

        $scope.dialog4 = ngDialog.open({
          template: 'PdfTemplate',
          scope: $scope
        });
      };
      
      $scope.checkIfPdf = function(name){
        return /\.(pdf|PDF)$/.test(name);
      };

}]);
