import {expect} from "chai";

describe("settings", () => {
    const settingsApi = require("./settings");

    function getRawSettings() {
        return settingsApi.getRawSettings(__dirname + "/test-config.toml");
    }

    it("should be able to be loaded from TOML", () => {
        const settings = getRawSettings();
        expect(settings.slack.token).to.be.ok;
        expect(settings.fsdi0jgsfd).to.not.be.ok;
    });
    it("should be able to configure plugins", () => {
        const settings = getRawSettings();
        settingsApi.configurePlugins(settings);
        expect(Object.keys(settings.chan.ioio._plugins)).to.have.length(2); // Two Githubs
        expect(Object.keys(settings.chan.peeloilu._plugins)).to.have.length(1); // One Weather
    });
});
