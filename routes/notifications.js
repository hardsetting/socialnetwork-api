const express = require('express');
const router = express.Router();
const passport = require('passport');

const Notification = require('../models/notification');
const User = require('../models/user');
const Upload = require('../models/upload');
const Post = require('../models/post');

const authenticate = passport.authenticate('bearer', {session: false});

router.get('/', authenticate, function(req, res) {
    let page = Number(req.query.page || 0);
    let perPage = Number(req.query['per-page'] || 5);

    Notification
        .query()
        .where('user_id', req.user.id)
        .page(page, perPage)
        .orderBy('created_at', 'desc')
        .then((data) => {
            res.json(data.results);
        }).catch((err) => {
            res.status(500).json({error: err.message});
        });
});

router.patch('/:id', authenticate, function(req, res) {
    let id = req.params.id;
    Notification
        .query()
        .patch({read_at: (new Date()).toISOString()})
        .where('user_id', req.user.id)
        .andWhere('id', id)
        .then(() => {
            res.json();
        }).catch((err) => {
            res.status(500).json({error: err.message});
        });
});

module.exports = router;
