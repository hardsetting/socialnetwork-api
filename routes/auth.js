const express = require('express');
const router = express.Router();
const passport = require('passport');
const uuid = require('uuid4');

const AuthToken = require('../models/auth_token');

const DURATION_DAY = 24*60*60*1000;
const TOKEN_DURATION = 3 * DURATION_DAY;

router.post('/', passport.authenticate('local', {session: false}), function(req, res) {

    let now = new Date();
    let expiresAt = new Date(now.getTime() + TOKEN_DURATION);

    let data = {
        token: uuid(),
        refresh_token: uuid(),
        user_id: req.user.id,
        expires_at: expiresAt.toISOString()
    };

    AuthToken.query().insert(data).then(function(auth_token) {
        res.json(auth_token);
    }).catch(function(err) {
        res.status(500).json(err);
    });
});

module.exports = router;
