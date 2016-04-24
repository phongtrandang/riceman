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
    var imgid = $scope.imagedata.image;
    var score = $scope.imagedata.score;
    var temp = $scope.sensors.temp;
    var humidity = $scope.sensors.humidity;
    var soil = $scope.sensors.soilmoisture;
    var timestamp = $scope.sensors.timestamp;
    $http.get('http://riceman.mybluemix.net/api/storepackage?imageid='+imgid+'&score='+score+'&temp='+temp+'&humidity='+humidity+'&soilmoisture='+soil+'&timestamp='+timestamp).then(function(res){
      console.log(res.data);
      $ionicLoading.hide();
    });
  }
});
