const Model = require('objection').Model;

class Post extends Model {
    static get tableName() { return 'post'; }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['creator_user_id', 'content'],
            properties: {
                id: {type: 'integer'},
                creator_user_id: {type: 'integer'},
                content: {type: 'string'},
                created_at: {type: 'string'},
                updated_at: {type: 'string'}
            }
        };
    }

    static get relationMappings() {
        return {
            creator_user: {
                relation: Model.HasOneRelation,
                modelClass: __dirname + '/user',
                join: {
                    from: 'post.creator_user_id',
                    to: 'user.id'
                }
            }
        };
    };

    $beforeInsert(queryContext) {
        this.created_at = new Date().toISOString();
    }

    $beforeUpdate(opt, queryContext) {
        this.updated_at = new Date().toISOString();
    }
}

module.exports = Post;