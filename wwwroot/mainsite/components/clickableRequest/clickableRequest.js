angular.module('myApp')

	.directive('clickableRequest', [function () {
		'use strict';
		return {
			restrict: 'A',
			transclude: true,
			templateUrl: 'components/clickableRequest/clickableRequest.html',
			scope: {
				area: '=',
				eventDescription: '=',
				eventId: '='
			}
		};
	}
	])

	.directive('urlSamplesWithValue', ['$http', 'config', 'sendCommandService', function ($http, config, sendCommandService) {
		'use strict';

		return {
			restrict: 'A',
			transclude: true,
			templateUrl: 'components/clickableRequest/urlSamples.html',
			scope: {
				urlSamplesWithValue: '='
			},
			link: function (scope) {
				var getUrl = function (target) {
					// not writeonly :(
					return sendCommandService.getRequestUrl(scope.$parent.eventId, scope.urlSamplesWithValue, scope.$parent.area, target);
				};

				scope.can_send_to_control_unit = scope.$parent.eventDescription.can_send_to_control_unit;
				scope.bodyText = JSON.stringify(scope.$parent.eventDescription.example_body);
				scope.isPost = scope.$parent.eventDescription.method && scope.$parent.eventDescription.method.toLowerCase() === 'post';

				scope.Targets = sendCommandService.Targets;

				scope.getUrl = getUrl;
				// url, isPost, bodyJson
				scope.sendRequest = function (target) {
					sendCommandService.sendRequestByUrl(getUrl(target), scope.isPost, !scope.bodyText ? '' : JSON.parse(scope.bodyText));
				};
			}
		};
	}
	]);
