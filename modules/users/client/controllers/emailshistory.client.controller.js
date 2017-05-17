'use strict';

angular.module('exports').controller('emailshistory', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator','toastr','ngDialog','$filter','FileUploader',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator, toastr, ngDialog, $filter, FileUploader) {
    $scope.authentication = Authentication;
    $scope.emailAttachment = [];
    
    $scope.uploader = new FileUploader({
      url: '/api/dropdpc/uploadfile',
      alias: 'uploadFile'
    });
    
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
    };
    //#
    $scope.uploadFile = function () {
      $scope.loadFile = true;
      $scope.uploader.uploadAll();
    };
    
    $scope.uploader.onAfterAddingFile = function(fileItem) {
      $scope.uploader.formData = [];
      $scope.uploadFile();
    };
    //#
    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
      $scope.loadFile = false;
      if(status === 200){
        console.log(response);
        toastr.success('File upload success');
        $scope.emailAttachment.push({url:response.url, originalName: response.originalName});
        $scope.loadSuccess = true;
        $scope.loadFile = false;
      }
      else
        toastr.warning('Error file upload');
    };
    
    
    function getEmails(){
      $http.get('/api/exports/emailslist').
        then(function(response) {
          if(response.data.length === 0)
            toastr.warning("No Emails Found");
          else{
            for(var k in response.data){     
              response.data[k].cc.replace("/,/"," , ");
              console.log(response.data[k].cc);
            }
            $scope.emailsUnfilter = response.data;
            $scope.searchAndDisplay();
          }
        }, function(response) {
          
          $scope.data = response.data || "Request failed";
        }
      ); 
    }
    getEmails();
    
    $scope.sendEmail = function(){
      var sendNote = $scope.note;
      var att = "<br>---<br>Attached files<br>";
      for(var k in $scope.emailAttachment){
        att += "<a href='" + $scope.emailAttachment[k].url + "'>"+$scope.emailAttachment[k].originalName+"</a><br>";
      }
      
      if($scope.emailAttachment.length > 0)
        sendNote.content += att;
      $http.post('/api/exports/sendNoteByEmail', sendNote).
        then(function(response) {
          if(response.data.length === 0)
            toastr.warning("No Claimants Found");
          else
            toastr.success("Email Sent Successfully");
          
          $scope.articles = response.data;
        }, function(response) {
          
          $scope.data = response.data || "Request failed";
        }
      ); 
    };
    
    $scope.emailDialog = function(note){
      console.log(Authentication);
      $scope.note = note;
      var date = $filter('date')(note.date, "MM/dd/yyyy mm:HH");
      $scope.note.content = "<div style='font-family:Helvetica Neue;'><br>------<br><b>From: </b>" + Authentication.user.displayName + " < " + Authentication.user.email + " > <br>  <b>Subject:</b> " + note.title + " <br> <b>Date:</b> " + date + "<br> <b>To:</b> " + note.to + "<br> <b>cc: </b>" + note.cc + "<br><b>Content:</b> <br>" + note.content +"</div>";
      $scope.note.title = " Forwarded message: " + $scope.note.title;
      ngDialog.open({
        template: 'emailTemplate',
        scope: $scope
      });
    };
    
    $scope.printDiv = function(note) {
      var popupWin = window.open('', '_blank', 'width=500,height=500');
      var date = $filter('date')(note.date, "MM/dd/yyyy mm:HH"); 
      var content = "<br><div style=''><b>From:</b>"+ Authentication.user.displayName +" <br>  <b>Subject:</b>" + note.title +" </b> <br> <b>Date:</b> " + date + "<br> <b>To:</b> " + note.to + "<br> <b>cc: </b>" + note.cc + "<br> <b>bcc:</b> " + note.bcc + " <b>Content:</b> <br>" + note.content + "</div>";
      popupWin.document.open();
      popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + content + '</body></html>');
      popupWin.document.close();
    };
    
    $scope.searchAndDisplay = function () {
      $scope.emails = $scope.emailsUnfilter;
      $scope.emails = $filter('filter')($scope.emails, {
        $: $scope.search
      });
      console.log($scope.emails);
    };
    
    $scope.deleteEmail = function(i){
      console.log($scope.emails[i]);
      $http.delete('/api/exports/emailslist/' + $scope.emails[i]._id).
        then(function(response) {
         toastr.success("Email Deleted");
        }, function(response) {
        }
      ); 
    };
  
  }
]);
