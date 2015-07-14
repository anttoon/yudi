(function () {
  'use strict';

  angular
    .module('yudi', [
      'ngAnimate',
      'ngTouch', // Mobile gestures support
      'ngSanitize', // Sanitice inputs.
      'ui.router', // Better routing.
      'ngStorage' // Local and session storage
    ]);

})();

