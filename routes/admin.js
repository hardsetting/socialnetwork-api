const express = require('express');
const router = express.Router();
const passport = require('passport');
const utils = require('../utils');

const tarjan = require('../tarjan');
const Graph = require('tarjan-graph');

const Model = require('objection').Model;
const User = require('../models/user');
const Friendship = require('../models/friendship');
const Upload = require('../models/upload');
const Post = require('../models/post');

const wrapAsync = require('../utils').wrapAsync;
const authenticate = passport.authenticate('bearer', {session: false});

const _ = require('lodash');
const nj = require('numjs');

router.get('/distribution', authenticate, wrapAsync(async (req, res) => {
    let step = Number(req.query.step) || 50;

    let distribution = await Model.query()
        .select('degree')
        .from('vw_degree')
        .orderBy('degree', 'desc')
        .pluck('degree');

    // Filter values by taking them by steps
    let i = 0;
    distribution = distribution.filter(() => i++ % step === 0);

    /*let user_ids = distribution.map(entry => entry.user_id);
    let degrees = distribution.map(entry => Number(entry.degree));
    return res.send({labels: user_ids, values: degrees});*/

    return res.send(distribution);
}));

router.get('/activity', authenticate, wrapAsync(async (req, res) => {
    let name = req.query.name;
    let limit = Number(req.query.limit) || 5;
    let after = req.query.after || '1970-01-01';

    let activity = await Model.query()
        .select('user_id', 'activity')
        .from(Model.rawKnex.raw(`fn_activity_all(timestamp '${after}')`))
        .orderBy('activity', 'desc')
        .limit(limit);

    let user_ids = activity.map(activity => activity.user_id);

    let users = await User.query()
        .select('id', 'username', 'name', 'surname', 'profile_picture_id', 'friends_count', 'posts_count')
        .eager('profile_picture')
        .pick(User, ['id', 'username', 'name', 'surname', 'profile_picture', 'friends_count', 'posts_count'])
        .pick(Upload, ['id', 'url'])
        .whereIn('id', user_ids);

    activity.forEach(activity => {
        activity.user = users.find(user => user.id === activity.user_id);
        delete activity.user_id;
    });

    return res.send(activity);
}));

router.get('/hubs', authenticate, wrapAsync(async (req, res) => {
    let name = req.query.name;
    let limit = Number(req.query.limit) || 5;

    let hubs = await Model.query()
        .select('user_id', 'hubbiness')
        .from('vw_hubbiness')
        .orderBy('hubbiness', 'desc')
        .limit(limit);

    let user_ids = hubs.map(activity => activity.user_id);

    let users = await User.query()
        .select('id', 'username', 'name', 'surname', 'profile_picture_id', 'friends_count', 'posts_count')
        .eager('profile_picture')
        .pick(User, ['id', 'username', 'name', 'surname', 'profile_picture', 'friends_count', 'posts_count'])
        .pick(Upload, ['id', 'url'])
        .whereIn('id', user_ids);

    hubs.forEach(hub => {
        hub.user = users.find(user => user.id === hub.user_id);
        hub.hubbiness = Math.round(hub.hubbiness * 100.0) / 100.0;
        delete hub.user_id;
    });

    return res.send(hubs);
}));


router.get('/network_matrix', authenticate, wrapAsync(async (req, res) => {

    // Assuming there are no holes in users ids
    let n = await User.query()
        .count()
        .pluck('count')
        .first();

    let friendships = await Model.query()
        .select('user_id', 'friend_id')
        .whereRaw('user_id < friend_id')
        .from('vw_friendship')
        /*.orderBy('user_id', 'asc')*/;

    // Initialize M
    let M = [];
    for (let i=0; i<n; ++i) {
        M.push([]);
        for (let j=0; j<n; ++j) {
            M[i].push(0);
        }
    }

    friendships.forEach(friendship => {
        let a = Number(friendship.user_id)-1;
        let b = Number(friendship.friend_id)-1;

        M[a][b] = 1;
        M[b][a] = 1;
    });

    let out = "";
    for (let i=0; i<n; ++i) {
        out += "[" + M[i][0];
        for (let j=1; j<n; ++j) {
            out += ", " + M[i][j];
        }
        out += "],\n";
    }

    /*let e = nj.multiply(nj.ones([n,1]), 1.0/n);
    let v = nj.multiply(nj.ones([n,1]), 1.0/n);
    let b = 0.000005;

    for (let i=0; i<300; ++i) {
        console.log(i, v.shape);
        let a = nj.multiply(nj.dot(M, v), 1.0-b)
        let c = nj.multiply(e, b)
        v = nj.sum(a, c);
    }*/

    res.send(out);
}));

