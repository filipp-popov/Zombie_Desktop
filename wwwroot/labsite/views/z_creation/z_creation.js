'use strict';

angular.module('myApp.zCreation', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/main', {
				templateUrl : 'views/z_creation/z_creation.html',
				controller : 'zCreationCtrl'
			});
		}
	])

.controller('zCreationCtrl', ['$scope', '$rootScope', 'zCreationService', function ($scope, $rootScope, zCreationService) {
			$scope.state = zCreationService.state;
			
			$rootScope.$watchGroup([function() {
				return $scope.state.isFirstStageComplete();
			}, 'isLoggedIn', 'game_started'], function (newValues) {
				if (newValues[0] && newValues[1] && newValues[2]) {
					$scope.state.setEnabledCardReader(true);
				} else {
					$scope.state.setEnabledCardReader(false);
				}
			});

			$scope.update = function($event){
				var elem = $event.target;
				var tabindex = parseInt(elem.getAttribute('tabindex'));
				if(elem.getAttribute('maxLength') - elem.value.length === 0){
					$('[tabindex=' + (tabindex + 1) + ']').focus();
				}
				return true;
			};
		}
	]);
