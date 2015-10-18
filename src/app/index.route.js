(function() {
  'use strict';

  angular
    .module('netpieManager')
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      })

      .state('netpie', {
        url: '/netpie',
        templateUrl: 'app/netpie/partials/netpie.html',
        controller: 'netpieCtrl',
        controllerAs: 'netpieCtrl'
      })
      ;

    $urlRouterProvider.otherwise('/');
  }

})();
