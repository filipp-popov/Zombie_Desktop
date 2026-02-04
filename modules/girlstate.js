'use strict';

var fs = require('fs');
var file = fs.readFileSync('./girlEscapeConfig.json', 'utf8');
var girlState;

var resetGirlState = function () {
    girlState = { cells: [], fans: [], lighters: [], switchers: [], panicMode: false, panicModeWasActive: false, gameDone: false };

    var config = JSON.parse(file);

    config.cellsInGame.forEach(function (cellCoords) {
        girlState.cells.push({ coords: cellCoords });
    });

    config.fans.forEach(function (fanCoords) {
        girlState.fans.push({ coords: fanCoords });
    });

    config.lighters.forEach(function (lighter) {
        girlState.lighters.push(lighter);
    });

    config.switchers.forEach(function (switcher) {
        girlState.switchers.push(switcher);
    });

    girlState.girlCoord = config.girlInitialCoords;
    girlState.maxSwitchedRooms = config.maxSwitchedRooms;

    girlState.sizes = {
        cellHeight: config.cellHeight,
        cellWidth: config.cellWidth,
        girlDotRadius: config.girlDotRadius
    };
};


resetGirlState();


var isCellInSwitcherRoom = function (coord, switcher) {
    return coord[0] >= switcher.leftTop[0] && coord[0] <= switcher.bottomRight[0] && coord[1] >= switcher.leftTop[1] && coord[1] <= switcher.bottomRight[1];
};

var findGameObjectByCoord = function (objectsArray, coordArray) {
    for (var i = 0; i < objectsArray.length; i++) {
        var obj = objectsArray[i];
        if (obj.coords[0] === coordArray[0] && obj.coords[1] === coordArray[1]) {
            return obj;
        }
    }

    return null;
};

var _recalculateLight = function () {
    girlState.cells.forEach(function (cell) {
        cell.light = 0;
    });
    //	console.log("-- start light recalculate");
    girlState.lighters.forEach(function (lighter) {
        var cell = findGameObjectByCoord(girlState.cells, lighter.coords);
        if (!cell) {
            return;
        }

        if (cell.hasEnergy) {
            lighter.lightSpread.forEach(function (cellLight) {
                var celltoLight = findGameObjectByCoord(girlState.cells, cellLight.coords);
                if (!celltoLight) {
                    return;
                }
                celltoLight.light = (celltoLight.light || 0) + parseInt(cellLight.intensity);
            });
        }
    });
};

var _recalculatePower = function () {
    girlState.cells.forEach(function (cell) {
        cell.hasEnergy = false;
        cell.hasZombies = false;
    });
    girlState.switchers.forEach(function (switcher) {
        if (switcher.isActive) {
            girlState.cells.forEach(function (cell) {
                var cellIsPowered = isCellInSwitcherRoom(cell.coords, switcher);
                if (cellIsPowered) {
                    cell.hasEnergy = true;
                    cell.hasZombies = switcher.sonarObjects && switcher.sonarObjects.some(function (sonarObject) { return sonarObject.type === 'zombie'; });
                }
            });
        }
    });
};

var isNeighbour = function (coord1, coord2) {
    var diffX = coord1[0] - coord2[0];
    var diffY = coord1[1] - coord2[1];

    return (diffX * diffX + diffY * diffY) === 1;
};


var findFinalLighter = function () {
    for (var i = 0; i < girlState.lighters.length; i++) {
        var lighter = girlState.lighters[i];
        if (lighter.isExit) {
            return lighter;
        }
    }

    return null;
};

var recalculateGirlCoord = function () {
    if (girlState.gameDone) {
        return;
    }

    if (girlState.panicMode) {
        var leftCellCoord = [girlState.girlCoord[0] - 1, girlState.girlCoord[1]];
        var bottomCellCoord = [girlState.girlCoord[0], girlState.girlCoord[1] + 1];

        var leftCell = findGameObjectByCoord(girlState.cells, leftCellCoord);
        var upCell = findGameObjectByCoord(girlState.cells, bottomCellCoord);

        var movementDone = false;

        if (girlState.girlCoord[0] > 0 && !!leftCell && ((leftCell.hasFan && !leftCell.hasEnergy) || !leftCell.hasFan)) {
            girlState.girlCoord = leftCellCoord;
            movementDone = true;
        } else if (girlState.girlCoord[1] > 0 && !!upCell && ((upCell.hasFan && !upCell.hasEnergy) || !upCell.hasFan)) {
            girlState.girlCoord = bottomCellCoord;
            movementDone = true;
        }

        //if nowhere to go, disable panic mode

        girlState.panicMode = movementDone;
    } else {
        var curGirlCell = findGameObjectByCoord(girlState.cells, girlState.girlCoord);
        var finalLighter = findFinalLighter();

        if (finalLighter && finalLighter.coords[0] === girlState.girlCoord[0] && finalLighter.coords[1] === girlState.girlCoord[1]) {
            girlState.gameDone = true;
        }

        var maxLight = curGirlCell.light || 0;
        var maxLightedCoord = girlState.girlCoord;

        girlState.cells.forEach(function (cell) {
            var cellLight = cell.light;
            var fanActive = cell.hasEnergy && cell.hasFan;

            if (isNeighbour(girlState.girlCoord, cell.coords) && (maxLight < cellLight) && !fanActive) {
                maxLight = cellLight;
                maxLightedCoord = cell.coords;
            }
        });

        var hasLighterOnNextCell = !!findGameObjectByCoord(girlState.lighters, maxLightedCoord);
        
        if (hasLighterOnNextCell && findGameObjectByCoord(girlState.cells, maxLightedCoord).hasZombies) {
            girlState.panicMode = true;
        }

        girlState.girlCoord = maxLightedCoord;
    }
};


