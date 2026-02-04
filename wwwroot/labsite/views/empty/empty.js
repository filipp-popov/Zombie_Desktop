angular.module('myApp.emptyPage', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        'use strict';
        $routeProvider.when('/empty', {
            templateUrl: 'views/empty/empty.html',
            controller: 'emptyPageCtrl'
        });
    }
    ]);

angular.module('myApp.emptyPage').controller('emptyPageCtrl', ['$rootScope', '$scope', '$interval', '$location', function ($rootScope, $scope, $interval, $location) {
    var interval = $interval(function () {
        if ($rootScope.isLoggedIn && $rootScope.game_started) {
            $location.path($location.search().redir || '/main');
            $location.search('redir', null);
        }
    }, 500)

    $scope.$on('$destroy', function () {
        $interval.cancel(interval);
    })
}]);   
