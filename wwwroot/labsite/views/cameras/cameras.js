angular.module('myApp.labCameras', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        'use strict';
        $routeProvider.when('/cameras', {
            templateUrl: 'views/cameras/empty-cameras.html'
        });
    }
    ])

    .controller('labCamerasCtrl', ['$scope', '$location', '$rootScope', function ($scope, $location, $rootScope) {
        'use strict';
        $scope.urls = [
            'http://localhost:8888/1',
            'http://localhost:8888/2',
            'http://localhost:8888/3',
            'http://localhost:8888/4',
            'http://localhost:8888/5',
            'http://localhost:8888/6',
            'http://localhost:9999/7',
            'http://localhost:9999/8',
            'http://localhost:9999/9'
        ];

        $scope.selectedVideo = null;

		$rootScope.$watch('game_started', function (newVal, oldVal) {
                if (!newVal) {
                    $scope.selectedVideo = null;
                }
            });
		
        $scope.state = {
            selectedUrl: 'videos/mov_bbb_1.mp4'
        };

        $scope.isVisible = function () {
            return $location.path() === '/cameras';
        };
        
        $scope.supressVideos = function () {
            return $location.search().supressVideos === "true";
        };

        $scope.selectCamera = function(num){
            if($scope.selectedVideo === num){
                $scope.selectedVideo = null;
            } else {
                $scope.selectedVideo = num;
            }
        };

        $scope.isVideoSelected = function(num){
            return $scope.selectedVideo === num;
        };
    }
    ])

    .filter('unsafe', [
        '$sce', function ($sce) {
            'use strict';
            return function (val) {
                return $sce.trustAsHtml(val);
            };
        }]); // TODO - duplication
