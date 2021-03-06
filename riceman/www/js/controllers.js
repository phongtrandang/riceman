angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {
})

.controller('MonitorCtrl', function($scope, $cordovaCamera, $cordovaFileTransfer, $http, RiceMan, $ionicLoading) {
  // Take photo
  $scope.takePicture = function(){
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 500,
      targetHeight: 500,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: true,
      correctOrientation: true,
    };
    $cordovaCamera.getPicture(options).then(function (imageData) {
      console.log(imageData);
      $scope.imgURI = "data:image/jpeg;base64," + imageData;
    }, function (err) {
    });
  };
  // Choose existing photo
  $scope.choosePhoto = function () {
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 500,
      targetHeight: 500,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: true,
      correctOrientation: true,
    };

    $cordovaCamera.getPicture(options).then(function (imageData) {
      $scope.imgURI = "data:image/jpeg;base64," + imageData;
    }, function (err) {

    });
  }

  // Upload photo.
  $scope.checkPhoto = function() {
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    var fileURL = $scope.imgURI;
    var data = {
      image_data: fileURL,
    };

    var config = {
      'Content-Type' : 'application/json',
    };
    $http.post('http://hackanoi-visual-recognition.mybluemix.net/api/testrice', data, config).then(function(res){
      var data = res.data;
      $scope.imagedata = data;
      if (data.score >= 0.5) {
        $scope.percent = data.score * 100;
        RiceMan.fetch().then(function(resSensor){
          var tmp = resSensor.data;
          tmp.soilmoisture = (tmp.soilmoisture*1).toFixed(1);
          if (tmp.hasOwnProperty('temp')) {
            tmp.temp = (tmp.temp*1).toFixed(1);
          } else {
            tmp.temp = 0;
          }
          tmp.humidity = (tmp.humidity*1).toFixed(1);
          tmp.light = (tmp.light*1).toFixed(1);
          $scope.sensors = tmp;
        });
      } else {
        $scope.percent = data.score * 100;
      }
      $ionicLoading.hide();
    });
  };

  // Store data
  $scope.StoreInfor = function(){
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    /*var imgid = $scope.imagedata.image;
    var score = $scope.imagedata.score;
    var temp = $scope.sensors.temp;
    var humidity = $scope.sensors.humidity;
    var soil = $scope.sensors.soilmoisture;
    var timestamp = $scope.sensors.timestamp;
    console.log(temp);
    $http.get('http://riceman.mybluemix.net/api/storepackage?imageid='+imgid+'&score='+score+'&temp='+temp+'&humidity='+humidity+'&soilmoisture='+soil+'&timestamp='+timestamp).then(function(res){
      console.log(res.data);
      $ionicLoading.hide();
    });*/

    var fileURL = $scope.imgURI;
    var options = {
      content: 'Loading',
      fileKey: "file",
      fileName: 'test.jpeg',
      chunkedMode: true,
      mimeType: "image/jpeg",
    };

    $cordovaFileTransfer.upload("http://ricedata.hackanoi.com/upload-single", fileURL, options).then(function(result) {
      console.log("SUCCESS: " + JSON.stringify(result.response));
      $ionicLoading.hide();
    }, function(err) {
      $ionicLoading.hide();
      console.log("ERROR: " + JSON.stringify(err));
    }, function (progress) {
      // constant progress updates
    });
  }
})

.controller('ProjectCtrl', function($scope, $ionicPopup, $timeout, $http){
  $scope.projects = "";

  $scope.doRefresh = function(){
    $http.get('http://ricedata.hackanoi.com/project/api/get')
    .success(function(data, status, headers,config){
      $scope.projects = data; // for UI
      $scope.$broadcast('scroll.refreshComplete');
    })
    .error(function(data, status, headers,config){
      console.log('data error');
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.doRefresh();
  // An elaborate, custom popup
  $scope.showPopup = function() {
    $scope.project = {};

    // An elaborate, custom popup
    var projectPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="project.title">',
      title: 'Create project',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.project.title) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              return $scope.project.title;
            }
          }
        }
      ]
    });

    projectPopup.then(function(res) {
      var data = {
        name: res,
      };
      var config = {
        'Access-Control-Allow-Origin': '*',

      };
      $http.post('http://ricedata.hackanoi.com/project/api/create', data, config).then(successCallback, errorCallback);

      var successCallback = function(res) {
        console.log(res);
        doRefresh();
      };
      var errorCallback = function(res) {
        console.log(res);
      }
    });
  };

});
