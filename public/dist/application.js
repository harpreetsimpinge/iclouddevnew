'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload']; //ngAnimate

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
  function ($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden');
        } else {
          $state.go('authentication.signin').then(function () {
            storePreviousState(toState, toParams);
          });
        }
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored 
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('articles');
 
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('calendar');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('exports');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('library');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('template');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core', 'ui.bootstrap']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

'use strict';
// Configuring the Articles module
angular.module('articles', ['ngDialog', 'ui.mask', 'ngMaterial', 'ngAnimate', 'ngAria', 'toastr', 'daterangepicker', 'angular.filter', 'ui.bootstrap', 'mdPickers', 'isteven-multi-select', 'textAngular', 'ngclipboard', 'froala'])
  .run(['Menus', function(Menus) {
    // Add the articles dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Claimants Management Center',
      state: 'articles',
      type: 'dropdown',
      roles: ['user', 'user2', 'admin1', 'admin2', 'admin']
    });


    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'articles', {
      title: 'Search',
      state: 'articles.list',
      roles: ['user', 'user2', 'admin2', 'admin']
    });

    Menus.addSubMenuItem('topbar', 'articles', {
      title: 'Bulk Edit',
      state: 'articles.bulk',
      roles: ['admin1', 'admin2', 'admin']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'articles', {
      title: 'Add New Claimants',
      state: 'articles.create',
      roles: ['admin1', 'admin2', 'admin']
    });

    // Add the edit fields
    Menus.addSubMenuItem('topbar', 'articles', {
      title: 'Edit Fields',
      state: 'articles.fields',
      roles: ['admin1', 'admin2', 'admin']
    });
  }]);

// add uiSwitch to module
angular.module('articles').service('fileUpload', ['$http', function($http) {
  this.uploadFileToUrl = function(data_, file, uploadUrl, cb) {
    var fd = new FormData();
    fd.append('file', file);
    fd.append('address', data_);

    $http.post(uploadUrl, fd, {
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined } //, 'enctype':'multipart/form-data'}
      })
      .success(function(data) {
        cb(data);
      })
      .error(function(err) {
        console.log(err);
      });
  };
}]);

angular.module('articles').value('froalaConfig', {
  toolbarInline: false,
  placeholderText: 'Enter Text Here'
});


angular.module('articles')
  .directive('myDraggable', ['$document', '$http', function($document, $http) {
    return {
      restrict: 'A',
      scope: {
        article: '=article'
      },
      templateUrl: '/modules/articles/client/views/side.client.view.html',
      link: function(scope, element, attr) {
        var startX = 0,
          startY = 0,
          x = 0,
          y = 0;
        //Fields();
        scope.cats = [];
        if (!scope.fields)
          getFields();
        scope.$watch('article', function(newValue, oldValue) {
          $http.get('/api/articles/' + newValue).
          then(function(response) {
            scope.article_sort = sortFields(response.data);
          });
        });


        function getFields() {
          $http.get('/api/fields/all-fields').
          then(function(response) {
              //console.log(response.data);
              scope.fields = response.data;
              scope.requiredFileds = [];
              scope.otherFileds = [];

              for (var k in scope.fields) {
                if (k === "_id" || k === "user")
                  continue;
                if (scope.fields[k].category === "Contact") {
                  scope.requiredFileds.push(scope.fields[k]);
                } else
                  scope.otherFileds.push(scope.fields[k]);
              }

              for (var j in response.data) {
                var found = false;
                for (var i in scope.cats) {
                  if (scope.cats[i] === response.data[j].category)
                    found = true;
                }
                if (found === false)
                  scope.cats.push(response.data[j].category);
              }


            }, function(response) {
              scope.data = response.data || "Request failed";
            }

          );
        };

        function sortFields(input) {
          var array = [];
          var other_arr = [];
          for (var objectKey in input) {
            if (objectKey !== undefined && angular.isObject(input[objectKey]) && objectKey !== "permissions" && objectKey !== "legacy")
              array.push(input[objectKey]);
            else
              other_arr.push(input[objectKey]);
          }

          array.sort(function(a, b) {
            //var aPos = parseInt(a.id.order);
            //var bPos = parseInt(b.id.order);
            if (a.id === null || b.id === null)
              return 0;
            return a.id.order - b.id.order;
          });
          return array;
        }
        element.css({
          position: 'relative',
          cursor: 'pointer',
        });

        element.on('mousedown', function(event) {
          // Prevent default dragging of selected content
          event.preventDefault();
          startX = event.pageX - x;
          startY = event.pageY - y;
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });

        function mousemove(event) {
          y = event.pageY - startY;
          x = event.pageX - startX;
          element.css({
            top: y + 'px',
            left: x + 'px'
          });
        }

        function mouseup() {
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        }
      }
    };
  }]);

angular.module('articles').service('fileUpload', ['$http', function($http) {
  this.uploadFileToUrl = function(data_, file, uploadUrl, cb) {
    var fd = new FormData();
    fd.append('file', file);
    fd.append('address', data_);

    $http.post(uploadUrl, fd, {
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined } //, 'enctype':'multipart/form-data'}
      })
      .success(function(data) {
        cb(data);
      })
      .error(function(err) {
        console.log(err);
      });
  };
}]);


angular.module('articles')
  .directive('addNote', ['$document', '$http', 'FileUploader', 'toastr', '$rootScope', function($document, $http, FileUploader, toastr, $rootScope) {
    return {
      restrict: 'A',
      scope: {
        article: '=article'
      },
      templateUrl: '/modules/articles/client/views/addNote.client.view.html',
      link: function(scope, element, attr) {
        var startX = 0,
          startY = 0,
          x = 0,
          y = 0;
        scope.cats = [];
        scope.newNote = {
          files: [],
          filesShow: [],
          date: new Date(),
          //followup: new Date(),
          RTWregpermFocusInformation: new Date(),
          RTWtransFocusInformation: new Date()
        };

        scope.froalaOptions = {
          toolbarButtons: ['undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'outdent', 'indent', 'clearFormatting', 'insertTable', 'html'],
          toolbarButtonsXS: ['undo', 'redo', '-', 'bold', 'italic', 'underline'],
          key: 'md1hkC-11ydbdmcE-13dvD1wzF-7=='
        };

        scope.$watch('article', function(newValue, oldValue) {
          console.log(newValue);
          $http.get('/api/articles/' + newValue).
          then(function(response) {
            scope.file = response.data;
          });
        });

        scope.uploader = new FileUploader({
          url: "/api/dropdpc/uploadfile",
          alias: 'uploadFile'
        });

        scope.uploader.onAfterAddingFile = function() {
          scope.loadFile = true;
          scope.uploader.uploadAll();
        };

        scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
          console.log(response);
          scope.loadFile = false;
          if (status === 200) {
            toastr.success('File upload success');
            scope.newNote.filesShow.push(response);
            scope.newNote.files.push(response._id);
            scope.loadSuccess = true;
          } else
            toastr.warning('Error file upload');
        };

        scope.getUsers = function() {
          $http.get('/api/users')
            .then(function(response) {
                scope.users = response.data;
                console.log(response);
              }, function(response) {}

            );
        };
        scope.getUsers();

        scope.onFileNote = function(re) {
          console.log(re.file);
          if (!re.file)
            return;
          scope.newNote.filesShow.push(re.file);
          scope.newNote.files.push(re.file._id);
        };

        scope.addNote = function(isValid) {
          //console.log("add note");
          /*if (!isValid) {
            scope.$broadcast('show-errors-check-validity', 'articleForm');
            return false;
          }*/
          scope.error = null;
          var date = new Date(scope.newNote.date);
          var followupdate = new Date(scope.newNote.followup);
          date.setUTCHours(12, 0, 0, 0);
          followupdate.setUTCHours(12, 0, 0, 0);
          var note = {
            date: date,
            article: scope.article._id,
            content: scope.newNote.text,
            type: scope.newNote.type,
            title: scope.newNote.title,
            _case: scope.file._id,
            files: scope.newNote.files,
            followUp: followupdate,
            assign: scope.newNote.assign
          };


          if (scope.loadFile) {
            toastr.warning('Uploading file...');
            return;
          }
          $http.post('/api/articles/note', note).
          then(function(response) {
            console.log(response);
            toastr.success('New note Saved');
            scope.newNote = {};
            scope.newNoteId = response.data.id;
            scope.uploader.clearQueue();
            scope.loadSuccess = false;
            scope.newNote.filesShow = [];
            scope.file = {};
            for (var k in response.data.files) {
              scope.files.push(response.data.files[k]);
            }
            if (note.type === "closing") {
              closeFile();
            }
          }, function(response) {
            scope.data = response.data || "Request failed";
            toastr.error('Error adding new note');
          });
        };

        element.css({
          position: 'relative',
          cursor: 'pointer',
          zIndex: 8888,
        });
        var myEl = angular.element(document.querySelector('#some-id'));
        myEl.on('mousedown', function(event) {
          // Prevent default dragging of selected content
          event.preventDefault();
          startX = event.pageX - x;
          startY = event.pageY - y;
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });

        function mousemove(event) {
          y = event.pageY - startY;
          x = event.pageX - startX;
          element.css({
            top: y + 'px',
            left: x + 'px'
          });
        }

        function mouseup() {
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        }
      }
    };
  }]);

