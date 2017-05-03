const express = require('express');
const router = express.Router();
const passport = require('passport');
const uuid = require('uuid4');

const moment = require('moment');
const _ = require('lodash');

const wrapAsync = require('../utils').wrapAsync;

const AuthToken = require('../models/auth_token');

function generateToken() {
    return {
        token: uuid(),
        refresh_token: uuid(),
        expires_at: moment().add(30, 'minutes').toISOString()
    };
}

router.post('/login', passport.authenticate('local', {session: false}), wrapAsync(async (req, res) => {
    let token = generateToken();
    token.user_id = req.user.id;

    let authToken = await AuthToken.query().insert(token);
    return res.json(authToken);
}));

router.post('/refresh', wrapAsync(async (req, res) => {
    let refreshToken = req.body.refresh_token;
    let token = generateToken();

    let updated = await AuthToken.query().patch(token)
        .where({refresh_token: refreshToken});
        //.andWhere('expires_at', '>', moment().toISOString())

    if (!updated) {
        return res.status(401).send('Unauthorized');
    }

    return res.send(token);
}));

module.exports = router;
