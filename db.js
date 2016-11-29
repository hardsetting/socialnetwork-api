const Model = require('objection').Model;
const Knex = require('knex');

var knex = Knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        port: '5432',
        database: 'socialnetwork'
    }
});

Model.knex(knex);