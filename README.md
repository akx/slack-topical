# slack-topical

[![Build Status](https://travis-ci.org/akx/slack-topical.svg?branch=master)](https://travis-ci.org/akx/slack-topical)
[![Coverage Status](https://coveralls.io/repos/akx/slack-topical/badge.svg?branch=master&service=github)](https://coveralls.io/github/akx/slack-topical?branch=master)

Slack-Topical is a tool that updates the topic of one or more Slack channels based on data fed by plugins.

## Setup

First, you'll need to have a Slack API token. If you want Slack-Topical to act using your own account, go to 
[https://api.slack.com/web](https://api.slack.com/web) to generate a token for a given team.  However, it's 
probably better to create a bot via the Slack integrations configuration, invite it to the channels you want
to manage and use the bot's token.

Then, create a `slack-topical.toml` configuration file:

```toml
[slack]
token = "put your Slack API token here"
dry = true  # remove this when you're ready to actually update topics

[chan.mychannelname.github]  # replace mychannelname with the actual channel name
repo = "jquery/jquery"
```

Now, just `npm start`, and a few seconds later, the topic in the `mychannelname` should update to reflect the
repo status of the jQuery repository.

## Configuration

### Channel-wide settings

There are some settings one can set per-channel.

```toml
[chan.test]
# Slack-Topical will leave anything before the static separator alone, and only replace
# content after it. The default is " | ".
staticSep = " ^___^ "

# Each plugin's output is separated by the `pluginSep` string. The default is " | ", but
# this would be a more compact (if arguably less readable) setup:
pluginSep = " "
```

### Multiple plugin instances

Each channel can host multiple instances of multiple plugins.  For instance, here's a channel with two Github repos:

```toml
[chan.test.github.awesomejquery]
repo = "jquery/jquery"

[chan.test.github.cooleslint]
repo = "eslint/eslint"
```

The order in which plugin information is displayed is based on the plugin instance name (`awesomejquery`, `cooleslint`).

## Plugins

These are the built-in plugins. (There is currently no mechanism for loading external plugins, but one will surely
be forthcoming.)

### GitHub (`github`)

```toml
repo = "jquery/jquery"  # The repository to check. (Authentication is not currently supported, so public repos only.) 
sep = ", "  # Separate the sub-output with this sequence.
prs = true  # Show count of PRs?
prsLabel = ":wrench:"  # Prefix for PR count
issues = true  # Show count of open issues?
issuesLabel = ":exclamation:"  # Prefix for issue count
forks = true  # Show count of forks?
forksLabel = ":fork_and_knife:"  # Prefix for fork count
stars = true  # Show stargazer count?
starsLabel = ":star:"   # Prefix for stargazer count 
```

### Yahoo! Weather (`yahoo-weather`)

```toml
location = "Turku, Finland"  # The location for weather queries.
sep = " "  # Separate output with this sequence
cond = ":star:"  # Prefix for the condition text. Will be replaced by emoji if possible.
sunrise = ":sunrise:"  # Prefix for sunrise time. Leave empty/null to disable.
sunset = ":night_with_stars:"  # Prefix for sunset time. Leave empty/null to disable.
humidity = ":droplet:"  # Prefix for humidity%. Leave empty/null to disable.
wind = ":dash:"  # Prefix for wind speed. Leave empty/null to disable.
temperature = ":thermo:"   # Prefix for temperature. Leave empty/null to disable.
```
