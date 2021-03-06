import Promise from "bluebird";
import request from "request";
import merge from "merge";
import log from "./log";

export default function(url, options) {
    options = merge.recursive({
        url: url,
        headers: {"User-Agent": "Slack-Topical"},
    }, options || {});
    log.d("jz", "Requesting %s", url);
    return new Promise(function(resolve, reject) {
        request(options, function(error, response, body) {
            if (error) return reject(error);
            try {
                var result = JSON.parse(body);
            } catch (error) {
                return reject(error);
            }

            if (response.statusCode >= 400) return reject(result);
            if (options.mutate) result = options.mutate(result);
            return resolve(result);
        });
    });
}
