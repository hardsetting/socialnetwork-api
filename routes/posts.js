const express = require('express');
const router = express.Router();
const passport = require('passport');
const utils = require('../utils');

const Post = require('../models/post');
const Reaction = require('../models/reaction');
const User = require('../models/user');
const Upload = require('../models/upload');

const authenticate = passport.authenticate('bearer', {session: false});

router.get('/:id', function(req, res, next) {
    let id = req.params.id;
    Post.query()
        .eager('creator_user.profile_picture')
        .pick(User, ['id', 'username', 'name', 'surname', 'profile_picture'])
        .pick(Upload, ['id', 'url'])
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
        .eager('reactions.user.profile_picture')
        .pick(User, ['id', 'username', 'name', 'surname', 'profile_picture'])
        .pick(Upload, ['id', 'url'])
        .insert(data)
        .then(function(post) {
            res.set('Location', utils.buildUrl(req, 'api/posts/:id', {id: post.id}));
            res.status(201).send(post);
        })
        .catch(next);
});

router.put('/:id', authenticate, function(req, res, next) {
    let id = req.params.id;
    let user_id = req.user.id;
    let content = req.body.content;

    Post.query()
        .where('id', id)
        .first()
        .then(post => {
            if (!post) {
                return res.status(404).send();
            } else if (post.creator_user_id != user_id) {
                return res.status(403).send();
            }

            return Post.query()
                .patch({content: content})
                .where('id', id)
                .andWhere('creator_user_id', user_id)
                .then(() => {
                    res.status(204).send();
                });
        })
        .catch(next);
});

router.delete('/:id', authenticate, function(req, res, next) {
    let id = req.params.id;
    let user_id = req.user.id;

    // First determine whether the user owns the post
    Post.query()
        .where('id', id)
        .first()
        .then(post => {
            if (!post) {
                // Post not found
                return res.status(404).send();
            } else if (post.creator_user_id != user_id) {
                // Post is owned by another user
                return res.status(403).send();
            }

            return Post.query()
                .delete()
                .where('id', id)
                .andWhere('creator_user_id', user_id)
                .then(() => {
                    res.status(204).send();
                });
        })
        .catch(next);
});

router.put('/:id/react', authenticate, function(req, res, next) {
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

            // TODO: test if outer catch catches inner error
            return Reaction.query().insert(data).then(function(reaction) {
                res.send(reaction);
            });
        })
        .catch(next);
});

router.delete('/:id/react', authenticate, function(req, res, next) {
    let post_id = Number(req.params.id);
    let user_id = req.user.id;

    Reaction.query()
        .delete()
        .where('post_id', post_id)
        .andWhere('user_id', user_id)
        .then(function() {
            return res.send();
        })
        .catch(next);
});

module.exports = router;
