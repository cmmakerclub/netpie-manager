'use strict';
/**
 * @ngdoc function
 * @name netpieManager.controller:devicesCtrl
 * @description
 * # devicesCtrl
 * Controller of the netpieManager
 */

String.prototype.isEmpty = function () {
  return (this.length === 0 || !this.trim());
};

var guid = function (prefix) {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + "-" + new Date().getTime()
}

angular.module('netpieManager')
  .factory("myMqtt", function (mqttwsProvider) {
    var MQTT = mqttwsProvider({});
    console.log(MQTT);
    return MQTT;
  })
  .controller('devicesCtrl', DevicesCtrl);

/** @ngInject */
function DevicesCtrl($scope, $timeout, myMqtt, $localStorage,
  $sessionStorage, $mdSidenav, $mdUtil, $mdDialog, $log, $window) {
  var vm = this;
  $scope.devices = {};
  vm.LWT = {};

  var mqttClient;

  var buildToggler = function buildToggler(navID) {

    var debounceFn = $mdUtil.debounce(function () {

      $mdSidenav(navID)
        .toggle()
        .then(function () {
          $log.debug("toggle " + navID + " is done");
        });
    }, 200);
    return debounceFn;
  }

  $scope.toggleRight = buildToggler('right');

  // load config
  // $scope.config = $localStorage.$default({
  //     // host: 'gearbroker.netpie.io',
  //     // port: 8083,
  //     // username: "BZXrhDBMKutYd68%1443014670",
  //     // password: "i4jmEZaflGYzXxxi2g5byEM5VA4=",
  //     // clientId: "eqSZOmyJ2oXN4CJs"
  //   }
  // });

  var localStorageDefault = {
    devices: {
      config: {
        prefix: "/ChiangMaiMakerClub",
        host: "iot.eclipse.org",
        myName: "",
        port: 80
      },
      checkbox: { clientId: true, userPass: false },
      devices: []
    }
  };

  $localStorage.$default(localStorageDefault);
  $scope.config = $localStorage.devices.config;
  $scope.checkbox = $localStorage.devices.checkbox || {};


  $scope.$watch("checkbox.clientId", function (current, old) {
    if (current === true) {
      $scope.config.clientId = guid("cmmc");
    }
    else {
      $scope.config.clientId = "";
    }
    // $log.debug("check changed", arguments);
  });

  $scope.closeNav = function () {
    $mdSidenav('right').close()
      .then(function () {
        $scope.config = angular.extend({}, $scope.config);
      });
  };


  
  $scope.closeAndSaveNewConfig = function (newConfig) {

    $mdSidenav('right').close()
      .then(function () {
        console.log("NEW CONFIG", newConfig);
        $scope.config = newConfig;
        // $scope.connect();
        $window.location.reload();
      });
  };

  // $scope.config = angular.extend({}, $scope.config.config);
  $scope.onlineStatus = "ALL";
  $scope.filterDevice = {};
  $scope.filterDevice.name = "";


  var onMsg = function (topic, payload) {
    var topics = topic.split("/");


    var incomming_topic = topics[topics.length - 1];

    if (incomming_topic == "online") {
      console.log("online", topics);
      var values = payload.split("|");

      var status = values[0];
      var id = values[1];
      var mac = values[1];

      $log.debug('id', id, "mac", mac, "status", status, new Date());

      if (mac && mac === status) {
        status = "online";
      }

      vm.LWT[mac || id] = status;
      // $scope.devices[mac || id] .status = status;
      if ($scope.devices[mac || id]) {
        $scope.devices[mac || id].status = status;
        console.log(vm);
        $scope.$apply();
      }
    }
    else {
      // console.log("???", );
      var _payload = JSON.parse(payload);
      var _id2 = _payload.info && _payload.info.id;

      console.log("TOPIC", topics, "PAYLOAD", payload)
      var _id = _payload.d && _payload.d.id;
      _payload.status = vm.LWT[_id || _id2] || "ONLINE" || "UNKNOWN";
      _payload.online = _payload.status !== "DEAD";
      $scope.devices[_id || _id2] = _payload;
      delete $scope.devices.undefined;
      $scope.$apply();
    }
  };


  var addListener = function () {
  }

  $scope.showDetail = function (ev, deviceUUIDuuid) {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'app/devices/partials/detail.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      locals: {
        deviceUUID: deviceUUIDuuid,
        devices: $scope.allDevices
      },
    })
      .then(function () {
      }, function () {
        $log.info('You cancelled the dialog.');
        // $scope.message = 'You cancelled the dialog.';
      });
  };

  // var isFirstLogin = function () {

  //   if ($scope.config.host != null && $scope.config.host != "") {
  //     return false;
  //   }
  //   else {
  //     return true;
  //   }

  // }

  // $scope.showFirstPopup = function (ev) {

  //   if (!isFirstLogin()) {
  //     return;
  //   }
  //   $scope.toggleRight();


  //   // $mdDialog.show({
  //   //   controller: FirstPopupDialogController,
  //   //   templateUrl: 'app/devices/partials/firstPopup.html',
  //   //   parent: angular.element(document.body),
  //   //   targetEvent: ev,
  //   //   clickOutsideToClose: false,
  //   // })
  //   // .then(function (newConfig) {

  //   //   $scope.config = newConfig;
  //   //   $scope.config.config = newConfig;

  //   // }, function () {
  //   //   $scope.connect();
  //   // });

  // };

  var remmoveDevices = function () {
    $scope.devices = {};
  }

  $scope.allDevices = function () {
    return $scope.devices;
  }


  //asynchronously
  $scope.connect = function () {
    $scope.status = "CONNECTING";
    if (!$scope.checkbox.userPass) {
      $scope.config.username = "";
      $scope.config.password = "";
    }

    $scope.devices = {};

    angular.forEach($scope.config, function (value, key) {
      if ($scope.config[key] == "") {
        delete $scope.config[key];
      }
    })


    myMqtt.on("message", onMsg);

    var genFailFn = function (type) {
      var failFn = function (error) {
        $scope.failed = true;
        $log.error(type + " FAILED", error)
        $scope.status = type + " FAILED = " + error.errorMessage;
      };
      return failFn;
    }


    var callbacks = {
      "SUBSCRIPTION": { failFn: genFailFn("SUBSCRIPTION") },
      "CONNECTION": { failFn: genFailFn("CONNECTION") },
    }

    // var utils = {
    //   "disconnectGen": function (client) {
    //     var mqttClient = client;
    //     var retFn = function () {
    //       $log.info("disconnection called")
    //       mqttClient.disconnect();
    //     };
    //     return retFn;
    //   }
    // };

    // $scope.operations = {
    // // "subscribe": myMqtt.subscribe("/NatWeerawan/gearname/FpzpfbaVOoAEa7Vp/#"),
    // //   "subscribe": myMqtt.subscribe("/NatWeerawan/gearname/#"),
    // //   "connect": myMqtt.connect(),
    //   "config": $scope.config,
    // //   "disconnect": angular.noop,
    // };

    // console.log("CONFIG", $scope.operations.config);

    // myMqtt.create(localStorageDefault.devices.config)
    var log = $log;
    log.debug('debug', $scope.config);
    myMqtt.create($scope.config)
    .then(function (client) { mqttClient = client; })
    .then(myMqtt.connect)
    .then(myMqtt.subscribe($scope.config.topic_sub))
    .then(function (argument) {
      console.log("?");
    })
    // .then(function (argument) {
    //   console.log("AFTER THEN", mqttClient);
    //   return myMqtt.subscribe();
    // })
    // .then($scope.operations.connect, callbacks.CONNECTION.failFn)
    // .then($scope.operations.subscribe, callbacks.SUBSCRIPTION.failFn)
    // .then(function (mqttClient) { 
    //   if (angular.isUndefined(mqttClient)) {
    //       $log.debug("CONTROLLER", "UNKNOWN FAILED");
    //       $scope.status = "UNKNOWN FAILED";
    //   }
    //   else {
    //     $scope.status = "READY";
    //     $scope.operations.disconnect = utils.disconnectGen(mqttClient);
    //   }
    // });
  }

  $scope.connect();

  $scope.disconnect = function () {
    // mqttLWT.end(remmoveDevices);
    // myMqtt.end(remmoveDevices);
    // mqttXYZ.end(remmoveDevices);
    // $scope.operations.disconnect();
  }

  function DialogController($scope, $mdDialog, deviceUUID, devices) {
    $scope.devices = devices;
    $scope.deviceUUID = deviceUUID;

    $scope.hide = function (config) {
      $mdDialog.hide(config);
    };
    $scope.cancel = function () {
      $mdDialog.cancel();
    };

  }

  // function FirstPopupDialogController($scope, $mdDialog) {

  //   $scope.config = {
  //     host: 'gearbroker.netpie.io',
  //     port: 8083,
  //   };

  //   $scope.save = function (newConfig) {
  //     $mdDialog.hide(newConfig);
  //     $window.reload();
  //   };
  // }

  // if (!isFirstLogin()) {
  //   $scope.connect();
  // }

}
