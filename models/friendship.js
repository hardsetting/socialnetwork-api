const Model = require('objection').Model;

class Friendship extends Model {
    static get tableName() { return 'friendship'; }
    static get idColumn() { return ['requester_user_id', 'requested_user_id']; }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['requester_user_id', 'requested_user_id'],
            properties: {
                requester_user_id: {type: 'integer'},
                requested_user_id: {type: 'integer'},
                created_at: {type: 'string'},
                accepted_at: {type: 'string'}
            }
        };
    }

    static get relationMappings() {
        return {
            requester_user: {
                relation: Model.HasOneRelation,
                modelClass: __dirname + '/user',
                join: {
                    from: 'user.id',
                    to: 'friendship.requester_user_id'
                }
            },
            requested_user: {
                relation: Model.HasOneRelation,
                modelClass: __dirname + '/user',
                join: {
                    from: 'user.id',
                    to: 'friendship.requested_user_id'
                }
            }
        };
    };
}

module.exports = Friendship;