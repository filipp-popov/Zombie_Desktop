'use strict';

var express = require('express');
var app = express();
app.disable('etag');//disable cache
var http = require('http');
var httpServer = http.Server(app);
var request = require('request');
var io = require('socket.io')(httpServer);
var bodyParser = require('body-parser');
var fs = require('fs');
var querystring = require('querystring');
var storage = require('node-persist');
var extend = require('extend');

var gamestate = require('./modules/gamestate.js');
var girlstateManager = require('./modules/girlstate.js');
var labSiteManager = require('./modules/labsitestate.js');
var playersPlan;


function reloadPlayersPlan() {
    playersPlan = JSON.parse(fs.readFileSync('./playersPlanConfig.json', 'utf8'));
}
reloadPlayersPlan();

var girlStateUpdateTimeout;

var currentStates = gamestate.getGameState();

var config = JSON.parse(fs.readFileSync('./config.json', 'UTF-8'));

httpServer.listen(5678, function () {

    var host = httpServer.address().address;
    var port = httpServer.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

});

var jsonParser = bodyParser.json({
    strict: true
});

var getEvent = function (request, isPost, isCommand) {
    var param = request.query.param || '';
    var isBoolean = param.toLowerCase() === 'true' || param.toLowerCase() === 'false';
    var paramValue = !isBoolean ? param : param.toLowerCase() === 'true';

    return {
        url: request.originalUrl,
        area: request.query.area,
        id: request.query.id,
        param: isPost ? request.body : paramValue,
        isCommand: isCommand
    };
};

io.on('connection', function () {
    updateAndSendState();
});

// CORS support
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    }
    else {
        next();
    }
};

app.use(allowCrossDomain);

app.use('/milligan', express.static('wwwroot'));
app.use('/site', express.static('wwwroot'));
app.use('/validation', express.static(__dirname + '/validation'));
app.use('/config.json', express.static(__dirname + '/config.json'));

app.use('/test/*', function (req, res) {
    if (req.query.id === 'sonar_calibration') {
        res.send(
            JSON.stringify([{
                'cam_id': 1,
                'left_up_coords': [-5, -3],
                'right_down_coords': [5, 3]
            }, {
                    'cam_id': 2,
                    'left_up_coords': [-7, -1],
                    'right_down_coords': [7, 2]
                }
            ]));
    }
});

app.get('/api/reloadConfiguration', function (req, res) {
    // TODO - send update config
    res.send('OK');
});

var handleEvent = function (req, res, isCommand, isPost) {
    var event = getEvent(req, isPost, isCommand);
    res.setHeader('Access-Control-Allow-Origin', '*');


    var isValid = false;
    if (gamestate.validateAndApplyEvent(event, isCommand)) {
        isValid = true;
		
        // notify about event either central server or control unit
        var url = (isCommand ? config.control_unit_url : config.central_server_url) + '/event?' + querystring.stringify(req.query);

        // initial request is waiting for an answer, so we should not only notify responsible party but also transfer its anser back 
        var answerExpected = gamestate.isAnswerExpected(event);

        request({
            url: url,
            json: answerExpected
        }, function (error, response, body) {
            if (answerExpected) {
                if (!error && response.statusCode === 200 && gamestate.validateResponse(event, body)) {
                    res.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    res.end(JSON.stringify(body));

                } else {
                    res.status(403);
                    res.send('Error while receiving response');
                }
            } else {
                res.send('OK');
            }
        });

        if (!isCommand) {
            // if it is command - it means it was received from central web server, and it will be transferred to control unit
            // when control unit replies it will resend this command as an event - and we will change state at that moment
            // as it will be the moment then state is really changed
            updateAndSendState();
        }
    } else {
        res.status(403);
        res.send('Invalid event');
    }

    io.emit('eventReceived', {
        state: event,
        isValid: isValid
    });
};

// event from control unit, need to send it to both local and central servers
app.get('/event', function (req, res) {
    handleEvent(req, res, false);
});

app.post('/event', jsonParser, function (req, res) {
    handleEvent(req, res, false, true);
});

app.get('/command', function (req, res) {
    handleEvent(req, res, true);
});

//app.get('/command', function (req, res) {
//	handleEvent(req, res, true);
//});

app.get('/reloadState', function (req, res) {

    updateAndSendState();
    res.send('OK');
});

app.post('/command', function (req, res) {
    handleEvent(req, res, true, true);
});


app.post('/labsiteloggedIn', function (req, res) {
    labSiteManager.processLabState(currentStates.zombie);
    labSiteManager.loginSuccess(currentStates.zombie);
    updateAndSendState();
    res.send('OK');
});

app.post('/log', jsonParser, function (req, res) {
    var today = getTimeStamp();

    var json = storage.getItem(today) || {};
    console.dir(json);
    
    var newEntry = {};
    newEntry[(new Date()).getTime().toString()] = req.body; 

    json = extend(json, newEntry);
    storage.setItem(today, json);

    //io.emit('stateUpdated', {
    //    area: 'zombie',
    //    localpath: json
    //});
    
    res.send('OK');
});

function getTimeStamp() {
    var now = new Date();
    return now.getFullYear().toString() + "-" + (now.getMonth() + 1).toString() + "-" + now.getDate().toString(); 
}

/*app.post('/post_event', jsonParser, function (req, res) {
	
	if (req.query.area === 'zombie' && req.query.id === 'sonar') {
		io.emit('cctvUpdated', {
			area: 'zombie',
			coords: req.body
		});
	}
	res.send('OK');
});*/


