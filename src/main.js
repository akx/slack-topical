const each = require("foreach");
const Promise = require("bluebird");
const plugins = require("./plugins");
const getSettings = require("./getSettings");
const SlackAPI = require("./SlackAPI");
const camel = require("camelcase");
const uncamel = require("decamelize");

function getChannelTopic(chanOpts, chanName) {
    return new Promise((resolve) => {
        var byPlugin = {};
        each(plugins, (fn, name) => {
            [name, camel(name), uncamel(name, "_"), uncamel(name, "-")].forEach((mName) => {
                var pluginOpts = chanOpts[mName];
                if (pluginOpts && !byPlugin[name]) {
                    byPlugin[name] = fn(pluginOpts, chanName);
                }
            });
        });
        Promise.props(byPlugin).then((byPlugin) => {
            var val = Object.values(byPlugin).filter((bit) => !!bit);
            resolve(val.join(chanOpts.pluginSep));
        });
    });
}

function main() {
    const settings = getSettings("./slack-topical.toml");
    var channelTopicPromises = {};
    each(settings.chan, (options, channel) => {
        channelTopicPromises[channel] = getChannelTopic(options, channel);
    });
    const slack = new SlackAPI(settings);
    var channels = slack.getChannels();
    Promise.props(channelTopicPromises).then((newTopicMap) => {
        channels.then((chanMap) => {
            each(newTopicMap, (newDynamic, chanName) => {
                const chanOpts = settings.chan[chanName];
                const chanInfo = chanMap[chanName];
                if (!chanInfo) return;
                const oldTopic = chanInfo.topic.value;
                const [staticPart] = oldTopic.split(chanOpts.staticSep, 2);
                var newTopic = staticPart;
                if (newDynamic && newDynamic.length) {
                    newTopic = [staticPart, newDynamic].join(chanOpts.staticSep);
                }

                slack.setTopic(chanInfo, newTopic);
            });
        });
    });
}

export default main;
