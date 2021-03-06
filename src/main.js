import Promise from "bluebird";
import {getSettings} from "./settings";
import SlackAPI from "./SlackAPI";
import getChannelTopic from "./getChannelTopic";

export function main() {
    const settings = getSettings("./slack-topical.toml");
    const slack = new SlackAPI(settings);
    const channelsPromise = slack.getChannels();
    Object.keys(settings.chan).forEach((chanName) => {
        const channelSettings = settings.chan[chanName];
        Promise.all([
            channelsPromise,
            getChannelTopic(channelSettings)
        ]).then(([slackChannelMap, newDynamic]) => {
            const slackChannelInfo = slackChannelMap[chanName];
            if (!slackChannelInfo) {
                return;
            }
            const oldTopic = slackChannelInfo.topic.value;
            const [staticPart] = oldTopic.split(channelSettings.staticSep, 2);
            var newTopic = staticPart;
            if (newDynamic && newDynamic.length) {
                newTopic = [staticPart, newDynamic].join(channelSettings.staticSep);
            }
            slack.setTopic(slackChannelInfo, newTopic);
        });
    });
}
