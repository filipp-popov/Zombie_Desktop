angular.module('myApp')
	.directive('eventsListener', ['$rootScope', '$http',
		function ($rootScope, $http) {
			'use strict';
			return {
				restrict: 'A',
				transclude: true,
				link: function () {
					var socket = io();

					socket.on('stateUpdated', function (msg) {
						$rootScope.$broadcast('stateUpdated', msg);
					});

					socket.on('eventReceived', function (msg) {
						$rootScope.$broadcast('eventReceived', msg);
					});

					$rootScope.$on('$locationChangeSuccess', requestStateUpdate);
					$rootScope.$on('$routeChangeSuccess', requestStateUpdate);

					function requestStateUpdate() {
						$http.get('/reloadState');
					}
				}
			};
		}
	]);