'use strict';

// Setting up route
angular.module('articles').config(['$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('articles', {
        abstract: true,
        url: '/articles',
        template: '<ui-view/>'
      })
      .state('articles.list', {
        templateUrl: 'modules/articles/client/views/list-articles.client.view.html',
        url: '/list',
        data: {
          roles: ['user', 'user2', 'admin2', 'admin']
        }
      })
      .state('articles.create', {
        url: '/create',
        templateUrl: 'modules/articles/client/views/create-article.client.view.html',
        data: {
          roles: ['admin1', 'admin2', 'admin']
        }
      })
      .state('articles.fields', {
        url: '/fields',
        templateUrl: 'modules/articles/client/views/edit-fields.client.view.html',
        data: {
          roles: [ 'admin1', 'admin2', 'admin']
        }
      })
      .state('articles.bulk', {
        url: '/bulk',
        templateUrl: 'modules/articles/client/views/bulk.client.view.html',
        data: {
          roles: [ 'admin1', 'admin2', 'admin']
        }
      });
  }
]);

'use strict';

// Articles controller
angular.module('articles').controller('articleActionController', ['$scope', '$location', '$timeout', 'Articles', '$http', 'Authentication', 'FileUploader', 'toastr', '$filter', '$window', 'ngDialog', 'fileUpload', '$sce', '$rootScope',
  function($scope, $location, $timeout, Articles, $http, Authentication, FileUploader, toastr, $filter, $window, ngDialog, fileUpload, $sce, $rootScope) {
    $scope.article = $scope.ngDialogData.article;
    $scope.fields = $scope.ngDialogData.fields;
    $scope.cats = $scope.ngDialogData.cats;
    $scope.users = $scope.ngDialogData.users;
    $scope.loadFile = false;
    $scope.loadSuccess = false;
    $scope.editDoc = null;
    $scope.notes = [];
    $scope.authentication = Authentication;
    $scope.sortType = 'date';
    $scope.emailAttachment = [];
    $scope.newNote = {
      files: [],
      filesShow: [],
      date: new Date(),
      // followup: new Date()
    };
    $scope.editNote = {
      files: []
    };
    $scope.dropdoc = {
      perPage: 8,
      n: 0,
      search: false,
      sortType: 'date',
      sortReverse: true
    };
    $scope.allFiles = [];
    $scope.sortReverse = true; //for Notes
    $scope.date = new Date();
    $scope.calculator = {};
    $scope.isLegacy = false;
    $scope.loading = false;
    $scope.confirmLegacy = "";
    $scope.permissions = [];
    var fileAction = "";
    var uploadType = {};

    // $scope.article.RTWregpermFocusInformation = $scope.article.RTWregpermFocusInformation || {value: new Date()};
    // $scope.article.RTWtransFocusInformation = $scope.article.RTWtransFocusInformation || {value: new Date()};

    // if ($scope.users && $scope.users.length) {
    //   for (var i = 0, len = $scope.users.length; i < len; i++) {
    //     if ($scope.users[i].hasOwnProperty('ticked'))
    //       delete $scope.users[i].ticked;
    //   }
    // }
    // console.log('users', $scope.users);
    //
    $scope.froalaOptions = {
      toolbarButtons: ["bold","italic","underline","strikeThrough","fontSize","fontFamily","color",
        "|","formatBlock","blockStyle","align","insertOrderedList","insertUnorderedList","outdent","indent",
        "|","createLink","insertImage","insertVideo","insertHorizontalRule","undo","redo","html"],
      key: 'md1hkC-11ydbdmcE-13dvD1wzF-7=='
    };

    $scope.uploaderDoc = new FileUploader({
      url: '/api/exports/renderDoc/' + $scope.article._id,
      alias: 'docRender',
      responseType: 'buffer',
      removeAfterUpload: true
        //headers: {'responseType':'buffer'}
    });

    $scope.bAllowedToChangeInfo = false;
    if ($scope.authentication.user.roles.indexOf('admin2') !== -1 || $scope.authentication.user.roles.indexOf('admin') !== -1)
      $scope.bAllowedToChangeInfo = true;

    $scope.uploaderDoc.onSuccessItem = function(fileItem, response, status, headers) {
      console.log(response);
      //if(response._id){
      var blob = new Blob([response.base64], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      //saveAs(blob, "export.docx");
      // var Docxgen = $window.doc;

      var aTag = document.createElement('a');
      aTag.setAttribute('href', response.content);
      aTag.setAttribute('download', "template.docx");
      aTag.setAttribute('id', "docxtrigger");
      aTag.setAttribute('target', "_self");
      aTag.click();

      //var output = new Docxgen(response).getZip().generate({type: "blob"});
      //saveAs(output, "raw.docx");
      toastr.success('File Rendered');
      $scope.getFiles();
      // $scope.uploaderDoc.clearQueue();
      //document.getElementById('renderFile').value = "";
      //}

    };

    $scope.removeAttachment = function(i) {
      $scope.note.files.splice(i, 1);
      $scope.emailAttachment.splice(i, 1);
    };

    $scope.uploader = new FileUploader({
      url: $scope.uploadApiUrl,
      alias: 'uploadFile'
    });

    $scope.uploader.onAfterAddingFile = function() {
      $scope.loadFile = true;
      $scope.uploader.uploadAll();
    };

    $scope.changeUploadType = function(action, para) {
      fileAction = action;
      uploadType.note = para.note;
      uploadType.followup = para.followup;
      uploadType.case = para.case;
      uploadType.id = para.id;
      if (fileAction === 'newFileNote') {
        $scope.uploader.url = "/api/dropdpc/uploadfile";
      } else if (action === 'modifyFile') {
        $scope.uploader.url = "/api/dropdpc/modifyfile";
      } else if (action === 'newEmailAttachment') {
        $scope.uploader.url = "/api/dropdpc/uploadfile";
      } else if (fileAction === "newCaseFile") {
        $scope.uploader.url = "/api/dropdpc/uploadfile";
      } else if (action === 'editNote') {
        $scope.uploader.url = "/api/dropdpc/uploadfile";
      } else {
        toastr.error('Error in file upload');
      }
      $scope.uploader.formData = [uploadType];
    };

    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
      console.log(response);
      $scope.loadFile = false;
      if (status === 200) {

        toastr.success('File upload success');
        if (fileAction === "newFileNote") {
          $scope.newNote.filesShow.push(response);
          $scope.newNote.files.push(response._id);
          //$scope.files.push(response);
        } else if (fileAction === "modifyFile") {
          console.log("modifyFile");
          for (var k in $scope.files) {
            if ($scope.files[k]._id === response._id) {
              $scope.files.splice(k, 1);
              $scope.files.push(response);
              $scope.allFiles.push(response);
            }
          }
        } else if (fileAction === "newEmailAttachment") {
          $scope.note.files.push({ originalName: response.originalName, url: response.Location });
          $scope.files.push(response);
          $scope.emailAttachment.push(response);
        } else if (fileAction === "newCaseFile") {
          $scope.files.push(response);
          $scope.allFiles.push(response);
          $scope.searchAndDisplay("");
        } else if (fileAction === "editNote") {
          $scope.editNote.files.push(response);

        }

        $scope.loadSuccess = true;

        $scope.getFiles();
      } else
        toastr.warning('Error file upload');
    };

    $scope.cancelUpload = function() {
      $scope.uploader.clearQueue();
    };

    $scope.deleteFileDropdoc = function(id, i) {
      $http.delete('/api/dropdpc/deletefile/' + id)
        .then(function(response) {
          console.log(response);
          if (response.data !== "") {
            toastr.success("Delete File Suceess");
            $scope.files.splice(i, 1);
          } else
            toastr.error("Delete failed");
        }, function(response) {
          toastr.error('Error Deleting file');
        });
    };

    $scope.sendNoteByEmail = function(email, id) {
      toastr.info("Sending email...");
      console.log(email, id);
      $http.get('/api/exports/sendNoteByEmail/' + id + "/" + email)
        .then(function(response) {
          console.log(response);
          if (response.data === "ok")
            toastr.success("Email sent");
          else
            toastr.error("Sending failed");
        }, function(response) {
          toastr.error('Error sending email');
        });
    };

    $scope.getFiles = function() {
      $http.get('/api/dropdpc/getbyclaimant/' + $scope.article._id)
        .then(function(response) {
          $scope.files = response.data;
          $scope.allFiles = response.data;
          $scope.pageLength = Math.ceil(response.data.length / $scope.dropdoc.perPage);
          $scope.seize(0);
        }, function(response) {
          toastr.error('Error Loading files');
        });
    };

    $scope.splitFields = function() {
      $scope.allArticles = [];
      var obj = {};
      for (var k in $scope.fields) {
        var found = false;
        for (var i in $scope.article) {
          var currentFiedld;
          if (i === $scope.fields[k].key) {
            if (i === "_id" || i === "user" || i === "__v" || i === "$$hashKey")
              continue;
            currentFiedld = $scope.fields[k];
            found = true;
            obj = {
              key: i,
              value: article[i],
              type: currentFiedld.type,
              name: currentFiedld.name
            };
            $scope.allArticles.push(obj);
          }
        }
      }
      //console.log($scope.otherFileds);
      //console.log($scope.allArticles);
    };

    $scope.onlyCategory = function(cat, item) {
      return item.id.category !== cat;
    };

    $scope.sendEditArticle = function(isValid) {
      if (isValid) {
        //toastr.warning('Please fill up all fields');
        //return false;
      }

      $scope.article.permissions = angular.copy($scope.permissions);
      console.log("permissions: ", $scope.permissions);
      var send = angular.copy($scope.article);
      delete send.legacy;
      $http.put('/api/articles/' + $scope.article._id, send)
        .then(function(response) {
          //$scope.article = response;
          toastr.success('Claimant Saved');
        }, function(response) {
          toastr.error('Error Saving');
        });
    };

    $scope.permissionsChange = function(data) {
      if ($scope.permissions.length === 0) {
        $scope.permissions.push({
          _id: data._id,
          displayName: data.displayName
        });
        return;
      } else {
        for (var k in $scope.permissions) {
          if ($scope.permissions[k]._id === data._id) {
            $scope.permissions.splice(Number(k), 1);
            return;
          }
        }
        $scope.permissions.push({
          _id: data._id,
          displayName: data.displayName
        });
      }
    }

    $scope.addNote = function(isValid) {
      //console.log("add note");
      /*if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');
        return false;
      }*/
      $scope.error = null;
      var date = new Date($scope.newNote.date);
      var followupdate = new Date($scope.newNote.followup);
      date.setUTCHours(12, 0, 0, 0);
      followupdate.setUTCHours(12, 0, 0, 0);
      var note = new Articles({
        date: date,
        article: $scope.article._id,
        content: $scope.newNote.text,
        type: $scope.newNote.type,
        title: $scope.newNote.title,
        _case: $scope.ngDialogData.article._id,
        files: $scope.newNote.files,
        followUp: followupdate,
        assign: $scope.newNote.assign
      });


      if ($scope.loadFile) {
        toastr.warning('Uploading file...');
        return;
      }
      $http.post('/api/articles/note', note)
        .then(function(response) {
          $scope.sendEditArticle(true);
          console.log(response);
          toastr.success('New note Saved');
          $scope.notesUnfilter.push(response.data);
          $scope.newNote = { files: [] };
          $scope.newNoteId = response.data.id;
          $scope.uploader.clearQueue();
          $scope.loadSuccess = false;
          $scope.newNote.filesShow = [];
          $scope.searchAndDisplay();
          $scope.emailAttachment = [];
          for (var k in response.data.files) {
            $scope.files.push(response.data.files[k]);
          }
          if (note.type === "closing") {
            closeFile();
          }
        }, function(response) {
          $scope.data = response.data || "Request failed";
          toastr.error('Error adding new note');
        });
    };

    $scope.getNotes = function() {
      $http.get('/api/articles/note/' + $scope.article._id).
      then(function(response) {
        $scope.notesUnfilter = response.data;
        for (var k in response.data) {
          if (response.data[k].date !== null)
            response.data[k].date = new Date(response.data[k].date);

          if (response.data[k].followUp !== null)
            response.data[k].followup = new Date(response.data[k].followUp);
        }
        $scope.searchAndDisplay();
      }, function(response) {
        $scope.data = response.data || "Request failed";
      });
    };

    $scope.deleteNote = function(note) {
      if (!$scope.canEditNote(note)) return;

      note = note._id;

      $http.delete('/api/articles/note/' + note)
        .then(function(response) {
          if (response.statusText === "OK")
            toastr.warning('Note deleted');
          $('#' + note).fadeOut(300, function() { $(this).remove(); });

        }, function(response) {
          $scope.data = response.data || "Request failed";
        });
    };

    $scope.deleteFollowUp = function(note) {
      if (!$scope.canEditNote(note)) return;

      note = note._id;

      $http.delete('/api/notes/followup/' + note)
        .then(function(response) {
          if (response.statusText === "OK")
            toastr.warning('Note deleted');
          $('#' + note).fadeOut(300, function() { $(this).remove(); });

        }, function(response) {
          $scope.data = response.data || "Request failed";
        });
    };

    $scope.update = function(isValid) {
      $scope.error = null;
      /*
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }*/
      var article = $scope.article;
      article.permissions = $scope.permissions;
      article.
      console.log("per:   ", $scope.permissions);
      article.$update(function() {
        $location.path('articles/' + article._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.getFollowUp = function() {
      $http.get('/api/notes/followup/' + $scope.article._id)
        .then(function(response) {
            $scope.followup = response.data;
            for (var k in $scope.followup) {
              /*$scope.notes.push({
               _id: $scope.followup[k]._id,
               article: $scope.followup[k].id.article,
               class: "followupNote",
               content: $scope.followup[k].id.content,
               created: $scope.followup[k].id.created,
               creator: $scope.followup[k].id.creator,
               date: $scope.followup[k].date,
               followUp: $scope.followup[k].id.followUp,
               icon: "fa-certificate",
               title: "F.U " + $scope.followup[k].id.title,
               type: $scope.followup[k].id.type,
               url: $scope.followup[k].url,
               status: $scope.followup[k].status,
               id: $scope.followup[k].id
              });*/
            }
          }, function(response) {
            $scope.data = response.data || "Request failed";
          }

        );
    };

    $scope.updateAllNotes = function() {
      $scope.getNotes();
      $scope.getFollowUp();
    };

    $scope.exportArticleToPdf = function() {
      var art = $scope.article;
      var art2 = sortFields($scope.article);
      var notes = $scope.notes;
      var obj = {};
      var html = "<div style='font-family:arial;'>";
      html += '<div><font style="font-size:30px">' + art.FirstnameContact.value + ' ' + art.LastnameContact.value + '</font></div><br>';
      html += '<div><font style="font-size:24px">Claim #' + art.ClaimContact.value + '</font></div><br>';
      html += '<div><font style="font-size:24px">DOI ' + $filter('date')(art.DOIContact.value, "MM/dd/yy") + '</font></div><br><br>';
      for (var k in art2) {
        if (art2[k].hasOwnProperty("id") && art2[k].value !== "" &&
          art2[k].value !== " " &&
          art2[k].id.key !== "NorthorCentralorStatewideFocusInformation" &&
          art2[k].id.key !== "DateassignedFocusInformation" &&
          art2[k].id.category !== "System" &&
          !angular.isUndefined(art2[k].value) &&
          !angular.isUndefined(art2[k].id.category)
        ) {
          if (!obj.hasOwnProperty(art2[k].id.category)) {
            obj[art2[k].id.category] = [];
          }
          if (art2[k].id.type === "date") {
            obj[art2[k].id.category].push({
              "name": art2[k].id.name.replace(/(\r\n|\n|\r)/gm, ""),
              "value": $filter('date')(art2[k].value, "MM/dd/yy")
            });
          } else if ((art2[k].id.type === "text" || art2[k].id.type === "dropdown") && art2[k].id.key !== "FirstnameContact" && art2[k].id.key !== "LastnameContact") {
            obj[art2[k].id.category].push({
              "name": art2[k].id.name.replace(/(\r\n|\n|\r)/gm, ""),
              "value": art2[k].value.replace(/(\r\n|\n|\r)/gm, "")
            });
          }
          console.log(obj[art2[k].id.category]);
        }
      }
      html += "<div>";
      for (var k in obj) {
        if (k === "Contact") {
          for (var i in obj[k]) {
            html += "<p style='margin:0px'>" + obj[k][i].name + " : " + obj[k][i].value + "</p><br>";
          }
        }
      }
      html += "</div>";
      for (var k in obj) {
        if (k !== "Contact") {
          html += "<p><font style='font-size:24px;'>" + k + "</font><br></p>";
          for (var i in obj[k]) {
            html += "<p style='margin:0px'>" + obj[k][i].name + " : " + obj[k][i].value + "</p><br>";
          }
        }
      }
      html += "</div>";
      console.log(html);
      // Save the PDF
      var pdf = new jsPDF('p', 'pt', 'letter');

      var specialElementHandlers = {
        '#bypassme': function(element, renderer) {
          return true;
        }
      };
      var margins = {
        top: 10,
        bottom: 10,
        left: 40,
        width: 522
      };
      pdf.fromHTML(
        html, // HTML string or DOM elem ref.
        margins.left, // x coord
        margins.top, { // y coord
          'width': margins.width, // max width of content on PDF
        },
        function(dispose) {
          pdf.save('Focus-On-Intervention-' + art.FirstnameContact.value + '-' + art.LastnameContact.value + '.pdf');
        }, margins);
    };

    $scope.decodeHtml = function(text) {
      $scope.render = text;
      for (var k in $scope.article) {
        if ($scope.article[k] !== undefined && angular.isObject($scope.article[k]) && k !== "permissions") {
          var re = "\*\*" + $scope.article[k].id.key + "\*\*";
          $scope.render = $scope.render.replace(re, $scope.article[k].value);
        }
      }
      var pdf = new jsPDF('p', 'pt', 'letter');
      var source = $scope.render;

      var specialElementHandlers = {
        '#bypassme': function(element, renderer) {
          return true;
        }
      };
      var margins = {
        top: 10,
        bottom: 10,
        left: 40,
        width: 522
      };
      pdf.fromHTML(
        source, // HTML string or DOM elem ref.
        margins.left, // x coord
        margins.top, { // y coord
          'width': margins.width, // max width of content on PDF
          'elementHandlers': specialElementHandlers
        },
        function(dispose) {
          pdf.save('Focus-On-Intervention-' + $scope.article.FirstnameContact.value + '-' + $scope.article.LastnameContact.value + '.pdf');
        }, margins);


    };

    $scope.emailExport = function() {
      $http.get('/api/templates')
        .then(function(response) {
          $scope.templates = response.data;

        }, function(response) {

        });
    };

    $scope.editDocFun = function(doc) {
      $scope.tempDoc = doc;
      $scope.editDoc = doc;
    };

    $scope.changeStatus = function(note) {
      if (!$scope.canEditNote(note)) return;

      var id = note._id;

      $http.get('/api/notes/changestatus/' + id)
        .then(function(response) {
          for (var k in $scope.notes) {
            if ($scope.notes[k]._id === response.data._id) {
              $scope.notes[k].status = response.data.status;
            }
          }

        }, function(response) {

        });
    };

    $scope.changeEmailSent = function(note) {
      if (!$scope.canEditNote(note)) return;

      var id = note._id;

      $http.get('/api/notes/change_emailsent/' + id)
        .then(function(response) {
          for (var k in $scope.notes) {
            if ($scope.notes[k]._id === response.data._id) {
              $scope.notes[k].email_sent = response.data.email_sent;
            }
          }

        }, function(response) {

        });
    };

    $scope.renderDocument = function() {
      console.log("here");
      $scope.uploaderDoc.uploadAll();
      /*
      $http.post('/api/exports/renderDoc', $scope.article)
        .then(function(response) {
            console.log(response.data);
          }, function(response) {
            $scope.data = response.data || "Request failed";
            toastr.error('Error adding new note');
          }
          );
        */
    };

    $scope.emailDialog = function(note) {
      $scope.note = note;
      $scope.emailAttachment = angular.copy(note.files);
      console.log(note, $scope.note);
      $scope.dialog2 = ngDialog.open({
        template: 'emailTemplate',
        scope: $scope,
        className: 'ngdialog-overlay ngdialog-custom dialog-medium-size',
        closeByEscape: true,
        showClose: false,
        overlay: false,
      });
    };

    $scope.emailDialogDropDoc = function(file) {
      console.log(file);
      $scope.note = {};
      $scope.note.files = [];
      $scope.note.files.push(file);
      $scope.emailAttachment.push(file);
      $scope.dialog2 = ngDialog.open({
        template: 'emailTemplate',
        scope: $scope
      });
    };

    $scope.sendEmail = function() {
      console.log($scope.emailAttachment);
      var att = "<br>---<br>Attached files<br>";
      for (var k in $scope.emailAttachment) {
        att += "<a href='" + $scope.emailAttachment[k].url + "'>" + $scope.emailAttachment[k].originalName + "</a><br>";
      }
      var sendNote = $scope.note;

      if ($scope.emailAttachment.length > 0)
        sendNote.content += att;
      delete sendNote._case;
      $http.post('/api/exports/sendNoteByEmail', sendNote)
        .then(function(response) {
          if (response.status !== 200)
            toastr.warning("Email not sent");
          else
            toastr.success("Email Sent Successfully");
          $scope.articles = response.data;
        }, function(response) {

          $scope.data = response.data || "Request failed";
        });
    };

    $scope.isClosed = function(date) {
      return angular.isDate(date);
    };

    $scope.openFile = function() {
      $scope.article.DateClosedFocusInformation.value = "";
      toastr.info("Claimate Open");
    };

    $scope.deleteFile = function(item) {
      if (!$scope.confirm === 'DELETE')
        return;
      $http.delete('/api/articles/' + item._id)
        .then(function(response) {
          toastr.info("Claimate deleted");
        }, function(response) {

        });
    };

    $scope.flipSortReverse = function() {
      $scope.sortReverse = !$scope.sortReverse;
    }

    $scope.searchAndDisplay = function() {
      $scope.isNotesReady = false;
      
      $scope.notes = $scope.notesUnfilter;
      $scope.notes = $filter('filter')($scope.notes, {
        $: $scope.search
      });

      var regular = [];
      var prior = [];
      for (var k in $scope.notes) {
        if ($scope.notes[k].type === "newInfo") {
          prior.push($scope.notes[k]);
        } else {
          regular.push($scope.notes[k]);
        }
      }
      
      console.log('sortReverse', $scope.sortReverse);
      
      prior = $filter('orderBy')(prior, "date", $scope.sortReverse);
      regular = $filter('orderBy')(regular, "date", $scope.sortReverse);
      
      $scope.notes = prior.concat(regular);

      $scope.isNotesReady = true;
    };

    $scope.canEditNote = function(note) {
      if ($scope.authentication.user.roles.indexOf('admin') !== -1)
        return true;

      if ($scope.authentication.user.roles.indexOf('admin1') !== -1)
        return false;

      if ((note.creator.hasOwnProperty('_id') && note.creator._id == $scope.authentication.user._id) || (!note.creator.hasOwnProperty('_id') && note.creator == $scope.authentication.user._id)) {
        var createdAt = new Date(note.created).getTime();
        var now = new Date().getTime();

        if (parseInt(now) - parseInt(createdAt) < 86400 * 1000) return true;
      }

      return false;
    }

    $scope.updateNote = function(i) {
      $http.post('/api/notes', $scope.editNote)
        .then(function(response) {
          toastr.success('Success Updating Note');
        }, function(response) {
          $scope.data = response.data || "Request failed";
          toastr.error('Error update ');
        });
    };

    $scope.editNoteDialog = function(note) {
      $scope.editNote = note;
      $scope.dialog3 = ngDialog.open({
        template: 'editNoteTemplate',
        scope: $scope
      });
    };

    $scope.showPdfDialog = function(url) {
      console.log(url);
      var config = {
        headers: {
          "X-Testing": "testing",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Origin": "*",
          "responseType": 'arraybuffer'
        },
        responseType: 'arraybuffer'
      };
      $scope.loadingPdf = true;
      $http.get(url, config)
        .success(function(response) {
          $scope.loadingPdf = false;
          var file = new Blob([response], { type: 'application/pdf' });
          var fileURL = URL.createObjectURL(file);
          $scope.url = $sce.trustAsResourceUrl(fileURL);
        });

      $scope.dialog4 = ngDialog.open({
        template: 'PdfTemplate',
        scope: $scope
      });
    };

    $scope.checkIfPdf = function(name) {
      return /\.(pdf|PDF)$/.test(name);
    };

    function addFields() {
      var fields = $scope.fields;
      var file = $scope.article;
      var save = false;
      var count = 0;
      for (var k in file) {
        if (typeof file[k] === 'object' && file[k] !== null && file[k].hasOwnProperty("value")) {
          count++;
        }
      }
      //if(fields.length > count){
      for (var i in fields) {
        var find = false;
        if (!file.hasOwnProperty(fields[i].key)) {
          file[fields[i].key] = { id: fields[i], value: "" };
          toastr.info('New Field Added: ' + fields[i].name);
          save = true;
        }
      }
      //}
      $scope.article = file;
      $scope.article_sort = sortFields(file);
      if (!$scope.article.legacy) {
        $scope.article.legacy = [];
      }
      $scope.article.legacy.push({ "created": "" });
      if (save === true) {
        $scope.sendEditArticle(true);
      }
    }

    function sortFields(input) {
      var array = [];
      var other_arr = [];
      for (var objectKey in input) {
        if (objectKey !== undefined && angular.isObject(input[objectKey]) && objectKey !== "permissions" && objectKey !== "legacy")
          array.push(input[objectKey]);
        else
          other_arr.push(input[objectKey]);
      }

      array.sort(function(a, b) {
        //var aPos = parseInt(a.id.order);
        //var bPos = parseInt(b.id.order);
        if (a.id === null || b.id === null)
          return 0;
        return a.id.order - b.id.order;
      });
      return array;
    }

    function sortFieldsToObj(input) {
      var array = [];
      for (var objectKey in input) {
        if (objectKey !== undefined && angular.isObject(input[objectKey]) && objectKey !== "permissions")
          array.push(input[objectKey]);
      }

      array.sort(function(a, b) {
        //var aPos = parseInt(a.id.order);
        //var bPos = parseInt(b.id.order);
        return a.id.order - b.id.order;
      });

      var obj = {};
      for (var k in array) {
        console.log(array[k].id.order, " -- ", array[k].id.key);
        var obj2 = { "value": array[k].value, "id": array[k].id };
        obj[array[k].id.key] = obj2;

      }

      console.log(obj);
      return obj;
    }

    function closeFile() {
      $scope.article.DateClosedFocusInformation.value = new Date();
      $scope.sendEditArticle(true);
      toastr.info("Claimate Closed");

    }

    function tickPremissions() {
      //tick the users that exist in the article:
      for (var k in $scope.users) {
        for (var i in $scope.article.permissions) {
          if ($scope.users[k]._id === $scope.article.permissions[i]._id) {
            $scope.users[k].ticked = true;
          }
        }
      }
      var permissions = angular.copy($scope.article.permissions);
      var ids = permissions.map(function(obj) { return obj._id; });
      $scope.permissions = permissions.filter(function(value, index, self) {
        return ids.indexOf(value._id) === index;
      });
    }

    $scope.docCaseFilter = function(item) {
      return item.case !== '' || item.case !== null;
    };

    $scope.seize = function(n) {
      var lowEnd = n * $scope.dropdoc.perPage;
      var highEnd = n * $scope.dropdoc.perPage + $scope.dropdoc.perPage;
      var arr = [];
      var bigArray = [];
      if ($scope.dropdoc.search === true) {
        bigArray = $scope.searchFiles;
      } else {
        bigArray = $scope.allFiles;
      }
      //console.log(bigArray);
      for (var i = lowEnd; i < highEnd; i++) {
        if (bigArray[i] !== undefined) {
          arr.push(bigArray[i]);
        }
      }
      $scope.dropdoc.n = n;
      $scope.files = arr;
    };

    $scope.dropdocPrev = function() {
      console.log("prev");
      if ($scope.dropdoc.n < 1)
        return;
      $scope.seize($scope.dropdoc.n - 1);
    };

    $scope.dropdocNext = function() {
      if ($scope.dropdoc.n > $scope.pageLength)
        return;
      $scope.seize($scope.dropdoc.n + 1);
    };

    $scope.dropdoc.searchAndDisplay = function(value) {

      if (value === undefined || value === "") {
        $scope.pageLength = Math.ceil($scope.allFiles.length / $scope.dropdoc.perPage);
        $scope.dropdoc.search = false;
        $scope.orderDropdoc();
        return;
      }
      $scope.files = $filter('filter')($scope.allFiles, value);
      $scope.searchFiles = $scope.files;
      $scope.pageLength = Math.ceil($scope.files.length / $scope.dropdoc.perPage);
      $scope.dropdoc.search = true;
      $scope.orderDropdoc();
    };

    $scope.orderDropdoc = function() {
      $scope.allFiles = $filter('orderBy')($scope.allFiles, $scope.dropdoc.sortType, $scope.dropdoc.sortReverse);
      $scope.seize(0);
    };

    $scope.calculator.changeDate = function() {
      $scope.calc1Error = true;
      console.log($scope.selectToday);
      var unix2, unix1;
      if ($scope.selectToday) {
        $scope.date2 = new Date();
        unix2 = new Date().getTime() / 1000;
      } else {
        $scope.date2 = $scope.article[$scope.calculator.endingDate.key].value;
        unix2 = $scope.date2.getTime() / 1000;
      }
      $scope.date1 = $scope.article[$scope.calculator.startingDate.key].value;
      unix1 = $scope.date1.getTime() / 1000;
      $scope.diff = Math.ceil((unix2 - unix1) / (60 * 60 * 25));
      console.log($scope.diff);
      if ($scope.diff < 0) {
        $scope.calc1Error = true;
      } else {
        $scope.calc1Error = false;
      }
    };

    $scope.formatString = function(format) {
      var day = parseInt(format.substring(0, 2));
      var month = parseInt(format.substring(3, 5));
      var year = parseInt(format.substring(6, 10));
      var date = new Date(year, month - 1, day);
      return date;
    };

    $scope.pushToEndingDate = function() {

    };

    $scope.printDiv = function(note) {
      var popupWin = window.open('', '_blank', 'width=500,height=500');
      var date = $filter('date')(note.date, "MM/dd/yyyy mm:HH");
      var content = "<br><div style=''><b>On:</b> " + date + "<br> <b>To:</b> " + note.to + "<br> <b>cc: </b>" + note.cc + "<br> <b>bcc:</b> " + note.bcc + "<br><b>Subject:</b>" + note.title + "<br> <b>Content:</b> <br>" + note.content + "</div>";
      popupWin.document.open();
      popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + content + '</body></html>');
      popupWin.document.close();
    };

    $scope.loadlegacy = function(i) {
      console.log(i);
      if (i.created === "")
        return;
      $scope.article_sort = sortFields(i);
      console.log($scope.legacy, i);
      $scope.isLegacy = true;
    };

    $scope.disableLegacy = function() {
      $scope.article_sort = sortFields($scope.article);
      $scope.isLegacy = false;
    };

    $scope.createLegacy = function(i) {
      if (i !== "LEGACY")
        return;
      $scope.loading = true;
      $http.get('/api/articles/addlegacy/' + $scope.article._id)
        .then(function(response) {
          $scope.loading = false;
          toastr.success('Legacy Created');
          $scope.article = response.data;
          $scope.legacy.push("");
          $scope.article_sort = sortFields($scope.article);
          for (var k in $scope.article_sort) {
            if ($scope.article_sort[k].id.category !== "Contact") {
              if ($scope.article_sort[k].id.type !== "date")
                $scope.article_sort[k].value = "";
              else
                $scope.article_sort[k].value = null;
            }
          }
        }, function(response) {
          $scope.loading = false;
          toastr.error('To Many Legacies');
        });
    };

    $scope.onFile = function(re) {
      console.log(re.file);
      if (!re.file)
        return;
      $scope.note.files.push(re.file);
      $scope.emailAttachment.push(re.file);
    };

    $scope.onFileNote = function(re) {
      console.log(re.file);
      if (!re.file)
        return;
      $scope.editNote.files.push(re.file);
    };

    $scope.onFileNote2 = function(re) {
      console.log(re.file);
      if (!re.file)
        return;
      $scope.newNote.filesShow.push(re.file);
      $scope.newNote.files.push(re.file._id);
    };

    //function for the page
    //$scope.splitFields();
    $scope.updateAllNotes();
    $scope.getFiles();
    $scope.emailExport();
    addFields();
    tickPremissions();
  }
]);

'use strict';

// Articles controller
angular.module('articles').controller('articleController', ['$scope', '$state', '$stateParams', '$location', 'Authentication', 'Articles', '$http', 'ngDialog', '$timeout', 'toastr', 'FileUploader', '$rootScope', '$filter', '$sce',
  function($scope, $state, $stateParams, $location, Authentication, Articles, $http, ngDialog, $timeout, toastr, FileUploader, $rootScope, $filter, $sce) {
    $scope.authentication = Authentication;
    $scope.fields = []; // a var to hold all the posible fields
    $scope.smartList = []; // a var to old the smart search params
    $scope.articles = []; // a var to hold all the articles to show
    $scope.articlesPart = []; // a var to hold all the articles to show
    $scope.cats = [];
    $scope.users = [];
    $scope.search = false;
    $scope.sortType = 'LastnameContact.value';
    $scope.searchText = "Find All";
    $scope.closed = "open";
    $scope.date = new Date();
    $scope.searchHistory = {};
    $scope.claimCheck = false;
    var date = new Date();
    var claim;
    $scope.minDate = date.setDate((new Date()).getDate());
    $scope.newDate = function(date) {
      return new Date(date);
    };
    $scope.tableOrder = [];

    $scope.bAllowedToChangeCaseInfo = 'XXX';
    $timeout(function() {
      $scope.$apply(function() {
        $scope.bAllowedToChangeCaseInfo = 'YYY';
      });
    }, 500);
    // if ($scope.authentication.user.roles.indexOf('admin2') !== -1 || $scope.authentication.user.roles.indexOf('admin') !== -1)
    //   $scope.bAllowedToChangeCaseInfo = true;

    console.log('Allowed', $scope.bAllowedToChangeCaseInfo);

    // Filter _id, user, and __v
    $scope.catFilter = function(cat) {
      return cat === 'Contact';
    };

    //change the current line params
    $scope.smartSearchParams = function(type) {
      $scope.smartSearch.type = type;
      console.log("type: " + type);
    };

    $scope.onFile = function(file) {
      console.log(file);
    };

    $scope.getFields = function() {
      $http.get('/api/fields/all-fields').
      then(function(response) {
          $scope.fields = response.data;
          $rootScope.fields = response.data;
          $scope.requiredFileds = [];
          $scope.otherFileds = [];

          for (var k in $scope.fields) {
            if (k === "_id" || k === "user")
              continue;
            if ($scope.fields[k].category === "Contact") {
              $scope.requiredFileds.push($scope.fields[k]);
            } else
              $scope.otherFileds.push($scope.fields[k]);
          }

          for (var j in response.data) {
            var found = false;
            for (var i in $scope.cats) {
              if ($scope.cats[i] === response.data[j].category)
                found = true;
            }
            if (found === false)
              $scope.cats.push(response.data[j].category);
          }


        }, function(response) {
          $scope.data = response.data || "Request failed";
        }

      );
    };
    $scope.getFields();

    $scope.getUsers = function() {
      if ($scope.authentication.user.roles.indexOf("admin") === -1 && $scope.authentication.user.roles.indexOf("admin2") === -1)
        return;
      $http.get('/api/users').
      then(function(response) {
          $scope.users = response.data;
          $rootScope.users = response.data;

        }, function(response) {
          console.log(response);
        }

      );
      $scope.example1model = [];
    };
    $scope.getUsers();

    $scope.addLineToSmartSearch = function() {
      //console.log($scope.smartSearch.currentField);
      /*if($scope.smartSearch.currentField === undefined){
        toastr.warning("Please select searching field");
        return;
      }*/
      if ($scope.smartSearch.option === "" || !$scope.smartSearch.option) {
        toastr.warning("Please select searching option");
        return;
      }

      if ($scope.smartSearch.currentField === "" || !$scope.smartSearch.currentField) {
        toastr.warning("Please select field");
        return;
      }

      if ($scope.smartSearch.input === "" || !$scope.smartSearch.input) {
        toastr.warning("Please insert a date/text");
        return;
      }
      $scope.smartList.push({
        "type": $scope.smartSearch.currentField.type,
        "field": $scope.smartSearch.currentField.key,
        "link": $scope.smartSearch.link,
        "option": $scope.smartSearch.option,
        "text": $scope.smartSearch.input,
        "fieldName": $scope.smartSearch.currentField.name
      });
      $scope.smartSearch.field = "";
      $scope.smartSearch.option = "";
      $scope.smartSearch.currentField = "";
      $scope.smartSearch.input = "";

    };

    $scope.removeFromSmartList = function(index) {
      console.log(index);
      $scope.smartList.splice(index, 1);
    };

    $scope.doSmartSearch = function() {
      if ($scope.smartList.length < 1) {
        toastr.warning("Please insert at list one searching row");
        return;
      }
      $scope.search = true;
      var found = false;
      for (var k in $scope.smartList) {
        if ($scope.smartList[k].field === "DateClosedFocusInformation")
          found = true;
      }
      if (!found) {
        $scope.smartList.push({
          "field": "closed",
          "text": $scope.closed
        });
      }
      $http.post('/api/articles/smart-search', $scope.smartList).
      then(function(response) {
        $scope.smartList.pop();
        $scope.search = false;
        if (response.data.length === 0)
          toastr.warning("No Claimants Found");
        else
          toastr.info(response.data.length + " Claimants Found");
        console.log(response.data);
        for (var k in response.data) {
          for (var i in response.data[k]) {
            if (response.data[k][i].id && response.data[k][i].id.type === "date") {
              response.data[k][i].value = new Date(response.data[k][i].value);
              if (response.data[k][i].value.getTime() === 0)
                response.data[k][i].value = "";
            }
          }
        }
        $scope.articles = response.data;
      }, function(response) {

        $scope.data = response.data || "Request failed";
      });
    };

    $scope.create = function(isValid) {
      $scope.error = null;
      //console.log(this);
      // Create new Article object
      var fields = {};
      fields.data = [];
      fields.permissions = [];
      var permissions = [];
      for (var k in $scope.fields) {
        var v;
        if (typeof $scope.fields[k].undefined !== "undefined" || $scope.fields[k].undefined === "") {
          v = $scope.fields[k].undefined;
        } else
          v = " ";
        //console.log($scope.fields[k].name);
        //console.log({value: v, category: $scope.fields[k].category, key : $scope.fields[k].key, type: $scope.fields[k].type, name: $scope.fields[k].name, order: $scope.fields[k].order});  
        //fields.push({value: v, category: $scope.fields[k].category, key : $scope.fields[k].key, type: $scope.fields[k].type, name: $scope.fields[k].name, order: $scope.fields[k].order});
        if ($scope.fields[k].key === 'ClaimContact') {
          fields.data.push({ value: claim, id: $scope.fields[k]._id, key: $scope.fields[k].key });
        } else {
          fields.data.push({ value: v, id: $scope.fields[k]._id, key: $scope.fields[k].key });
        }
      }

      for (var k in $scope.permissions) {
        permissions.push($scope.permissions[k]._id);
      }
      fields.permissions = permissions;

      //console.log($scope.fields);
      // Redirect after save
      /*
      article.$save(function (response) {
        $location.path('articles/' + response._id);
        toastr.success('New Claimant added');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
        toastr.error('Error adding Claimant');
      });
    }; */
      for (var k in $scope.fields) {
        $scope.fields[k].undefined = "";
      }
      $http.post('/api/articles', fields).
      then(function(response) {
        toastr.success('New Claimant added');
        $state.go('articles.create', {}, { reload: true });
      }, function(response) {
        toastr.error('Error adding Claimant');
        $scope.data = response.data || "Request failed";
      });
    };

    $scope.remove = function(article) {
      if (article) {
        article.$remove();

        for (var i in $scope.articles) {
          if ($scope.articles[i] === article) {
            $scope.articles.splice(i, 1);
          }
        }
      } else {
        $scope.article.$remove(function() {
          $location.path('articles');
        });
      }
    };

    $scope.find = function(all) {
      var search = {};
      if (!all) {
        for (var k in $scope.requiredFileds) {
          if ($scope.requiredFileds[k].value !== undefined && $scope.requiredFileds[k].value !== "")
            search[$scope.requiredFileds[k].key] = {
              "value": $scope.requiredFileds[k].value,
              "type": $scope.requiredFileds[k].type
            };
        }
        if (Object.keys(search).length === 0) {
          toastr.warning("Please fill up at list one field");
          return;
        }
      }
      search.closed = $scope.closed;
      $scope.search = true;
      //console.log(search);
      $http.post('/api/articles/search', search).
      then(function(response) {
        $scope.search = false;
        for (var k in response.data) {
          for (var i in response.data[k]) {
            if (response.data[k][i].id && response.data[k][i].id.type === "date") {
              response.data[k][i].value = new Date(response.data[k][i].value);
              if (response.data[k][i].value.getTime() === 0)
                response.data[k][i].value = "";
            }
          }
        }

        $scope.articles = [];
        $scope.articles = response.data;
        if (response.data.length === 0)
          toastr.warning("No Claimants Found");
        else
          toastr.info(response.data.length + " Claimants Found");

      }, function(response) {

        $scope.data = response.data || "Request failed";
      });
      getSearchHistory();
    };

    $scope.findOne = function() {
      $scope.article = Articles.get({
        articleId: $stateParams.articleId
      });
    };

    $scope.filterArticles = function() {
      var result = {};
      angular.forEach($scope.articles, function(value, key) {
        if (!value.hasOwnProperty('secId')) {
          result[key] = value;
        }
      });
      console.log(result);
      return result;
    };

    $scope.editArticle = function(article, cats) {
      //$scope.editArticle = article;
      $scope.dialog = ngDialog.open({
        template: 'editArticle',
        data: {
          'article': article,
          'cats': cats,
          'users': angular.copy($scope.users),
          'fields': $scope.fields
        },
        controller: 'articleActionController',
        closeByEscape: true,
        showClose: false,
        closeByDocument: false,
        className: 'ngdialog-overlay ngdialog-custom dialog-medium-size',
        overlay: false,

      });
      $scope.dialog.setPadding = 15;
    };

    function getSearchHistory() {
      $http.get('/api/articles/searchhistory').
      then(function(response) {
        $scope.searchHistory = response.data;
      }, function(response) {

      });
    }

    $scope.adaptSearchHistory = function() {
      if (!$scope.searchSelect)
        return;
      var params = $scope.searchSelect.params;
      console.log(params);
      for (var k in $scope.requiredFileds) {
        $scope.requiredFileds[k].value = "";
      }
      for (var k in params) {
        for (var j in $scope.requiredFileds) {
          if ($scope.requiredFileds[j].key === k && $scope.requiredFileds[j].type === params[k].type) {
            if (params[k].type === "date") {
              $scope.requiredFileds[j].value = new Date(params[k].value);
            } else {
              $scope.requiredFileds[j].value = params[k].value;
            }
          }
        }
      }
    };

    $scope.checkClaim = function(i) {
      claim = i;
      if (i === null || i === "")
        return;
      $http.get('/api/articles/checkclain/' + i).
      then(function(response) {
        console.log(response.data);
        if (response.data) {
          $scope.claimCheck = false;
        } else {
          $scope.claimCheck = true;
          toastr.warning("Claim is not unique");
        }
      }, function(response) {
        console.log(response);
      });
    };


    $scope.changeSide = function(id) {
      $scope.xxx = id;
    };



    getSearchHistory();

  }
]);

angular.module('articles').controller('bulkController', ['$scope', '$location', 'Articles','$http', 'Authentication','FileUploader','toastr','$filter','$window','ngDialog','fileUpload','$sce',
  function($scope, $location, Articles, $http, Authentication, FileUploader,toastr, $filter, $window, ngDialog, fileUpload, $sce){
    $scope.smartList = [];
    $scope.fields = [];
    $scope.showFields = [];
    
    $scope.getFields = function(){
      $http.get('/api/fields/all-fields').
          then(function(response) {
            //console.log(response.data);
            $scope.fields  = response.data;
      }); 
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
      
      if($scope.smartSearch.input === "" || !$scope.smartSearch.input){
        toastr.warning("Please insert a date/text");
        return;
      }
      $scope.smartList.push({
        "type"  : $scope.smartSearch.currentField.type,
        "field" : $scope.smartSearch.currentField.key,
        "link"  : $scope.smartSearch.link,
        "option": $scope.smartSearch.option,
        "text"  : $scope.smartSearch.input,
        "fieldName"  : $scope.smartSearch.currentField.name
      });
      $scope.smartSearch.field = "";
      $scope.smartSearch.option = "";
      $scope.smartSearch.currentField = "";
      $scope.smartSearch.input = "";
      
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
      $scope.search = true;
      var found = false;
      for(var k in $scope.smartList){
        if($scope.smartList[k].field === "DateClosedFocusInformation")
          found = true;
      }
      if(!found){
        $scope.smartList.push({
          "field"  : "closed",
          "text"  : $scope.closed
        });
      }
      $http.post('/api/articles/smart-search', $scope.smartList).
        then(function(response) {
          $scope.smartList.pop();
          $scope.search = false;
          if(response.data.length === 0)
            toastr.warning("No Claimants Found");
          else
            toastr.info(response.data.length + " Claimants Found");
          console.log(response.data);
          for(var k in response.data){
            for(var i in response.data[k]){
              if(response.data[k][i].id && response.data[k][i].id.type === "date"){
                response.data[k][i].value = new Date(response.data[k][i].value);
                if(response.data[k][i].value.getTime() === 0)
                  response.data[k][i].value = "";
              }
            }
          }
          $scope.articles = response.data;
        }, function(response) {
          
          $scope.data = response.data || "Request failed";
        }
      ); 
    };
    
    $scope.affField = function(){
      console.log($scope.filedsList);
      if($scope.showFields.length > 3)
        return;
      for(var k in $scope.showFields){
        if($scope.showFields[k]._id === $scope.filedsList._id)
          return;
      }
      $scope.showFields.push($scope.filedsList);
    };
    
    $scope.showField = function(i){
      for(var k in $scope.showFields){
        if(!i.id)
          return false;
        if($scope.showFields[k]._id === i.id._id){
          return true;
        }
      }
      return false;
    };
    
    $scope.editSingle = function(i){
      $http.put('/api/articles/' + $scope.articles[i]._id, $scope.articles[i]).
          then(function(response) {
            console.log(response.data);
            if(response.data === "OK")
              toastr.success("Claimants edit success");
      }); 
    };
    
    $scope.editAll = function(){
      $scope.articles.forEach(function(single,i){
        console.log(i);
        $scope.editSingle(i);
      });

    };
    
    $scope.pushChange = function(index, field){
      console.log(index, field, field.value);
      for(var k in $scope.articles[index]){
        console.log($scope.articles[index][k]);
        if($scope.articles[index][k].id._id === field._id){
          $scope.articles[index][k].value = field.value;
        }
      }
      console.log($scope.articles[index]);
    };
}]);
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
'use strict';

// Articles controller
angular.module('articles').controller('FieldsController', ['$scope', 'Authentication','$http','toastr',
  function ($scope, Authentication, $http, toastr) {
    $scope.authentication = Authentication;
    $scope.cats = [];
    
    $scope.getFields = function(){
      $http.get('/api/fields/all-fields').
        then(function(response) {
          //console.log(response.data);
          $scope.fields  = response.data;
          $scope.splitFileds = {};
          
          for(var j in response.data){
             var found = false;
             for(var i in $scope.cats){
               if($scope.cats[i] === response.data[j].category)
                 found = true;
             }
             if(found === false){
               $scope.cats.push(response.data[j].category);
               $scope.splitFileds[response.data[j].category] = {};
             }
           }
          for(var k in $scope.fileds){
            var cat = $scope.fields[k].category;
            $scope.splitFileds[cat].push($scope.fields[k]);
          }
        }, function(response) {
          $scope.data = response.data || "Request failed";
        }
        
        ); 
    };
    $scope.getFields();

    $scope.addLineToFilds = function(){
      var line = {
        type: "text",
        required: $scope.newFiled.required,
        name: $scope.newFiled.value,
        category: $scope.newFiled.cat,
        order: 1,
        key: $scope.newFiled.value.replace(/[^A-Z0-9]/ig, '')+$scope.newFiled.cat.replace(/\s+/g, '')
      };
      console.log(line);
      create(line);
    };
    
    $scope.update = function(){
    var fields = $scope.fields;
     $http.post('/api/fields', fields).
        then(function(response) {
      
        }, function(response) {
        }
      );
    };
    
    $scope.showUpdate = function(){
      toastr.success('Fields Updated');
    };
    
    $scope.delete = function(id){
      $http.delete('/api/fields/'+id).
        then(function(response) {
           if(response.statusText === "OK"){
             toastr.warning('Field deleted');
             for(var k in $scope.fields){
               if($scope.fields[k]._id === id){
                 $scope.fields.splice(k,1);
                 break;
               }
             }
           }
             
        }, function(response) {
          $scope.data = response.data || "Request failed";
        }
      );  
    };
    
    function create(line){

     $http.post('/api/fields/newfields', line).
        then(function(response) {
          if(response.statusText === "OK")
            toastr.success('Fields Added');
            $scope.fields.push(response.data);
        }, function(response) {
        }
      ); 
    }
    
    $scope.moveDown = function(index, cat){
      var up, down;
      for(var k in $scope.fields){
        if($scope.fields[k].category === cat && $scope.fields[k].order === index){
          //console.log(k , $scope.fields[k]);
          up = $scope.fields[k];
         // $scope.fields[k]++;
        }
        if($scope.fields[k].category === cat && $scope.fields[k].order === index+1){
          //console.log(k , $scope.fields[k]);
          //$scope.fields[k]--;
          down = $scope.fields[k];
        }

      }
      if(down.order > 0 && up.order !== $scope.fields.length){
        up.order++;
        down.order--;
        $scope.update();
      }
      for(var k in $scope.fileds){
      }
    };
    
    $scope.moveUp = function(index, cat){
      var up, down;
      for(var k in $scope.fields){
        if($scope.fields[k].category === cat && $scope.fields[k].order === index){
          //console.log(k , $scope.fields[k]);
          up = $scope.fields[k];
         // $scope.fields[k]++;
        }
        if($scope.fields[k].category === cat && $scope.fields[k].order === index-1){
          //console.log(k , $scope.fields[k]);
          //$scope.fields[k]--;
          down = $scope.fields[k];
        }

      }
      if(up.order > 0 && up.down !== $scope.fields.length){
        up.order--;
        down.order++;
        $scope.update();
      }
    };
    
    $scope.addDropdown = function(item){
      if(item.type !== "dropdown")
        return;
      if(!item.hasOwnProperty("value")){
        item.values = [];
      }
    };
    
    $scope.addToDropdown = function(item){
      if(item.type !== "dropdown")
        return;
      if(!item.hasOwnProperty("values")){
        item.values = [];
      }
      item.values.push(item.new);
      item.new = "";
    };
    
    $scope.removeFromValues = function(i, item){
      if(item.type !== "dropdown")
        return;
      item.values.splice(i,1);
 
    };
    
  }]);

'use strict';
//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('Articles', ['$resource',
  function ($resource) {
    return $resource('api/articles/:articleId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);


angular.module('articles').filter('category', function() {
    return function(input, cat) {
        var out = [];
        for (var i = 0; i < input.length; i++) {
          console.log(input);
            if(input[i].id.category === cat){
                out.push(input[i]);
            }
        }
        return out;
    }
});

angular.module('articles').filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);
'use strict';
// Configuring the Calendar module
angular.module('calendar', ['ngDialog', 'ui.mask', 'ui.bootstrap', 'ui.calendar', 'ngMaterial']).run(['Menus',
  function(Menus) {
    // Add the calendar dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Calendar',
      state: 'calendar',
      type: 'dropdown',
      roles: ['user', 'user2', 'admin2', 'admin']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'calendar', {
      title: 'Show Calendar',
      state: 'calendar.list',
      roles: ['user', 'user2', 'admin2', 'admin']
    });
  }
]);



angular.module('calendar').config(["$provide", function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {
    // $delegate is the taOptions we are decorating
    // register the tool with textAngular
    taRegisterTool('colourRed', {
      iconclass: "fa fa-square red",
      action: function() {
        this.$editor().wrapSelection('forecolor', 'red');
      }
    });
    // add the button to the default toolbar definition
    taOptions.toolbar[1].push('colourRed');
    return taOptions;
  }]);
}]);

