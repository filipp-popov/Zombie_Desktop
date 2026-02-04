angular.module('myApp.compose_email', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        'use strict';
        $routeProvider.when('/compose_email', {
            templateUrl: 'views/compose_email/compose_email.html',
            controller: 'emailComposeCtrl',
            controllerAs: 'vm'
        });
    }
    ])

    .controller('emailComposeCtrl', ['$scope', 'labEmailService', '$location', '$rootScope', function ($scope, labEmailService, $location, $rootScope) {
        'use strict';
        var vm = this;
        vm.email = {};

        vm.submit = function (email) {
            if (email.to) {
                labEmailService.emailSent(email);
                $location.path('email');
            }
        };

        vm.getAddresses = function () {
            return $rootScope.localization.emails.addresses;
        };

        vm.getUnreadEmails = function () {
            return labEmailService.state.emails.filter(function (email) { return email.unread; }).length;
        }
    }
    ]);