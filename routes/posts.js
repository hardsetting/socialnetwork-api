const express = require('express');
const router = express.Router();
const passport = require('passport');

const Post = require('../models/post');
const Reaction = require('../models/reaction');

const authenticate = passport.authenticate('bearer', {session: false});

router.get('/:id', function(req, res, next) {
    let id = req.params.id;
    Post.query()
        .eager('[creator_user, reactions, reactions.user, reactions.user.profile_picture]')
        .where('id', id)
        .then(function(posts) {
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

    Post.query()
        .eager('[reactions, reactions.user, reactions.user.profile_picture]')
        .insert(data)
        .then(function(post) {
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
        post_id: Number(req.params.id),
        user_id: req.user.id,
        value: req.body.value
    };

    Reaction.query()
        .patch({value: data.value})
        .where('post_id', data.post_id)
        .andWhere('user_id', data.user_id)
        .then(function(updated) {
            if (updated) {
                return res.json(data);
            }

            return Reaction.query().insert(data).then(function(reaction) {
                res.json(reaction);
            })
        }).catch(function(err) {
            res.status(500).json({error: err});
        });

});

router.delete('/:id/react', authenticate, function(req, res) {
    let post_id = Number(req.params.id);
    let user_id = req.user.id;

    Reaction.query()
        .delete()
        .where('post_id', post_id)
        .andWhere('user_id', user_id)
        .then(function(deleted) {
            return res.json();
        })
        .catch(function(err) {
            res.status(500).json({error: err});
        });
});

module.exports = router;
