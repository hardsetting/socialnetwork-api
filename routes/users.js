const express = require('express');
const router = express.Router();
const passport = require('passport');
const utils = require('../utils');

const Model = require('objection').Model;
const User = require('../models/user');
const Friendship = require('../models/friendship');
const Upload = require('../models/upload');
const Post = require('../models/post');

const wrapAsync = require('../utils').wrapAsync;

const authenticate = passport.authenticate('bearer', {session: false});

/* GET users listing. */
router.get('/', function(req, res, next) {
    let name = req.query.name;
    let limit = Number(req.query.limit) || 5;

    // Return nothing if empty querystring
    if (!name) {
        return res.json([]);
    }

    User
        .query()
        .skipUndefined()
        .select('id', 'username', 'name', 'surname', 'gender', 'profile_picture_id')
        .whereRaw(`name || ' ' || surname ilike '%${name}%'`)
        .limit(limit)
        .eager('profile_picture')
        .pick(User, ['id', 'username', 'name', 'surname', 'gender', 'profile_picture'])
        .pick(Upload, ['id', 'url'])
        .then(function(users) {
            res.json(users);
        })
        .catch(next);
});

router.get('/:id', authenticate, wrapAsync(async (req, res) => {
    let id = req.params.id;
    let idField = isNaN(id) ? 'username' : 'id';

    let userId = req.user.id;

    let user = await User
        .query()
        .select('id', 'username', 'name', 'surname', 'profile_picture_id', 'friends_count', 'posts_count')
        .where(idField, id)
        .eager('profile_picture')
        .pick(User, ['id', 'username', 'name', 'surname', 'profile_picture', 'friends_count', 'posts_count'])
        .pick(Upload, ['id', 'url'])
        .first();

    user.friendship = await Friendship.query()
        .where(c => c.where('requested_user_id', user.id).andWhere('requester_user_id', userId))
        .orWhere(c => c.where('requester_user_id', user.id).andWhere('requested_user_id', userId))
        .first();

    res.send(user);
}));

router.get('/:id/posts', function(req, res, next) {
    let id = req.params.id;
    let useUsername = isNaN(id);
    let limit = Number(req.query.limit) || 8;
    let before = req.query.before;

    let query = Post.query()
        .skipUndefined()
        .orderBy('created_at', 'desc')
        .eager('reactions.user.profile_picture')
        .pick(User, ['id', 'username', 'name', 'surname', 'profile_picture'])
        .pick(Upload, ['id', 'url']);

    // Filters posts by user (id or username)
    if (useUsername) {
        query
            .select('post.*')
            .join('user', 'post.creator_user_id', 'user.id')
            .where('user.username', id);
    } else {
        query
            .where('creator_user_id', id);
    }

    query
        .limit(limit)
        .andWhere('created_at', '<', before)
        .then(posts => {
            res.send(posts);
        })
        .catch(next);
});

//region Friends
router.get('/:id/friends', authenticate, wrapAsync(async (req, res) => {
    let id = req.params.id;
    let limit = req.query.limit || 10;
    let offset = req.query.offset || 0;

    // TODO: order friends by interactions with user

    let query = User.query()
        .select('user.*')
        .join('friendship', 'user.id', 'friendship.requested_user_id')
        .where('friendship.requester_user_id', id)
        .whereNotNull('friendship.accepted_at')
        .union((query) => {
            query
                .select('user.*')
                .from('user')
                .join('friendship', 'user.id', 'friendship.requester_user_id')
                .where('friendship.requested_user_id', id)
                .whereNotNull('friendship.accepted_at');
        });

    query.limit(limit)
        .offset(offset)
        .orderBy('name', 'asc', 'surname', 'asc')
        .eager('profile_picture')
        .pick(User, ['id', 'username', 'name', 'surname', 'profile_picture', 'posts_count', 'friends_count'])
        .pick(Upload, ['id', 'url']);

    let friends = await query;

    let friendsIds = friends.map(friend => friend.id);

    let friendships = await Friendship.query()
        .where(c => c.whereIn('requested_user_id', friendsIds).andWhere('requester_user_id', id))
        .orWhere(c => c.whereIn('requester_user_id', friendsIds).andWhere('requested_user_id', id));

    friends.forEach(friend => {
        let userId = friend.id;
        friend.friendship = friendships.find(friendship => {
            let isRequested = friendship.requested_user_id === userId;
            let isRequester = friendship.requester_user_id === userId;
            return isRequested || isRequester;
        });
    });

    res.send(friends);
}));

