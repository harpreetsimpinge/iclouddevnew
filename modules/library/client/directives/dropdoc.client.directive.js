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