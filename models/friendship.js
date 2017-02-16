const Model = require('objection').Model;

class Friendship extends Model {
    static get tableName() { return 'friendship'; }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id_1', 'user_id_1'],
            properties: {
                user_id_1: {type: 'integer'},
                user_id_2: {type: 'integer'},
            }
        };
    }

    static get relationMappings() {
        return {
            user_1: {
                relation: Model.HasOneRelation,
                modelClass: __dirname + '/user',
                join: {
                    from: 'user.id',
                    to: 'friendship.user_id_1'
                }
            },
            user_2: {
                relation: Model.HasOneRelation,
                modelClass: __dirname + '/user',
                join: {
                    from: 'user.id',
                    to: 'friendship.user_id_2'
                }
            }
        };
    };
}

module.exports = Friendship;