'use strict';

angular.module('myApp.adminZombie', ['ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/adminZombie', {
      templateUrl: 'views/adminZombie/adminZombie.html',
      controller: 'adminZombieCtrl'
    });
  }
  ])

  .controller('adminZombieCtrl', ['$scope', '$http', '$q', 'config', 'sendCommandService',
    function($scope, $http, $q, config, sendCommandService) {
      $scope.events = [];
      $scope.config = config;
      $scope.gameState = {};
      $scope.languages = [];

      var target = sendCommandService.Targets.fromLocalToControlUnit; // todo - change after tests

      $scope.sendPlaySoundRequest = sendCommandService.sendPlaySoundRequest;

      $scope.$on('stateUpdated', function(evnt, stateObj) {
        if (stateObj.area === 'zombie') {
          $scope.gameState[stateObj.area] = stateObj.state;
          $scope.$digest();
        }
      });

      $scope.sendGetCommand = function(eventId, paramValue) {
        var url = sendCommandService.getRequestUrl(eventId, paramValue, 'zombie', target);
        sendCommandService.sendRequestByUrl(url);
      };


      $http.get('../../validation/zombie.json').then(function(response) {
        var events = response.data.reduce(function(aggregate, cur) {
          return angular.extend(aggregate, cur.events);
        }, {});
        $scope.languages = events.game_language.possible_values;
      });

      var gameFinishedTime = null;
      $scope.getTimeStampGameLength = function(timeStr) {
        var dt = new Date(Date.parse(timeStr));
        if ($scope.gameState && $scope.gameState.zombie && $scope.gameState.zombie.final_box_in_progress && !gameFinishedTime) {
          gameFinishedTime = moment();
        }

        if ($scope.gameState && $scope.gameState.zombie && !$scope.gameState.zombie.final_box_in_progress) {
          gameFinishedTime = null;
        }

        var diff = (gameFinishedTime || moment()).diff(dt, 'seconds');
        var seconds = diff % 60;
        var minutes = Math.floor(diff / 60) % 60;
        var hours = Math.floor(diff / 3600);

        return prependLeadingZeroes(hours.toString()) + ":"
          + prependLeadingZeroes(minutes.toString()) + ":"
          + prependLeadingZeroes(seconds.toString());
      }

      $scope.getTimeStampDate = function(timeStr) {
        var dt = new Date(Date.parse(timeStr));

        return prependLeadingZeroes(dt.getHours().toString()) + ":"
          + prependLeadingZeroes(dt.getMinutes().toString()) + ":"
          + prependLeadingZeroes(dt.getSeconds().toString());

      }

      function prependLeadingZeroes(str) {
        if (str.length === 1) {
          return "0" + str;
        }

        str = str + "00";
        return str.substr(0, 2);
      }

      $('#sterilizer_lock_on')
        .checkbox().first().checkbox({
          onChange: function(res) {
            var isChecked = $(this).checkbox('is checked');
            var isChecked2 = $('#sterilizer_lock_on').checkbox().first().checkbox('is checked');
            console.log('onChange called - ' + isChecked);
          }
        });
    }
  ]);

