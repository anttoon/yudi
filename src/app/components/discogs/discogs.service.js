(function () {
  'use strict';
  angular
    .module('yudi')
    .factory('discogs', discogs);
  /** @ngInject */
  function discogs($http, $q, $sessionStorage, $window) {

    var discogs = {};

    // var from = 1990;
    // var to = 2015;
    var api = 'https://api.discogs.com/'
    var token = 'YOIaShyIrjcubyScocKXKnIjkhVXwGnKgLGDJrBa';
    var pathToken = '&token=' + token;
    var queLength = 1;

    discogs.style = $sessionStorage.$default({
      current: 'dub techno'
    });
    discogs.fetchTrigger = 0;
    discogs.videoTitle = '';
    discogs.videoPath = null;
    discogs.videoQue = $sessionStorage.$default({
      list: []
    });
    discogs.pages = 0;
    discogs.pageData = {};

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

    discogs.playNext = function () {
      discogs.videoQue.list.shift();
      discogs.setVideo();
      discogs.fetch();
    }

    discogs.auth = function () {
      var nonceObj = Math.round((new Date()).getTime() / 1000.0);
      var string = 'OAuth oauth_consumer_key="IFacfLZuREoDDxzmSRzk", oauth_nonce="' + nonceObj + '", oauth_signature="sgnPtvxhrGLUeSOwWRQfrnvBaXUIINtx&", oauth_signature_method="PLAINTEXT", oauth_timestamp="' + nonceObj + '", oauth_callback="' + $window.location.href + '"';
      var req = {
        method: 'GET',
        url: 'https://api.discogs.com/oauth/request_token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'OAuth'
        },
        data: {
          test: 'test'
        }
      }
      console.log('headers', req.headers.Authorization);

      $http(req).success(function(data, status, headers){
        console.log('success', data, status, headers);
      }).error(function(data, status, headers){
        console.log('error', data, status, headers);
      });
    }

    discogs.setVideo = function () {
      console.log('discogs.videoQue', discogs.videoQue);
      discogs.videoTitle = discogs.videoQue.list[0].title;
      discogs.videoPath = discogs.videoQue.list[0].uri.replace("watch?v=", "v/");
    }

    discogs.fetch = function () {

      return $q(function (resolve, reject) {

        // Collect number of pages.
        discogs.getPages()
          .success(function (data) {

            console.log('Collect pagination info', data);
            // Store number of pages.
            discogs.pages = data.pagination.pages;

            // Pic random page and fetch it.
            discogs.getRandomPage()
              .success(function (data) {
                console.log('Random page fetched', data);

                // Store this hole page.
                discogs.pageData = data.results;

                // Pick a video from random item in page.
                discogs.getAVideo()
                  .then(function (data) {
                    discogs.videoQue.list.push(data);
                    discogs.fetchTrigger++;
                    resolve(data);
                  });
              });

          });
      });

    }

    discogs.getPages = function () {
      return $http.get(api + 'database/search?style=' + encodeURI(discogs.style.current) + pathToken)

    }

    discogs.getRandomPage = function () {
      var page = Math.floor((Math.random() * discogs.pages) + 1);
      return $http.get(api + 'database/search?page=' + page + '&style=' + encodeURI(discogs.style.current) + pathToken)

    }

    discogs.getAVideo = function () {
      var keepSearching = true;
      var busy;
      return $q(function (resolve, reject) {
        var func = function (videos) {
          var randomVideo = Math.floor((Math.random() * videos.length))
          console.log('chosing: ' + randomVideo + ' of:', videos);
          resolve(videos[randomVideo]);
        }
        discogs.tryForVideo(func);
      });
    }

    discogs.tryForVideo = function (callback) {
      var testItem = Math.floor((Math.random() * discogs.pageData.length));
      console.log('testing item ' + testItem + ' of page');
      return $http.get(api + 'releases/' + discogs.pageData[testItem].id)
        .then(function (response) {
          // Do your filters here.
          if (response.data.videos && response.data.videos.length) {
            callback(response.data.videos);
          } else {
            discogs.tryForVideo(callback);
          }
        }, function () {
          discogs.tryForVideo(callback);
        });
    }

    return discogs;
  };
})();

