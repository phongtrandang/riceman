angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {
  console.log('Dashboard');
})

.controller('MonitorCtrl', function($scope, $cordovaCamera, $cordovaFileTransfer, $http) {
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
    var fileURL = $scope.imgURI;
    var options = {
      fileKey: "file",
      fileName: 'test.jpeg',
      chunkedMode: true,
      mimeType: "image/jpeg"
    };

    $cordovaFileTransfer.upload("http://coworking.drupalchimp.com/upload.php", fileURL, options).then(function(result) {
      console.log("SUCCESS: " + JSON.stringify(result.response));
    }, function(err) {
      console.log("ERROR: " + JSON.stringify(err));
    }, function (progress) {
      // constant progress updates
    });

    var data = {
      image_data: fileURL,
    };

    var config = {
      'Content-Type' : 'application/json',
    };
    $http.post('http://hackanoi-visual-recognition.mybluemix.net/api/testrice', data, config).then(function(res){
      var data = res.data;
      if (data.score >= 0.5) {
        $scope.percent = data.score * 100;
      } else {
        $scope.percent = 'This tree is not rice';
      }
    });
  };
});
