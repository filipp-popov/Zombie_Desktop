var request = require('request');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync('./config.json', 'UTF-8'));

'use strict';

var loginSuccess = function (zombieState) {
    if (!zombieState.labState.loggedIn) {
        var url = config.control_unit_url + '/event?area=zombie&id=play_sound&param=login_success';

        console.log('sent: ' + url);
        request.get({
            url: url,
        }, function (error) {
            if (error) {
                console.log('send failed: ' + url);
            }
        });
    }
    zombieState.labState.loggedIn = true;
};

var processLabState = function (zombieState) {
    zombieState.labState = zombieState.labState || { loggedIn: false };

    if (zombieState.game_status !== 'game_started') {
        zombieState.labState.loggedIn = false;
    }
};

module.exports = {
    loginSuccess: loginSuccess,
    processLabState: processLabState
};

