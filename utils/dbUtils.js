'use-strict';

/**
 * Module imports*/
var MongoClient = require('mongodb').MongoClient;
var config = require('config');

/**
 *  Global vars
 * */
var db;

module.exports.getConnection = function (callback) {
    if (!db) {
        MongoClient.connect(config.MONGO_URI, function (err, database) {
            if (err) {
                throw err;
            }
            console.log('Created database connection in db connection' + database);
            db = database;
            callback(db);
        });
    } else {
        console.log('Else block of get connection');
        callback(db);
    }
};