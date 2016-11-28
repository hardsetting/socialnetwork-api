var express = require('express');
var router = express.Router();
var pg = require('pg');

/* GET users listing. */
router.get('/', function(req, res, next) {
  pg.connect('postgres://localhost:5432/socialnetwork');
  res.json({ciao: 'lòl'});
});

module.exports = router;
