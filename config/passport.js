'use-strict';
/**
 * Module imports
 * */
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;


/**
 * Local imports*/
var dbUtils = require('../utils/dbUtils.js');
var security = require('../utils/security.js');


module.exports = function (passport) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        console.log('[serialize]' + JSON.stringify(user));
        done(null, user._id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        console.log('[deserialize] ' + id);
        try {
            dbUtils.getConnection(function (db) {
                var tableName = 'user';
                db.collection(tableName).findOne({'_id': new ObjectId(id)}, function (err, user) {
                    // if there are any errors, return the error
                    try {
                        console.log('[deserialize] ' + err + '\n' + JSON.stringify(user));
                    } catch (e) {
                        console.log(e);
                    }
                    done(err, user);
                });
            });
        } catch (e) {
            console.log(e);
        }


    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done) {
            if (email) {
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
            }

            // asynchronous
            process.nextTick(function () {
                console.log('[login] ' + email);

                try {
                    dbUtils.getConnection(function (db) {
                        var tableName = 'user';
                        db.collection(tableName).findOne({'email': email}, function (err, user) {
                            // if there are any errors, return the error
                            console.log('[login] ' + err + '\n' + JSON.stringify(user));

                            if (err) {
                                return done(err);
                            }
                            // if no user is found, return the message
                            if (!user) {
                                return done(null, false);
                            }
                            if (!security.comparePassword(password, user.password)) {
                                return done(null, false);
                            }
                            // all is well, return user
                            else {
                                return done(null, user);
                            }
                        });
                    });
                } catch (e) {
                }
            });

        }
    ));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done) {
            if (email) {
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
            }
            console.log('[passport] request received ' + email);
            // asynchronous
            process.nextTick(function () {

                // if the user is not already logged in:
                if (!req.user) {

                    console.log('[passport] not req.user');

                    try {
                        console.log(email);
                        dbUtils.getConnection(function (db) {
                            var tableName = 'user';
                            db.collection(tableName).findOne({
                                'email': email
                            }, function (err, user) {

                                if (err) {
                                    return done(err);
                                }
                                if (user) {
                                    return done(null, false);
                                }

                                var data = {
                                    email: email,
                                    password: security.encryptPassword(password)
                                };

                                console.log('adding user');

                                db.collection(tableName).insertOne(data, function (err, result) {


                                    if (err) {
                                        return done(err);
                                    }
                                    return done(null, data);

                                });


                            });
                        });
                    } catch (e) {
                    }

                    // if the user is logged in but has no local account...
                } else if (!req.user.email) {

                    // ...presumably they're trying to connect a local account
                    // BUT let's check if the email used to connect a local account is being used by another user
                    try {
                        dbUtils.getConnection(function (db) {
                            var tableName = 'user';
                            db.collection(tableName).findOne({
                                email: email
                            }, function (err, user) {

                                if (err) {
                                    return done(err);
                                }
                                if (user) {
                                    return done(null, false);
                                }

                                var data = {
                                    email: email,
                                    password: security.encryptPassword(password)
                                };

                                db.collection(tableName).insertOne(data, function (err, result) {
                                    if (err) {
                                        return done(err);
                                    }
                                    return done(null, data);

                                });


                            });
                        });
                    } catch (e) {
                    }

                } else {
                    // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                    return done(null, req.user);
                }

            });

        }));

};