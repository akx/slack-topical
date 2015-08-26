const each = require("foreach");
const Promise = require("bluebird");
const plugins = require("./plugins");
const settings = require("./settings");
const slack = require("./slack");
const camel = require("camelcase");
const uncamel = require("decamelize");

function getChannelTopic(chanOpts) {
    return new Promise((resolve) => {
        var byPlugin = {};
        each(plugins, (fn, name) => {
            [name, camel(name), uncamel(name, "_"), uncamel(name, "-")].forEach((mName) => {
                var pluginOpts = chanOpts[mName];
                if(pluginOpts) byPlugin[name] = fn(pluginOpts);
            });
        });
        Promise.props(byPlugin).then((byPlugin) => {
            var val = Object.values(byPlugin).filter((bit) => !!bit);
            resolve(val.join(chanOpts.pluginSep));
        });
    });
}

var channelTopicPromises = {};
each(settings.chan, (o, c) => { channelTopicPromises[c] = getChannelTopic(o); });

Promise.props(channelTopicPromises).then((newTopicMap) => {
    slack.channelListPromise.then((chanMap) => {
        each(newTopicMap, (newDynamic, chanName) => {
            const chanOpts = settings.chan[chanName];
            const chanInfo = chanMap[chanName];
            if(!chanInfo) return;
            const oldTopic = chanInfo.topic.value;
            const [staticPart] = oldTopic.split(chanOpts.staticSep, 2);
            var newTopic = staticPart;
            if(newDynamic && newDynamic.length) {
                newTopic = [staticPart, newDynamic].join(chanOpts.staticSep);
            }
            slack.setTopic(chanInfo, newTopic);
        });
    });
});
