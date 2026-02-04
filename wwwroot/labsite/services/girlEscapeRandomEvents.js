angular.module('myApp')
    .factory('girlEscapeRandomEvents', ['config', '$q', '$rootScope', '$timeout', '$interval', 'sendCommandService', '$http',
        function (config, $q, $rootScope, $timeout, $interval, sendCommandService, $http) {
            'use strict';
            var randomEventInterval = null;
            var randomActors = [];
            var ticksElapsed = 0;
            var isInProgress = false;
            var ticksPeriod = 100;

            function getSeconds(secs) {
                return secs * 10 * ticksPeriod;
            };

            $rootScope.$watch("girlEscapeStarted",
                function (newVal) {
                    if (!newVal) {
                        init(true);
                        isInProgress = false;
                        ticksElapsed = 0;
                    }

                    if (newVal && !isInProgress) {
                        isInProgress = true;
                        init();
                        // girl was first discovered, let start events
                        randomEventInterval = $interval(function () {
                            ticksElapsed = ticksElapsed + ticksPeriod;
                            randomActors.forEach(function (actor) {
                                var animationLength = actor.recalculate(ticksElapsed);
                                if (animationLength > 0) {
                                    $rootScope.$broadcast("randomEvent", { id: actor.id, animationLength: animationLength });
                                }
                            });
                        }, ticksPeriod);

                    }
                });

            var rooms = [];
            $rootScope.$on('stateUpdated', function (event, eventObj) {
                if (eventObj.area !== 'zombie' || !eventObj.state) {
                    return;
                } else {
                    rooms = eventObj.state.girl_escape_state.switchers;
                }
            });

            return {
                randomActors: randomActors,
                getTicksElapsed: function () {
                    return ticksElapsed;
                },
                ticksPeriod: ticksPeriod
            }

            function init(isJustClean) {
                ticksElapsed = 0;
                randomActors.length = 0;
                $interval.cancel(randomEventInterval);

                if (!isJustClean) {
                    initCorpsesResurrection();
                    initEaten();
                    initZombiesEnter();
                }
            }

            function initEaten() {
                var eatenTime = getSeconds(60);
                var victimEnterRoomTime = getSeconds(50);
                var victimAnimationStart = getSeconds(50.1);
                var runTime = getSeconds(3);
                var zombiesEnterRoom = getSeconds(50.4);
                var zombiesAnimationStart = getSeconds(50.5);
                var victimResurrectTime = getSeconds(70);

                var victimActor = {
                    id: "victim",
                    coords: [-0.5, 2],
                    visible: false,
                    room: {},
                    recalculate: function (ticksElapsed) {
                        this.visible = !(ticksElapsed < victimEnterRoomTime);
                        if (ticksElapsed > victimResurrectTime) {
                            this.type = "zombie";
                        } else {
                            this.type = ticksElapsed < eatenTime ? "custom" : "corpse";
                        }

                        if (ticksElapsed === victimAnimationStart) {
                            this.coords = [3.3, 0];
                            return runTime;
                        }

                        return 0;
                    }
                }

                angular.extend(victimActor.room, rooms.filter(function (room) {
                    return isCellInSwitcherRoom([1, 1], room);
                })[0]);

                var zombieTemplate = {
                    coords: [-0.5, 1.6],
                    animateCoords: [3.31, -0.1],
                    visible: false,
                    room: {},
                    recalculate: function (ticksElapsed) {
                        this.visible = !(ticksElapsed < zombiesEnterRoom);
                        this.type = ticksElapsed < eatenTime ? "custom" : "zombie";
                        this.style = { "background-color": "red" };

                        if (ticksElapsed === zombiesAnimationStart) {
                            this.coords = this.animateCoords;
                            return runTime;
                        }

                        return 0;
                    }
                };

                angular.extend(zombieTemplate.room, rooms.filter(function (room) {
                    return isCellInSwitcherRoom([1, 1], room);
                })[0]);

                randomActors.push(victimActor);
                randomActors.push(angular.extend({}, zombieTemplate, { id: "zombieEater1" }));
                randomActors.push(angular.extend({}, zombieTemplate, {
                    id: "zombieEater2",
                    coords: [-0.5, 2.0],
                    animateCoords: [3.4, 0.1],
                }));
            }

            function initCorpsesResurrection() {
                var corpses = [
                    {
                        coords: [2, 4],
                        seconds: 30
                    },
                    {
                        coords: [5, 2],
                        seconds: 125
                    },
                    {
                        coords: [5.2, 2.4],
                        seconds: 290
                    },
                    {
                        coords: [4.8, 2.3],
                        seconds: 500
                    },
                    {
                        coords: [4.7, 1.3],
                        seconds: 470
                    },
                    {
                        coords: [4.9, 0.9],
                        seconds: 600
                    },
                    {
                        coords: [4.1, 1.2],
                        seconds: 450
                    },
                    {
                        coords: [5, 0.9],
                        seconds: 520
                    }
                ]

                corpses.forEach(initCorpseAnimation);
            }

            function initZombiesEnter() {
                return;
                var period = getSeconds(30);
                var isVisible = false;
                var isEntering = true;               
                var appearCoords = [5.2, 12];
                var enterToCoords = [4.6, 9.8];
                var animationLength = 3;
                
                
                
                var zombieTemplate = {
                    visible: false,
                    room: {},
                    recalculate: function (ticksElapsed) {
                        if ((ticksElapsed % period) === 0) {
                            if (isEntering) {
                                
                            }
                        }
                        
                        this.visible = isVisible;
                        
                        
                        this.type = ticksElapsed < eatenTime ? "custom" : "zombie";
                        this.style = { "background-color": "red" };

                        if (ticksElapsed === zombiesAnimationStart) {
                            this.coords = this.animateCoords;
                            return runTime;
                        }

                        return 0;
                    }
                };

                angular.extend(zombieTemplate.room, rooms.filter(function (room) {
                    return isCellInSwitcherRoom([1, 1], room);
                })[0]);
            }

            function initCorpseAnimation(corpseDesc, index) {
                var actor = {
                    id: "animatedCorpse " + index,
                    coords: corpseDesc.coords,
                    type: "corpse",
                    visible: true,
                    room: {},
                    recalculate: function (ticksElapsed) {
                        this.type = ticksElapsed > getSeconds(corpseDesc.seconds) ? "zombie" : "corpse";
                        var coords = this.coords;


                        return 0;
                    }
                }

                angular.extend(actor.room, rooms.filter(function (room) {
                    return isCellInSwitcherRoom(actor.coords, room);
                })[0]);

                randomActors.push(actor);
            }

            function isCellInSwitcherRoom(coord, switcher) {
                return coord[0] >= switcher.leftTop[0] && coord[0] <= switcher.bottomRight[0] && coord[1] >= switcher.leftTop[1] && coord[1] <= switcher.bottomRight[1];
            };

        }]);