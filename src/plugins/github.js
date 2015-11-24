const jz = require("../jz");
const merge = require("merge");
const Promise = require("bluebird");
const sprintf = require("sprintf-js").sprintf;
const log = require("../log");

export default class Github {
    constructor(options) {
        this.options = merge({}, {
            sep: ", ",
            prs: true,
            prsLabel: ":wrench:",
            issues: true,
            issuesLabel: ":exclamation:",
            forks: true,
            forksLabel: ":fork_and_knife:",
            stars: true,
            starsLabel: ":star:",
        }, options);
        if(!this.options.repo) {
            throw new Error("Invalid configuration: repo missing");
        }
    }

    formatCount(settingKey, val) {
        if (!val) return;
        if (this.options[settingKey]) {
            const label = this.options[settingKey + "Label"] || settingKey;
            return sprintf("%d%s", val, label);
        }
    }

    render() {
        const plugin = this;
        const options = this.options;
        return new Promise(function (resolve) {
            if (!options.repo) return resolve(null);
            Promise.join(
                jz("https://api.github.com/repos/" + options.repo),
                jz("https://api.github.com/repos/" + options.repo + "/issues"),
                function (info, issues) {
                    const bits = [];
                    var nIssues = 0;
                    var nPulls = 0;
                    issues.forEach((issue) => {
                        if (issue.closed_at) return;
                        if (issue.pull_request) nPulls++;
                        else nIssues++;
                    });
                    bits.push(plugin.formatCount("prs", nPulls));
                    bits.push(plugin.formatCount("issues", nIssues));
                    bits.push(plugin.formatCount("stars", info.stargazers_count));
                    bits.push(plugin.formatCount("forks", info.forks_count));
                    resolve(bits.filter((bit) => !!bit).join(options.sep));
                }
            ).catch(function (error) {
                error = error.message || error;
                log.w("Github", "Couldn't Github %s (%s): %s", options.repo, plugin.channelName, error);
                resolve(null);
            });
        });
    }
}
