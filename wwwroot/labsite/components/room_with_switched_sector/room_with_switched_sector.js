angular.module('myApp')
    .directive('roomWithSwitchedSector', ['$rootScope', '$http', '$timeout', function ($rootScope, $http, $timeout) {
        'use strict';
        return {
            restrict: 'A',
            transclude: true,
            templateUrl: 'components/room_with_switched_sector/room_with_switched_sector.html',
            scope: {
                switcher: '=roomWithSwitchedSector',
                cellWidth: '=',
                cellHeight: '=',
                hideLever: '=',
                isPlans: '='
            },
            link: function (scope) {
                var sendSwitcherState = function (id, isOn, isPlans) {

                    var url = isPlans ? "/plansAction/switcher" : "/girlAction/switcher";

                    $http.get(url + '?id=' + id + '&isOn=' + isOn).then(function (response) {
                        $timeout(function () {
                            $rootScope.$broadcast('stateUpdated', response.data);
                        }, 0);
                    });
                };

                var getStyle = function (dimensions) {

                    if (!dimensions) {
                        dimensions = {
                            top: scope.switcher.leftTop[1] * scope.cellHeight,
                            left: scope.switcher.leftTop[0] * scope.cellWidth,
                            height: (scope.switcher.bottomRight[1] - scope.switcher.leftTop[1] + 1) * scope.cellHeight,
                            width: (scope.switcher.bottomRight[0] - scope.switcher.leftTop[0] + 1) * scope.cellWidth,
                        };
                    }

                    var style = {
                        position: 'absolute',
                        'background-color': scope.switcher.isActive ? '#FFFFFF' : '#C4C4C4',
                        opacity: 0.6,
                        cursor: 'pointer'
                    };

                    if (!scope.switcher.noOwnWalls) {
                        style.border = 'solid';
                    }


                    angular.extend(style, dimensions);

                    return style;
                };

                var increaseOnHoverPixels = 4;

                var isCoordsInsideSwitcher = function (coords) {
                    return coords[0] >= scope.switcher.leftTop[0]
                        && coords[0] <= scope.switcher.bottomRight[0]
                        && coords[1] >= scope.switcher.leftTop[1]
                        && coords[1] <= scope.switcher.bottomRight[1]
                };
                var funcsToUnlink = [];

                funcsToUnlink.push($rootScope.$on("switched", function ($ev, coords) {
                    if (isCoordsInsideSwitcher(coords)) {
                        scope.turn();
                    }
                }));

                funcsToUnlink.push($rootScope.$on("mouseLeave", function ($ev, coords) {
                    if (isCoordsInsideSwitcher(coords)) {
                        scope.mouseLeave();
                    }
                }));

                funcsToUnlink.push($rootScope.$on("mouseEnter", function ($ev, coords) {
                    if (isCoordsInsideSwitcher(coords)) {
                          scope.mouseEnter();
                    }
                }));

                funcsToUnlink.push($rootScope.$on("rightNeighbourLeft", function (event, id) {
                    if (scope.switcher.id === id) {
                        scope.style = getStyle();
                    }
                }));

                funcsToUnlink.push($rootScope.$on("leftNeighbourLeft", function (event, id) {
                    if (scope.switcher.id === id) {
                        scope.style = getStyle();
                    }
                }));

                funcsToUnlink.push($rootScope.$on("rightNeighbourEntered", function (event, id) {
                    if (scope.switcher.id === id) {
                        var dimensions = {
                            top: scope.style.top - increaseOnHoverPixels,
                            left: scope.style.left - increaseOnHoverPixels,
                            height: scope.style.height + 2 * increaseOnHoverPixels,
                            width: scope.style.width + increaseOnHoverPixels // do not allow overlap
                        };

                        scope.style = getStyle(dimensions);
                    }
                }));

                funcsToUnlink.push($rootScope.$on("leftNeighbourEntered", function (event, id) {
                    if (scope.switcher.id === id) {
                        var dimensions = {
                            top: scope.style.top - increaseOnHoverPixels,
                            left: scope.style.left, // do not allow overlap
                            height: scope.style.height + 2 * increaseOnHoverPixels,
                            width: scope.style.width + increaseOnHoverPixels // do not allow overlap
                        };

                        scope.style = getStyle(dimensions);
                    }
                }));
                
                scope.$on("$destroy", function() {
                    funcsToUnlink.forEach(function(func) {func();});
                })

                scope.mouseLeave = function () {
                    if (!scope.style || scope.hideLever) {
                        return;
                    }

                    if (scope.switcher.rightLinkedId) {
                        $rootScope.$broadcast("leftNeighbourLeft", scope.switcher.rightLinkedId);
                    }

                    if (scope.switcher.leftLinkedId) {
                        $rootScope.$broadcast("rightNeighbourLeft", scope.switcher.leftLinkedId);
                    }

                    scope.style = getStyle();
                }

                scope.mouseEnter = function () {
                    if (!scope.style || scope.hideLever) {
                        return;
                    }

                    var dimensions = {
                        top: scope.style.top - increaseOnHoverPixels,
                        left: scope.style.left - increaseOnHoverPixels,
                        height: scope.style.height + 2 * increaseOnHoverPixels,
                        width: scope.style.width + 2 * increaseOnHoverPixels
                    };

                    if (scope.switcher.rightLinkedId) {
                        $rootScope.$broadcast("leftNeighbourEntered", scope.switcher.rightLinkedId);
                        dimensions.width = dimensions.width - increaseOnHoverPixels; // do not allow overlap
                    }

                    if (scope.switcher.leftLinkedId) {
                        $rootScope.$broadcast("rightNeighbourEntered", scope.switcher.leftLinkedId);
                        dimensions.left = dimensions.left + increaseOnHoverPixels; // do not allow overlap
                        dimensions.width = dimensions.width - increaseOnHoverPixels; // do not allow overlap
                    }

                    scope.style = getStyle(dimensions);
                }

                scope.$watchGroup(['switcher.isActive', 'cellWidth', 'cellHeight'], function () {

                    scope.style = getStyle();

                    if (!scope.switcher.leverCoordRelative) {
                        scope.hideLever = true;
                    } else {

                        scope.leverStyle = {
                            position: 'absolute',
                            top: scope.switcher.leverCoordRelative[1] * scope.cellHeight,
                            left: scope.switcher.leverCoordRelative[0] * scope.cellWidth,
                            height: scope.height,
                            width: scope.width,
                            'z-index': 100
                        };
                    }

                });

                scope.turn = function () {
                    if (scope.hideLever) {
                        return;
                    }

                    sendSwitcherState(scope.switcher.id, !scope.switcher.isActive, scope.isPlans);
                };
            }
        };
    }
    ]);