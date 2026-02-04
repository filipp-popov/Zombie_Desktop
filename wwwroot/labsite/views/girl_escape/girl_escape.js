angular.module('myApp.girlEscape', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		'use strict';
		$routeProvider.when('/girl_escape', {
			templateUrl: 'views/girl_escape/girl_escape.html',
			controller: 'GirlEscapeCtrl',
			resolve: {
				isObserver: function () {
					return false;
				}
			}
		});

		$routeProvider.when('/girl_escape_observer', {
			templateUrl: 'views/girl_escape/girl_escape.html',
			controller: 'GirlEscapeCtrl',
			resolve: {
				isObserver: function () {
					return true;
				}
			}
		});
	}
	]);