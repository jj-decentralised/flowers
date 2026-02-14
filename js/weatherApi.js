/**
 * weatherApi.js — Singapore NEA Weather Telemetry
 *
 * Fetches real-time weather data from Singapore's National Environment Agency
 * (NEA) via the data.gov.sg public APIs. No API key is required.
 *
 * Endpoints used:
 *   - Air temperature (per-station readings in Celsius)
 *   - Rainfall (per-station readings in mm)
 *   - Relative humidity (per-station readings in %)
 *   - Wind speed (per-station readings in knots)
 *   - PSI (national 24-hour reading)
 *   - 2-hour weather forecast (text descriptions per area)
 *   - UV index (national value)
 *
 * When any API call fails (CORS, rate-limit, network), the module falls back
 * to procedurally generated data that mirrors typical Singapore tropical
 * weather patterns. The returned object always carries an `isLive` flag and
 * an ISO `timestamp` so consumers know the provenance.
 *
 * Exposed on `window.WeatherApi` as a global (loaded via <script> tag).
 */

const WeatherApi = (function () {
    'use strict';

    // ---------------------------------------------------------------
    // NEA endpoints via data.gov.sg (public, no key required)
    // ---------------------------------------------------------------
    const ENDPOINTS = {
        temperature: 'https://api.data.gov.sg/v1/environment/air-temperature',
        rainfall:    'https://api.data.gov.sg/v1/environment/rainfall',
        humidity:    'https://api.data.gov.sg/v1/environment/relative-humidity',
        windSpeed:   'https://api.data.gov.sg/v1/environment/wind-speed',
        psi:         'https://api.data.gov.sg/v1/environment/psi',
        forecast:    'https://api.data.gov.sg/v1/environment/2-hour-weather-forecast',
        uv:          'https://api.data.gov.sg/v1/environment/uv-index'
    };

    // Maximum time we wait for any single endpoint before giving up.
    const FETCH_TIMEOUT_MS = 8000;

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    /**
     * Fetch JSON from `url` with a timeout. Returns the parsed body or
     * `null` when the request fails for any reason.
     */
    async function fetchJSON(url) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS);

            const response = await fetch(url, {
                signal: controller.signal,
                headers: { Accept: 'application/json' }
            });

            clearTimeout(timer);

            if (!response.ok) {
                console.warn('[WeatherApi] HTTP ' + response.status + ' from ' + url);
                return null;
            }

            return await response.json();
        } catch (err) {
            console.warn('[WeatherApi] Fetch failed for ' + url + ':', err.message || err);
            return null;
        }
    }

    /**
     * Return the arithmetic mean of an array of numbers, ignoring any
     * non-finite values. Returns `null` when no valid values remain.
     */
    function average(values) {
        var nums = values.filter(function (v) { return Number.isFinite(v); });
        if (nums.length === 0) return null;
        var sum = 0;
        for (var i = 0; i < nums.length; i++) {
            sum += nums[i];
        }
        return sum / nums.length;
    }

    // ---------------------------------------------------------------
    // Parsers — one per endpoint
    // ---------------------------------------------------------------

    /**
     * Air temperature: average across all station readings (Celsius).
     *
     * Response shape:
     *   { items: [{ readings: [{ station_id, value }, ...] }] }
     */
    function parseTemperature(data) {
        try {
            var readings = data.items[0].readings;
            var values = readings.map(function (r) { return r.value; });
            return average(values);
        } catch (_) {
            return null;
        }
    }

    /**
     * Rainfall: maximum value across stations (mm).
     * We use max rather than average because rainfall is highly localised in
     * Singapore. The maximum reading gives the best sense of ongoing rain
     * intensity for the symbolism engine.
     *
     * Response shape: same as temperature.
     */
    function parseRainfall(data) {
        try {
            var readings = data.items[0].readings;
            var values = readings.map(function (r) { return r.value; });
            var valid = values.filter(function (v) { return Number.isFinite(v); });
            if (valid.length === 0) return null;
            return Math.max.apply(null, valid);
        } catch (_) {
            return null;
        }
    }

    /**
     * Relative humidity: average across stations (%).
     *
     * Response shape: same as temperature.
     */
    function parseHumidity(data) {
        try {
            var readings = data.items[0].readings;
            var values = readings.map(function (r) { return r.value; });
            return average(values);
        } catch (_) {
            return null;
        }
    }

    /**
     * Wind speed: average across stations (knots).
     *
     * Response shape: same as temperature.
     */
    function parseWindSpeed(data) {
        try {
            var readings = data.items[0].readings;
            var values = readings.map(function (r) { return r.value; });
            return average(values);
        } catch (_) {
            return null;
        }
    }

    /**
     * PSI (Pollutant Standards Index): national 24-hour value.
     *
     * Response shape:
     *   { items: [{
     *       readings: {
     *         psi_twenty_four_hourly: { national, north, south, east, west, central },
     *         ...
     *       }
     *     }]
     *   }
     */
    function parsePSI(data) {
        try {
            var readings = data.items[0].readings;
            // Prefer the national value; fall back to averaging the regions.
            if (readings.psi_twenty_four_hourly &&
                readings.psi_twenty_four_hourly.national != null) {
                return readings.psi_twenty_four_hourly.national;
            }
            // Fallback: try averaging available regional values.
            var regional = readings.psi_twenty_four_hourly;
            if (regional) {
                var vals = Object.keys(regional).map(function (k) { return regional[k]; });
                return average(vals);
            }
            return null;
        } catch (_) {
            return null;
        }
    }

    /**
     * 2-hour weather forecast: returns the most representative forecast
     * string from the area-level forecasts.
     *
     * Response shape:
     *   { items: [{ forecasts: [{ area, forecast }, ...] }] }
     *
     * Strategy: tally each forecast string across all areas and return the
     * most common one. This gives a national-level summary.
     */
    function parseForecast(data) {
        try {
            var forecasts = data.items[0].forecasts;
            if (!forecasts || forecasts.length === 0) return null;

            // Tally forecast strings.
            var counts = {};
            for (var i = 0; i < forecasts.length; i++) {
                var text = forecasts[i].forecast;
                counts[text] = (counts[text] || 0) + 1;
            }

            // Find the most common forecast text.
            var best = null;
            var bestCount = 0;
            var keys = Object.keys(counts);
            for (var j = 0; j < keys.length; j++) {
                if (counts[keys[j]] > bestCount) {
                    bestCount = counts[keys[j]];
                    best = keys[j];
                }
            }

            return best;
        } catch (_) {
            return null;
        }
    }

    /**
     * UV index: national value (0-11+).
     *
     * Response shape:
     *   { items: [{ index: [{ value, timestamp }] }] }
     */
    function parseUV(data) {
        try {
            var indices = data.items[0].index;
            if (!indices || indices.length === 0) return null;
            // Return the most recent UV reading.
            return indices[indices.length - 1].value;
        } catch (_) {
            return null;
        }
    }

    // ---------------------------------------------------------------
    // Forecast keyword extraction
    // ---------------------------------------------------------------

    /**
     * Classify the raw forecast text into a simplified weather condition
     * category that the symbolism engine can consume.
     *
     * Categories (in priority order):
     *   "Thundery"  — thunderstorms present
     *   "Hazy"      — haze conditions
     *   "Showers"   — rain but not thundery
     *   "Cloudy"    — overcast without rain
     *   "Windy"     — strong winds (derived from wind speed, not forecast)
     *   "Fair"      — clear / fine weather
     */
    function classifyForecast(forecastText) {
        if (!forecastText) return 'Fair';
        var lower = forecastText.toLowerCase();

        if (lower.indexOf('thunder') !== -1) return 'Thundery';
        if (lower.indexOf('haz') !== -1)     return 'Hazy';
        if (lower.indexOf('shower') !== -1 || lower.indexOf('rain') !== -1) return 'Showers';
        if (lower.indexOf('cloudy') !== -1 || lower.indexOf('overcast') !== -1) return 'Cloudy';
        if (lower.indexOf('fair') !== -1 || lower.indexOf('fine') !== -1 || lower.indexOf('clear') !== -1) return 'Fair';

        // Default: return the original text trimmed.
        return forecastText;
    }

    // ---------------------------------------------------------------
    // Fallback data generator
    // ---------------------------------------------------------------

    /**
     * Generate realistic synthetic Singapore weather when APIs are
     * unavailable. Produces values that reflect the tropical equatorial
     * climate: warm temperatures (28-34 C), high humidity (70-95%),
     * frequent afternoon showers, moderate wind.
     */
    function getFallbackWeather() {
        var hour = new Date().getHours();

        // Temperature follows a simple diurnal curve.
        // Coolest around 06:00 (~26 C), hottest around 14:00 (~33 C).
        var baseTempC = 28;
        var diurnal = 3 * Math.sin((hour - 6) * Math.PI / 12);
        var temperature = baseTempC + diurnal + (Math.random() * 2 - 1);
        temperature = Math.max(25, Math.min(35, temperature));

        // Humidity inversely related to temperature, plus noise.
        var humidity = 90 - diurnal * 3 + (Math.random() * 6 - 3);
        humidity = Math.max(60, Math.min(100, humidity));

        // Rainfall: higher chance in the afternoon (12-18h).
        var rainChance = (hour >= 12 && hour <= 18) ? 0.55 : 0.2;
        var rainfall = Math.random() < rainChance ? Math.random() * 20 : 0;
        rainfall = Math.round(rainfall * 10) / 10;

        // Wind speed: light to moderate, occasionally gusty.
        var windSpeed = 5 + Math.random() * 15;
        windSpeed = Math.round(windSpeed * 10) / 10;

        // PSI: usually in the "Good" (0-50) to "Moderate" (51-100) range.
        var psi = 20 + Math.random() * 60;
        psi = Math.round(psi);

        // UV index: peaks midday.
        var uvBase = (hour >= 10 && hour <= 15)
            ? 8 + Math.random() * 4
            : 1 + Math.random() * 4;
        var uv = Math.round(uvBase);

        // Forecast text: biased toward conditions matching rainfall.
        var forecastOptions;
        if (rainfall > 10) {
            forecastOptions = ['Thundery Showers', 'Heavy Thundery Showers', 'Moderate Rain'];
        } else if (rainfall > 0) {
            forecastOptions = ['Light Showers', 'Light Rain', 'Passing Showers'];
        } else if (humidity > 85) {
            forecastOptions = ['Partly Cloudy', 'Cloudy', 'Hazy'];
        } else {
            forecastOptions = ['Fair', 'Fair & Warm', 'Partly Cloudy'];
        }
        var forecast = forecastOptions[Math.floor(Math.random() * forecastOptions.length)];

        return {
            temperature: Math.round(temperature * 10) / 10,
            rainfall:    rainfall,
            humidity:    Math.round(humidity * 10) / 10,
            windSpeed:   windSpeed,
            psi:         psi,
            uv:          uv,
            forecast:    forecast,
            condition:   classifyForecast(forecast),
            isLive:      false,
            timestamp:   new Date().toISOString()
        };
    }

    // ---------------------------------------------------------------
    // Main fetch routine
    // ---------------------------------------------------------------

    /**
     * Fetch all weather data in parallel, parse each response, and return
     * a consolidated weather object. If every endpoint fails, the fallback
     * generator is used instead. Partial failures fill in missing fields
     * from fallback values so the returned object is always complete.
     */
    async function fetchAllWeather() {
        // Fire all requests simultaneously.
        var results = await Promise.all([
            fetchJSON(ENDPOINTS.temperature),   // 0
            fetchJSON(ENDPOINTS.rainfall),       // 1
            fetchJSON(ENDPOINTS.humidity),       // 2
            fetchJSON(ENDPOINTS.windSpeed),      // 3
            fetchJSON(ENDPOINTS.psi),            // 4
            fetchJSON(ENDPOINTS.forecast),       // 5
            fetchJSON(ENDPOINTS.uv)              // 6
        ]);

        var temperature   = results[0] ? parseTemperature(results[0]) : null;
        var rainfall      = results[1] ? parseRainfall(results[1])    : null;
        var humidity      = results[2] ? parseHumidity(results[2])    : null;
        var windSpeed     = results[3] ? parseWindSpeed(results[3])   : null;
        var psi           = results[4] ? parsePSI(results[4])         : null;
        var forecastText  = results[5] ? parseForecast(results[5])    : null;
        var uv            = results[6] ? parseUV(results[6])          : null;

        // Determine how many fields came back successfully.
        var liveFields = [temperature, rainfall, humidity, windSpeed, psi, forecastText];
        var liveCount = liveFields.filter(function (v) { return v !== null; }).length;

        // If nothing came back, return pure fallback.
        if (liveCount === 0) {
            console.warn('[WeatherApi] All endpoints failed — using fallback data.');
            return getFallbackWeather();
        }

        // Generate fallback values to fill any gaps.
        var fallback = getFallbackWeather();

        var weather = {
            temperature: temperature !== null ? Math.round(temperature * 10) / 10 : fallback.temperature,
            rainfall:    rainfall !== null    ? Math.round(rainfall * 10) / 10     : fallback.rainfall,
            humidity:    humidity !== null    ? Math.round(humidity * 10) / 10     : fallback.humidity,
            windSpeed:   windSpeed !== null   ? Math.round(windSpeed * 10) / 10   : fallback.windSpeed,
            psi:         psi !== null         ? Math.round(psi)                    : fallback.psi,
            uv:          uv !== null          ? Math.round(uv)                     : fallback.uv,
            forecast:    forecastText || fallback.forecast,
            condition:   classifyForecast(forecastText || fallback.forecast),
            isLive:      true,
            timestamp:   new Date().toISOString()
        };

        console.log(
            '[WeatherApi] Live data retrieved (' + liveCount + '/' + liveFields.length + ' endpoints).',
            weather
        );

        return weather;
    }

    // ---------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------

    return {
        fetchAllWeather:    fetchAllWeather,
        getFallbackWeather: getFallbackWeather
    };
})();
