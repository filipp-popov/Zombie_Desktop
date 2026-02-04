'use strict';

angular.module('myApp.configPage', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/config', {
				templateUrl : 'views/config/config.html',
				controller : 'configPageCtrl'
			});
		}
	])

.controller('configPageCtrl',
	['$scope', '$http', function ($scope, $http) {
			$scope.addNewVisible = false;
			$scope.newPerson = {};
			$scope.clearPerson = function (person) {
				person.name = '';
				person.cards = [];
				person.bracers = [];
			};

			$scope.persons = [];

			$scope.savePerson = function (person) {
				$scope.persons.push(angular.extend({}, person));
				$scope.clearPerson(person);
				$scope.addNewVisible = false;
			};

			$scope.saveToDisk = function (persons) {
				$http({
					method : 'POST',
					url : '../api/persons', // TODO
					headers : {
						'Content-Type' : 'application/json'
					},
					data : persons
				});
			};

			$scope.loadFromDisk = function () {
				$http({
					method : 'GET',
					url : '../api/persons', // TODO
				}).then(function (result) {
					$scope.persons = result.data;
				});
			};

			$scope.clearPerson($scope.newPerson);
			$scope.loadFromDisk();
		}
	]);
