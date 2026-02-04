angular.module('myApp').directive('embedVideo', [function () {
    'use strict';
    return {
        restrict: 'A',
        scope: { url: '@', width: '=', height: '=' },
        replace: false,
        template: '<video autoplay loop src="{{url}}" width="{{width}}" height="{{height}}" preload="auto" />',
        link: function (scope, elem) {
            scope.$watch(scope.width, function (newVal) {
                if ($('video', elem).length === 1) {
                    $('video', elem).attr('width', newVal);
                }
            });

            scope.$watch(scope.height, function (newVal) {
                if ($('video', elem).length === 1) {
                    $('video', elem).attr('height', newVal);
                }
            });

            var videoElem = $('video', elem)[0];
            videoElem.loop = true;
            videoElem.muted = true;

            /*var r = new XMLHttpRequest();
            r.onload = function () {
                videoElem.src = URL.createObjectURL(r.response);
                videoElem.play();
            };
            if (videoElem.canPlayType('video/mp4;codecs="avc1.42E01E, mp4a.40.2"')) {
                r.open('GET', scope.url);
            }

            r.responseType = 'blob';
            r.send();*/
        }
    };
}]);