const Model = require('objection').Model;

class Notification extends Model {
    static get tableName() { return 'notification'; }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id', 'type'],
            properties: {
                id: {type: 'integer'},
                user_id: {type: 'integer'},
                type: {type: 'integer'},
                data: {type: 'string'},
                created_at: {type: 'string'},
                read_at: {type: 'string'}
            }
        };
    }

    static get relationMappings() {
        return {
            user: {
                relation: Model.HasOneRelation,
                modelClass: __dirname + '/user',
                join: {
                    from: 'user.id',
                    to: 'notification.user_id'
                }
            }
        };
    };

    $beforeInsert(queryContext) {
        this.created_at = new Date().toISOString();
    }
}

module.exports = Notification;