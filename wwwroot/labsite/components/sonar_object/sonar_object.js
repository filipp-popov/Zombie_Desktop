angular.module('myApp')
    .directive('sonarObject', ['$interval', '$timeout', 'girlEscapeRandomEvents', 'objectBehaviorService',
        function ($interval, $timeout, girlEscapeRandomEvents, objectBehaviorService) {
            'use strict';
            var radius = 20;

            return {
                restrict: 'A',
                template: '<span ng-style="objectStyle" ng-class="objectClass"></span>',
                replace: true,
                scope: {
                    sonarObject: '=',
                    cellWidth: '=',
                    cellHeight: '=',
                    roomRightBottom: '=?',
                    roomLeftTop: '=?',
                    roomActive: '=',
                    isRandomActor: '='
                },
                link: function (scope, el) {

                    var isInit = false;
                    var watchType = scope.$watch('sonarObject.type', function (newVal) {
                        if (newVal) {
                            if (!scope.isRandomActor) {
                                //  return;
                            }
                            isInit = true;
                            init();
                        }
                    });

                    scope.$on("randomEvent", function (ev, data) {
                        if (scope.sonarObject.type === 'custom') {
                            if (scope.sonarObject.id === data.id) {
                                objectBehaviorService.calculateAndAnimateToCoord(el, scope.sonarObject.coords[0], scope.sonarObject.coords[1], scope.cellHeight, scope.cellWidth, radius, data.animationLength);
                            }
                        }
                    });

                    var patrolFunc = objectBehaviorService.getHandlePatrolCoordsFunction();
                    var zombieFunc = objectBehaviorService.getHandleZombieCoords();
                    var civilianWorkerFunc = objectBehaviorService.getHandleCivilianWorkerFunction();



                    var intervalFunc = $interval(function () {
                        if (!isInit) {
                            return;
                        }
                        recalculateFrame()
                    }, girlEscapeRandomEvents.ticksPeriod);

                    scope.$on('$destroy', function () {
                        $interval.cancel(intervalFunc);
                        watchType();
                    });

                    function recalculateFrame() {
                        if (scope.isRandomActor) {
                            scope.roomActive = scope.sonarObject.room.isActive;
                            scope.roomRightBottom = scope.sonarObject.room.bottomRight;
                            scope.roomLeftTop = scope.sonarObject.room.leftTop;

                            // objectBehaviorService.calculateAndAnimateToCoord(el, scope.sonarObject.coords[0], scope.sonarObject.coords[1], scope.cellHeight, scope.cellWidth, radius);

                            if (scope.sonarObject.type === 'custom') {
                                angular.extend(scope.objectStyle, scope.sonarObject.style);
                                return; //random actors behaviore are defined in separate file 
                            }
                        }

                        switch (scope.sonarObject.type) {
                            case 'girl': /* girl is handled separately*/ break;
                            case 'zombie': zombieFunc(scope.objectStyle, el, scope.sonarObject, scope.cellWidth, scope.cellHeight, scope.roomLeftTop, scope.roomRightBottom, radius, scope.roomActive); break;
                            case 'patrol': patrolFunc(scope.objectStyle, el, scope.sonarObject, scope.cellWidth, scope.cellHeight, scope.roomLeftTop, scope.roomRightBottom, radius); break;
                            case 'guard': /* guard is standing still */  break;
                            case 'civilian_worker': civilianWorkerFunc(scope.objectStyle, el, scope.sonarObject, scope.cellWidth, scope.cellHeight, scope.roomLeftTop, scope.roomRightBottom, radius); break;
                            case 'corpse': /* corpse is standing still */ break;
                        }
                    }



                    function init() {
                        var bkColor = "";

                        if (scope.sonarObject.type === 'zombie') {
                            bkColor = 'red';
                        } else if (scope.sonarObject.type === 'corpse') {
                            bkColor = 'black';
                        } else {
                            if (scope.sonarObject.type !== 'girl') {
                                bkColor = 'green';
                            }
                        }

                        scope.objectStyle = {
                            'z-index': 2000,
                            cursor: 'pointer',
                            position: 'absolute',
                            'border-radius': '50%',
                            width: radius,
                            height: radius,
                            'background-color': bkColor
                        };

                        scope.objectClass = {
                            'girlAnimation': scope.sonarObject.type === 'girl'
                        }

                        angular.extend(scope.objectStyle, scope.sonarObject.style);

                        var initialCoords = scope.sonarObject.coords;
                        if (scope.sonarObject.type === 'patrol') {
                            initialCoords = scope.sonarObject.route[0];
                        }

                        objectBehaviorService.calculateAndSetInitialCoords(scope.objectStyle, initialCoords, scope.cellHeight, scope.cellWidth, radius);

                        if (scope.sonarObject.type === 'girl') {
                            scope.$watchCollection(function () { return scope.sonarObject.coords; }, function (newVal) {
                                if (newVal[0] && newVal[1]) {
                                    objectBehaviorService.calculateAndAnimateToCoord(el, newVal[0], newVal[1], scope.cellHeight, scope.cellWidth, radius);
                                }
                            });
                        }
                    }

                }
            };
        }
    ]);
