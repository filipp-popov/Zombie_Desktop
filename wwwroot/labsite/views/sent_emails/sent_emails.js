'use strict';

angular.module('myApp.sent_emails', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/sent_emails', {
            templateUrl: 'views/sent_emails/sent_emails.html',
            controller: 'sentEmailsCtrl',
            controllerAs: 'vm'
        });
    }
    ])

    .controller('sentEmailsCtrl', ['$scope', 'labEmailService', function ($scope, labEmailService) {
        var vm = this;

        vm.state = labEmailService.state;
        vm.selectedIndex = 0;

        vm.getTimestamp = function (momentDate) {
            if (momentDate.isBefore(vm.state.today)) {
                return momentDate.format('H:mm, MMM, DD');
            } else {
                return momentDate.format('H:mm');
            }
        };

        vm.getRemovedBeforeDate = function () {
            return vm.state.today.clone().add(-2, 'days').format('YYYY-MMM-DD');
        };

        vm.onEmailClick = function (index) {
            vm.selectedIndex = index;
        };
        
        vm.getUnreadEmails = function () {
            return labEmailService.state.emails.filter(function (email) { return email.unread; }).length;
        }
    }
    ]);