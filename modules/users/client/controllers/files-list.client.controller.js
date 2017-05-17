'use strict';

angular.module('exports').controller('filelist', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator','toastr','ngDialog','$filter','FileUploader',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator, toastr, ngDialog, $filter, FileUploader) {
    $scope.authentication = Authentication;

    var itemPerPage = 15;
    var realType = "";
    var list = [];
    var fileAction;
    var uploadType = {};
    $scope.k;
    $scope.uploadApiUrl;
    $scope.uploadTitle = "Title";
    $scope.uploadText = "Description";
    $scope.n = [0,0,0];
    
    $scope.getFiles = function(close){
      $scope.files = [];
      $scope.types = ['case','general','library'];
      $scope.pageLength = [];
      $scope.allFiles = [];
      $scope.search = [false,false,false,false];
      $scope.searchFiles = [];
      $scope.sortReverse = [];
      $scope.sortType = [];
      $scope.uploadText;
      list = [];
      list[0] = [];
      list[1] = [];
      list[2] = [];
      console.log(list);
      if(close === undefined)
        close = true;
        $http.get('/api/dropdpc/getforuser/'+close).
          then(function(response) {
            
            for(var k in response.data){
              var inter = response.data[k].type;
              for(var i in inter){
                if(inter[i] === 'case' || inter[i] === 'library' || inter[i] === 'general'){
                  /*
                  if(!list.hasOwnProperty(inter[i])){
                    list[inter[i]] = [];
                  }*/
                  var j = -1;
                  if(inter[i] === 'case')
                    j = 0;
                  if(inter[i] === 'general')
                    j = 1;
                  if(inter[i] === 'library')
                    j = 2;
                  console.log(j);
                  list[j].push(response.data[k]);
                }
              }
            }
            var i = 0;
            for(var k in list){
              $scope.files.push(list[k]);
              $scope.pageLength[i] =  Math.ceil(list[k].length / 10);
              i++;
            }
            //$scope.allFiles = $scope.files;
            angular.copy( $scope.files, $scope.allFiles);
            console.log($scope.allFiles);
            for(var i = 0 ; i < $scope.types.length ; i++)
              $scope.searchAndDisplay("",i);
            
            console.log($scope.allFiles);
            
          }, function(response) {
            toastr.error('Error Loading files');
          }
        );
    };
    
    $scope.fileFilter = function(type) {
      return function(item) {
        if(!item.hasOwnProperty(type))
          return false;
        if(type === "general"){
          if(item.type.length === 1)
            return true;
          else
            return false;
        }
        return item.type.indexOf(type) === -1;
      };
    };
    
    $scope.searchAndDisplay = function(value, k){
      if(value === undefined || value === ""){
        $scope.search[k] = false;
        $scope.orderDropdoc(k);
        return;
      }
      $scope.search[k] = true;
      $scope.searchFiles[k] = $filter('filter')($scope.allFiles[k], value);
      $scope.orderDropdoc(k);
    };
    
    $scope.seize =  function(n , k){
      $scope.n[k] = n;
      console.log(n, k);
      var lowEnd = n*itemPerPage;
      var highEnd = n*itemPerPage + itemPerPage;
      var arr = [];
      var bigArray = [];
      if($scope.search[k] === true){
          bigArray = $scope.searchFiles[k];
        } else {
          bigArray = $scope.allFiles[k];
      }
      $scope.pageLength[k] = Math.ceil(bigArray.length/itemPerPage);
      for(var i = lowEnd ; i < highEnd ; i++){ 
        if(bigArray[i] !== undefined){
          arr.push(bigArray[i]);
        }
      }
      $scope.files[k] = arr;
    };
   
    $scope.orderDropdoc = function(k, sortReverse, sortType){
      $scope.allFiles[k] = $filter('orderBy')($scope.allFiles[k], sortType, sortReverse);
      $scope.seize(0,k);
    };
    
    $scope.eidtNoteDialog = function(note, articleId){
        $scope.editNote = note;
        $scope.editArticleId = articleId;
        $scope.dialog3 = ngDialog.open({
          template: 'editNoteTemplate',
          scope: $scope
        });
      };
      
    $scope.uploader = new FileUploader({
      url: $scope.uploadApiUrl,
      alias: 'uploadFile'
    });

    $scope.uploader.onAfterAddingFile = function() {
      if(fileAction !== "newLibraryFile"){
        $scope.loadFile = true;
        $scope.uploader.uploadAll();
      }
    };
    
    $scope.sendUpload = function(){
      uploadType.title = $scope.uploadTitle;
      uploadType.text = $scope.uploadText;
      $scope.uploader.formData = [uploadType];
      $scope.loadFile = true;
      console.log($scope.uploadTitle , $scope.uploadText);

      $scope.uploader.uploadAll();
    };

    $scope.changeUploadType = function(action, para, k){
      $scope.k = k;
      fileAction = action;
      uploadType.note = para.note;
      uploadType.followup = para.followup;
      uploadType.case = para.case;
      uploadType.id = para.id;
      uploadType.type = para.type;
      uploadType.title = $scope.uploadTitle;
      uploadType.text = $scope.uploadText;
      
      if(fileAction === 'newFileNote'){
        $scope.uploader.url = "/api/dropdpc/uploadfile";
      } else if(action === 'modifyFile'){
        $scope.uploader.url = "/api/dropdpc/modifyfile";
      } else if(action === 'newEmailAttachment'){
        $scope.uploader.url = "/api/dropdpc/uploadfile";
      } else if(fileAction === "newLibraryFile"){
        $scope.uploader.url = "/api/dropdpc/uploadfile";  
      } else if(fileAction === "addFileNote"){
        $scope.uploader.url = "/api/dropdpc/uploadfile";  
      } else{
        toastr.error('Error in file upload');
      }
      $scope.uploader.formData = [uploadType];
    };

    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
      console.log(response);
      $scope.loadFile = false;
      if(status === 200){
        toastr.success('File upload success');
        if(fileAction === "modifyFile"){
          console.log("modifyFile");
          for(var k in $scope.files[$scope.k]){
            if($scope.files[$scope.k][k]._id === response._id){
              $scope.files[$scope.k].splice(k,1);
              $scope.files[$scope.k].push(response);
              $scope.allFiles[$scope.k].push(response);
            }
          }
        } else if(fileAction === "newEmailAttachment"){
         $scope.note.files.push({originalName: response.originalName, url: response.Location });
         $scope.files.push(response);
        } else if(fileAction === "newCaseFile"){
          $scope.files.push(response);
          $scope.allFiles.push(response);
          $scope.searchAndDisplay("");
        } else if(fileAction === "addFileNote"){
          $scope.editNote.files.push(response);
        } else if(fileAction === 'newLibraryFile'){
          $scope.allFiles[2].push(response);
          $scope.searchAndDisplay("", 2);
        }
        $scope.uploader.clearQueue();
        $scope.uploadTitle = "";
        $scope.uploadText = "";
        $scope.loadSuccess = true;
      }
      else
        toastr.warning('Error file upload');
    };
    
    $scope.updateNote = function(i){
      $http.post('/api/notes', $scope.editNote).
        then(function(response) {
          toastr.success('Success Updating Note');
        }, function(response) {
          $scope.data = response.data || "Request failed";
          toastr.error('Error update ');
        }
        ); 
    };
    
    $scope.dropdocPrev = function(k){
        console.log("prev", $scope.n[k]);
        if($scope.n[k] < 1)
          return;
        $scope.seize($scope.n[k]-1 , k);
      };
      
    $scope.dropdocNext = function(k){
      console.log(k);
      if($scope.n[k] > $scope.pageLength[k])
        return;
      $scope.seize($scope.n[k]+1, k);
    };
      
    $scope.getFiles();
  
  }
]);
