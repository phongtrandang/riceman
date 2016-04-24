angular.module('starter.services', [])

.factory('RiceMan', function($http) {
  return {
    fetch: function() {
      return $http.get("http://agtech.mybluemix.net/api/sensors")
    },
    background_mode: function() {
      return $http.get("http://riceman.mybluemix.net/api/crontask")
    }
  };
});
