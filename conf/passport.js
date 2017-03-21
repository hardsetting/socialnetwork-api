const passport = require('passport');
const LocalStrategy = require('passport-local');
const BearerStrategy = require('passport-http-bearer');

const bcrypt = require('bcrypt');
const moment = require('moment');

const User = require('../models/user');
const AuthToken = require('../models/auth_token');

// Username/password authentication for Bearer token requests
passport.use(new LocalStrategy({
    session: false
}, async function(username, password, done) {

    try {
        let user = await User.query()
            .where('username', username)
            .first();

        if (!user) {
            return done(null, false, {message: "User not found."});
        }

        let valid = bcrypt.compareSync(password, user.password);

        if (!valid) {
            return done(null, false, {message: "Authentication failed."});
        }

        done(null, user)
    } catch(err) {
        done(err);
    }

}));

// Bearer token configuration for api authentication
passport.use(new BearerStrategy(async function(token, done) {
    // Always auth with user 1, for debugging purposes
    try {
        let user = await User.query().findById(1);
        return done(null, user);
    } catch(err) {
        return done(err);
    }

    try {
        let authToken = await AuthToken.query()
            .where('token', token)
            .eager('user')
            .first();

        if (!authToken) {
            done(null, false, {message: 'Token not found.'});
        } else if (authToken.expires_at < moment().toISOString()) {
            done(null, false, {message: 'Token expired.'});
        } else {
            done(null, authToken.user);
        }
    } catch(err) {
        done(err);
    }

}));

function config(app) {
    // Initialize passport
    app.use(passport.initialize());
}

module.exports = config;

