const Promise = require("bluebird");

export default function getChannelTopic(chanOpts, chanName) {
    return new Promise((resolve) => {
        var renders = {};
        Object.keys(chanOpts._plugins).forEach((instanceName) => {
            const pluginInst = chanOpts._plugins[instanceName];
            renders[instanceName] = pluginInst.render();
        });
        Promise.props(renders).then((byPlugin) => {
            var val = Object.keys(byPlugin).sort().map((instanceName) => {
                var out = byPlugin[instanceName];
                const plugin = chanOpts._plugins[instanceName];
                if (!out) return null;
                if (plugin.options.prefix) {
                    out = "" + plugin.options.prefix + out;
                }
                if (plugin.options.suffix) {
                    out = "" + out + plugin.options.suffix;
                }
                return out;
            }).filter((bit) => !!bit);
            resolve(val.join(chanOpts.pluginSep));
        });
    });
};
