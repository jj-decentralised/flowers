/**
 * symbolismEngine.js — Data-to-Flora Mapping
 *
 * The interpretive heart of The Living Vases. Takes real-time data from
 * weather, astronomy, and museum sources and maps them onto a curated
 * selection of flowers, foliage, and arrangement styles.
 *
 * Responsibilities:
 *   - Map temperature ranges to warm/cool-palette flowers
 *   - Map humidity & rainfall to lushness and density
 *   - Map zodiac signs and moon phases to symbolic blooms
 *   - Map museum artwork culture/period to historically appropriate flora
 *   - Determine colour palette, stem length, and arrangement shape
 *   - Output a structured "arrangement recipe" for the composition engine
 *
 * Dependencies: FloraDatabase (global)
 */

const SymbolismEngine = (function () {

    // -----------------------------------------------------------------------
    // Weather protocol thresholds (tuned for Singapore climate)
    // -----------------------------------------------------------------------
    var THRESHOLDS = {
        rainfall: 0,        // mm — any positive value means rain
        heavyRain: 10,      // mm — heavy monsoon rain
        heat: 32,           // Celsius
        extremeHeat: 36,    // Celsius
        cold: 22,           // Celsius — cool for Singapore
        wind: 20,           // km/h
        strongWind: 40,     // km/h
        humidity: 90,       // percentage — very humid even for Singapore
        haze: 100           // PSI — unhealthy threshold
    };

    // Zodiac sign date ranges (month, day) — inclusive start, exclusive end
    var ZODIAC_DATES = [
        { sign: 'Capricorn',    start: [12, 22], end: [1, 20]  },
        { sign: 'Aquarius',     start: [1, 20],  end: [2, 19]  },
        { sign: 'Pisces',       start: [2, 19],  end: [3, 21]  },
        { sign: 'Aries',        start: [3, 21],  end: [4, 20]  },
        { sign: 'Taurus',       start: [4, 20],  end: [5, 21]  },
        { sign: 'Gemini',       start: [5, 21],  end: [6, 21]  },
        { sign: 'Cancer',       start: [6, 21],  end: [7, 23]  },
        { sign: 'Leo',          start: [7, 23],  end: [8, 23]  },
        { sign: 'Virgo',        start: [8, 23],  end: [9, 23]  },
        { sign: 'Libra',        start: [9, 23],  end: [10, 23] },
        { sign: 'Scorpio',      start: [10, 23], end: [11, 22] },
        { sign: 'Sagittarius',  start: [11, 22], end: [12, 22] }
    ];

    // Moon phase names by illumination fraction and waxing/waning state
    var MOON_PHASES = [
        { name: 'New Moon',        minIllum: 0,    maxIllum: 0.03 },
        { name: 'Waxing Crescent', minIllum: 0.03, maxIllum: 0.25 },
        { name: 'First Quarter',   minIllum: 0.25, maxIllum: 0.50 },
        { name: 'Waxing Gibbous',  minIllum: 0.50, maxIllum: 0.75 },
        { name: 'Full Moon',       minIllum: 0.75, maxIllum: 1.01 }
    ];


    // -----------------------------------------------------------------------
    // Weather Protocol Detection
    // -----------------------------------------------------------------------

    /**
     * Determine the active weather protocol(s) from raw weather data.
     * Multiple protocols can be active simultaneously.
     *
     * @param {object} weather
     *   - temperature {number} Celsius
     *   - humidity {number} percentage (0-100)
     *   - rainfall {number} mm
     *   - windSpeed {number} km/h
     *   - psi {number} Pollutant Standards Index
     *   - forecast {string} optional textual forecast
     * @returns {string[]} Array of active protocol names
     */
    function getWeatherProtocols(weather) {
        if (!weather) return ['fair'];

        var protocols = [];

        // Rain / Monsoon
        if ((weather.rainfall || 0) > THRESHOLDS.rainfall) {
            if ((weather.rainfall || 0) >= THRESHOLDS.heavyRain) {
                protocols.push('heavy_monsoon');
            } else {
                protocols.push('monsoon');
            }
        }

        // Heat
        if ((weather.temperature || 0) >= THRESHOLDS.extremeHeat) {
            protocols.push('extreme_heat');
        } else if ((weather.temperature || 0) >= THRESHOLDS.heat) {
            protocols.push('heat');
        }

        // Cold (unusual for Singapore but handled)
        if ((weather.temperature || 0) <= THRESHOLDS.cold) {
            protocols.push('cold');
        }

        // Wind
        if ((weather.windSpeed || 0) >= THRESHOLDS.strongWind) {
            protocols.push('strong_wind');
        } else if ((weather.windSpeed || 0) >= THRESHOLDS.wind) {
            protocols.push('wind');
        }

        // Haze (Singapore-specific: PSI readings)
        if ((weather.psi || 0) >= THRESHOLDS.haze) {
            protocols.push('haze');
        }

        // Humidity (distinct from rain — hot and sticky without precipitation)
        if ((weather.humidity || 0) >= THRESHOLDS.humidity && protocols.indexOf('monsoon') === -1 && protocols.indexOf('heavy_monsoon') === -1) {
            protocols.push('humidity');
        }

        // If nothing triggered, it is a fair day
        if (protocols.length === 0) {
            protocols.push('fair');
        }

        return protocols;
    }

    /**
     * Simplified single-protocol getter for backward compatibility.
     * Returns the most significant (first) protocol.
     *
     * @param {object} weather
     * @returns {string}
     */
    function getWeatherProtocol(weather) {
        return getWeatherProtocols(weather)[0];
    }


    // -----------------------------------------------------------------------
    // Weather-based Flower Selection
    // -----------------------------------------------------------------------

    /**
     * Map a protocol name to the FloraDatabase weather category.
     */
    function protocolToWeatherCategory(protocol) {
        switch (protocol) {
            case 'monsoon':
            case 'heavy_monsoon':
                return 'rain';
            case 'heat':
            case 'extreme_heat':
                return 'heat';
            case 'wind':
            case 'strong_wind':
                return 'wind';
            case 'humidity':
                return 'humidity';
            case 'haze':
                return 'haze';
            case 'cold':
                return 'cold';
            default:
                return null;
        }
    }

    /**
     * Pretty name for a protocol, used in the narrative and receipt.
     */
    function protocolDisplayName(protocol) {
        var names = {
            'monsoon': 'Monsoon Protocol',
            'heavy_monsoon': 'Heavy Monsoon Protocol',
            'heat': 'Tropical Heat Protocol',
            'extreme_heat': 'Extreme Heat Protocol',
            'wind': 'Wind Protocol',
            'strong_wind': 'Strong Wind Protocol',
            'humidity': 'Humidity Protocol',
            'haze': 'Haze Protocol',
            'cold': 'Cool Weather Protocol',
            'fair': 'Fair Skies'
        };
        return names[protocol] || protocol;
    }

    /**
     * Select flowers based on the current weather conditions.
     * Also applies Singapore-specific overrides.
     *
     * @param {object} weather - Raw weather data object
     * @returns {Array} Array of { flower, role, reason, protocol }
     */
    function selectWeatherFlowers(weather) {
        var protocols = getWeatherProtocols(weather);
        var results = [];
        var addedKeys = {};

        // Gather flowers for each active protocol
        for (var p = 0; p < protocols.length; p++) {
            var protocol = protocols[p];
            var category = protocolToWeatherCategory(protocol);

            if (category) {
                var flowers = FloraDatabase.getByWeather(category);
                for (var f = 0; f < flowers.length; f++) {
                    var flower = flowers[f];
                    if (!addedKeys[flower.key]) {
                        addedKeys[flower.key] = true;
                        results.push({
                            flower: flower,
                            role: 'weather_accent',
                            reason: protocolDisplayName(protocol) + ' — ' + describeWeatherTrigger(protocol, weather),
                            protocol: protocol
                        });
                    }
                }
            }
        }

        // Singapore-specific overrides
        var vandaIncluded = !!addedKeys['vanda_miss_joaquim'];

        // Override 1: Humidity above 90% always includes Vanda Miss Joaquim
        if (!vandaIncluded && (weather.humidity || 0) >= 90) {
            var vandaFlower = FloraDatabase.getByKey('vanda_miss_joaquim');
            if (vandaFlower) {
                results.push({
                    flower: vandaFlower,
                    role: 'weather_accent',
                    reason: 'Singapore humidity override — humidity at ' + Math.round(weather.humidity) + '%',
                    protocol: 'humidity'
                });
                vandaIncluded = true;
            }
        }

        // Override 2: Singapore National Day (August 9)
        if (!vandaIncluded && isSingaporeNationalDay()) {
            var vandaNational = FloraDatabase.getByKey('vanda_miss_joaquim');
            if (vandaNational) {
                results.push({
                    flower: vandaNational,
                    role: 'weather_accent',
                    reason: 'Singapore National Day — Vanda Miss Joaquim as national tribute',
                    protocol: 'national_day'
                });
            }
        }

        // For fair weather with no weather flowers, add seasonal tropical defaults
        if (results.length === 0) {
            var tropicalDefaults = FloraDatabase.getBySeason('tropical');
            if (tropicalDefaults.length > 0) {
                // Pick one tropical flower at random for gentle variety
                var pick = tropicalDefaults[Math.floor(Math.random() * tropicalDefaults.length)];
                results.push({
                    flower: pick,
                    role: 'weather_accent',
                    reason: 'Fair skies — a tropical bloom for Singapore',
                    protocol: 'fair'
                });
            }
        }

        return results;
    }

    /**
     * Generate a short human-readable trigger description for a protocol.
     */
    function describeWeatherTrigger(protocol, weather) {
        switch (protocol) {
            case 'monsoon':
                return 'rainfall detected (' + (weather.rainfall || 0).toFixed(1) + ' mm)';
            case 'heavy_monsoon':
                return 'heavy rainfall (' + (weather.rainfall || 0).toFixed(1) + ' mm)';
            case 'heat':
                return 'temperature at ' + Math.round(weather.temperature || 0) + '\u00B0C';
            case 'extreme_heat':
                return 'extreme temperature at ' + Math.round(weather.temperature || 0) + '\u00B0C';
            case 'cold':
                return 'cool temperature at ' + Math.round(weather.temperature || 0) + '\u00B0C';
            case 'wind':
                return 'wind speed ' + Math.round(weather.windSpeed || 0) + ' km/h';
            case 'strong_wind':
                return 'strong wind at ' + Math.round(weather.windSpeed || 0) + ' km/h';
            case 'humidity':
                return 'humidity at ' + Math.round(weather.humidity || 0) + '%';
            case 'haze':
                return 'PSI at ' + Math.round(weather.psi || 0);
            default:
                return 'fair conditions';
        }
    }


    // -----------------------------------------------------------------------
    // Celestial-based Flower Selection
    // -----------------------------------------------------------------------

    /**
     * Select flowers based on a celestial profile.
     *
     * @param {object} celestialProfile
     *   - sunSign {string}   Current zodiac sign of the Sun (e.g. 'Scorpio')
     *   - venusSign {string} Current zodiac sign of Venus
     *   - moonPhase {number} Illumination fraction 0.0 - 1.0
     *   - moonWaxing {boolean} true if waxing, false if waning
     *   - risingSeason {string} optional — seasonal override
     * @returns {Array} Array of { flower, role, reason }
     */
    function selectCelestialFlowers(celestialProfile) {
        if (!celestialProfile) return [];

        var results = [];
        var sunSign = celestialProfile.sunSign || '';
        var venusSign = celestialProfile.venusSign || '';
        var moonPhase = typeof celestialProfile.moonIllumination === 'number'
            ? celestialProfile.moonIllumination
            : (typeof celestialProfile.moonPhase === 'number' ? celestialProfile.moonPhase : 0.5);

        // --- Sun sign -> primary zodiac flower ---
        var sunFlower = FloraDatabase.getByZodiac(sunSign);
        if (sunFlower) {
            results.push({
                flower: sunFlower,
                role: 'zodiac_primary',
                reason: 'Sun in ' + sunSign + ' — ' + sunFlower.symbolism
            });
        }

        // --- Venus sign -> love/beauty accent flower ---
        if (venusSign && venusSign !== sunSign) {
            var venusFlower = FloraDatabase.getByZodiac(venusSign);
            if (venusFlower) {
                results.push({
                    flower: venusFlower,
                    role: 'venus_accent',
                    reason: 'Venus in ' + venusSign + ' — ' + venusFlower.symbolism
                });
            }
        }

        // --- Moon phase modifies the density / bloom openness ---
        // Not adding extra flowers but annotating existing ones with phase data
        var phaseInfo = getMoonPhaseName(moonPhase);
        for (var i = 0; i < results.length; i++) {
            results[i].moonPhase = phaseInfo.name;
            results[i].moonIllumination = moonPhase;
        }

        // --- If moon is full, add a special luminous accent ---
        if (moonPhase >= 0.75) {
            var moonFlower = FloraDatabase.getByZodiac('Cancer'); // White Rose — Moon's own sign
            if (moonFlower && !results.some(function (r) { return r.flower.key === moonFlower.key; })) {
                results.push({
                    flower: moonFlower,
                    role: 'moon_accent',
                    reason: 'Full Moon luminance — ' + moonFlower.common + ' glows with lunar energy',
                    moonPhase: phaseInfo.name,
                    moonIllumination: moonPhase
                });
            }
        }

        // --- If moon is new, add a mystery accent ---
        if (moonPhase <= 0.03) {
            var darkFlower = FloraDatabase.getByZodiac('Scorpio'); // Geranium — mystery
            if (darkFlower && !results.some(function (r) { return r.flower.key === darkFlower.key; })) {
                results.push({
                    flower: darkFlower,
                    role: 'moon_accent',
                    reason: 'New Moon darkness — ' + darkFlower.common + ' emerges from shadow',
                    moonPhase: phaseInfo.name,
                    moonIllumination: moonPhase
                });
            }
        }

        return results;
    }

    /**
     * Determine moon phase name from illumination fraction.
     */
    function getMoonPhaseName(illumination) {
        for (var i = 0; i < MOON_PHASES.length; i++) {
            if (illumination >= MOON_PHASES[i].minIllum && illumination < MOON_PHASES[i].maxIllum) {
                return MOON_PHASES[i];
            }
        }
        return { name: 'Waning', minIllum: 0, maxIllum: 1 };
    }


    // -----------------------------------------------------------------------
    // Bloom Count Calculation
    // -----------------------------------------------------------------------

    /**
     * Determine total bloom count based on moon phase.
     * Full moon = maximum blooms (12), new moon = minimal (5).
     * Intermediate phases scale linearly.
     *
     * @param {number} moonIllumination - 0.0 to 1.0
     * @returns {number} Integer bloom count between 5 and 12
     */
    function calculateBloomCount(moonIllumination) {
        var MIN_BLOOMS = 5;
        var MAX_BLOOMS = 12;
        var illum = Math.max(0, Math.min(1, moonIllumination || 0));
        return Math.round(MIN_BLOOMS + (MAX_BLOOMS - MIN_BLOOMS) * illum);
    }


    // -----------------------------------------------------------------------
    // Colour Palette Extraction
    // -----------------------------------------------------------------------

    /**
     * Build a dominant colour palette from the selected flowers.
     * Collects all flower colours, counts frequency, and returns
     * the most common ones up to a maximum count.
     *
     * @param {Array} allSelections - Combined array of flower selections
     * @param {number} maxColors - Maximum palette size (default 6)
     * @returns {string[]} Array of hex colour strings
     */
    function extractPalette(allSelections, maxColors) {
        var max = maxColors || 6;
        var colorCounts = {};

        for (var i = 0; i < allSelections.length; i++) {
            var colors = allSelections[i].flower.colors || [];
            for (var c = 0; c < colors.length; c++) {
                var hex = colors[c].toUpperCase();
                colorCounts[hex] = (colorCounts[hex] || 0) + 1;
            }
        }

        // Sort by frequency descending
        var sorted = Object.keys(colorCounts).sort(function (a, b) {
            return colorCounts[b] - colorCounts[a];
        });

        return sorted.slice(0, max);
    }


    // -----------------------------------------------------------------------
    // Foliage Selection
    // -----------------------------------------------------------------------

    /**
     * Select appropriate foliage based on the weather protocol and
     * the cultural period of the artwork (if any).
     *
     * @param {string[]} protocols - Active weather protocols
     * @param {string|null} period - Cultural/historical period key
     * @returns {Array} Array of foliage entries
     */
    function selectFoliage(protocols, period) {
        var foliageKeys = [];

        // Period-based foliage
        if (period) {
            var periodData = FloraDatabase.getByPeriod(period);
            if (periodData && periodData.foliage) {
                foliageKeys = foliageKeys.concat(periodData.foliage);
            }
        }

        // Weather-based foliage
        var isTropical = protocols.some(function (p) {
            return p === 'heat' || p === 'extreme_heat' || p === 'humidity';
        });
        var isStormy = protocols.some(function (p) {
            return p === 'monsoon' || p === 'heavy_monsoon' || p === 'wind' || p === 'strong_wind';
        });

        if (isTropical && foliageKeys.indexOf('monstera') === -1) {
            foliageKeys.push('monstera');
        }
        if (isTropical && foliageKeys.indexOf('palm_frond') === -1) {
            foliageKeys.push('palm_frond');
        }
        if (isStormy && foliageKeys.indexOf('fern') === -1) {
            foliageKeys.push('fern');
        }

        // Default: always include at least one foliage type
        if (foliageKeys.length === 0) {
            foliageKeys.push('eucalyptus');
            foliageKeys.push('babys_breath');
        }

        // Resolve to actual foliage entries
        var results = [];
        var seen = {};
        for (var i = 0; i < foliageKeys.length; i++) {
            if (!seen[foliageKeys[i]]) {
                seen[foliageKeys[i]] = true;
                var entry = FloraDatabase.getFoliageByKey(foliageKeys[i]);
                if (entry) {
                    results.push(entry);
                }
            }
        }
        return results;
    }


    // -----------------------------------------------------------------------
    // Arrangement Shape
    // -----------------------------------------------------------------------

    /**
     * Determine the arrangement shape based on bloom count and protocols.
     *
     * @param {number} bloomCount
     * @param {string[]} protocols
     * @returns {string} Shape name: 'ikebana', 'dome', 'fan', 'cascade', 'wild'
     */
    function determineArrangementShape(bloomCount, protocols) {
        // Ikebana: minimal blooms and calm weather
        if (bloomCount <= 6 && protocols.indexOf('fair') !== -1) {
            return 'ikebana';
        }

        // Cascade: rain or water-related
        if (protocols.indexOf('monsoon') !== -1 || protocols.indexOf('heavy_monsoon') !== -1) {
            return 'cascade';
        }

        // Wild: strong wind scatters the arrangement
        if (protocols.indexOf('strong_wind') !== -1) {
            return 'wild';
        }

        // Fan: wind gently spreads the blooms
        if (protocols.indexOf('wind') !== -1) {
            return 'fan';
        }

        // Dome: heat creates full, round arrangements
        if (protocols.indexOf('heat') !== -1 || protocols.indexOf('extreme_heat') !== -1) {
            return 'dome';
        }

        // Default dome for abundant blooms, fan for moderate
        if (bloomCount >= 10) {
            return 'dome';
        }
        return 'fan';
    }


    // -----------------------------------------------------------------------
    // Accent Flower Selection
    // -----------------------------------------------------------------------

    /**
     * Select complementary accent flowers to fill out the bouquet.
     * Uses the existing palette to find contrasting accents from
     * the FloraDatabase.
     *
     * @param {string[]} palette - Current colour palette
     * @param {number} count - How many accents to add (default 1-2)
     * @returns {Array} Array of { flower, role, reason }
     */
    function selectAccentFlowers(palette, count) {
        var needed = count || 1;
        var accents = FloraDatabase.getAccentFlowers(palette);
        var results = [];

        for (var i = 0; i < Math.min(needed, accents.length); i++) {
            results.push({
                flower: accents[i],
                role: 'palette_accent',
                reason: 'Colour complement — ' + accents[i].common + ' adds visual contrast'
            });
        }
        return results;
    }


    // -----------------------------------------------------------------------
    // Main Composition: composeBouquet
    // -----------------------------------------------------------------------

    /**
     * Compose a full bouquet recipe from weather data and celestial profile.
     * This is the primary entry point for the symbolism engine.
     *
     * @param {object} weather - Raw weather data
     * @param {object} celestialProfile - Celestial/zodiac data
     * @param {object} [options] - Optional overrides
     *   - period {string} Cultural/historical period for foliage hints
     *   - forceVanda {boolean} Force include Vanda Miss Joaquim
     * @returns {object} Complete bouquet recipe
     */
    function composeBouquet(weather, celestialProfile, options) {
        var opts = options || {};
        weather = weather || {};
        celestialProfile = celestialProfile || {};

        // 1. Determine weather conditions
        var protocols = getWeatherProtocols(weather);

        // 2. Select weather-triggered flowers
        var weatherFlowers = selectWeatherFlowers(weather);

        // 3. Select celestial/zodiac flowers
        var celestialFlowers = selectCelestialFlowers(celestialProfile);

        // 4. Compute bloom count from moon phase
        var moonIllumination = typeof celestialProfile.moonIllumination === 'number'
            ? celestialProfile.moonIllumination
            : (typeof celestialProfile.moonPhase === 'number' ? celestialProfile.moonPhase : 0.5);
        var bloomCount = calculateBloomCount(moonIllumination);

        // 5. Combine all selections for palette extraction
        var allSelections = celestialFlowers.concat(weatherFlowers);

        // 6. Extract dominant colour palette
        var palette = extractPalette(allSelections);

        // 7. Determine how many accent flowers we need to reach bloom count
        var currentCount = allSelections.length;
        var accentsNeeded = Math.max(0, bloomCount - currentCount);
        var accentFlowers = [];
        if (accentsNeeded > 0) {
            accentFlowers = selectAccentFlowers(palette, Math.min(accentsNeeded, 3));
            allSelections = allSelections.concat(accentFlowers);
            // Refresh palette with accents included
            palette = extractPalette(allSelections);
        }

        // 8. Select foliage
        var foliage = selectFoliage(protocols, opts.period || null);

        // 9. Determine arrangement shape
        var shape = determineArrangementShape(bloomCount, protocols);

        // 10. Determine the mood-palette name from weather
        var paletteName = determinePaletteName(protocols);
        var palettePreset = FloraDatabase.getPalette(paletteName);

        // 11. Force Vanda override if requested
        if (opts.forceVanda) {
            var hasVanda = allSelections.some(function (s) { return s.flower.key === 'vanda_miss_joaquim'; });
            if (!hasVanda) {
                var vandaEntry = FloraDatabase.getByKey('vanda_miss_joaquim');
                if (vandaEntry) {
                    var vandaSelection = {
                        flower: vandaEntry,
                        role: 'override',
                        reason: 'Manual override — Vanda Miss Joaquim requested'
                    };
                    weatherFlowers.push(vandaSelection);
                    allSelections.push(vandaSelection);
                }
            }
        }

        // 12. Build active protocol display names
        var activeProtocols = protocols.map(function (p) { return protocolDisplayName(p); });

        // Add celestial protocol names
        if (celestialProfile.sunSign) {
            activeProtocols.push('Sun in ' + celestialProfile.sunSign);
        }
        if (celestialProfile.venusSign) {
            activeProtocols.push('Venus in ' + celestialProfile.venusSign);
        }
        var moonPhaseName = getMoonPhaseName(moonIllumination).name;
        activeProtocols.push(moonPhaseName);

        // 13. Generate the poetic narrative
        var narrative = generateNarrative(weatherFlowers, celestialFlowers, accentFlowers, weather, celestialProfile, protocols);

        // 14. Assemble the final recipe
        return {
            primary: celestialFlowers.filter(function (f) { return f.role === 'zodiac_primary'; }),
            loveAccent: celestialFlowers.filter(function (f) { return f.role === 'venus_accent'; }),
            moonAccent: celestialFlowers.filter(function (f) { return f.role === 'moon_accent'; }),
            weatherAccent: weatherFlowers,
            paletteAccent: accentFlowers,
            foliage: foliage,
            allFlowers: allSelections,
            totalBlooms: bloomCount,
            palette: palette,
            palettePreset: palettePreset,
            paletteName: paletteName,
            shape: shape,
            protocols: activeProtocols,
            moonPhase: moonPhaseName,
            moonIllumination: moonIllumination,
            narrative: narrative,
            timestamp: new Date().toISOString()
        };
    }


    // -----------------------------------------------------------------------
    // Palette Name from Protocols
    // -----------------------------------------------------------------------

    /**
     * Map weather protocols to the best matching FloraDatabase palette.
     *
     * @param {string[]} protocols
     * @returns {string} Palette key
     */
    function determinePaletteName(protocols) {
        if (protocols.indexOf('heavy_monsoon') !== -1 || protocols.indexOf('monsoon') !== -1) {
            return 'monsoon';
        }
        if (protocols.indexOf('haze') !== -1) {
            return 'haze';
        }
        if (protocols.indexOf('extreme_heat') !== -1 || protocols.indexOf('heat') !== -1) {
            return 'tropical';
        }
        if (protocols.indexOf('cold') !== -1) {
            return 'winter';
        }

        // Default to tropical for Singapore
        return 'tropical';
    }


    // -----------------------------------------------------------------------
    // Narrative Generation
    // -----------------------------------------------------------------------

    /**
     * Generate a human-readable poetic narrative explaining the bouquet.
     * This becomes the "Arrangement Receipt" displayed in the UI.
     *
     * @param {Array} weatherFlowers
     * @param {Array} celestialFlowers
     * @param {Array} accentFlowers
     * @param {object} weather
     * @param {object} celestialProfile
     * @param {string[]} protocols
     * @returns {string} Multi-line narrative text
     */
    function generateNarrative(weatherFlowers, celestialFlowers, accentFlowers, weather, celestialProfile, protocols) {
        var lines = [];
        var now = new Date();
        var timeStr = formatTime(now);
        var dateStr = formatDate(now);

        // Opening line
        lines.push('Arrangement composed at ' + timeStr + ' on ' + dateStr + '.');
        lines.push('');

        // Celestial section
        if (celestialFlowers.length > 0) {
            lines.push('-- Celestial Influences --');
            for (var i = 0; i < celestialFlowers.length; i++) {
                var cf = celestialFlowers[i];
                var roleName = cf.role === 'zodiac_primary' ? 'Primary bloom'
                    : cf.role === 'venus_accent' ? 'Love accent'
                    : 'Lunar bloom';
                lines.push(roleName + ': ' + cf.flower.common + ' (' + cf.flower.scientific + ')');
                lines.push('  ' + cf.reason);
            }
            if (celestialProfile.moonPhase !== undefined) {
                var phaseName = getMoonPhaseName(celestialProfile.moonPhase).name;
                var illumPct = Math.round(celestialProfile.moonPhase * 100);
                lines.push('Moon: ' + phaseName + ' (' + illumPct + '% illumination)');
                lines.push('  Bloom density scaled to lunar light.');
            }
            lines.push('');
        }

        // Weather section
        if (weatherFlowers.length > 0) {
            lines.push('-- Weather Response --');
            for (var w = 0; w < weatherFlowers.length; w++) {
                var wf = weatherFlowers[w];
                lines.push('Weather bloom: ' + wf.flower.common + ' (' + wf.flower.scientific + ')');
                lines.push('  ' + wf.reason);
            }
            // Summarise conditions
            var conditions = [];
            if (weather.temperature !== undefined) {
                conditions.push(Math.round(weather.temperature) + '\u00B0C');
            }
            if (weather.humidity !== undefined) {
                conditions.push(Math.round(weather.humidity) + '% humidity');
            }
            if (weather.rainfall !== undefined && weather.rainfall > 0) {
                conditions.push(weather.rainfall.toFixed(1) + ' mm rainfall');
            }
            if (weather.windSpeed !== undefined && weather.windSpeed > 0) {
                conditions.push(Math.round(weather.windSpeed) + ' km/h wind');
            }
            if (weather.psi !== undefined && weather.psi > 0) {
                conditions.push('PSI ' + Math.round(weather.psi));
            }
            if (conditions.length > 0) {
                lines.push('Conditions: ' + conditions.join(', '));
            }
            lines.push('');
        }

        // Accent section
        if (accentFlowers.length > 0) {
            lines.push('-- Palette Accents --');
            for (var a = 0; a < accentFlowers.length; a++) {
                var af = accentFlowers[a];
                lines.push('Accent: ' + af.flower.common);
                lines.push('  ' + af.reason);
            }
            lines.push('');
        }

        // Closing poetic line
        lines.push(generateClosingLine(protocols, celestialProfile));

        return lines.join('\n');
    }

    /**
     * Generate a poetic closing line based on the dominant conditions.
     */
    function generateClosingLine(protocols, celestialProfile) {
        var sunSign = (celestialProfile && celestialProfile.sunSign) || '';

        if (protocols.indexOf('heavy_monsoon') !== -1) {
            return 'The sky weeps and the garden drinks — each petal holds a silver tear.';
        }
        if (protocols.indexOf('monsoon') !== -1) {
            return 'Rain taps a gentle rhythm on the leaves, and the blooms lean in to listen.';
        }
        if (protocols.indexOf('extreme_heat') !== -1) {
            return 'The equatorial sun presses down, and only the boldest colours dare to answer.';
        }
        if (protocols.indexOf('heat') !== -1) {
            return 'Warmth rises from the earth, drawing fragrance upward into the trembling air.';
        }
        if (protocols.indexOf('strong_wind') !== -1) {
            return 'The wind scatters petals like whispered secrets — each one lands where it must.';
        }
        if (protocols.indexOf('wind') !== -1) {
            return 'A breeze stirs the stems, and the arrangement dances with invisible hands.';
        }
        if (protocols.indexOf('haze') !== -1) {
            return 'Through the amber veil, these blooms burn bright — a garden defiant against the haze.';
        }
        if (protocols.indexOf('cold') !== -1) {
            return 'In the rare cool of the tropics, delicate blooms unfurl like memories of distant winters.';
        }

        // Fair weather — reference the zodiac
        if (sunSign) {
            return 'Under fair skies and the sign of ' + sunSign + ', the vase fills with quiet intention.';
        }

        return 'The flowers arrange themselves as they always have — by instinct, by season, by light.';
    }


    // -----------------------------------------------------------------------
    // Utility: date helpers
    // -----------------------------------------------------------------------

    /**
     * Check if today is Singapore National Day (August 9).
     */
    function isSingaporeNationalDay() {
        var now = new Date();
        return now.getMonth() === 7 && now.getDate() === 9; // Month is 0-indexed
    }

    /**
     * Format a Date as a time string (HH:MM).
     */
    function formatTime(date) {
        var h = date.getHours().toString();
        var m = date.getMinutes().toString();
        if (h.length < 2) h = '0' + h;
        if (m.length < 2) m = '0' + m;
        return h + ':' + m;
    }

    /**
     * Format a Date as a readable date string.
     */
    function formatDate(date) {
        var months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
    }

    /**
     * Determine the current Sun zodiac sign from today's date.
     * This is a fallback when the astronomy engine is unavailable.
     *
     * @param {Date} [date] - Date to check (defaults to now)
     * @returns {string} Zodiac sign name
     */
    function getZodiacSignForDate(date) {
        var d = date || new Date();
        var month = d.getMonth() + 1; // 1-indexed
        var day = d.getDate();

        for (var i = 0; i < ZODIAC_DATES.length; i++) {
            var z = ZODIAC_DATES[i];
            var s = z.start;
            var e = z.end;

            // Handle Capricorn wrapping around the year
            if (s[0] > e[0]) {
                if ((month === s[0] && day >= s[1]) || (month === e[0] && day < e[1]) || month > s[0] || month < e[0]) {
                    return z.sign;
                }
            } else {
                if ((month === s[0] && day >= s[1]) || (month === e[0] && day < e[1]) || (month > s[0] && month < e[0])) {
                    return z.sign;
                }
            }
        }

        return 'Aries'; // Fallback
    }


    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------
    return {
        composeBouquet: composeBouquet,
        getWeatherProtocol: getWeatherProtocol,
        getWeatherProtocols: getWeatherProtocols,
        selectWeatherFlowers: selectWeatherFlowers,
        selectCelestialFlowers: selectCelestialFlowers,
        calculateBloomCount: calculateBloomCount,
        extractPalette: extractPalette,
        selectFoliage: selectFoliage,
        selectAccentFlowers: selectAccentFlowers,
        determineArrangementShape: determineArrangementShape,
        getZodiacSignForDate: getZodiacSignForDate,
        getMoonPhaseName: getMoonPhaseName
    };

})();
