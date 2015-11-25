const sprintf = require("sprintf-js").sprintf;
const levels = {e: 10, w: 20, i: 30, d: 40};
var visibleLevel = levels.i;

function ts() {
    const now = new Date();
    return sprintf(
        "%04d-%02d-%02dT%02d:%02d:%02d.%03d",
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
    );
}

export function log(type, tag, message) {
    type = (("" + type).toLowerCase());
    if (!levels[type]) type = "i";
    const level = levels[level];
    if (level < visibleLevel) return;
    message = sprintf.apply(null, [].slice.call(arguments, 2));
    const formatted = sprintf("[%s] %s/%s: %s", ts(), type.toUpperCase(), tag, message);
    console.log(formatted);
}

function as(type) {
    return function() {
        log.apply(null, [type].concat([].slice.call(arguments)));
    };
}

export function setLevel(newLevel) {
    visibleLevel = 0 | (levels[newLevel] || newLevel);
}

export var e = as("e");
export var d = as("d");
export var i = as("i");
export var w = as("w");
