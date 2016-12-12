const passport = require('passport');
const LocalStrategy = require('passport-local');
const BearerStrategy = require('passport-http-bearer');

const bcrypt = require('bcrypt');

const User = require('../models/user');
const AuthToken = require('../models/auth_token');

// Username/password authentication for Bearer token requests
passport.use(new LocalStrategy({
    session: false
}, function(username, password, done) {

    User.query().where({username: username}).then(function(users) {
        // Username match not found
        if (users.length == 0) {
            return done(null, false, {message: "User not found."});
        }

        let user = users[0];
        bcrypt.compare(password, user.password, function(err, valid) {
            // Error evaluating password
            if (err) {
                return done(err);
            }

            if (valid) {
                // Password was valid, auth successful
                return done(null, user);
            } else {
                // Password invalid, auth failed
                return done(null, false, {message: "Authentication failed."});
            }
        });

    }).catch(function(err) {
        return done(err);
    });
}));

// Bearer token configuration for api authentication
passport.use(new BearerStrategy(function(token, done) {
    AuthToken.query().where('value', token).eager('user').then(function(auth_tokens) {
        if (auth_tokens.length == 0) {
            return done(null, false, {message: 'Token not found.'});
        }

        let auth_token = auth_tokens[0];
        if (new Date() > new Date(auth_token.expires_at)) {
            return done(null, false, {message: 'Token expired.'});
        }

        return done(null, auth_token);
    }).catch(function(err) {
        return done(err);
    });
}));

function config(app) {
    // Initialize passport
    app.use(passport.initialize());
}

module.exports = config;

