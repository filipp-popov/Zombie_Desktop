angular.module('myApp')
	.factory('statePopulator', ['config', '$q', '$http',
	function (config, $q, $http) {
		'use strict';
		var validatorsLoaded = false;
		var validatorsLoading = false;
		var validatorLoadingPromise = null;

		var validators = {};

		var loadValidatorsPromise = function () {
			if (validatorsLoaded) {
				return $q.when(validators);
			}

			if (validatorsLoading) {
				return validatorLoadingPromise;
			}

			validatorsLoading = true;
			var promises = [];

			var getValidator = function (areaName) {
				promises.push($http.get('../../validation/' + areaName + '.json').then(function (result) {
					validators[areaName] = result.data;
				}));
			};

			for (var i = 0; i < config.areas.length; i++) {
				getValidator(config.areas[i]);
			}

			validatorLoadingPromise = $q.all(promises).then(function () {
				validatorsLoading = false;
				validatorsLoaded = true;
				return validators;
			});

			return validatorLoadingPromise;
		};

		var getDefaultObject = function (areas) {
			var result = {};

			for (var i = 0; i < areas.length; i++) {
				var area = areas[i];
				for (var eventId in area.events) {
					if (area.events.hasOwnProperty(eventId)) {
						result[eventId] = area.events[eventId].default_value;
					}
				}
			}

			return result;
		};

		var getEmptyStatePromise = function () {
			return loadValidatorsPromise().then(function (validators) {
				var result = {};

				for (var i = 0; i < config.areas.length; i++) {
					var areaName = config.areas[i];

					result[areaName] = getDefaultObject(validators[areaName]);
				}

				return result;
			});
		};

		return {
			loadValidatorsPromise: loadValidatorsPromise,
			getEmptyStatePromise: getEmptyStatePromise,
			patchGameState: function (state, event) {
				state[event.area][event.id] = event.param;
			}
		};
	}
]);
