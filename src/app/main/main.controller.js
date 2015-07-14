(function () {
  'use strict';

  angular
    .module('yudi')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $sce, discogs) {
    var youtubeSettings = '?modestbranding=1&autoplay=1&iv_load_policy=3&rel=0&theme=light';

    // Initialize discogs.
    discogs.init();

    // Scoping fuctionality.
    $scope.embed = {}
    $scope.next = {}
    $scope.style = discogs.style.current;

    // Setting defaults on a sync values.
    $scope.embed.path = null;
    $scope.next.label= 'next';

    // Watch async trigger attribute.
    $scope.$watch(function () { return discogs.fetchTrigger }, function (newValue) {

      console.log('Updating iframe src', newValue);
      if (discogs.videoPath !== null) {
        // Update scope.
        videoUpdate();
      }
    });

    // Changing scope varables on path update.
    function videoUpdate () {
      $scope.embed.path = $sce.trustAs('resourceUrl', discogs.videoPath + youtubeSettings);
      $scope.embed.title = discogs.videoTitle;
      $scope.next.label = discogs.videoQue.list[1] ? 'next: ' + discogs.videoQue.list[1].title : '...'
    }


    /**
     * next.play()
     * Asking discogs service to make next in que first.
     */
    $scope.next.play = function () {
      discogs.playNext();
    }


    $scope.pickStyle = function (style) {
      // Update style text.
      $scope.style = style;
      // Set new style in service
      discogs.style.current = style;
      // Hide picker.
      $scope.showStylePicker = false;
      // Clear que.
      discogs.videoQue.list = [];
      // Initiate with new style.
      discogs.init();
    }

    $scope.signIn = function () {
      discogs.auth();
    }
  }
})();

