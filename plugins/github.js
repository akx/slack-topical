const jz = require("../jz");
const merge = require("merge");
const Promise = require("bluebird");
const sprintf = require("sprintf-js").sprintf;

export default function github(options) {
    options = merge({
        sep: ", ",
        prs: true,
        prsLabel: ":wrench:",
        issues: true,
        issuesLabel: ":exclamation:",
        forks: true,
        forksLabel: ":fork_and_knife:",
        stars: true,
        starsLabel: ":star:"
    }, options);

    function formatCount(settingKey, val) {
        if(!val) return;
        if(options[settingKey]) {
            var label = options[settingKey + "Label"] || settingKey;
            return sprintf("%d%s", val, label);
        }
    }

    return new Promise(function(resolve) {
        if(!options.repo) return resolve(null);
        Promise.join(
            jz("https://api.github.com/repos/" + options.repo),
            jz("https://api.github.com/repos/" + options.repo + "/issues"),
            function(info, issues) {
                var bits = [];
                var nIssues = 0;
                var nPulls = 0;
                issues.forEach((issue) => {
                    if(issue.closed_at) return;
                    if(issue.pull_request) nPulls++;
                    else nIssues++;
                });
                bits.push(formatCount("prs", nPulls));
                bits.push(formatCount("issues", nIssues));
                bits.push(formatCount("stars", info.stargazers_count));
                bits.push(formatCount("forks", info.forks_count));
                bits = bits.filter((bit) => !!bit);
                resolve(bits.join(options.sep));
            }
        );
    });
}