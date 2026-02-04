angular.module('myApp.girlEscape').controller('GirlEscapeCtrl',
    ['$scope', '$http', '$q', '$timeout', '$interval', '$rootScope', 'isObserver', 'girlEscapeRandomEvents',
        function ($scope, $http, $q, $timeout, $interval, $rootScope, isObserver, girlEscapeRandomEvents) {
            'use strict';
            $scope.isObserver = isObserver;
            $scope.switchers = [];
            $scope.cellsInGame = [];
            $scope.poweredRooms = [];
            $scope.sizes = {cellHeight: 40, cellWidth: 40};
            $scope.girlObject = {};
            $scope.maxSwitchedRooms = 1;

            $scope.currentPlanNumber = "D-14";
            $scope.selectedPlanNumber = $scope.currentPlanNumber;

            $scope.turnAllOff = function () {
                $http.get('/girlAction/switcher/turnAllOff').then(function (response) {
                    $timeout(function () {
                        $rootScope.$broadcast('stateUpdated', response.data);
                    }, 0);
                });
            };

            $scope.getBattaryImageName = function () {
                var counter = $scope.maxSwitchedRooms - $scope.poweredRooms.length;
                return 'battery' + counter + '.png';
            };

            // TODO - add to a service
            $rootScope.$on('stateUpdated', function (event, eventObj) {
                if (eventObj.area !== 'zombie' || !eventObj.state) {
                    return;
                } else {
                    angular.merge($scope.switchers, eventObj.state.girl_escape_state.switchers);
                    angular.merge($scope.cellsInGame, eventObj.state.girl_escape_state.cells);

                    angular.merge($scope.sizes, eventObj.state.girl_escape_state.sizes);
                    angular.merge($scope.girlObject, { coords: eventObj.state.girl_escape_state.girlCoord, type: 'girl' });

                    $scope.poweredRooms = (((eventObj.state || {}).girl_escape_state || {}).switchers || []).filter(function (switcher) { return switcher.isActive; });
                    $scope.maxSwitchedRooms = eventObj.state.girl_escape_state.maxSwitchedRooms;
                    $scope.gameDone = eventObj.state.girl_escape_state.gameDone;
                    $scope.$apply();
                }
            });

            $scope.getRandomActors = function() {
                return  girlEscapeRandomEvents.randomActors.filter(function (actor) { return actor.visible; });
            }
        }
    ]);
