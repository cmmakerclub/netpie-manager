(function () {
  'use strict';

  angular
    .module('netpieManager')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($timeout, toastr,
    $http,
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
      // console.log("CLEAR");
      toastr.info("DO NOTHING");
    };

    vm.generate = function () {

    };

    var storage = $localStorage.$default({ 'netpie_manager': { netpie: {} }, netpieApp: [] });

    $scope.config = storage.netpie_manager.netpie;
    $scope.data = storage.netpie_manager.data;


    vm.generate = function () {
      var endpoint = "https://netpie-api.herokuapp.com/api/";
      endpoint += $scope.config.netpie.appKey + "/";
      endpoint += $scope.config.netpie.appSecret + "/";
      endpoint += $scope.config.netpie.appId;
      endpoint += "?callback=JSON_CALLBACK";

      $scope.loading = true;

      $http.jsonp(endpoint)
        .success(function (data) {
          delete data.protocolVersion;
          // delete data.
          data.prefix = "/"+$scope.config.netpie.appId+"/gearname/"
          // console.log(data);
          storage['netpie_manager'].data = data;
          $scope.data = storage['netpie_manager'].data;
          $scope.loading = false;
          $scope.failed = false;
        })
        .error(function () {
          console.log("FAILED");
          storage['netpie_manager'].data = {};
          $scope.loading = false;
          $scope.failed = true;
          $scope.appError = "Failed: " + arguments[1] + " " + arguments[0];
        });
    }

  }


})();
