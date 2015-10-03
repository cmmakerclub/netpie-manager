/* global toastr:false, moment:false */
(function() {
  'use strict';
  angular
    .module('netpieManager')
    .constant('toastr', toastr)
    .constant('moment', moment);
})();
