const each = require("foreach");
const Promise = require("bluebird");
const plugins = require("./plugins");
const settings = require("./settings");
const slack = require("./slack");

function getChannelTopic(options) {
    return new Promise((resolve) => {
        var byPlugin = {};
        each(plugins, (fn, name) => {
            if(options[name]) byPlugin[name] = fn(options[name]);
        })
        Promise.props(byPlugin).then((byPlugin) => {
            var val = Object.values(byPlugin).filter((bit) => !!bit);
            resolve(val.join(" | "));
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
            const [staticPart] = oldTopic.split(chanOpts.sep, 2);
            const newTopic = [staticPart, newDynamic].join(chanOpts.sep);
            slack.setTopic(chanInfo, newTopic);
        });
    });
});