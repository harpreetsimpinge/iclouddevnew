'use strict';

// Edit Article controller
angular.module('articles').controller('EditArticle',['$scope', '$location', 'Articles','$http', 'Authentication','toastr',
  function($scope, $location, Articles, $http, Authentication,toastr){ 
    $scope.article = $scope.ngDialogData.article;
    $scope.fields = $scope.ngDialogData.fields;
    $scope.cats = $scope.ngDialogData.cats;
    console.log($scope.article);
      //split the data for reqired and non-required fields
      /*
    $scope.splitFields = function(){
      $scope.requiredFileds = [];
      $scope.allArticles = [];
      var obj = {};
      for(var k in $scope.fields){
        var found = false;
        for(var i in $scope.article){
          var currentFiedld;
          if(i === $scope.fields[k].key){
            if(i === "_id" || i === "user" || i === "__v" || i === "$$hashKey")
              continue; 
            currentFiedld = $scope.fields[k];
            found = true;
            obj = {
              key : i,
              value : article[i],
              type : currentFiedld.type,
              name : currentFiedld.name
            };           
              $scope.allArticles.push(obj);
          }  
        }
      }
        //console.log($scope.otherFileds);
        //console.log($scope.allArticles);
    };
    */
    $scope.onlyCategory = function(cat,item){
      return item.id.category !== cat;
    };

    $scope.sendEditArticle = function (isValid) {
      if(isValid){
        toastr.warning('Please fill up all fields');
        return false;
      }
      $http.put('/api/articles/'+$scope.article._id, $scope.article).
        then(function(response) {
          //$scope.article = response;
          console.log(response);
          toastr.success('Claimant Saved');
        }, function(response) {
          console.log("no");
          toastr.error('Error Saving');
        }
      );
    };

    $scope.addNote = function(isValid){
      //console.log("add note");
      /*if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');
        return false;
      }*/
      $scope.error = null;
      var note = new Articles({
        date    : $scope.newNote.date,
        article : $scope.article._id,
        content : $scope.newNote.text,
        type    : $scope.newNote.type,
        title   : $scope.newNote.title,
        _case   : $scope.ngDialogData.article._id
      });
      $http.post('/api/articles/note', note).
        then(function(response) {
          console.log(response);
          toastr.success('New note Saved');
          $scope.notes.push(response.data);
        }, function(response) {
          $scope.data = response.data || "Request failed";
          toastr.success('Error adding new note');
        }
        ); 
    };

    $scope.getNotes = function () {
      $http.get('/api/articles/note/'+$scope.article._id).
        then(function(response) {
           $scope.notes = response.data;
        }, function(response) {
          $scope.data = response.data || "Request failed";
        }
        );  
    };

    $scope.deleteNote = function(note){
      $http.delete('/api/articles/note/'+note).
        then(function(response) {
           if(response.statusText === "OK")
             toastr.warning('Note deleted');
             $('#'+note).fadeOut(300, function(){ $(this).remove();});

        }, function(response) {
          $scope.data = response.data || "Request failed";
          console.log($scope.todayNotes);
        }
      );  
  };

  // Update existing Article
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      var article = $scope.article;
      console.log(article);

      article.$update(function () {
        $location.path('articles/' + article._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    //function to run for the page
    $scope.getNotes();
    $scope.splitFields();
}]);