router.get('/:id/friendship', authenticate, wrapAsync(async function(req, res) {
    let id = Number(req.params.id);
    let user_id = Number(req.user.id);

    // First check that the user actually exists
    let user = await User.query().findById(id);

    if (!user) {
        return res.status(404).send('User not found.');
    }

    let friendship = await Friendship.query()
        .where((c) => c.where({requester_user_id: user_id, requested_user_id: id}))
        .orWhere((c) => c.where({requester_user_id: id, requested_user_id: user_id}))
        .first();

    if (!friendship) {
        // TODO: use 204
        return res.status(404).send('Friendship not found.');
    }

    return res.send(friendship);
}));

router.put('/:id/friendship', authenticate, wrapAsync(async function(req, res) {
    let id = Number(req.params.id);
    let user_id = Number(req.user.id);

    // Check that the user actually exists
    let user = await User.query().findById(id);

    if (!user) {
        return res.status(404).send('User not found.');
    }

    let friendship = await Friendship.query()
        .where((c) => c.where({requester_user_id: user_id, requested_user_id: id}))
        .orWhere((c) => c.where({requester_user_id: id, requested_user_id: user_id}))
        .first();

    // Either request or accept friendship
    if (!friendship) {
        friendship = await Friendship.query()
            .insert({
                requester_user_id: user_id,
                requested_user_id: id
            })
            .returning('*');

    } else if (friendship.requested_user_id === user_id) {
        friendship = await Friendship.query()
            .patch({accepted_at: new Date().toISOString()})
            .where({
                requester_user_id: id,
                requested_user_id: user_id
            })
            .first()
            .returning('*');
    }

    // TODO: manage not changed

    res.status(201).send(friendship);
}));

router.delete('/:id/friendship', authenticate, wrapAsync(async function(req, res) {
    let id = Number(req.params.id);
    let user_id = Number(req.user.id);

    // Check that the user actually exists
    let user = await User.query().findById(id);
    if (!user) {
        return res.status(404).send();
    }

    // Delete friendship if any
    await Friendship.query()
        .delete()
        .where((c) => c.where({requester_user_id: user_id, requested_user_id: id}))
        .orWhere((c) => c.where({requester_user_id: id, requested_user_id: user_id}));

    // TODO: differentiate delete from not found

    res.status(204).send();
}));
//endregion

router.get('/:id/suggestions', authenticate, wrapAsync(async (req, res) => {
    let id = req.params.id;
    let limit = Math.max(req.query.limit || 16, 16);
    //let offset = req.query.offset || 0;

    let suggestedUserIds = await Model.query()
        .from('vw_suggestions')
        .where('user_id', id)
        .limit(limit)
        .orderBy('score', 'desc')
        .pluck('suggested_friend_id');

    let suggestedUsers = await User.query()
        .whereIn('id', suggestedUserIds)
        .eager('profile_picture')
        .pick(User, ['id', 'username', 'name', 'surname', 'profile_picture', 'posts_count', 'friends_count'])
        .pick(Upload, ['id', 'url']);

    let friendships = await Friendship.query()
        .where(c => c.whereIn('requested_user_id', suggestedUserIds).andWhere('requester_user_id', id))
        .orWhere(c => c.whereIn('requester_user_id', suggestedUserIds).andWhere('requested_user_id', id));

    suggestedUsers.forEach(suggestedUser => {
        let userId = suggestedUser.id;
        suggestedUser.friendship = friendships.find(friendship => {
            let isRequested = friendship.requested_user_id === userId;
            let isRequester = friendship.requester_user_id === userId;
            return isRequested || isRequester;
        });
    });

    res.send(suggestedUsers);
}));

module.exports = router;
