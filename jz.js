const Promise = require("bluebird");
const request = require("request");
const merge = require("merge");

export default function(url, options) {
    options = merge.recursive({
        url: url,
        headers: {"User-Agent": "Slack-Topical"}
    }, options || {});
    return new Promise(function(resolve, reject) {
        request(options, function(error, response, body) {
            if(error) return reject(error);
            try {
                var result = JSON.parse(body);
            } catch(error) {
                return reject(error);
            }
            if(options.mutate) result = options.mutate(result);
            return resolve(result);
        });
    });
}