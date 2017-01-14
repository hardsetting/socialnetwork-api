const Model = require('objection').Model;

class Reaction extends Model {
    static get tableName() { return 'reaction'; }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['post_id', 'user_id', 'value'],
            properties: {
                id: {type: 'integer'},
                post_id: {type: 'integer'},
                user_id: {type: 'integer'},
                value: {type: 'string'},
                created_at: {type: 'string'},
                modified_at: {type: 'string'}
            }
        };
    }

    static get relationMappings() {
        return {
            post: {
                relation: Model.HasOneRelation,
                modelClass: __dirname + '/post',
                join: {
                    from: 'reaction.post_id',
                    to: 'post.id'
                }
            },
            user: {
                relation: Model.HasOneRelation,
                modelClass: __dirname + '/user',
                join: {
                    from: 'reaction.user_id',
                    to: 'user.id'
                }
            }
        };
    };

    $beforeInsert(queryContext) {
        this.created_at = new Date().toISOString();
    }

    $beforeUpdate(opt, queryContext) {
        this.modified_at = new Date().toISOString();
    }
}

module.exports = Reaction;