angular.module('calendar').config(["$provide", function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {
    // $delegate is the taOptions we are decorating
    // register the tool with textAngular
    taRegisterTool('colourBlue', {
      iconclass: "fa fa-square blue",
      action: function() {
        this.$editor().wrapSelection('forecolor', 'blue');
      }
    });
    // add the button to the default toolbar definition
    taOptions.toolbar[1].push('colourBlue');
    return taOptions;
  }]);
}]);

angular.module('calendar').config(["$provide", function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {
    // $delegate is the taOptions we are decorating
    // register the tool with textAngular
    taRegisterTool('colourGreen', {
      iconclass: "fa fa-square green",
      action: function() {
        this.$editor().wrapSelection('forecolor', 'green');
      }
    });
    // add the button to the default toolbar definition
    taOptions.toolbar[1].push('colourGreen');
    return taOptions;
  }]);
}]);

angular.module('calendar').config(["$provide", function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {
    // $delegate is the taOptions we are decorating
    // register the tool with textAngular
    taRegisterTool('colourGrey', {
      iconclass: "fa fa-square grey",
      action: function() {
        this.$editor().wrapSelection('forecolor', 'grey');
      }
    });
    // add the button to the default toolbar definition
    taOptions.toolbar[1].push('colourGrey');
    return taOptions;
  }]);
}]);

