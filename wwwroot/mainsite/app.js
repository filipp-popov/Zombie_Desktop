'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.mainPage',
    'myApp.alice',
    'myApp.configPage',
    'myApp.testPage',
    'myApp.menDetectorPage'
]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({
            redirectTo: '/main'
        });
    }
    ]);
