const fs = require("fs");
const merge = require("merge");
const toml = require("toml");
const pluginApi = require("./plugins");
const log = require("./log");
const camel = require("camelcase");
const uncamel = require("decamelize");


const defaultSettings = {
    slack: {token: "", dry: false},
    chan: {}
};

const defaultChanSettings = {
    staticSep: " | ",
    pluginSep: " | "
};

export function getRawSettings(filename = null) {
    const userSettings = (filename && fs.existsSync(filename) && toml.parse(fs.readFileSync(filename, "UTF-8")));
    const settings = merge.recursive(defaultSettings, userSettings);
    Object.keys(settings.chan).forEach((name) => {
        settings.chan[name] = merge({name}, defaultChanSettings, settings.chan[name]);
    });
    return settings;
}

export function configurePlugins(settings, additionalPlugins = {}) {
    const plugins = merge({}, pluginApi.getPlugins(settings), additionalPlugins);
    // Populate aliases
    Object.keys(plugins).forEach((name) => {
        const pluginClass = plugins[name];
        [camel(name), uncamel(name, "_"), uncamel(name, "-")].forEach((name) => {
            plugins[name] = pluginClass;
        });
    });

    Object.keys(settings.chan).forEach((chan) => {
        const vars = settings.chan[chan];
        const channelPlugins = {};
        Object.keys(plugins).forEach((pluginName) => {
            const errors = {};
            var added = false;
            const addPlugin = (conf, instanceName) => {
                const uid = (instanceName + "$" + pluginName);
                try {
                    const PluginClass = plugins[pluginName];
                    const plugin = new PluginClass(conf, instanceName);
                    plugin.channelName = chan;
                    channelPlugins[uid] = plugin;
                    added = true;
                } catch (e) {
                    errors[instanceName] = e;
                }
            };
            const conf = vars[pluginName];
            if (conf === undefined) {
                return;
            }
            addPlugin(conf, "_default");
            Object.keys(conf).forEach((instanceId) => {
                if (typeof conf[instanceId] === "object") {
                    addPlugin(conf[instanceId], instanceId);
                }
            });
            if(!added) {
                Object.keys(errors).forEach((instanceName) => {
                    const e = errors[instanceName];
                    log.w("Could not configure " + instanceName + " plugin for channel " + chan + ": " + e);
                });
            }
        });
        settings.chan[chan]._plugins = channelPlugins;
    });
}

export function getSettings(filename = null) {
    const settings = getRawSettings(filename);
    configurePlugins(settings);
    return settings;
}
