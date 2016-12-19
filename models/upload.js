const Model = require('objection').Model;

class Upload extends Model {

    static get tableName() { return 'upload'; }
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['uuid', 'category', 'extension', 'uploader_user_id'],
            properties: {
                id: {type: 'integer'},
                uuid: {type: 'string'},
                category: {type: 'string'},
                original_name: {type: 'string'},
                extension: {type: 'string'},
                uploader_user_id: {type: 'integer'},
                uploaded_at: {type: 'string'},
                url: {type: 'string'}
            }
        };
    }

    /*static get virtualAttributes() {
        return ['url'];
    }

    get url() {
        return ;
    }*/

    $afterGet(queryContext) {
        this.url = `http://img.socialnetwork.local/${this.category}/${this.uuid}.${this.extension}`;
    }

    $beforeInsert(queryContext) {
        this.uploaded_at = new Date().toISOString();
    }
}

module.exports = Upload;