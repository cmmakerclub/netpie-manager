'use strict';
/**
 * @ngdoc directive
 * @name gulpAngularMqttWs.directive:sidebarMqttConfig
 * @description
 * # sidebarMqttConfig
 */
angular.module('netpieManager')
  .directive('sidebarMqttConfig', function () {
    return {
      templateUrl: 'app/devices/partials/sidebar.html',
      restrict: 'E',
      link: function(scope, element, attrs) {
        // element.text('this is the sidebarMqttConfig directive');
      }
    };
  });
