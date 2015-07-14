(function () {
  'use strict';
  angular
    .module('yudi')
    .factory('discogs', discogs);
  /** @ngInject */
  function discogs($http, $q, $sessionStorage, $window) {

    // Setting up retun object.
    var discogs = {};

    // var from = 1990;
    // var to = 2015;
    var api = 'https://api.discogs.com/'
    var token = 'YOIaShyIrjcubyScocKXKnIjkhVXwGnKgLGDJrBa';
    var pathToken = '&token=' + token;
    var queLength = 1;

    // Attribute to watch for async updates.
    discogs.fetchTrigger = 0;

    // Placeholders.
    discogs.videoTitle = '';
    discogs.videoPath = null;
    discogs.pages = 0;
    discogs.pageData = {};

    // Remember que in storage.
    discogs.videoQue = $sessionStorage.$default({
      list: []
    });

    // Latest chosen style with default
    discogs.style = $sessionStorage.$default({
      current: 'dub techno'
    });

    /**
     * init()
     * Fetch one video then fill the que.
     */
    discogs.init = function () {
      discogs.fetch()
        .then(function (video) {

          // Ready first video.
          discogs.setVideo()

          // Fill que.
          for (var i = queLength - 1; i >= 0; i--) {
            discogs.fetch();
          };
        });

    }

    /**
     * playNext()
     * Directs all chores that needs to be done.
     */
    discogs.playNext = function () {
      // Remove first que item.
      discogs.videoQue.list.shift();
      // Sett video after updating que.
      discogs.setVideo();
      // Fill que.
      discogs.fetch();
    }

    /**
     * auth()
     * authenticate user.
     */
    discogs.auth = function () {
      console.log('doing some auth');
    }

    /**
     * setVideo()
     * Setting parameters with details from first que item.
     */
    discogs.setVideo = function () {
      console.log('preparing new video', discogs.videoQue);
      discogs.videoTitle = discogs.videoQue.list[0].title;
      // make path embedable.
      discogs.videoPath = discogs.videoQue.list[0].uri.replace("watch?v=", "v/");
    }

    /**
     * fetch()
     * Fetching a video and adding it last in que.
     * @return promise
     */
    discogs.fetch = function () {

      return $q(function (resolve, reject) {

        // Collect number of pages.
        discogs.getPages()
          .success(function (data) {

            console.log('Number of pages for ' + discogs.style.current, data.pagination.pages);
            // Store number of pages.
            discogs.pages = data.pagination.pages;

            // Pic random page and fetch it.
            discogs.getRandomPage()
              .success(function (data) {
                console.log('Random page picked and fetched', data.results);

                // Store this whole page.
                discogs.pageData = data.results;

                // Pick one video from random item in page.
                discogs.getAVideo()
                  .then(function (data) {

                    // Add video last in the que.
                    discogs.videoQue.list.push(data);

                    // Update async trigger.
                    discogs.fetchTrigger++;

                    // Resolve promise.
                    resolve(data);
                  });
              });

          });
      });

    }

    /**
     * getPages()
     * @return HttpPromise
     */
    discogs.getPages = function () {
      return $http.get(api + 'database/search?style=' + encodeURI(discogs.style.current) + pathToken)
    }

    /**
     * getRandomPage()
     * @return HttpPromise
     */
    discogs.getRandomPage = function () {
      var page = Math.floor((Math.random() * discogs.pages) + 1);
      return $http.get(api + 'database/search?page=' + page + '&style=' + encodeURI(discogs.style.current) + pathToken)
    }

    /**
     * getRandomPage()
     * Try to fetching items until requirements are met.
     * @return Promise
     */
    discogs.getAVideo = function () {
      var keepSearching = true;
      var busy;
      return $q(function (resolve, reject) {
        // callback function.
        var func = function (videos) {
          var randomVideo = Math.floor((Math.random() * videos.length))
          console.log('Found video in index ' + randomVideo + ' of:', videos);
          resolve(videos[randomVideo]);
        }

        // Start video check loop.
        discogs.tryForVideo(func);
      });
    }

    /**
     * tryForVideo()
     * @param  {Function}
     * @return HttpPromise
     */
    discogs.tryForVideo = function (callback) {
      // Random index to test.
      var testItem = Math.floor((Math.random() * discogs.pageData.length));
      console.log('testing item ' + testItem);
      return $http.get(api + 'releases/' + discogs.pageData[testItem].id)
        .then(function (response) {

          // Do your filters here.
          if (response.data.videos && response.data.videos.length) {
            // Success we have found a video.
            callback(response.data.videos);
          } else {
            // No videos for this index.
            discogs.tryForVideo(callback);
          }
        }, function () {
          // call failed, lets try again.
          discogs.tryForVideo(callback);
        });
    }

    return discogs;
  };
})();

