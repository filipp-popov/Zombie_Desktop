angular.module('myApp')
    .directive('autofocus', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.focus();
            }
        };
    });