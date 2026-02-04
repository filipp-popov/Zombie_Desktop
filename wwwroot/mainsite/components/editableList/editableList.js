'use strict';

angular.module('myApp')
.directive('editableList', [
		function () {
			return {
				restrict : 'A',
				transclude : true,
				templateUrl : 'components/editableList/editableList.html',
				scope : {
					items : '=editableList'
				},
				link : function (scope) {
					scope.newValue = '';
					scope.addValue = function (value) {
						if (scope.items.indexOf(value) ===  - 1) {
							scope.items.push(value);
						}
						scope.addNewVisible = false;
						scope.newValue = '';
					};

					scope.removeItem = function (value) {
						var index = scope.items.indexOf(value);

						if (index > -1) {
							scope.items.splice(index, 1);
						}
					};
				}
			};
		}
	]);
