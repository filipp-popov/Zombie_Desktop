angular.module('myApp')
    .factory('objectBehaviorService', ['girlEscapeRandomEvents', function (girlEscapeRandomEvents) {
        return {
            getHandleCivilianWorkerFunction: getHandleCivilianWorkerFunction,
            getHandlePatrolCoordsFunction: getHandlePatrolCoordsFunction,
            getHandleZombieCoords: getHandleZombieCoords,
            calculateAndSetInitialCoords: calculateAndSetInitialCoords,
            calculateAndAnimateToCoord: calculateAndAnimateToCoord
        }

        function getHandleCivilianWorkerFunction() {
            var oldMovementTicks = 0;

            return function (objectStyle, element, sonarObject, cellWidth, cellHeight, roomLeftTop, roomRightBottom, radius) {
                // 10% chance every 20 seconds to stand up and move and return to the place
                if ((girlEscapeRandomEvents.getTicksElapsed() - oldMovementTicks) < 20 * 1000) {
                    return;
                } else {
                    oldMovementTicks = girlEscapeRandomEvents.getTicksElapsed();
                    var dice = getRandomInt(1, 10);

                    if (dice > 8) {
                        element.stop();
                        var newCoords = calculateRandomMovement(cellWidth * 1.5, element, roomLeftTop, roomRightBottom, cellHeight, cellWidth, radius);
                        animateEl(element, newCoords);
                    } else {
                        animateEl(element, calculateObjectCoord(sonarObject.coords[0], sonarObject.coords[1], cellHeight, cellWidth, radius));
                    }
                }

            }
        }

        function getHandlePatrolCoordsFunction() {
            var asc = true;
            var ind = 0;

            var oldMovementTicks = 0;

            return function (objectStyle, element, sonarObject, cellWidth, cellHeight, roomLeftTop, roomRightBottom, radius) {

                if ((girlEscapeRandomEvents.getTicksElapsed() - oldMovementTicks) < 10 * 1000) {
                    return;
                } else {
                    oldMovementTicks = girlEscapeRandomEvents.getTicksElapsed();
                }

                if (ind === sonarObject.route.length - 1) {
                    asc = false;
                }

                if (ind === 0) {
                    asc = true;
                }

                ind = ind + (asc ? 1 : -1);

                var newCoord = sonarObject.route[ind];

                calculateAndAnimateToCoord(element, newCoord[0], newCoord[1], cellHeight, cellWidth, radius, 10000);
            };
        }


        function getHandleZombieCoords() {
            var oldMovementTicks = 0;

            return function (objectStyle, element, sonarObject, cellWidth, cellHeight, roomLeftTop, roomRightBottom, radius, isActive) {
                if ((girlEscapeRandomEvents.getTicksElapsed() - oldMovementTicks) < (1500 + getRandomInt(-300, 300))) {
                    return
                } else {
                    oldMovementTicks = girlEscapeRandomEvents.getTicksElapsed();

                    if (!isActive) {
                        return;
                    }

                    configureZombieAnimation(element, roomLeftTop, roomRightBottom, cellHeight, cellWidth, radius, 5000);
                }
            }
        }

        function calculateAndSetInitialCoords(objectStyle, coords, cellHeight, cellWidth, radius) {
            var currentCoords = calculateObjectCoord(coords[0], coords[1], cellHeight, cellWidth, radius);

            objectStyle.top = currentCoords.top;
            objectStyle.left = currentCoords.left;
        }

        function handleCivilinWorkerCoords(objectStyle, element, sonarObject, cellWidth, cellHeight, roomLeftTop, roomRightBottom, radius) {
            // 10% chance every 20 seconds to stand up and move and return to the place
            var dice = getRandomInt(1, 10);

            if (dice > 8) {
                element.stop();
                var newCoords = calculateRandomMovement(cellWidth * 1.5, element, roomLeftTop, roomRightBottom, cellHeight, cellWidth, radius);
                animateEl(element, newCoords);
            } else {
                animateEl(element, calculateObjectCoord(sonarObject.coords[0], sonarObject.coords[1], cellHeight, cellWidth, radius));
            }
        }


        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        function calculateAndAnimateToCoord(element, left, top, cellHeight, cellWidth, radius, animationLength) {
            var changedCoords = calculateObjectCoord(left, top, cellHeight, cellWidth, radius);
            animateEl(element, changedCoords, animationLength);
        }


        function calculateRandomMovement(maxStepVal, element, roomLeftTop, roomRightBottom, cellHeight, cellWidth, radius) {
            var currentOffset = element.position();
            var minTop = roomLeftTop[1] * cellHeight + radius / 2;
            var maxTop = (roomRightBottom[1] + 1) * cellHeight - radius / 2;

            var minLeft = roomLeftTop[0] * cellWidth + radius / 2;
            var maxLeft = (roomRightBottom[0] + 1) * cellWidth - radius / 2;

            var newTop = getRandomInt(currentOffset.top - maxStepVal, currentOffset.top + maxStepVal);
            newTop = Math.max(minTop, newTop);
            newTop = Math.min(maxTop, newTop);


            var newLeft = getRandomInt(currentOffset.left - maxStepVal, currentOffset.left + maxStepVal);
            newLeft = Math.max(minLeft, newLeft);
            newLeft = Math.min(maxLeft, newLeft);

            return { top: newTop, left: newLeft };
        }


        function configureZombieAnimation(element, roomLeftTop, roomRightBottom, cellHeight, cellWidth, radius) {
            var maxStepVal = radius * 3;

            var newCoords = calculateRandomMovement(maxStepVal, element, roomLeftTop, roomRightBottom, cellHeight, cellWidth, radius);

            animateEl(element, newCoords);
        }

        function animateEl(element, newPosition, animationLength) {
            element.stop();
            element.animate({ top: newPosition.top, left: newPosition.left }, {
                duration: (animationLength || 2000) * 1.2
            });
        }

        function calculateObjectCoord(left, top, cellHeight, cellWidth, radius) {
            return {
                top: (cellHeight * top) + cellHeight / 2 - radius / 2,
                left: (cellWidth * left) + cellWidth / 2 - radius / 2
            };
        }
    }]);