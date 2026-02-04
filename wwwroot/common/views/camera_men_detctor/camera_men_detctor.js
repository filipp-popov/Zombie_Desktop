'use strict';

angular.module('myApp.menDetectorPage', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/camera', {
			templateUrl: '../common/views/camera_men_detctor/camera_men_detctor.html',
			controller: 'menDetectorCtrl'
		});
	}
	])

	.controller('menDetectorCtrl', ['$scope', function ($scope) {
		$scope.events = [];
		$scope.cameras = [];
		$scope.people = [];
		$scope.$on('stateUpdated', function (evnt, obj) {

			if (obj.area === 'zombie') {
				$scope.cameras = obj.state.sonar_calibration;

				var sonar = obj.state.sonar;
				for (var i = 0; i < $scope.cameras.length; i++) {
					var camera = $scope.cameras[i];
					camera.people = [];

					for (var j = 0; j < sonar.length; j++) {
						var person = sonar[j];

						if (person.cam_id === camera.cam_id) {
							camera.people.push(person);
						}
					}
				}
			}
			$scope.$digest();
		});

		$scope.$on('eventReceived', function (evnt, obj) {
			$scope.events.push({
				time: moment().format('YYYY-MM-DD HH:mm:ss'),
				event: obj
			});
			$scope.$digest();			
		});
	}
	]);

