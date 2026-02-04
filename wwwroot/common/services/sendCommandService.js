angular.module('myApp')
	.factory('sendCommandService', ['config', '$http',
		function (config, $http) {
			'use strict';

			var targets = {
				fromControlUnitToLocal: 0,
				fromLocalToControlUnit: 1,
				fromOutsideToLocalForControlUnit: 2
			};

			var getRequestUrl = function (eventId, parameterValue, area, target) {
				var pathAndQuery;
				var value = '';
				if (typeof parameterValue !== 'undefined' && parameterValue !== null) {
					value = parameterValue.toString();
				}

				var query = '?area=' + area + '&id=' + eventId + '&param=' + value;

				pathAndQuery = config.control_unit_url + '/event' + query; // default

				if (target === targets.fromOutsideToLocalForControlUnit) {
					pathAndQuery = config.local_server_example_url + '/command' + query;
				}

				if (target === targets.fromControlUnitToLocal) {
					pathAndQuery = config.local_server_example_url + '/event' + query;
				}

				return pathAndQuery;
			};

			var sendRequest = function (url, isPost, bodyJson) {
				if (isPost) {
					$http({
						url: url,
						method: 'POST',
						data: bodyJson
					});
				} else {
					$http.get(url);
				}
			};
			
			var sendRequestByParams = function(eventId, parameterValue, area, isPost, bodyJson, target) {
				sendRequest(getRequestUrl(eventId, parameterValue, area, target), isPost, bodyJson);
			};
            
            var sendPlaySoundRequest = function(sound_id, area) {
              var url = getRequestUrl("play_sound", sound_id, area, targets.fromLocalToControlUnit);
              
                 sendRequest(url);
            };

			return {
				Targets: targets,
				getRequestUrl: getRequestUrl,
				sendRequestByUrl: sendRequest,
				sendRequestByParams: sendRequestByParams,
                sendPlaySoundRequest: sendPlaySoundRequest
			};
		}]);