angular.module('calendar').config(["$provide", function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {
    // $delegate is the taOptions we are decorating
    // register the tool with textAngular
    taRegisterTool('colouryellow', {
      iconclass: "fa fa-square yellow",
      action: function() {
        this.$editor().wrapSelection('forecolor', '#F6911E');
      }
    });
    // add the button to the default toolbar definition
    taOptions.toolbar[1].push('colouryellow');
    return taOptions;
  }]);
}]);




angular.module('calendar').config(["$provide", function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {
    // $delegate is the taOptions we are decorating
    // register the tool with textAngular
    taRegisterTool('colourgreyblue', {
      iconclass: "fa fa-square yellow greyb",
      action: function() {
        this.$editor().wrapSelection('forecolor', '#8496BA');
      }
    });
    // add the button to the default toolbar definition
    taOptions.toolbar[1].push('colourgreyblue');
    return taOptions;
  }]);
}]);

'use strict';

// Setting up route
angular.module('calendar').config(['$stateProvider',
  function ($stateProvider) {
    // Calendar state routing
    $stateProvider
      .state('calendar', {
        abstract: true,
        url: '/calendar',
        template: '<ui-view/>'
      })
      .state('calendar.list', {
        templateUrl: 'modules/calendar/client/views/calendar.client.view.html',
        url: '/',
        data: {
          roles: ['user', 'user2', 'admin2', 'admin']
        }
      });
  }
]);

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
'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('calendar').factory('Calendar', ['$resource',
  function ($resource) {
    return $resource('api/calendar/:calendarId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'modules/core/client/views/home.client.view.html'
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    });
  }
]);

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

