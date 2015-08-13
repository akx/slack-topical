const jz = require("./jz");
const settings = require("./settings");


export function setTopic(chanInfo, newTopic) {
    const oldTopic = chanInfo.topic.value;
    if(oldTopic == newTopic) {
        console.log("<<" + chanInfo.name + ">>: Topic is fresh, not updated");
        return;
    }
    if(settings.slack.dry) {
        console.log("<<" + chanInfo.name + ">>: Would update topic to '" + newTopic + "' (dry run)");
        return;
    }
    return jz("https://slack.com/api/channels.setTopic", {qs: {
        token: settings.slack.token,
        channel: chanInfo.id,
        topic: newTopic
    }}).then((result) => {
        if(result.ok) {
            console.log("<<" + chanInfo.name + ">>: Topic updated to '" + newTopic + "'");
        } else {
            console.log("<<" + chanInfo.name + ">>: Error: " + result.error);
        }
    });
}

export var channelListPromise = jz("https://slack.com/api/channels.list", {
    qs: {token: settings.slack.token},
    mutate: (value) => {
        const out = {};
        value.channels.forEach((chan) => {out[chan.name] = chan;});
        return out;
    }
});