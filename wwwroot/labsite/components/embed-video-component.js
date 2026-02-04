angular.module('myApp').directive('embedVideoComponent', [function () {
    'use strict';
    return {
        restrict: 'AE',
        scope: { url: '@', selected: '='},
        replace: true,
        template:
            '<div ng-style="getStyle()">'+
            '<video autoplay loop src="{{url}}" width="100%" height="100%" preload="auto" />' +
            '</div>'
        ,
        link: function (scope, elem) {
            var videoElem = $('video', elem)[0];
            videoElem.loop = true;
            videoElem.muted = true;

            scope.getStyle = function () {
                if(!scope.selected){
                    return {
                        cursor: 'pointer',
                        position: 'inherit'
                    }
                } else {
                    return {
                        cursor: 'pointer',
                        position: 'absolute',
                        left: '0px',
                        top: '30px',
                        width: '900px',
                        border: '1px black solid;'
                    }
                }
            }
        }
    };
}]);