angular.module('starter.services', [])

.factory('RiceMan', function($http) {
  return {
    fetch: function() {
      return $http.get("http://agtech.mybluemix.net/api/sensors")
    },
  };
});
