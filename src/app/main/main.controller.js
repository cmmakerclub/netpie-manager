(function () {
  'use strict';

  angular
    .module('netpieManager')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($timeout, toastr,
    $http, $log, $window, 
    $localStorage, $scope) {
    var vm = this;
    vm.classAnimation = '';

    activate();

    function activate() {
      $timeout(function () {
        vm.classAnimation = 'rubberBand';
      }, 4000);
    }

    vm.clear = function () {
      $log.debug("Wipe the data. Reloading..");
      $localStorage.$reset({});
      $window.location.reload();
      // toastr.info('Curious?', 'Information');
    };

    var STORAGE_KEY = 'netpie_manager';
    var _storage = $localStorage.$default({ 
      'netpie_manager': { netpie: {} }, netpieApp: [] });
    var STORAGE = _storage[STORAGE_KEY];

    $scope.config = STORAGE.netpie;
    $scope.latest_device = STORAGE.latest_device;
    $scope.device_count = STORAGE.devices && STORAGE.devices.length || 0; 


    vm.generate = function () {
      var endpoint = "https://netpie-api.herokuapp.com/api/";
      endpoint += $scope.config.netpie.appKey + "/";
      endpoint += $scope.config.netpie.appSecret + "/";
      endpoint += $scope.config.netpie.appId;
      endpoint += "?callback=JSON_CALLBACK";

      $scope.loading = true;

      $http.jsonp(endpoint)
        .success(function (data) {
          var appId = $scope.config.netpie.appId;
          delete data.protocolVersion;
          delete data.keepalive;
          // delete data.
          data.appId = $scope.config.netpie.appId;
          data.appKey = $scope.config.netpie.appKey;
          data.appSecret = $scope.config.netpie.appSecret;
          data.prefix = "/"+ appId +"/gearname";
          STORAGE.latest_device = data;
          var devices = STORAGE.devices || [];
          devices.push(data);
          $log.debug(devices);
          STORAGE.devices = devices;
          $scope.device_count = devices.length;
          $scope.latest_device = STORAGE.latest_device;
          $scope.loading = false;
          $scope.failed = false;
        })
        .error(function () {
          $log.debug("FAILED");
          STORAGE.latest_device = {};
          $scope.loading = false;
          $scope.failed = true;
          $scope.appError = "Failed: " + arguments[1] + " " + arguments[0];
        });
    };

  }


})();
