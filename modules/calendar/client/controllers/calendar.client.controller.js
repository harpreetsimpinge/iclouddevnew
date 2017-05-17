'use strict';

// Articles controller
angular.module('calendar').controller('CalendarController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles','$http','ngDialog','uiCalendarConfig','$filter', '$compile','toastr','FileUploader',
  function ($scope, $stateParams, $location, Authentication, Articles, $http, ngDialog, uiCalendarConfig, $filter, $compile, toastr, FileUploader) {
    $scope.authentication = Authentication;
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    var fileName = "";
    var countFollows = 0;
    $scope.datepicker = new Date(); 
    $scope.events = [];
    $scope.eventSources = [$scope.events];
    $scope.emailAttachment = [];
    $scope.followup = [];
    
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
      $scope.uploader.formData = [{case: $scope.note._case._id}];
      $scope.uploadFile();
    };
    //#
    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
      $scope.loadFile = false;
      if(status === 200){
        toastr.success('File upload success');
        $scope.emailAttachment.push({url:response.url, name: response.originalName});
        $scope.loadSuccess = true;
        $scope.loadFile = false;
      }
      else
        toastr.warning('Error file upload');
    };
    
    $scope.removeAttachment = function(i){
      $scope.emailAttachment.splice(i,1);
    };
    
    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
        console.log(date);
        $scope.currentFU = date.followup;
        $scope.sideArticleId = date.userId;
    };
    /* alert on Drop */
     $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
       $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
       console.log(event.start._d);
       console.log(event.id);
       var id = event.id;
       var date = event.start._d;
       $http.get('/api/notes/changedate/'+id+"/"+date).
        then(function(response) {
           var re = response.data;
           toastr.success("Date changed");
           console.log(re);
        }, function(response) {
          
        }
        ); 
       //*
       
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
       $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function(sources,source) {
      var canAdd = 0;
      angular.forEach(sources,function(value, key){
        if(sources[key] === source){
          sources.splice(key,1);
          canAdd = 1;
        }
      });
      if(canAdd === 0){
        sources.push(source);
      }
    };
    /* remove event */
    $scope.remove = function(index) {
      $scope.events.splice(index,1);
    };
    /* Change View */
    $scope.changeView = function(view,calendar) {
      uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
    };
    /* Change View */
    $scope.renderCalender = function(calendar) {
      if(uiCalendarConfig.calendars[calendar]){
        uiCalendarConfig.calendars[calendar].fullCalendar('render');
      }
    };
    
    $scope.uiConfig = {
      calendar:{
        height: 1000,
        editable: true,
        // header:{
        //   left: 'title',
        //   center: '',
        //   right: 'today prev,next'
        // },
        header:{
          left: 'month basicWeek basicDay',
          center: 'title',
          right: 'today prev,next'
        },
        eventClick: $scope.alertOnEventClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventRender: $scope.eventRender
      }
    };
     /* Render Tooltip */
     /*
    $scope.eventRender = function( event, element, view ) { 
        element.attr({'tooltip': event.title,
                     'tooltip-append-to-body': true});
        $compile(element)($scope);
    };*/
    /* config object */
    
    
    $scope.getNotesByDate = function () {
      var date;
      date = new Date($scope.datepicker);
      date.setHours(12,0,0,0);
      
      var show_date = $filter('date')(date, "EEE MMM dd y");
      $scope.todayNotes = [];
      $http.get('/api/articles/notesById/'+date).
        then(function(response) {
          toastr.info(response.data.length + " Note(s)"," Notes for " + show_date);
           //console.log(response.data);
           for(var k in response.data){
             //console.log(response.data[k].type);
             if(response.data[k].type === "meeting"){
               response.data[k].icon = "fa-users";
               response.data[k].class = "meetingNote";
             }
             if(response.data[k].type === "phone"){
               response.data[k].icon = "fa-phone";
               response.data[k].class = "phoneNote";
             }
             if(response.data[k].type === "email"){
               response.data[k].icon = "fa-envelope";
               response.data[k].class = "emailNote";
             }
             if(response.data[k].type === "other"){
               response.data[k].icon = "fa-asterisk";
               response.data[k].class = "otherNote";
             }
             if(response.data[k].type === "check"){
               response.data[k].icon = "fa-check";
               response.data[k].class = "checkingNote";
             }
             if(response.data[k].type === "closing"){
               response.data[k].icon = "fa-times-circle";
               response.data[k].class = "closingNote";
             }
             if(response.data[k].type === "employer"){
               response.data[k].icon = "fa-male";
               response.data[k].class = "employerNote";
             }
             if(response.data[k].type === "form"){
               response.data[k].icon = "fa-book";
               response.data[k].class = "formNote";
             }
             if(response.data[k].type === "physician"){
               response.data[k].icon = "fa-wheelchair";
               response.data[k].class = "physicianNote";
             }
           }
           $scope.allNotes = response.data;
           $scope.searchAndDisplay();
        }, function(response) {
          $scope.data = response.data || "Request failed";
        }
        );  
      };
    $scope.getNotesByDate();
    
    $scope.getNotes = function () {
      $http.get('/api/articles/noteByUser/').
        then(function(response) {
          $scope.events = [];
           for(var i = 0 ; i < response.data.length; i++){
             var ev = response.data[i];
             for(var k in response.data){
              if(ev.type === "meeting"){
                ev.class = "meetingNote";
              }
              if(ev.type === "phone"){
                ev.class = "phoneNote";
              }
              if(ev.type === "email"){
                ev.class = "emailNote";
              }
              if(ev.type === "other"){
                ev.class = "otherNote";
              }
              if(ev.type === "check"){
                ev.class = "checkingNote";
              }
            }
            /*
             $scope.events.push({
                title: ev.title,
               start: new Date(ev.date),
               className: ev.class
             });*/
           }      
           //$scope.eventSources = [$scope.events];
           //uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEvents');
           //uiCalendarConfig.calendars.myCalendar.fullCalendar('addEventSource', $scope.events);
        }, function(response) {
          $scope.data = response.data || "Request failed";
          //console.log(response);
        }
        );  
      };
    $scope.getNotes();
      
    $scope.getFollowUpByDate = function () {
      var date;
      date = new Date($scope.datepicker);
      date.setHours(12,0,0,0);

      $http.get('/api/notes/followupbydate/'+date).
        then(function(response) {
           $scope.followup = response.data;
           for(var k in $scope.followup){
             $scope.todayNotes.push({
              id: $scope.followup[k].id.id,
              article: up[k].id.article,
              class: "followupNote",
              content: $scope.followup[k].id.content,
              created: $scope.followup[k].id.created,
              creator: $scope.followup[k].id.creator,
              date: $scope.followup[k].date,
              followUp: $scope.followup[k].id.followUp,
              icon: "fa-certificate",
              title: "Follow Up for " + $scope.followup[k].id.title,
              type: $scope.followup[k].id.type,
              url: $scope.followup[k].url
             });
           }
        }, function(response) {
          $scope.data = response.data || "Request failed";
        }
        ); 
    };
    //$scope.getFollowUpByDate();
    
    $scope.getFollowUp = function () {
      $scope.events = [];
      $http.get('/api/notes/followuppagin/' + countFollows).
        then(function(response) {
          $scope.followup = $scope.followup.concat(response.data.items);
          if(response.data.more){
            countFollows++;
            $scope.getFollowUp();
          } else {
            $scope.followup = Angular.copy($scope.followup.concat(response.data.items));
            toastr.info($scope.events.length + " Follow up(s)"," Follow ups");
          }
          console.log(response.data);
          for(var k in $scope.followup){
            if($scope.followup[k].status ==='open'){
              if($scope.followup[k]._case !== null && $scope.followup[k].id !== null){
                  var Class = "followupNote";
                  if($scope.followup[k].assigned){
                    Class = "assignNote";
                  } else if($scope.followup[k].id.type === "priority"){
                    Class= "priorityNote"; 
                  } else if($scope.followup[k].id.type === "invoice"){
                    Class= "invoiceNote";
                  } else if($scope.followup[k].id.type === "newInfo"){
                    Class= "newInfoNote";
                  } else if(fourDays($scope.followup[k])){
                    Class= "delayNote";
                  }
                  
                  $scope.events.push({
                  title: $scope.followup[k]._case.FirstnameContact.value + " " + $scope.followup[k]._case.LastnameContact.value,
                  start: new Date($scope.followup[k].date),
                  className: Class,
                  id: $scope.followup[k]._id,
                  followup : $scope.followup[k],
                  userId: $scope.followup[k]._case._id
                });
              }
            }
          }
          uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEvents');
          uiCalendarConfig.calendars.myCalendar.fullCalendar('addEventSource', $scope.events);
        }, function(response) {
          $scope.data = response.data || "Request failed";
        }
        );
    };    
    
    $scope.deleteNote = function(note){
      $http.delete('/api/articles/note/'+note).
        then(function(response) {
          console.log(response);
          if(response.statusText === "OK")
            $('#'+note).fadeOut(300, function(){ $(this).remove();});
            toastr.warning('Note deleted');
        }, function(response) {
          $scope.data = response.data || "Request failed";
          console.log($scope.todayNotes);
        }
        );  
    };
    
    $scope.sendEmail = function(item){
      console.log(item);
      var att = "<br>---<br>Attached files<br>";
      for(var k in $scope.emailAttachment){
        att += "<a href='" + $scope.emailAttachment[k].url + "'>"+$scope.emailAttachment[k].originalName+"</a><br>";
      }
      var sendNote = angular.copy(item);
      
      if($scope.emailAttachment.length > 0)
        sendNote.content += att;
      delete sendNote._case;
      $http.post('/api/exports/sendNoteByEmail', sendNote).
        then(function(response) {
          if(response.status !== 200)
            toastr.warning("Erro sending email");
          else
            toastr.success("Email Sent Successfully");
        }
      ); 
    };
    
    $scope.emailDialog = function(note){
      $scope.emailAttachment = [];
      console.log(note);
      $scope.note = note;
      ngDialog.open({
        template: 'emailTemplate',
        scope: $scope
      });
    };
    
    $scope.searchAndDisplay = function () {
      $scope.todayNotes = $scope.allNotes;
      $scope.todayNotes = $filter('filter')($scope.allNotes, {
        $: $scope.search
      });
      console.log($scope.todayNotes);
    };
    
    $scope.changeStatus = function(id,place){
       $http.get('/api/notes/changestatus/'+id).
        then(function(response) {
          $scope.todayNotes[place].status = response.data.status;
        },function(response) {

        }); 
    };
    
    $scope.changeStatus2 = function(id){
       $http.get('/api/notes/changestatus/'+id).
        then(function(response) {
          $scope.currentFU.status = response.data.status;
        },function(response) {

        }); 
    };
    
    //$scope.getFollowUp();
    
    $scope.$on('$viewContentLoaded', function(){
    console.log("test");
  });
  
  $scope.printDiv = function(note) {
    var popupWin = window.open('', '_blank', 'width=500,height=500');
    var date = $filter('date')(note.date, "MM/dd/yyyy mm:HH");
    var content = "<br><div style=''><b>On:</b> " + date + "<br> <b>To:</b> " + note.to + "<br> <b>cc: </b>" + note.cc + "<br> <b>bcc:</b> " + note.bcc + "<br><b>Subject:</b>" + note.title +"<br> <b>Content:</b> <br>" + note.content + "</div>";
    popupWin.document.open();
    popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + content + '</body></html>');
    popupWin.document.close();
  };
  
  $scope.onFile = function(re){
    console.log(re.file);
    if(!re.file)
      return;
    $scope.note.files.push(re.file);
    $scope.emailAttachment.push(re.file);
  };
  
  $scope.changeSideId = function(id){
    $scope.sideArticleId = id;  
  };
  
  function fourDays(obj){
    if(!obj.date || !obj.originalDate)
      return false;
    var a = moment(obj.date);
    var b = moment(obj.originalDate);
    var diffDays = a.diff(b, 'days'); 
    if(diffDays > 3 )
      return true;
    return false;
  };
}]);