'use strict';

/** @module utils/log-manager.js
 * This file is the log initializer.
 * By default all log messages go to console, but using this it can be redirected to log files.
 * TODO: - Slack Channels
 * TODO: - Rolling over capabilties.
 */


/** Global vars */
var logger;
/** If a logger exists, close it to free file handles */
if (logger) {
    logger.close();
}
logger = createLogger();

exports.getLogger = function () {
    return logger;
};

/** Create a logger to log messages to console. */
function createLogger() {
    var winston = require('winston');

    var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                timestamp: true
            }),
            new (winston.transports.File)({
                filename: 'api.log',
                json: true,
                timestamp: true,
                maxFiles: 1,
                maxsize: 1000000
            })
        ]
    });
    return logger;
}