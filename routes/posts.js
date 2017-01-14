const express = require('express');
const router = express.Router();
const passport = require('passport');

const Post = require('../models/post');
const Reaction = require('../models/reaction');

const authenticate = passport.authenticate('bearer', {session: false});

router.get('/:id', function(req, res, next) {
    let id = req.params.id;
    Post.query().eager('creator_user', 'reactions').where('id', id).then(function(posts) {
        res.json(posts.length > 0 ? posts[0] : null);
    }).catch(function(err) {
        res.status(500).json({error: err});
    });
});

router.post('/', authenticate, function(req, res, next) {
    let data = {
        creator_user_id: req.user.id,
        content: req.body.content
    };

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

router.post('/:id/react', authenticate, function(req, res) {
    let data = {
        user_id: req.user.id,
        post_id: Number(req.params.id),
        value: req.body.value,
    };

    Reaction.query().insert(data).then(function(reaction) {
        res.json(reaction);
    }).catch(function(err) {
        res.status(500).json({error: err});
    });
});

module.exports = router;
