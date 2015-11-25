import merge from "merge";
import github from "./github";
import yahooWeather from "./yahoo-weather";

const staticRegistry = {github, yahooWeather};

export function getPlugins(/*settings*/) {
    // TODO: use `settings` to dynamically load plugins?
    return merge({}, staticRegistry, {});
}
