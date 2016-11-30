var express = require('express');
var router = express.Router();

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
    User.query().limit(10).then(function(users) {
        res.json(users);
    }).catch(function(err) {
        res.status(500).json({error: err});
    });
});

router.get('/:id', function(req, res, next) {
    var id = req.params.id;
    User.query().where('id', id).then(function(users) {
        res.json(users.length > 0 ? users[0] : null);
    }).catch(function(err) {
        res.status(500).json({error: err});
    });
});

router.get('/search', function(req, res, next) {
    var name = req.query.name;

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

module.exports = router;
