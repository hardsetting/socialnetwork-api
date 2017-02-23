const Model = require('objection').Model;

class User extends Model {
    static get tableName() { return 'user'; }
    static get idColumn() { return 'id'; }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['username', 'password', 'name', 'surname', 'gender'],
            properties: {
                id: {type: 'integer'},
                username: {type: 'string'},
                password: {type: 'string'},
                name: {type: 'string'},
                surname: {type: 'string'},
                gender: {type: 'integer'}
            }
        };
    }

    static get relationMappings() {
        return {
            profile_picture: {
                relation: Model.HasOneRelation,
                modelClass: __dirname + '/upload',
                join: {
                    from: 'user.profile_picture_id',
                    to: 'upload.id'
                }
            },
            friends: {
                relation: Model.ManyToManyRelation,
                modelClass: __dirname + '/user',
                join: {
                    from: 'user.id',
                    through: {
                        from: 'friendship.user_id_1',
                        to: 'friendship.user_id_2'
                    },
                    to: 'user.id'
                }
            }
        };
    };
}

module.exports = User;