var updateAndSendState = function () {
    labSiteManager.processLabState(currentStates.zombie);
    currentStates.zombie.playersPlan = playersPlan;


    Object.keys(currentStates).forEach(function (areaName) {
        io.emit('stateUpdated', {
            area: areaName,
            state: currentStates[areaName]
        });

        //send to central server
        if (!config.central_server_url) {
            return;
        }
        var url = config.central_server_url + '?area=' + areaName + '&id=state';

        request.post({
            url: url,
            json: true,
            form: currentStates[areaName]
        }, function (error) {
            if (error) {
                console.log('send to central server failed');
            }
        });
    });
};

var updateGirlState = function (calculateGirlMovement) {
    var airtubeTimeout = null;

    if (currentStates.zombie.game_status !== 'game_started') {
        console.log('girl state reset');
        currentStates.zombie.girl_escape_state = girlstateManager.getResetState();
        clearTimeout(airtubeTimeout);
    }

    var isDone = currentStates.zombie.girl_escape_state.gameDone;

    currentStates.zombie.girl_escape_state = girlstateManager.getRecalculatedState(calculateGirlMovement);
    if ((!calculateGirlMovement || !girlStateUpdateTimeout) && !currentStates.zombie.girl_escape_state.panicMode) {
        clearInterval(girlStateUpdateTimeout);
        girlStateUpdateTimeout = setInterval(function () { updateGirlState(true); }, 2000); // if any user action, then let the girl time to adopt to it
    }

    if (currentStates.zombie.girl_escape_state.panicMode && !currentStates.zombie.girl_escape_state.panicModeWasActive) {
        currentStates.zombie.girl_escape_state.panicModeWasActive = true;

        setTimeout(function () {
            requestToControlUnit("zombie", "hint_ventilation_girl_frightened", true)
        }, 3000);
    }


    if (currentStates.zombie.girl_escape_state.gameDone && !isDone) {
        // game finished at last iteration
        // console.log("playing hint1");
        requestToControlUnit("zombie", "girl_escape_complete", true);
        /*airtubeTimeout = setTimeout(function() {
            console.log("playing hint2");
            requestToControlUnit("zombie", "girl_escape_complete_2", true)
            requestToControlUnit("zombie", "girl_air_tube_lock_on", false)
        }, 15000)*/
    }
};

var isPausedMainLight = false;
app.get('/plansAction/switcher', function (req, res) {
    var findSwitcher = function (id) {
        for (var i = 0; i < playersPlan.switchers.length; i++) {
            var switcher = playersPlan.switchers[i];
            if (switcher.id == id) {
                return switcher;
            }
        }

        return null;
    }

    var responseEnd = function () {
        res.status(200);
        res.send({ area: 'zombie', state: currentStates.zombie });
    };

    var switcher = findSwitcher(req.query.id);

    if (switcher.isPlayersRoom) {
        if (isPausedMainLight) {
            responseEnd();
            return;
        } else {
            isPausedMainLight = true;
            setTimeout(function () { isPausedMainLight = false; console.log("unpaused"); }, 5000);
        }
    }


    var isOn = req.query.isOn === 'true';
    switcher.isActive = isOn;

    var siblingSwitcher = findSwitcher(switcher.rightLinkedId || switcher.leftLinkedId);

    if (siblingSwitcher) {
        siblingSwitcher.isActive = isOn;
    }

    if (switcher.isPlayersRoom) {
        requestToControlUnit("zombie", "main_light_on", isOn);
    }

    updateGirlState(false);
    responseEnd();
});

app.get('/girlAction/switcher', function (req, res) {
    girlstateManager.changeSwitcher(req.query.id, req.query.isOn === 'true');

    updateGirlState(false);
    res.status(200);
    res.send({ area: 'zombie', state: currentStates.zombie });
});

app.get('/girlAction/switcher/turnAllOff', function (req, res) {
    if (currentStates.zombie.girl_escape_state.switchers) {
        currentStates.zombie.girl_escape_state.switchers.forEach(function (switcher) {
            if (switcher.leverCoordRelative) {
                girlstateManager.changeSwitcher(switcher.id, false);
            }
        });
    }

    updateGirlState(false);
    res.status(200);
    res.send({ area: 'zombie', state: currentStates.zombie });
});

currentStates.zombie.sonar_calibration = [
    {
        'cam_id': 0,
        'left_up_coords': [
            -5,
            -3
        ],
        'right_down_coords': [
            8,
            4
        ]
    },
    {
        'cam_id': 5,
        'left_up_coords': [
            -3.2,
            -6.1
        ],
        'right_down_coords': [
            3.5,
            2.44
        ]
    }
];

// every second send an update to web site
setInterval(updateAndSendState, 1000);

function requestToControlUnit(areaName, eventId, value) {
    var url = config.control_unit_url + '/event?area=' + areaName + '&id=' + eventId + '&param=' + value;

    console.log('sent: ' + url);
    request.get({
        url: url,
    }, function (error) {
        if (error) {
            console.log('send failed: ' + url);
        }
    });
}

/*var step = 1;
setInterval(function () {
	request.post({
		url: "http://127.0.0.1:5678/event?area=zombie&id=sonar&param=",
		json: [
			{ cam_id: 5, coords: [-4 + step * 0.1, 2 + step * 0.1] },
			{ cam_id: 5, coords: [2.2 + step * 0.1, 1.2 + step * 0.1] },
			{ cam_id: 5, coords: [-1.2 + step * 0.1, 0.23 + step * 0.1] },
			{ cam_id: 0, coords: [3.2 + step * 0.1, 1.2 + step * 0.1] }]
	});
	step = step + 1;
}, 50);*/

updateGirlState(true);