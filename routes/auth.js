const express = require('express');
const router = express.Router();
const passport = require('passport');
const uuid = require('uuid4');

const moment = require('moment');
const _ = require('lodash');

const AuthToken = require('../models/auth_token');

function generateTokens() {
    return {
        token: uuid(),
        refresh_token: uuid(),
        expires_at: moment().add(30, 'minutes').toISOString()
    };
}

router.post('/', passport.authenticate('local', {session: false}), function(req, res) {
    let tokens = generateTokens();

    let data = _.clone(tokens);
    data.user_id = req.user.id;

    AuthToken.query().insert(data).then(function() {
        res.json(tokens);
    }).catch(function(err) {
        res.status(500).json(err);
    });
});

router.post('/refresh', function(req, res) {
    let refreshToken = req.body.refresh_token;
    let tokens = generateTokens();

    AuthToken.query().patch(tokens)
        .where({refresh_token: refreshToken})
        //.andWhere('expires_at', '>', moment().toISOString())
        .then(function(updated) {
            if (!updated) {
                res.status(401).send('Unauthorized');
            }

            res.json(tokens);
        }).catch(function(err) {
            return res.status(500).json(err);
        });
});

module.exports = router;
