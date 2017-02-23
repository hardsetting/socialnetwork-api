const Model = require('objection').Model;
const Knex = require('knex');

let knex = Knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        port: '5432',
        database: 'socialnetwork',
        user: 'socialnetwork',
        password: 's0c1aln3tw0rk'
    }
});

Model.knex(knex);