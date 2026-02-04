'use strict';

angular.module('myApp.mainPage', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/main', {
		templateUrl: 'views/main/MainPage.html',
		controller: 'MainPageCtrl'
	});
}
])

	.controller('MainPageCtrl', ['$scope', '$http', '$q', 'config', function ($scope, $http, $q, statePopulator, config) {
	$scope.events = [];
	$scope.config = config;
	$scope.gameState = {};

	$scope.$on('stateUpdated', function (evnt, stateObj) {
		$scope.gameState[stateObj.area] = stateObj.state;
		$scope.$digest();
	});
}
]);
