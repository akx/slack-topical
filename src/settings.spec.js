describe("settings", () => {
    it("should be able to be loaded from TOML", () => {
        const settings = require("./getSettings")(__dirname + "/test-config.toml");
        // TODO: Test structure
    });
});
