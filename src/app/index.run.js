(function() {
  'use strict';

  angular
    .module('netpieManager')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
