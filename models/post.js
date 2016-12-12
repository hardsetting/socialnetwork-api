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

    $beforeInsert(queryContext) {
        let now = new Date().toISOString();
        this.created_at = now;
        this.updated_at = now;
    }

    $beforeUpdate(opt, queryContext) {
        this.updated_at = new Date().toISOString();
    }
}

module.exports = Post;