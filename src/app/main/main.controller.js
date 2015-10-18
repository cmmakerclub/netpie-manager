(function () {
  'use strict';
    String.prototype.isEmpty = function() {
        return (this.length === 0 || !this.trim());
    };

    var guid = function (prefix) {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + "-" +new Date().getTime()
    }

  angular
    .module('netpieManager')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($timeout, toastr, $http, $log, 
      $window, $mdSidenav, $localStorage, $scope) {

      var localStorageDefault = {
        main: {
          config: { 
            prefix: "/ChiangMaiMakerClub",
            host: "iot.eclipse.org",
            myName: "",
            port: 1883
          },
          checkbox: { clientId: true, userPass: false },
          devices: []
        }
      };

      $localStorage.$default(localStorageDefault);
      $scope.config = $localStorage.main.config;

      $scope.tab = $scope.config || {};
      $scope.checkbox = $localStorage.main.checkbox || {};

      $scope.$watch("checkbox.clientId", function  (current, old) {
        if (current === true) {
          $scope.config.clientId = guid("cmmc");
        }
        else {
          $scope.config.clientId = "";
        }
        // $log.debug("check changed", arguments);
      });

      $scope.tabs = $localStorage.main.devices || [];
      $scope.device_count = $scope.tabs.length;
      $scope.selectedIndex = $scope.tabs.length;

      this.generate = function() {
        $log.debug('generate');
        if ($scope.config.myName.isEmpty()) {
          $log.error("EMPTY myName");
        }
        else {

          if ( !$scope.checkbox.userPass ) {
            $scope.config.password = "";
            $scope.config.username = "";
          }

          var obj = angular.copy($scope.config);
          $localStorage.main.devices.push(obj);
          console.log($localStorage.main.devices);
          $scope.config.clientId = guid("cmmc");
          $scope.config.myName = "";
          $scope.tabs = $localStorage.main.devices;
        }
      };

      $scope.loadDevices = function () {
        $scope.devices = $localStorage.main.devices;
        return $localStorage.main.devices;
      }


      this.clear = function() {
        $log.debug('generate');
        $localStorage.main.devices = [];
        $scope.config.clientId = guid("cmmc");
        $scope.tabs = $localStorage.main.devices;
      };
  }// end controller


})();
