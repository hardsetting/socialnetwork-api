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
                created_at: {type: 'timestamp'},
                updated_at: {type: 'timestamp'}
            }
        };
    }
}

Post.prototype.$beforeInsert = function () {
    this.updated_at = this.created_at = new Date().toISOString();
};

Post.prototype.$beforeUpdate = function () {
    this.updated_at = new Date().toISOString();
};

module.exports = Post;