'use strict';

angular.module('myApp.testPage', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/testRequests', {
		templateUrl: 'views/testRequests/testRequests.html',
		controller: 'testRequestsCtrl'
	});
}
])

	.controller('testRequestsCtrl', ['$scope', '$http', '$q', 'statePopulator', function ($scope, $http, $q, statePopulator) {
	$scope.scrollToElement = function (id) {
		var element = document.getElementById(id);
		element.scrollIntoView();
	};

	statePopulator.loadValidatorsPromise().then(function (validators) {
		$scope.areaValidators = validators;
	});

	$scope.cfg = { areaToShow: 'zombie' };

}
]);
