const merge = require("merge");

const staticRegistry = {
    github: require("./github"),
    yahooWeather: require("./yahoo-weather")
};

export function getPlugins(settings) {
    // TODO: use `settings` to dynamically load plugins?
    return merge({}, staticRegistry, {});
}
