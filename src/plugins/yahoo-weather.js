//41	heavy snow
//42	scattered snow showers
//43	heavy snow
//44	partly cloudy
//45	thundershowers
//46	snow showers
//47	isolated thundershowers
//3200	not available

const jz = require("../jz");
const merge = require("merge");
const Promise = require("bluebird");
const sprintf = require("sprintf-js").sprintf;
const log = require("../log");

function format(heading, value, suffix) {
    if (!(heading && heading.length)) return null;
    if (!(value && value.length)) return null;
    var val = sprintf("%s %s%s", heading, value, suffix || "");
    val = val.replace(/^\s+|\s+$/g, "");
    return val;
}

function getCondEmoji(condCode) {
    condCode = 0 | condCode;
    if (condCode <= 12) return ":shower:";
    if (condCode <= 18) return ":snowflake:";
    if (condCode <= 22) return ":foggy:";
    if (condCode <= 24) return ":dash:";
    if (condCode == 25) return ":snowflake:";
    if (condCode <= 30) return ":cloud:";
    if (condCode <= 34) return ":sunny:";
    if (condCode == 35) return ":shower:";
    if (condCode == 36) return ":hot:";
    if (condCode <= 40) return ":shower:";
    if (condCode <= 43) return ":snowflake:";
    if (condCode == 44) return ":cloud:";
    if (condCode == 45) return ":shower:";
    if (condCode == 46) return ":snowflake:";
    if (condCode == 47) return ":shower:";
    return null;
}

export default class YahooWeather {
    constructor(options) {
        this.options = merge({}, {
            location: null,
            sep: " ",
            cond: ":star:",
            sunrise: ":sunrise:",
            sunset: ":night_with_stars:",
            humidity: ":droplet:",
            wind: ":dash:",
            temperature: ":thermo:",
        }, options);
        if(!this.options.location) {
            throw new Error("Invalid configuration: location missing");
        }
    }

    render() {
        const options = this.options;
        return new Promise(function(resolve) {
            const location = options.location;
            if (!location) {
                return resolve(null);
            }

            const query = "select * from weather.forecast " +
                "where woeid in (select woeid from geo.places(1) where text=\"" + location + "\") " +
                "and u=\"c\"";
            return jz("https://query.yahooapis.com/v1/public/yql", {
                qs: {
                    q: query,
                    format: "json",
                    env: "store://datatables.org/alltableswithkeys",
                },
            }).then(function(result) {
                const weather = result.query.results.channel;
                const cond = weather.item.condition;
                const bits = [];
                bits.push(format(getCondEmoji(cond.code) || options.cond, cond.text));
                bits.push(format(options.temperature, cond.temp, weather.units.temperature));
                bits.push(format(options.humidity, weather.atmosphere.humidity, "%"));
                bits.push(format(options.wind, weather.wind.speed, weather.units.speed));
                bits.push(format(options.sunrise, weather.astronomy.sunrise));
                bits.push(format(options.sunset, weather.astronomy.sunset));
                return resolve(bits.filter((bit) => !!bit).join(options.sep));
            }, function(rejection) {
                log.w("Yahoo-Weather", "Couldn't get weather for %s: %s", location, rejection);
                return resolve(null);
            });
        });
    }
}
