'use-strict';

/**
 *  Module imports*/

var bcrypt = require('bcrypt');

/* Constants */


const saltRounds = 10;

exports.encryptPassword = function (password) {
    return bcrypt.hashSync(password, saltRounds);
};

exports.comparePassword = function (password, hash) {
    return bcrypt.compareSync(password, hash);
};