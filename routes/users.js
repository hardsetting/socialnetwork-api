const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Post = require('../models/post');

/* GET users listing. */
router.get('/', function(req, res, next) {
    User.query().limit(10).then(function(users) {
        res.json(users);
    }).catch(function(err) {
        res.status(500).json({error: err});
    });
});

router.get('/search', function(req, res, next) {
    let name = req.query.name;

    // Return nothing if empty querystring
    if (!name) {
        return res.json([]);
    }

    User.query().where('id', name).limit(5).then(function(users) {
        res.json(users);
    }).catch(function(err) {
        res.status(500).json({error: err});
    });
});

router.get('/:id', function(req, res, next) {
    let id = req.params.id;
    User.query().where('id', id).then(function(users) {
        res.json(users.length > 0 ? users[0] : null);
    }).catch(function(err) {
        res.status(500).json({error: err});
    });
});

router.get('/:id/posts', function(req, res, next) {
    let id = req.params.id;
    let query = Post.query()
        .where('creator_user_id', id)
        .orderBy('created_at', 'desc');

    query.then(function(posts) {
        res.json(posts);
    }).catch(function(err) {
        res.status(500).json({error: err});
    });
});

module.exports = router;
