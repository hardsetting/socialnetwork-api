function Utils() {}

Utils.parseHost = function(req) {
    return req.protocol + '://' + req.get('host')
};

Utils.buildUrl = function(req, uri, params) {
    let url = Utils.parseHost(req) + '/' + uri;
    for (let param in params) {
        url = url.replace(':'+param, params[param]);
    }
    return url;
};

module.exports = Utils;