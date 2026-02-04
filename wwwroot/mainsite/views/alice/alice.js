'use strict';

angular.module('myApp.alice', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/alice', {
		templateUrl: 'views/alice/alice.html',
		controller: 'AlicePageCtrl'
	});
}
])

	.controller('AlicePageCtrl', ['$scope', '$http', '$q', 'config', function ($scope, $http, $q, statePopulator, config) {
	$scope.events = [];
	$scope.config = config;
	$scope.gameState = {};

	$scope.$on('stateUpdated', function (evnt, stateObj) {
		$scope.gameState[stateObj.area] = stateObj.state;
		$scope.$digest();
	});
}
]);