'use strict';

angular.module('core').controller('HomeController', ['$scope', '$location', 'Authentication',
  function($scope, $location, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    console.log($scope.authentication);
    if ($scope.authentication.user === "")
      $location.path('/');
    else if ($scope.authentication.user.roles.indexOf('admin1') === -1)
      $location.path('/articles/list');
    else
      $location.path('/articles/create');
  }
]);

'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
    var linkFn = function (scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function (invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
  function ($q, $injector) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if(!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

'use strict';
// Configuring the Calendar module
angular.module('export',['ngDialog','ui.mask','ui.calendar','ngMaterial']).run(['Menus',

]);




'use strict';

// Setting up route
angular.module('exports').config(['$stateProvider',
  function ($stateProvider) {
    // Exports state routing
    $stateProvider
      .state('exports', {
        abstract: true,
        url: '/exports',
        template: '<ui-view/>'
      })
      .state('exports.list', {
        templateUrl: 'modules/exports/client/views/exports.client.view.html',
        url: '/'
      })
      .state('exports.create', {
        url: '/create',
        templateUrl: 'modules/exports/client/views/create-article.client.view.html',
        data: {
          roles: ['user', 'user2', 'admin1', 'admin2', 'admin']
        }
      })
      .state('exports.edit', {
        url: '/:articleId/edit',
        templateUrl: 'modules/exports/client/views/edit-article.client.view.html',
        data: {
          roles: ['user', 'user2', 'admin1', 'admin2', 'admin']
        }
      })
      .state('exports.diplicates', {
        url: '/duplicates',
        templateUrl: 'modules/exports/client/views/duplicates.client.view.html',
        data: {
          roles: ['admin1', 'admin2', 'admin']
        }
      });
  }
]);

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

'use strict';

// Articles controller
angular.module('exports').controller('ExportsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles','$http','$filter','toastr',
  function ($scope, $stateParams, $location, Authentication, Articles, $http, $filter, toastr) {
  $scope.spinner = false;
  $scope.smartList = [];
  $scope.cats = [];
  
    $scope.csv = function(part){
      $scope.spinner = true;
      $http.get('/api/exports/contacttocsv/' + part).
        then(function(response) {
          $scope.spinner = false;
          var blob = new Blob([response.data], { type: "application/CSV"});
          var fileName = "Contacts-Part-" + part + ".csv";
          saveAs(blob, fileName);
        }, function(response) {
          $scope.spinner = false;
          toastr.warning("Error exporting CSV");
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

'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('exports').factory('Exports', ['$resource',
  function ($resource) {
    return $resource('api/exports/:exportsId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';
// Configuring the library module
angular.module('library',['ngDialog','ui.mask','ngMaterial']).run(['Menus',
  function (Menus) {
    // Add the library dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Library',
      state: 'library',
      type: 'dropdown',
      roles: ['user2', 'admin2', 'admin']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'library', {
      title: 'Show library',
      state: 'library.list',
      roles: ['user2', 'admin2', 'admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('library').config(['$stateProvider',
  function ($stateProvider) {
    // library state routing
    $stateProvider
      .state('library', {
        abstract: true,
        url: '/library',
        template: '<ui-view/>'
      })
      .state('library.list', {
        templateUrl: 'modules/library/client/views/library.client.view.html',
        url: '/',
        data: {
          roles: ['user2', 'admin2', 'admin']
        }
      });
  }
]);

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

angular.module('articles').directive('searchDoc', ['$http', function ($http) {
  return  {
    restrict : "E",
    template : "<div class='search-dropdoc'><input type='text' ng-model='search' class='form-control'><select ng-options='item.originalName for item in items' ng-model='results' class='form-control' ng-change='select()'></select></div>",
    scope: {
      user: "@  ", 
      callback: "="   
    },
    link: function(scope, elem, attrs) {

      scope.$watchGroup(['search'], function(newValues, oldValues, scope) {
        search();
      });
      function search(){
        if(!scope.search)
          return;
        var obj = {
          user: attrs.user,
          search: scope.search
        };
        console.log(obj);
        $http.post('/api/dropdoc/searchuser', obj).
          then(function(response) {
            scope.items = response.data;
          }
        );  
      }
      
      scope.select = function(){
        scope.callback({file:scope.results});
      };
    }
  };
}]);
'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('library').factory('library', ['$resource',
  function ($resource) {
    return $resource('api/library/:libraryId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';
// Configuring the Articles module
angular.module('template',['ngDialog','ui.mask','ngMaterial','ngAnimate','ngAria','toastr','daterangepicker','angular.filter','ui.bootstrap','mdPickers','isteven-multi-select','textAngular','ngclipboard']).run(['Menus',
  function (Menus) {
    // Add the articles dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Templates',
      state: 'templates',
      type: 'dropdown',
      roles: ['user', 'user2', 'admin2', 'admin']
    });
    

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'templates', {
      title: 'Templates',
      state: 'templates.list',
      roles: ['user', 'user2', 'admin2', 'admin']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'templates', {
      title: 'Create',
      state: 'templates.create',
      roles: ['user', 'user2', 'admin2', 'admin']
    });
    
  }
]);

// add uiSwitch to module
'use strict';

// Setting up route
angular.module('template').config(['$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('templates', {
        abstract: true,
        url: '/templates',
        template: '<ui-view/>'
      })
      .state('templates.list', {
        templateUrl: 'modules/templates/client/views/templates-list.client.view.html',
        url: '/list'
      })
      .state('templates.create', {
        url: '/create',
        templateUrl: 'modules/templates/client/views/templates-create.client.view.html',
        data: {
          roles: ['user', 'user2', 'admin2', 'admin']
        }
      })
      .state('templates.edit', {
        url: '/edit/:docId',
        templateUrl: 'modules/templates/client/views/templates-create.client.view.html',
        //controller: 'templatesCreateController',
        /*resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              docId: $stateParams.docId
            });
          }]
        }*/
      });
  }
]);

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

'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('template').factory('template', ['$resource',
  function ($resource) {
    return $resource('api/template/:templateId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
    
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Download CSV',
      state: 'csv',
      roles: ['admin']
    });
    
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Find Duplicates',
      state: 'exports.diplicates',
      roles: ['admin']
    });
  }
]);


'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'user2', 'admin1', 'admin2', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      //.state('settings.accounts', {
      //  url: '/accounts',
      //  templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      //})
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      }).state('csv', {
        url: '/csvexport',
        templateUrl: 'modules/exports/client/views/csv.client.view.html'
      }).state('emailhistory', {
        url: '/emailhistory',
        templateUrl: 'modules/users/client/views/email-history.client.view.html'
      }).state('fileslist', {
        url: '/fileslist',
        templateUrl: 'modules/users/client/views/files-list.client.view.html'
      });
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    $scope.bPagination = false;

    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 10;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.bPagination = false;
      
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);

      $scope.bPagination = true;
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

    $scope.roles = {
      'admin': 'Super Admin',
      // 'admin1': 'Admin1',
      'admin2': 'Admin1',
      'user': 'User1',
      'user2': 'User2'
    };    

    $scope.user.$promise.then(function(v){
      $scope.user.block = v.block.toString();
      $scope.user.valid = v.valid.toString();
      $scope.user.roles = v.roles[0];
    });

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;
      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.getRoleName = function (role) {
      return $scope.roles[role];
    }
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator','toastr',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator,toastr) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if (!$scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // // If successful we assign the response to the global user model
        // $scope.authentication.user = response;

        // // And redirect to the previous or home page
        // $state.go($state.previous.state.name || 'home', $state.previous.params);
         
        if (!response.valid) {
          toastr.info(response.message);
          // $state.go('home');
        }
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        //$scope.error = response.message;
        toastr.error(response.message);
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);

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

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = PasswordValidator.getResult(password);
            var requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            var requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var status = true;
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, function(value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              var origin = scope.passwordVerify;
              return (origin !== password) ? false : true;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.';
        return popoverMsg;
      }
    };
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
