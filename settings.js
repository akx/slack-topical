const fs = require("fs");
const merge = require("merge");
const toml = require("toml");

const defaultSettings = {
    slack: {token: "", dry: false},
    chan: {}
};

const defaultChanSettings = {
    staticSep: " | ",
    pluginSep: " | ",
};

const userSettings = fs.existsSync("slack-topical.toml") && toml.parse(fs.readFileSync("slack-topical.toml", "UTF-8"));
const settings = merge.recursive(defaultSettings, userSettings);
Object.keys(settings.chan).forEach((chan) => {
    settings.chan[chan] = merge(defaultChanSettings, settings.chan[chan]);
});

export default settings;