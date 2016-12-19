const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Upload = require('../models/upload');
const Post = require('../models/post');

/* GET users listing. */
router.get('/', function(req, res, next) {
    User.query().limit(10).then(function(users) {
        res.json(users);
    }).catch(function(err) {
        res.status(500).json({error: err.message});
    });
});

router.get('/search', function(req, res) {
    let name = req.query.name;

    // Return nothing if empty querystring
    if (!name) {
        return res.json([]);
    }

    User
        .query()
        .select('id', 'username', 'name', 'surname', 'gender', 'profile_picture_id')
        .whereRaw(`name || ' ' || surname ilike '%${name}%'`)
        //.where('name', 'ilike', `%${name}%`)
        //.orWhere('surname', 'ilike', `%${name}%`)
        .limit(5)
        //.modify(withProfilePicture)
        .eager('profile_picture')
        .map(function(user) {
            user.$omit('profile_picture_id');
            user.profile_picture.$pick('id', 'url');
            return user;
        })
        .then(function(users) {
            res.json(users);
        }).catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

router.get('/:id', function(req, res) {
    let id = req.params.id;
    User
        .query()
        .select('id', 'username', 'name', 'surname', 'gender', 'profile_picture_id')
        .where('id', id)
        .eager('profile_picture')
        .map(function(user) {
            user.$omit('profile_picture_id');
            user.profile_picture.$pick('id', 'url');
            return user;
        })
        .then(function(users) {
            res.json(users.length > 0 ? users[0] : null);
        }).catch(function(err) {
            res.status(500).json({error: err.message});
        });
});

router.get('/:id/posts', function(req, res, next) {
    let id = req.params.id;
    let query = Post.query()
        .where('creator_user_id', id)
        .orderBy('created_at', 'desc')
        .eager('[creator_user, creator_user.profile_picture]')
        .map(post => {
            post.$omit('creator_user_id');
            post.creator_user.$pick('id', 'username', 'name', 'surname', 'profile_picture');
            post.creator_user.profile_picture.$pick('id', 'url');
            return post;
        });

    query.then(posts => {
        res.json(posts);
    }).catch(err => {
        res.status(500).json({error: err.message});
    });
});

module.exports = router;
