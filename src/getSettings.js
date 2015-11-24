const fs = require("fs");
const merge = require("merge");
const toml = require("toml");

const defaultSettings = {
    slack: {token: "", dry: false},
    chan: {}
};

const defaultChanSettings = {
    staticSep: " | ",
    pluginSep: " | "
};

export default function getSettings(filename = null) {
    const userSettings = (filename && fs.existsSync(filename) && toml.parse(fs.readFileSync(filename, "UTF-8")));
    const settings = merge.recursive(defaultSettings, userSettings);
    Object.keys(settings.chan).forEach((chan) => {
        settings.chan[chan] = merge({}, defaultChanSettings, settings.chan[chan]);
    });
    return settings;
}
