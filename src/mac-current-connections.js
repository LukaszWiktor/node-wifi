var exec = require('child_process').exec;
var macProvider = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport';
var env = require('./env');
var networkUtils = require('./network-utils.js');

function parseAirport (stdout) {
    var lines = stdout.split('\n');

    var connections = [];
    var connection = {};
    lines.forEach(function (line) {
        if (line.match(/[ ]*agrCtlRSSI: (.*)/)) {
            connection.signal_level = parseInt(line.match(/[ ]*agrCtlRSSI: (.*)/)[1]);
        } else if (line.match(/[ ]*BSSID: ([a-zA-Z0-1:]*)/)) {
            connection.mac = line.match(/[ ]*BSSID: ([0-9A-Fa-f:]*)/)[1];
        } else if (line.match(/[ ]*SSID: (.*)/)) {
            connection.ssid = line.match(/[ ]*SSID: (.*)/)[1];
        } else if (line.match(/[ ]*link auth: (.*)/)) {
            connection.security = line.match(/[ ]*link auth: (.*)/)[1];
        } else if (line.match(/[ ]*channel: (.*),(.*)/)) {
            connection.frequency = parseInt(networkUtils.frequencyFromChannel(parseInt(line.match(/[ ]*channel: (.*),(.*)/)[1])));
            connections.push(connection);
            connection = {};
        }
    });

    return connections;
}

module.exports = function (config) {

    return function(callback) {

    	var commandStr = macProvider+" --getinfo" ;

    	exec(commandStr, env, function(err, stdout) {
            if (err) {
                callback && callback(err);
            } else {
                callback && callback(null, parseAirport(stdout));
            }
    	});
    }
}
