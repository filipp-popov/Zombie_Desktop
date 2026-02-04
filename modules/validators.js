'use strict';

var validationDir = './validation';
var fs = require('fs');
var path = require('path');

var getValidatorsObject = function () {
	var result = {};
	var dir = path.normalize(validationDir);
	var validatorFiles = fs.readdirSync(dir);

	for (var i = 0; i < validatorFiles.length; i++) {
		var fileName = validatorFiles[i];
		var filePath = path.join(dir, fileName);

		var file = fs.readFileSync(filePath, 'utf8');

		result[fileName.substr(0, fileName.lastIndexOf('.'))] = JSON.parse(file);
	}

	return result;
};

var validators = getValidatorsObject();

module.exports = validators;