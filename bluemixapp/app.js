/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var bodyParser = require('body-parser');
var path    = require('path');
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();
var router = express.Router();

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});


var Cloudant = require('cloudant');

router.get('/crontask', function(req, res){
    var iotf = require("ibmiotf");
    var appClientConfig = {
      org: '1sihq1',
      id: 'myapp',
      "auth-key": 'a-1sihq1-lmejvsoyvz',
      "auth-token": '+GSuDjN@2CRTLLNAtS',
      "auth-method": "token",
      "type": "shared"
    };

    var appClient = new iotf.IotfApplication(appClientConfig);
    appClient.connect();

    appClient.on('connect', function () {
    	appClient.subscribeToDeviceEvents();
    });
    appClient.on('deviceEvent', function (deviceType, deviceId, eventType, format, payload, topic) {
        var tmp = JSON.parse(payload);
        if (tmp.d){

            var data = {
              temp: tmp.d.temp,
              humidity: (tmp.d.potentiometer1 * 100).toFixed(1),
              soilmoisture: (tmp.d.potentiometer2 * 100).toFixed(1),
              timestamp: (new Date).getTime()
            }
            // var data = { 'temp' : tmp[0], 'humidity': tmp[1], 'soilmoisture': tmp[2], 'light': 0};
            // var date = new Date();
            // data.timestamp = date.getTime();

            var cloudant = Cloudant("https://8cd7b256-b57e-4822-ab9f-7dbf2b6a9a8f-bluemix:6f37e8f02528019bb2f86db43e33f49d2172d2e31c933aa9d72f849d8b2e707a@8cd7b256-b57e-4822-ab9f-7dbf2b6a9a8f-bluemix.cloudant.com",
                function(err, cloudant) {
                    if (err) {
                      return console.log('Failed to initialize Cloudant: ' + err.message);
                    }
                }
            );

            var db = cloudant.db.use("agtech");
            db.insert(data, function(){
              console.log('sensors data updated');
              res.send({ message: 'sensors data updated.' });
              appClient.disconnect();
              return
            })
        }
    });
})

router.get('/sensordata', function(req, res) {

    // Initialize the library with my account.
    var cloudant = Cloudant("https://8cd7b256-b57e-4822-ab9f-7dbf2b6a9a8f-bluemix:6f37e8f02528019bb2f86db43e33f49d2172d2e31c933aa9d72f849d8b2e707a@8cd7b256-b57e-4822-ab9f-7dbf2b6a9a8f-bluemix.cloudant.com",
      function(err, cloudant) {
        if (err) {
          return console.log('Failed to initialize Cloudant: ' + err.message);
        }
      }
    );

    var db = cloudant.db.use("agtech");
    db.find({"sort": [{"timestamp": "desc"}], "limit":1, "selector": {"timestamp": {"$gt": 0 } } }, function(er, result) {
        if (er) {
            throw er;
        }

        var tmpRes = [];
        for (var i = 0; i < result.docs.length; i++) {
            tmpRes.push({temp: result.docs[i].temp, humidity: result.docs[i].humidity, soilmoisture: result.docs[i].soilmoisture, light:0, timestamp: result.docs[i].timestamp, comments: result.docs[i].comments});
        }
        res.json(tmpRes);
        return;
    });

});

router.get('/sensors', function(req, res) {

    // Initialize the library with my account.
    var cloudant = Cloudant("https://8cd7b256-b57e-4822-ab9f-7dbf2b6a9a8f-bluemix:6f37e8f02528019bb2f86db43e33f49d2172d2e31c933aa9d72f849d8b2e707a@8cd7b256-b57e-4822-ab9f-7dbf2b6a9a8f-bluemix.cloudant.com",
      function(err, cloudant) {
        if (err) {
          return console.log('Failed to initialize Cloudant: ' + err.message);
        }
      }
    );

    var db = cloudant.db.use("agtech");
    db.find({"sort": [{"timestamp": "desc"}], "limit":10, "selector": {"timestamp": {"$gt": 0 } } }, function(er, result) {
        if (er) {
            throw er;
        }

        var tmpRes = [];
        for (var i = 0; i < result.docs.length; i++) {
            tmpRes.push({imageid: result.docs[i].imageid, temp: result.docs[i].temp, humidity: result.docs[i].humidity, soilmoisture: result.docs[i].soilmoisture, light:0, timestamp: result.docs[i].timestamp, comments: result.docs[i].comments});
        }
        res.json(tmpRes);
        return;
    });

});

router.get('/graphs', function (req, res) {
  res.sendFile(path.join(__dirname + '/graph.html'));
});

router.get('/storepackage', function(req, res) {
  var cloudant = Cloudant("https://8cd7b256-b57e-4822-ab9f-7dbf2b6a9a8f-bluemix:6f37e8f02528019bb2f86db43e33f49d2172d2e31c933aa9d72f849d8b2e707a@8cd7b256-b57e-4822-ab9f-7dbf2b6a9a8f-bluemix.cloudant.com",
      function(err, cloudant) {
        if (err) {
          return console.log('Failed to initialize Cloudant: ' + err.message);
        }
      }
  );

  var db = cloudant.db.use('agtech');

  var data = {
    imageid: req.query.imageid,
    score: req.query.score,
    temp: Number(req.query.temp),
    humidity: req.query.humidity,
    soilmoisture: req.query.soilmoisture,
    timestamp: Number(req.query.timestamp)
  }

  db.insert(data, function (err, result) {
    if(err) {
      throw err;
    }

    console.log(result);
    res.json(result);
  })
})

router.post('/cloudant', function (req, res) {
  var timestamp = Number(req.body.timestamp);

  var cloudant = Cloudant("https://8cd7b256-b57e-4822-ab9f-7dbf2b6a9a8f-bluemix:6f37e8f02528019bb2f86db43e33f49d2172d2e31c933aa9d72f849d8b2e707a@8cd7b256-b57e-4822-ab9f-7dbf2b6a9a8f-bluemix.cloudant.com",
      function(err, cloudant) {
        if (err) {
          return console.log('Failed to initialize Cloudant: ' + err.message);
        }
      }
    );

  var db = cloudant.db.use('agtech');

  var select =
  {
    "selector": {
      "timestamp": timestamp
    }
  };

  db.find(select, function(err, result) {
      if (err) {
        throw err;
      }

      var record = result.docs[0];

      if (record.comments == undefined) {
        record.comments = [
          req.body.comment + ' - ' + req.body.author
        ];
      } else {
        record.comments.push(req.body.comment + ' - ' + req.body.author);
      }

      db.insert(record, function(err, result) {
        if (err) {
          throw err;
        }
        console.log(result);
      });
  });

  res.redirect('back');
});


// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

require('./error-handler')(app);

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});