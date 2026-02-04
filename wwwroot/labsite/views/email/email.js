angular.module('myApp.email', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		'use strict';

		$routeProvider.when('/email', {
			templateUrl: 'views/email/email.html',
			controller: 'emailCtrl'
		});
	}
	])

	.controller('emailCtrl', ['$scope', 'labEmailService', function ($scope, labEmailService) {
		'use strict';

		$scope.state = labEmailService.state;
		$scope.state.displayedEmailIndex = 1;

		$scope.onEmailClick = function (index, email) {
			$scope.state.displayedEmailIndex = index;
			email.unread = false;
		};
		$scope.getTimestamp = function (momentDate) {
            var momentDate = new moment(momentDate);
			if (momentDate.isBefore($scope.state.today)) {
				return momentDate.format('H:mm, MMM, DD');
			} else {
				return momentDate.format('H:mm');
			}

		};

		$scope.getRemovedBeforeDate = function () {
			return $scope.state.today.clone().add(-2, 'days').format('YYYY-MMM-DD');
		};
        
        $scope.vm = {};
        $scope.vm.getUnreadEmails = function () {
            return labEmailService.state.emails.filter(function (email) { return email.unread; }).length;
        }
	}
	])

	.filter('unsafe', [
		'$sce', function ($sce) {
			'use strict';

			return function (val) {
				return $sce.trustAsHtml(val);
			};
		}
	]);
