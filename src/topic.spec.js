import {expect} from "chai";
import Promise from "bluebird";
import getChannelTopic from "./getChannelTopic";

describe("topic API", () => {
    const settingsApi = require("./settings");
    class DummyPlugin {
        constructor(options) {
            if (options.value === undefined) {
                throw new Error("no value");
            }
            this.options = options;
        }

        render() {
            return Promise.resolve(this.options.value);
        }
    }
    it("should be able to render dummies", () => {
        const settings = {
            chan: {
                waterfall: {
                    pluginSep: " +++ ",
                    dummy: {
                        mad: {prefix: "not an ", value: "angry dummy"},
                        sad: {value: "blook", suffix: "tunes"},
                        ignored: {value: null}
                    }
                }
            }
        };
        settingsApi.configurePlugins(settings, {dummy: DummyPlugin});
        return getChannelTopic(settings.chan.waterfall).then((value) => {
            expect(value).to.equal("not an angry dummy +++ blooktunes");
        });
    });
});
