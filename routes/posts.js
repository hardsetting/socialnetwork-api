const express = require('express');
const router = express.Router();
const passport = require('passport');

const Post = require('../models/post');

const authenticate = passport.authenticate('bearer', {session: false});

router.get('/:id', function(req, res, next) {
    let id = req.params.id;
    Post.query().where('id', id).then(function(posts) {
        res.json(posts.length > 0 ? posts[0] : null);
    }).catch(function(err) {
        res.status(500).json({error: err});
    });
});

// todo require logged user
router.post('/', authenticate, function(req, res, next) {
    let data = req.body;

    Post.query().insert(data).then(function(post) {
        res.json(post);
    }).catch(function(err) {
        res.status(500).json({error: err});
    });
});

// todo require logged user
router.delete('/:id', function(req, res, next) {
    let id = req.params.id;

    Post.query().delete().where('id', id).then(function(post) {
        res.send();
    }).catch(function(err) {
        res.status(500).json({error: err});
    });
});

module.exports = router;
