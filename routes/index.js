var express = require('express');
var passport = require('passport');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('index', {title: 'Express'});
});

// PROFILE SECTION =========================
router.get('/profile', isLoggedIn, function (req, res) {

    res.render('profile.ejs', {
        user: req.user
    });
});

// LOGOUT ==============================
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/login', function (req, res, next) {
    res.render('login');
});


// SIGNUP =================================
// show the signup form
router.get('/signup', function (req, res) {

    res.render('signup.ejs', {});
});

// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));


// process the signup form
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/');

}

module.exports = router;
