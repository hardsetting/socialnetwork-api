const Model = require('objection').Model;

function User() {
    Model.apply(this, arguments);
}

Model.extend(User);
User.tableName = 'user';

module.exports = User;