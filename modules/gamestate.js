'use strict';

var storage = require('node-persist');
var validators = require('./validators.js');
var extend = require('extend');

var eventsByArea = {};

Object.keys(validators).forEach(function (areaName) {
	eventsByArea[areaName] = {};

	validators[areaName].forEach(function (area) {
		extend(eventsByArea[areaName], area.events);
	});
});

storage.initSync();

var getDefaultStates = function () {
	var result = {};

	Object.keys(validators).forEach(function (areaName) {
		result[areaName] = {};
		var events = eventsByArea[areaName];

		Object.keys(events).forEach(function (eventId) {
			result[areaName][eventId] = events[eventId].default_value;
		});
	});

	return result;
};

var getEventDescription = function (event) {
	var areaValidatorsObj = eventsByArea[event.area];

	for (var eventId in areaValidatorsObj) {
		if (areaValidatorsObj.hasOwnProperty(eventId)) {
			if (eventId === event.id) {
				return areaValidatorsObj[eventId];
			}
		}
	}

	return null;
};

var validateEvent = function (event, eventDescription) {
	if (eventDescription && event) {
		if (eventDescription.type === 'predefined') {
			for (var i = 0; i < eventDescription.possible_values.length; i++) {
				if (event.param === eventDescription.possible_values[i]) {
					return true;
				}
			}
			return false;
		} else if (eventDescription.type === 'number') {
			return parseInt(event.param).toString() === event.param;
		} else if (eventDescription.type === 'none') {
			return event.param === '';
		} else if (eventDescription.type === 'array') {
			return Array.isArray(event.param);
		} else {
			return (typeof event.param === eventDescription.type);
		}
	} else {
		return false;
	}
};

var checkForGameStart = function (event) {
	if (event.area === 'zombie' && event.id === 'game_status' && event.param === 'game_started' && currentStates.zombie.game_status !== 'game_started') { // TODO - include that info in validation jsons
		currentStates.zombie = getDefaultStates().zombie;
        currentStates.zombie.game_started_time = new Date();
	}

	if (event.area === 'alice' && event.id === 'game_started' && event.param.toString() === 'true' && currentStates.alice.game_started.toString() !== 'true') {
		currentStates.alice = getDefaultStates().alice;
        currentStates.alice.game_started_time = new Date();
	}
};

var validateAndApplyEvent = function (event) {
	var eventDescription = getEventDescription(event);

	var isValid = validateEvent(event, eventDescription);
	logEvent(event, isValid);
	if (!isValid) {
		return false;
	} else {
		checkForGameStart(event);
		currentStates[event.area][event.id] = event.param;
		storage.setItem('gamestates', currentStates);
		return true;
	}

};

var logEvent = function (event, isValid) {
	var date = new Date();
	var timestamp = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

	var fs = require('fs');
	var log = fs.createWriteStream('logs/log_' + timestamp + '.txt', { 'flags': 'a' });
	log.end(JSON.stringify({ isValid: isValid, event: event }));
};

var isAnswerExpected = function (event) {
	var eventDescription = getEventDescription(event) || {};

	return !!eventDescription.answer;
};

var validateResponse = function (event, json) {
	var eventDescription = getEventDescription(event);

	if (eventDescription && eventDescription.answer) {
		if (eventDescription.answer.type === 'array' && Array.isArray(json)) {
			return true; // TODO
		} else {
			return false;
		}
	}
	else {
		return false;
	}
};


var currentStates = extend({}, getDefaultStates(), storage.getItem('gamestates') || {});

module.exports = {
	getGameState: function () {
		return currentStates;
	},
	isAnswerExpected: isAnswerExpected,
	validateResponse: validateResponse,
	validateAndApplyEvent: validateAndApplyEvent
};