var recalculateState = function (calculateGirlMove) {
    if (calculateGirlMove) {
        recalculateGirlCoord(); // use old state
    }

    girlState.poweredRooms = 0;

    girlState.switchers.forEach(function (switcher) {
        if (switcher.isActive) {
            girlState.poweredRooms = girlState.poweredRooms + 1;
        }
    });
	
    //order is important
    _recalculatePower();
    _recalculateLight();

    girlState.cells.forEach(function (cell) {
        cell.hasFan = !!findGameObjectByCoord(girlState.fans, cell.coords);
        cell.hasLighter = !!findGameObjectByCoord(girlState.lighters, cell.coords);
    });
    
    
    // need to get sure, girl is not on cell with working fan
    _checkGirlIsOnWorkingFan();

};


function _checkGirlIsOnWorkingFan() {
    var girlCell = findGameObjectByCoord(girlState.cells, girlState.girlCoord);

    if (girlCell.hasEnergy && girlCell.hasFan) {
        // move girl to an available cell 
        // try upper cell 
        if (_checkCellExistsAndMoveGirl([girlState.girlCoord[0], girlState.girlCoord[1] - 1])) {
            return;
        }
        // try left cell 
        if (_checkCellExistsAndMoveGirl([girlState.girlCoord[0] - 1, girlState.girlCoord[1]])) {
            return;
        }   
        
        // try bottom cell 
        if (_checkCellExistsAndMoveGirl([girlState.girlCoord[0], girlState.girlCoord[1] + 1])) {
            return;
        }    
        
        // try right cell 
        if (_checkCellExistsAndMoveGirl([girlState.girlCoord[0] + 1, girlState.girlCoord[1]])) {
            return;
        }
    }
}

function _checkCellExistsAndMoveGirl(coord) {
    if (!!findGameObjectByCoord(girlState.cells, coord)) {
        girlState.girlCoord = coord;
        return true;
    }
    return false;
}


var plannedSwitchers = [];

var findSwitcher = function (id, isOn) {
    for (var i = 0; i < girlState.switchers.length; i++) {
        var switcher = girlState.switchers[i];

        if (switcher.id.toString() === id) {
            return switcher;
            /*if (isOn && girlState.maxSwitchedRooms === girlState.poweredRooms) {
                return;
            }
            switcher.isActive = isOn;*/
        }
    }
};

var countActiveSwitchers = function () {
    var result = 0;
    for (var i = 0; i < girlState.switchers.length; i++) {
        var switcher = girlState.switchers[i];

        if (switcher.isActive) {
            result = result + 1;
        }
    }

    return result;
}

var gertRecalculatedState = function (calculateGirlMove) {
    var switchersActive = countActiveSwitchers();

    for (var i = 0; i < plannedSwitchers.length; i++) {
        var plannedSwitcher = plannedSwitchers[i];
        var switcherInGame = findSwitcher(plannedSwitcher.id);

        if (plannedSwitcher.isActive && (switchersActive >= girlState.maxSwitchedRooms)) {
            continue; // ignore this try to switch the room, continue as there can be
        } else {
            switcherInGame.isActive = plannedSwitcher.isActive;
            switchersActive = switchersActive + 1;
        }
    }

    plannedSwitchers = [];

    recalculateState(calculateGirlMove);
    return girlState;
};

module.exports = {
    getResetState: function () {
        resetGirlState();
        return gertRecalculatedState(false);
    },
    getRecalculatedState: gertRecalculatedState,
    changeSwitcher: function (id, isOn) {
        var newPlannedSwitchers = [];
        
        // if we pressed same switcher more that once, take the last got switcher
        for (var i = 0; i < plannedSwitchers.length; i++) {
            var oldSwitcher = plannedSwitchers[i];
            if (oldSwitcher.id !== id) {
                newPlannedSwitchers.push(oldSwitcher);
            }
        }

        newPlannedSwitchers.push({ id: id, isActive: isOn });

        plannedSwitchers = newPlannedSwitchers;
    }
};