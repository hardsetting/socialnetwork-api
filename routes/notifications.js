const express = require('express');
const router = express.Router();
const passport = require('passport');

const Notification = require('../models/notification');
const User = require('../models/user');
const Upload = require('../models/upload');
const Post = require('../models/post');

const wrapAsync = require('../utils').wrapAsync;

const authenticate = passport.authenticate('bearer', {session: false});

router.get('/', authenticate, wrapAsync(async function(req, res) {
    let page = Number(req.query.page || 0);
    let perPage = Number(req.query['per-page'] || 5);

    let data = await Notification
        .query()
        .where('user_id', req.user.id)
        .page(page, perPage)
        .orderBy('created_at', 'desc');

    let postsNotifications = data.results.filter(notification => notification.data.post_id);
    let posts_ids = postsNotifications.map(notification => notification.data.post_id);

    let posts = await Post
        .query()
        .eager('creator_user.profile_picture')
        .pick(User, ['id', 'username', 'name', 'surname', 'profile_picture'])
        .pick(Upload, ['id', 'url'])
        .whereIn('id', posts_ids);

    postsNotifications.forEach(notification => {
        let post_id = notification.data.post_id;
        let post = posts.find(post => post.id === post_id);
        if (post) {
            notification.data.description = post.content;
            notification.data.user = post.creator_user;
        }
    });

    res.json(data.results);
}));

router.patch('/:id', authenticate, function(req, res) {
    let id = req.params.id;
    Notification
        .query()
        .patch({read_at: (new Date()).toISOString()})
        .where('user_id', req.user.id)
        .andWhere('id', id)
        .then(() => {
            res.status(200).send();
        }).catch((err) => {
            res.status(500).json({error: err.message});
        });
});

module.exports = router;
