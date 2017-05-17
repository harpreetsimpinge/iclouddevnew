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