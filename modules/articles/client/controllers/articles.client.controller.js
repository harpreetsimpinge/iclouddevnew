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
