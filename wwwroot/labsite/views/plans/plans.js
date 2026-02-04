(function () {
    'use strict';
    angular.module('myApp.plans', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/plans', {
                templateUrl: 'views/plans/plans.html',
                controller: PlansCtrl,
                controllerAs: 'ctrl'
            });
        }
        ]);

    PlansCtrl.$inject = ['$http', '$rootScope', '$scope', '$location', 'config', '$interval', '$timeout', 'sendCommandService'];
    function PlansCtrl($http, $rootScope, $scope, $location, config, $interval, $timeout, sendCommandService) {
        var ctrl = this;
        ctrl.sizes = [];
        ctrl.isError = false;
        ctrl.currentPlanNumber = "B-05";
        ctrl.selectedPlanNumber = ctrl.currentPlanNumber;
        var $errorTimer = null;

        ctrl.showPlan = function (planNumber) {
            switch (planNumber.toLowerCase()) {
                case config.zombie.planNumber.toLowerCase():
                    if (!$rootScope.girlEscapeStarted) {
                        $rootScope.girlEscapeStarted = true;
                        setTimeout(function () {
                            sendCommandService.sendRequestByParams("hint_ventilation_sounds", true, "zombie");
                        }, 4000);
                    }
                    $location.path('/girl_escape');
                    break;
                case ctrl.currentPlanNumber.toLowerCase():
                    ctrl.selectedPlanNumber = planNumber.toLowerCase();
                    break;
                default:
                    ctrl.isError = true;
                    if ($errorTimer && $errorTimer.cancel) {
                        $errorTimer.cancel();
                        $errorTimer = null;
                    }
                    $errorTimer = $timeout(function () {
                        ctrl.isError = false;
                    }, 2000)
            }
            //if (planNumber.toLowerCase() === config.zombie.planNumber.toLowerCase()) {
            //    $location.path('/girl_escape');
            //} else {
            //    ctrl.isError = true;
            //}
        };

        $rootScope.$on('stateUpdated', function (event, eventObj) {
            if (eventObj.area !== 'zombie' || !eventObj.state) {
                return;
            } else {
                angular.merge(ctrl.sizes, eventObj.state.girl_escape_state.sizes);
                ctrl.plan = eventObj.state.playersPlan;

                if (!$rootScope.game_started) {
                    $http.get("/plansAction/switcher?id=8&isOn=false");
                }

                $scope.$apply();
            }
        });

        var socket = io();

        socket.on('eventReceived', function (msg) {
            if (!ctrl.plan) {
                return;
            }
            if (msg.state.area === 'zombie' && msg.state.id === 'sonar') {
                ctrl.plan.switchers.forEach(function (switcher) {
                    switcher.sonarObjects = msg.state.param.filter(function (obj) {
                        return obj.cam_id === switcher.cam_id;
                    }).map(function (obj) {
                        return { type: 'guard', coords: obj.coords };
                    });
                });
            }

            $scope.$applyAsync();
        });
    }

})();