router.get('/communities_old', authenticate, wrapAsync(async (req, res) => {

    return res.status(404).send();

    let taxation = req.query.taxation || 0.05;

    let friendships = await Friendship
        .query()
        .select('requester_user_id AS a', 'requested_user_id AS b')
        /*.orderBy('requester_user_id', 'asc')*/;

    let users_ids = await User.query()
        .select('id')
        .distinct()
        .pluck('id');

    let vertices = {};
    users_ids.forEach(user_id => {
        vertices[user_id] = new tarjan.Vertex(user_id);

        /*vertices[user_id] = {
            id: user_id,
            connections: _.sampleSize(users_ids, Math.round(taxation*users_ids.length))
        };*/
    });

    let verticesArr = _.values(vertices);

    verticesArr.forEach(vertex => {
        vertex.connections = _.sampleSize(verticesArr, Math.round(taxation*verticesArr.length));
    });

    friendships.forEach(friendship => {
        if (vertices[friendship.a].connections.indexOf(vertices[friendship.b]) === -1) {
            vertices[friendship.a].connections.push(vertices[friendship.b]);
            //vertices[friendship.a].connections.push(friendship.b);
        }
    });



    let graph = new tarjan.Graph(verticesArr);
    let tarj = new tarjan.Tarjan(graph);
    let scc = tarj.run();

    /*let graph = new Graph();
    verticesArr.forEach((vertex) => {
        graph.add(vertex.id, vertex.connections);
    });

    let scc = graph.getStronglyConnectedComponents();*/

    let avgLength = scc.reduce((tot, v) => tot+v.length, 0) / scc.length;

    let comms = scc.filter(comm => comm.length > avgLength);
    console.log(avgLength);
    console.log(comms.length);

    res.send();
}));

router.get('/communities', authenticate, wrapAsync(async (req, res) => {
    let name = req.query.name;
    let limit = Number(req.query.limit) || 5;
    let limitFriends = Number(req.query.limit_friends) || 5;

    let fn_communities = Model.rawKnex.raw(`fn_communities(${limit})`);

    let rows = await Model.query()
        .select('user_id', 'friend_id')
        .from(fn_communities);

    let users_ids = new Set();
    let communities = {};

    rows.forEach(row => {
        if (!communities[row.user_id]) {
            communities[row.user_id] = {
                hub_user_id: row.user_id,
                friends_ids: []
            };
        }

        communities[row.user_id].friends_ids.push(row.friend_id);
        users_ids.add(row.user_id);
        users_ids.add(row.friend_id);
    });

    communities = _.values(communities);

    let users = await User.query()
        .select('id', 'username', 'name', 'surname', 'profile_picture_id', 'friends_count', 'posts_count')
        .eager('profile_picture')
        .pick(User, ['id', 'username', 'name', 'surname', 'profile_picture', 'friends_count', 'posts_count'])
        .pick(Upload, ['id', 'url'])
        .whereIn('id', Array.from(users_ids));

    communities.forEach(community => {
        community.hub_user = users.find(user => user.id === community.hub_user_id);

        community.friends = community.friends_ids.map(friend_id => {
            return users.find(user => user.id === friend_id);
        });

        delete community.hub_user_id;
        delete community.friends_ids;
    });

    return res.send(communities);
}));


module.exports = router;
