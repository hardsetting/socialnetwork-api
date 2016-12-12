const Model = require('objection').Model;

class AuthToken extends Model {
    static get tableName() { return 'auth_token'; }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['token', 'refresh_token', 'user_id', 'expires_at'],
            properties: {
                id: {type: 'integer'},
                token: {type: 'string'},
                refresh_token: {type: 'string'},
                user_id: {type: 'integer'},
                created_at: {type: 'string'},
                expires_at: {type: 'string'}
            }
        };
    }

    static get relationMappings() {
        return {
            user: {
                relation: Model.HasOneRelation,
                modelClass: __dirname + '/user',
                join: {
                    from: 'auth_token.user_id',
                    to: 'user.id'
                }
            }
        };
    };

    $beforeInsert(queryContext) {
        this.created_at = new Date().toISOString();
    }
}

module.exports = AuthToken;