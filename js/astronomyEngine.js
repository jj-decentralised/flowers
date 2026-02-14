/**
 * astronomyEngine.js - Celestial Mechanics for Floral Selection
 *
 * Calculates zodiac signs, planetary positions, and moon phases based on
 * a user-provided date (e.g., a lover's birthday). Uses the global `Astronomy`
 * object from the astronomy-engine CDN library when available, with pure-math
 * fallbacks for environments where the library is not loaded.
 *
 * Responsibilities:
 *   - Determine the zodiac sun sign from a date
 *   - Calculate Venus sign (the planet of love/beauty)
 *   - Compute moon phase with illumination percentage
 *   - Map planetary positions across the zodiac
 *   - Derive dominant element and symbolic associations
 *   - Return structured celestial profiles for the symbolism engine
 *
 * Dependencies: window.Astronomy (optional, from astronomy-engine CDN)
 */

const AstronomyEngine = (function () {

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    // Tropical zodiac signs with inclusive month/day boundaries
    const ZODIAC_SIGNS = [
        { name: 'Aries',       symbol: '\u2648', start: [3, 21], end: [4, 19],  element: 'Fire',  quality: 'Cardinal' },
        { name: 'Taurus',      symbol: '\u2649', start: [4, 20], end: [5, 20],  element: 'Earth', quality: 'Fixed' },
        { name: 'Gemini',      symbol: '\u264A', start: [5, 21], end: [6, 20],  element: 'Air',   quality: 'Mutable' },
        { name: 'Cancer',      symbol: '\u264B', start: [6, 21], end: [7, 22],  element: 'Water', quality: 'Cardinal' },
        { name: 'Leo',         symbol: '\u264C', start: [7, 23], end: [8, 22],  element: 'Fire',  quality: 'Fixed' },
        { name: 'Virgo',       symbol: '\u264D', start: [8, 23], end: [9, 22],  element: 'Earth', quality: 'Mutable' },
        { name: 'Libra',       symbol: '\u264E', start: [9, 23], end: [10, 22], element: 'Air',   quality: 'Cardinal' },
        { name: 'Scorpio',     symbol: '\u264F', start: [10, 23], end: [11, 21], element: 'Water', quality: 'Fixed' },
        { name: 'Sagittarius', symbol: '\u2650', start: [11, 22], end: [12, 21], element: 'Fire',  quality: 'Mutable' },
        { name: 'Capricorn',   symbol: '\u2651', start: [12, 22], end: [1, 19],  element: 'Earth', quality: 'Cardinal' },
        { name: 'Aquarius',    symbol: '\u2652', start: [1, 20], end: [2, 18],   element: 'Air',   quality: 'Fixed' },
        { name: 'Pisces',      symbol: '\u2653', start: [2, 19], end: [3, 20],   element: 'Water', quality: 'Mutable' }
    ];

    // Signs ordered by ecliptic longitude (0 = Aries, 30 = Taurus, ...)
    const SIGNS_BY_LONGITUDE = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    // Ruling planets for each sign (modern rulerships)
    const RULING_PLANETS = {
        'Aries': 'Mars',
        'Taurus': 'Venus',
        'Gemini': 'Mercury',
        'Cancer': 'Moon',
        'Leo': 'Sun',
        'Virgo': 'Mercury',
        'Libra': 'Venus',
        'Scorpio': 'Pluto',
        'Sagittarius': 'Jupiter',
        'Capricorn': 'Saturn',
        'Aquarius': 'Uranus',
        'Pisces': 'Neptune'
    };

    // Elemental associations (used by symbolism engine for flower mapping)
    const ELEMENT_ASSOCIATIONS = {
        'Fire':  { colors: ['red', 'orange', 'gold'],        mood: 'passionate' },
        'Earth': { colors: ['green', 'brown', 'cream'],      mood: 'grounded' },
        'Air':   { colors: ['yellow', 'lavender', 'white'],  mood: 'intellectual' },
        'Water': { colors: ['blue', 'silver', 'deep purple'], mood: 'emotional' }
    };

    // Moon phase emoji and name lookup (8 phases, each spanning 45 degrees)
    const MOON_PHASES = [
        { name: 'New Moon',        emoji: '\uD83C\uDF11', minAngle: 0,     maxAngle: 22.5  },
        { name: 'Waxing Crescent', emoji: '\uD83C\uDF12', minAngle: 22.5,  maxAngle: 67.5  },
        { name: 'First Quarter',   emoji: '\uD83C\uDF13', minAngle: 67.5,  maxAngle: 112.5 },
        { name: 'Waxing Gibbous',  emoji: '\uD83C\uDF14', minAngle: 112.5, maxAngle: 157.5 },
        { name: 'Full Moon',       emoji: '\uD83C\uDF15', minAngle: 157.5, maxAngle: 202.5 },
        { name: 'Waning Gibbous',  emoji: '\uD83C\uDF16', minAngle: 202.5, maxAngle: 247.5 },
        { name: 'Last Quarter',    emoji: '\uD83C\uDF17', minAngle: 247.5, maxAngle: 292.5 },
        { name: 'Waning Crescent', emoji: '\uD83C\uDF18', minAngle: 292.5, maxAngle: 360   }
    ];

    // -------------------------------------------------------------------------
    // Venus Fallback Table
    //
    // Venus completes one full zodiac cycle in approximately 225 days and
    // never strays more than ~47 degrees from the Sun. This table provides
    // approximate Venus sign positions by month for an "average" year. When
    // the Astronomy library is loaded, the real calculation supersedes this.
    // Each row is indexed by (year % 8) and columns are months 0-11.
    // Values are zodiac sign indices (0=Aries .. 11=Pisces).
    // -------------------------------------------------------------------------
    const VENUS_MONTH_TABLE = [
        // Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec
        [10,  11,   0,   1,   2,   3,   4,   5,   6,   7,   8,   9],  // offset 0
        [11,   0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10],  // offset 1
        [ 0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11],  // offset 2
        [ 9,  10,  11,   0,   1,   2,   3,   4,   5,   6,   7,   8],  // offset 3
        [ 8,   9,  10,  11,   0,   1,   2,   3,   4,   5,   6,   7],  // offset 4
        [ 1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,   0],  // offset 5
        [ 2,   3,   4,   5,   6,   7,   8,   9,  10,  11,   0,   1],  // offset 6
        [ 7,   8,   9,  10,  11,   0,   1,   2,   3,   4,   5,   6],  // offset 7
    ];

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Check whether the astronomy-engine library is available on `window`.
     */
    function hasAstronomyLib() {
        return typeof Astronomy !== 'undefined' && Astronomy !== null;
    }

    /**
     * Safely create a Date object from various input types.
     * The astronomy-engine library accepts standard JS Date objects.
     *
     * @param {Date|string} input - Date object or ISO date string
     * @returns {Date}
     */
    function makeDate(input) {
        if (input instanceof Date) return input;
        // Accept ISO date strings like "1995-11-04"
        var d = new Date(input);
        if (isNaN(d.getTime())) {
            throw new Error('AstronomyEngine: Invalid date "' + input + '"');
        }
        return d;
    }

    /**
     * Convert an ecliptic longitude (0-360) to its zodiac sign.
     * 0-30 = Aries, 30-60 = Taurus, etc.
     *
     * @param {number} longitude - Ecliptic longitude in degrees
     * @returns {{ name, symbol, longitude, degreeInSign, index }}
     */
    function longitudeToSign(longitude) {
        var normalized = ((longitude % 360) + 360) % 360;
        var index = Math.floor(normalized / 30);
        if (index > 11) index = 11; // safety clamp
        var degree = normalized - index * 30;
        var signEntry = ZODIAC_SIGNS.find(function (z) {
            return z.name === SIGNS_BY_LONGITUDE[index];
        });
        return {
            name: SIGNS_BY_LONGITUDE[index],
            symbol: signEntry ? signEntry.symbol : '',
            longitude: normalized,
            degreeInSign: degree,
            index: index
        };
    }

    /**
     * Check if a (month, day) pair falls within a zodiac date range.
     * Handles the Capricorn wrap-around (Dec 22 -> Jan 19).
     *
     * @param {number} month - 1-12
     * @param {number} day   - 1-31
     * @param {number[]} start - [month, day]
     * @param {number[]} end   - [month, day]
     * @returns {boolean}
     */
    function dateInRange(month, day, start, end) {
        var startVal = start[0] * 100 + start[1];
        var endVal   = end[0] * 100 + end[1];
        var dateVal  = month * 100 + day;

        if (startVal <= endVal) {
            // Normal range (e.g., Mar 21 - Apr 19)
            return dateVal >= startVal && dateVal <= endVal;
        } else {
            // Wrapping range (Capricorn: Dec 22 - Jan 19)
            return dateVal >= startVal || dateVal <= endVal;
        }
    }

    /**
     * Estimate illumination fraction from the moon phase angle.
     * 0 degrees = new moon (0%), 180 degrees = full moon (100%).
     *
     * @param {number} angle - Phase angle in degrees (0-360)
     * @returns {number} Illumination fraction (0.0 - 1.0)
     */
    function illuminationFromAngle(angle) {
        return (1 - Math.cos(angle * Math.PI / 180)) / 2;
    }

    // -------------------------------------------------------------------------
    // Pure-math fallback: approximate moon phase angle from date
    //
    // Uses a well-known synodic month calculation.
    // Reference new moon: Jan 6, 2000 18:14 UTC (Julian day 2451550.26)
    // Synodic month: 29.53058770576 days
    // -------------------------------------------------------------------------
    var SYNODIC_MONTH = 29.53058770576;
    var KNOWN_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14, 0)); // Jan 6, 2000

    /**
     * Approximate moon phase angle without the Astronomy library.
     * @param {Date} date
     * @returns {number} Phase angle 0-360
     */
    function fallbackMoonPhaseAngle(date) {
        var diff = (date.getTime() - KNOWN_NEW_MOON.getTime()) / 86400000; // days
        var cycles = diff / SYNODIC_MONTH;
        var fraction = cycles - Math.floor(cycles);
        if (fraction < 0) fraction += 1;
        return fraction * 360;
    }

    // -------------------------------------------------------------------------
    // Pure-math fallback: approximate Sun ecliptic longitude
    //
    // Simple first-order approximation (accurate to ~1 degree).
    // -------------------------------------------------------------------------

    /**
     * Approximate the Sun's ecliptic longitude for a given date.
     * @param {Date} date
     * @returns {number} Ecliptic longitude in degrees (0-360)
     */
    function fallbackSunLongitude(date) {
        // Days since J2000.0 epoch (Jan 1.5, 2000 TT)
        var J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
        var d = (date.getTime() - J2000) / 86400000;

        // Mean longitude (degrees)
        var L = (280.460 + 0.9856474 * d) % 360;
        if (L < 0) L += 360;

        // Mean anomaly (degrees)
        var g = (357.528 + 0.9856003 * d) % 360;
        if (g < 0) g += 360;

        var gRad = g * Math.PI / 180;

        // Ecliptic longitude
        var lambda = L + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad);
        lambda = ((lambda % 360) + 360) % 360;

        return lambda;
    }

    // -------------------------------------------------------------------------
    // Pure-math fallback: approximate Venus ecliptic longitude
    //
    // Simplified heliocentric calculation projected to geocentric.
    // -------------------------------------------------------------------------

    /**
     * Approximate Venus's geocentric ecliptic longitude.
     * @param {Date} date
     * @returns {number} Ecliptic longitude in degrees (0-360)
     */
    function fallbackVenusLongitude(date) {
        var J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
        var d = (date.getTime() - J2000) / 86400000;

        // Venus orbital elements (J2000 epoch, simplified)
        // Mean longitude: ~181.98 deg at epoch, moves ~1.602 deg/day
        var venusL = (181.979801 + 1.6021302244 * d) % 360;
        if (venusL < 0) venusL += 360;

        // Venus mean anomaly
        var venusM = (50.4161 + 1.6021687039 * d) % 360;
        if (venusM < 0) venusM += 360;
        var venusMRad = venusM * Math.PI / 180;

        // Venus heliocentric longitude (first-order correction)
        var venusHLon = venusL + 0.7758 * Math.sin(venusMRad);
        venusHLon = ((venusHLon % 360) + 360) % 360;

        // Earth/Sun longitude (needed to project to geocentric)
        var sunLon = fallbackSunLongitude(date);
        // Earth heliocentric longitude is opposite the Sun
        var earthHLon = (sunLon + 180) % 360;

        // Simplified geocentric projection
        // Venus orbital radius ~0.723 AU, Earth ~1.0 AU
        var venusR = 0.723;
        var earthR = 1.0;

        var venusHRad = venusHLon * Math.PI / 180;
        var earthHRad = earthHLon * Math.PI / 180;

        var x = venusR * Math.cos(venusHRad) - earthR * Math.cos(earthHRad);
        var y = venusR * Math.sin(venusHRad) - earthR * Math.sin(earthHRad);

        var geocentricLon = Math.atan2(y, x) * 180 / Math.PI;
        geocentricLon = ((geocentricLon % 360) + 360) % 360;

        return geocentricLon;
    }

    // -------------------------------------------------------------------------
    // Pure-math fallback: approximate Mars ecliptic longitude
    // -------------------------------------------------------------------------

    /**
     * Approximate Mars's geocentric ecliptic longitude.
     * @param {Date} date
     * @returns {number} Ecliptic longitude in degrees (0-360)
     */
    function fallbackMarsLongitude(date) {
        var J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
        var d = (date.getTime() - J2000) / 86400000;

        // Mars mean longitude
        var marsL = (355.45332 + 0.5240208 * d) % 360;
        if (marsL < 0) marsL += 360;

        // Mars mean anomaly
        var marsM = (19.3730 + 0.5240711 * d) % 360;
        if (marsM < 0) marsM += 360;
        var marsMRad = marsM * Math.PI / 180;

        // Heliocentric longitude (equation of center)
        var marsHLon = marsL + 10.691 * Math.sin(marsMRad) + 0.623 * Math.sin(2 * marsMRad);
        marsHLon = ((marsHLon % 360) + 360) % 360;

        // Geocentric projection
        var marsR = 1.524;
        var earthR = 1.0;
        var sunLon = fallbackSunLongitude(date);
        var earthHLon = (sunLon + 180) % 360;

        var marsHRad = marsHLon * Math.PI / 180;
        var earthHRad = earthHLon * Math.PI / 180;

        var x = marsR * Math.cos(marsHRad) - earthR * Math.cos(earthHRad);
        var y = marsR * Math.sin(marsHRad) - earthR * Math.sin(earthHRad);

        var geocentricLon = Math.atan2(y, x) * 180 / Math.PI;
        return ((geocentricLon % 360) + 360) % 360;
    }

    // -------------------------------------------------------------------------
    // Pure-math fallback: approximate Jupiter ecliptic longitude
    // -------------------------------------------------------------------------

    /**
     * Approximate Jupiter's geocentric ecliptic longitude.
     * @param {Date} date
     * @returns {number} Ecliptic longitude in degrees (0-360)
     */
    function fallbackJupiterLongitude(date) {
        var J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
        var d = (date.getTime() - J2000) / 86400000;

        // Jupiter mean longitude
        var jupL = (34.40438 + 0.08308676 * d) % 360;
        if (jupL < 0) jupL += 360;

        // Jupiter mean anomaly
        var jupM = (20.0202 + 0.08308676 * d) % 360;
        if (jupM < 0) jupM += 360;
        var jupMRad = jupM * Math.PI / 180;

        // Heliocentric longitude
        var jupHLon = jupL + 5.555 * Math.sin(jupMRad) + 0.168 * Math.sin(2 * jupMRad);
        jupHLon = ((jupHLon % 360) + 360) % 360;

        // Geocentric projection
        var jupR = 5.203;
        var earthR = 1.0;
        var sunLon = fallbackSunLongitude(date);
        var earthHLon = (sunLon + 180) % 360;

        var jupHRad = jupHLon * Math.PI / 180;
        var earthHRad = earthHLon * Math.PI / 180;

        var x = jupR * Math.cos(jupHRad) - earthR * Math.cos(earthHRad);
        var y = jupR * Math.sin(jupHRad) - earthR * Math.sin(earthHRad);

        var geocentricLon = Math.atan2(y, x) * 180 / Math.PI;
        return ((geocentricLon % 360) + 360) % 360;
    }

    // -------------------------------------------------------------------------
    // Pure-math fallback: approximate Moon ecliptic longitude
    // -------------------------------------------------------------------------

    /**
     * Approximate the Moon's ecliptic longitude.
     * @param {Date} date
     * @returns {number} Ecliptic longitude in degrees (0-360)
     */
    function fallbackMoonLongitude(date) {
        var J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
        var d = (date.getTime() - J2000) / 86400000;

        // Moon mean longitude
        var L = (218.316 + 13.176396 * d) % 360;
        if (L < 0) L += 360;

        // Moon mean anomaly
        var M = (134.963 + 13.064993 * d) % 360;
        if (M < 0) M += 360;
        var MRad = M * Math.PI / 180;

        // Ecliptic longitude (simplified, first-order correction)
        var lon = L + 6.289 * Math.sin(MRad);
        lon = ((lon % 360) + 360) % 360;

        return lon;
    }

    // -------------------------------------------------------------------------
    // Fallback Venus sign using the lookup table
    // -------------------------------------------------------------------------

    /**
     * Approximate Venus sign using a year/month lookup table.
     * This is the last-resort fallback when both the Astronomy library
     * and the orbital calculation fail.
     *
     * @param {Date} date
     * @returns {{ name, symbol, longitude, degreeInSign, index, approximate }}
     */
    function fallbackVenusSignFromTable(date) {
        var year = date.getFullYear();
        var month = date.getMonth(); // 0-11
        var offset = ((year % 8) + 8) % 8;
        var signIndex = VENUS_MONTH_TABLE[offset][month];
        return {
            name: SIGNS_BY_LONGITUDE[signIndex],
            symbol: ZODIAC_SIGNS[signIndex].symbol,
            longitude: signIndex * 30 + 15, // midpoint approximation
            degreeInSign: 15,
            index: signIndex,
            approximate: true
        };
    }

    // -------------------------------------------------------------------------
    // Core Public API
    // -------------------------------------------------------------------------

    /**
     * Determine the Sun (zodiac) sign for a given date.
     * This uses calendar date ranges -- no external library needed.
     *
     * @param {Date|string} date - Date object or ISO date string
     * @returns {{ name: string, symbol: string, rulingPlanet: string,
     *             element: string, quality: string }}
     */
    function getSunSign(date) {
        var d = makeDate(date);
        var month = d.getMonth() + 1; // 1-12
        var day = d.getDate();

        for (var i = 0; i < ZODIAC_SIGNS.length; i++) {
            var sign = ZODIAC_SIGNS[i];
            if (dateInRange(month, day, sign.start, sign.end)) {
                return {
                    name: sign.name,
                    symbol: sign.symbol,
                    rulingPlanet: RULING_PLANETS[sign.name],
                    element: sign.element,
                    quality: sign.quality
                };
            }
        }

        // Should never reach here, but default to Capricorn (the wrapping sign)
        return {
            name: 'Capricorn',
            symbol: '\u2651',
            rulingPlanet: 'Saturn',
            element: 'Earth',
            quality: 'Cardinal'
        };
    }

    /**
     * Calculate Venus's zodiac sign at the given date.
     * Uses the Astronomy library when available, then falls back to a
     * simplified orbital calculation, and finally to a lookup table.
     *
     * @param {Date|string} date
     * @returns {{ name: string, symbol: string, longitude: number,
     *             degreeInSign: number, approximate: boolean }}
     */
    function getVenusSign(date) {
        var d = makeDate(date);

        // Strategy 1: Use astronomy-engine library
        if (hasAstronomyLib()) {
            try {
                var longitude = Astronomy.EclipticLongitude('Venus', d);
                if (typeof longitude === 'number' && !isNaN(longitude)) {
                    var result = longitudeToSign(longitude);
                    result.approximate = false;
                    return result;
                }
            } catch (e) {
                // Fall through to fallback
            }
        }

        // Strategy 2: Orbital mechanics calculation
        try {
            var venusLon = fallbackVenusLongitude(d);
            if (!isNaN(venusLon)) {
                var result = longitudeToSign(venusLon);
                result.approximate = true;
                return result;
            }
        } catch (e) {
            // Fall through to table lookup
        }

        // Strategy 3: Static lookup table (always works)
        return fallbackVenusSignFromTable(d);
    }

    /**
     * Calculate the moon phase for a given date.
     *
     * @param {Date|string} date
     * @returns {{ phase: string, angle: number, illumination: number,
     *             emoji: string, approximate: boolean }}
     */
    function getMoonPhase(date) {
        var d = makeDate(date);
        var angle = null;
        var illumination = null;
        var approximate = true;

        // Try the Astronomy library first
        if (hasAstronomyLib()) {
            try {
                var libAngle = Astronomy.MoonPhase(d);
                if (typeof libAngle === 'number' && !isNaN(libAngle)) {
                    angle = libAngle;
                    approximate = false;
                }
            } catch (e) {
                // Fall through to fallback
            }

            // Try to get accurate illumination from the library
            if (angle !== null) {
                try {
                    var illumResult = Astronomy.Illumination('Moon', d);
                    if (illumResult && typeof illumResult.phase_fraction === 'number') {
                        illumination = illumResult.phase_fraction;
                    } else if (illumResult && typeof illumResult.phase_angle !== 'undefined') {
                        // Derive illumination from the phase angle returned by Illumination()
                        illumination = illuminationFromAngle(angle);
                    }
                } catch (e) {
                    illumination = illuminationFromAngle(angle);
                }
            }
        }

        // Fallback: calculate from synodic month
        if (angle === null) {
            angle = fallbackMoonPhaseAngle(d);
            approximate = true;
        }

        if (illumination === null) {
            illumination = illuminationFromAngle(angle);
        }

        // Determine the phase name and emoji from the angle
        var phaseInfo = MOON_PHASES[0]; // default: New Moon
        for (var i = 0; i < MOON_PHASES.length; i++) {
            var p = MOON_PHASES[i];
            if (i === MOON_PHASES.length - 1) {
                // Last entry wraps: 292.5 to <360 (angle 0 to <22.5 is handled by first entry)
                if (angle >= p.minAngle && angle < 360) {
                    phaseInfo = p;
                    break;
                }
            } else if (angle >= p.minAngle && angle < p.maxAngle) {
                phaseInfo = p;
                break;
            }
        }

        return {
            phase: phaseInfo.name,
            angle: Math.round(angle * 100) / 100,
            illumination: Math.round(illumination * 1000) / 1000,
            emoji: phaseInfo.emoji,
            approximate: approximate
        };
    }

    /**
     * Calculate planetary positions for the main celestial bodies.
     * Returns the zodiac sign for each of: Sun, Moon, Venus, Mars, Jupiter.
     *
     * @param {Date|string} date
     * @returns {Array<{ planet: string, sign: string, symbol: string,
     *                    longitude: number, degreeInSign: number,
     *                    approximate: boolean }>}
     */
    function getPlanetaryPositions(date) {
        var d = makeDate(date);
        var positions = [];

        // --- Sun ---
        (function () {
            var longitude = null;
            var approximate = true;

            if (hasAstronomyLib()) {
                try {
                    var sunPos = Astronomy.SunPosition(d);
                    if (sunPos && typeof sunPos.elon === 'number') {
                        longitude = sunPos.elon;
                        approximate = false;
                    }
                } catch (e) { /* fall through */ }

                // Alternative: try EclipticLongitude for 'Sun'
                if (longitude === null) {
                    try {
                        var elon = Astronomy.EclipticLongitude('Sun', d);
                        if (typeof elon === 'number' && !isNaN(elon)) {
                            longitude = elon;
                            approximate = false;
                        }
                    } catch (e) { /* fall through */ }
                }
            }

            if (longitude === null) {
                longitude = fallbackSunLongitude(d);
                approximate = true;
            }

            var signInfo = longitudeToSign(longitude);
            positions.push({
                planet: 'Sun',
                sign: signInfo.name,
                symbol: signInfo.symbol,
                longitude: Math.round(longitude * 100) / 100,
                degreeInSign: Math.round(signInfo.degreeInSign * 100) / 100,
                approximate: approximate
            });
        })();

        // --- Moon ---
        (function () {
            var longitude = null;
            var approximate = true;

            if (hasAstronomyLib()) {
                // Try EclipticLongitude first
                try {
                    var elon = Astronomy.EclipticLongitude('Moon', d);
                    if (typeof elon === 'number' && !isNaN(elon)) {
                        longitude = elon;
                        approximate = false;
                    }
                } catch (e) { /* fall through */ }

                // Alternative: EclipticGeoMoon
                if (longitude === null) {
                    try {
                        var moonEcl = Astronomy.EclipticGeoMoon(d);
                        if (moonEcl && typeof moonEcl.lon === 'number') {
                            longitude = moonEcl.lon;
                            approximate = false;
                        }
                    } catch (e) { /* fall through */ }
                }
            }

            if (longitude === null) {
                longitude = fallbackMoonLongitude(d);
                approximate = true;
            }

            var signInfo = longitudeToSign(longitude);
            positions.push({
                planet: 'Moon',
                sign: signInfo.name,
                symbol: signInfo.symbol,
                longitude: Math.round(longitude * 100) / 100,
                degreeInSign: Math.round(signInfo.degreeInSign * 100) / 100,
                approximate: approximate
            });
        })();

        // --- Venus ---
        (function () {
            var venusInfo = getVenusSign(d);
            positions.push({
                planet: 'Venus',
                sign: venusInfo.name,
                symbol: venusInfo.symbol,
                longitude: Math.round(venusInfo.longitude * 100) / 100,
                degreeInSign: Math.round(venusInfo.degreeInSign * 100) / 100,
                approximate: venusInfo.approximate
            });
        })();

        // --- Mars ---
        (function () {
            var longitude = null;
            var approximate = true;

            if (hasAstronomyLib()) {
                try {
                    var elon = Astronomy.EclipticLongitude('Mars', d);
                    if (typeof elon === 'number' && !isNaN(elon)) {
                        longitude = elon;
                        approximate = false;
                    }
                } catch (e) { /* fall through */ }
            }

            if (longitude === null) {
                longitude = fallbackMarsLongitude(d);
                approximate = true;
            }

            var signInfo = longitudeToSign(longitude);
            positions.push({
                planet: 'Mars',
                sign: signInfo.name,
                symbol: signInfo.symbol,
                longitude: Math.round(longitude * 100) / 100,
                degreeInSign: Math.round(signInfo.degreeInSign * 100) / 100,
                approximate: approximate
            });
        })();

        // --- Jupiter ---
        (function () {
            var longitude = null;
            var approximate = true;

            if (hasAstronomyLib()) {
                try {
                    var elon = Astronomy.EclipticLongitude('Jupiter', d);
                    if (typeof elon === 'number' && !isNaN(elon)) {
                        longitude = elon;
                        approximate = false;
                    }
                } catch (e) { /* fall through */ }
            }

            if (longitude === null) {
                longitude = fallbackJupiterLongitude(d);
                approximate = true;
            }

            var signInfo = longitudeToSign(longitude);
            positions.push({
                planet: 'Jupiter',
                sign: signInfo.name,
                symbol: signInfo.symbol,
                longitude: Math.round(longitude * 100) / 100,
                degreeInSign: Math.round(signInfo.degreeInSign * 100) / 100,
                approximate: approximate
            });
        })();

        return positions;
    }

    /**
     * Main entry point. Build a comprehensive celestial profile for a date.
     *
     * @param {string|Date} dateString - ISO date string (e.g. "1995-11-04") or Date
     * @returns {{
     *   date: string,
     *   sunSign: { name, symbol, rulingPlanet, element, quality },
     *   venusSign: { name, symbol, longitude, degreeInSign, approximate },
     *   moonPhase: { phase, angle, illumination, emoji, approximate },
     *   planetaryPositions: Array<{ planet, sign, symbol, longitude, degreeInSign, approximate }>,
     *   dominantElement: string,
     *   elementAssociations: { colors: string[], mood: string },
     *   rulingPlanet: string,
     *   libraryAvailable: boolean
     * }}
     */
    function getCelestialProfile(dateString) {
        var d = makeDate(dateString);
        var isoDate = d.toISOString().split('T')[0];

        var sunSign = getSunSign(d);
        var venusSign = getVenusSign(d);
        var moonPhase = getMoonPhase(d);
        var planetaryPositions = getPlanetaryPositions(d);

        // Determine dominant element from planetary positions.
        // Sun sign element receives extra weight (+2) because it is the
        // primary determinant of personality and symbolic resonance.
        var elementCounts = { 'Fire': 0, 'Earth': 0, 'Air': 0, 'Water': 0 };
        planetaryPositions.forEach(function (pos) {
            var signData = ZODIAC_SIGNS.find(function (z) { return z.name === pos.sign; });
            if (signData) {
                elementCounts[signData.element] += 1;
            }
        });
        elementCounts[sunSign.element] += 2;

        var dominantElement = Object.keys(elementCounts).reduce(function (a, b) {
            return elementCounts[a] >= elementCounts[b] ? a : b;
        });

        return {
            date: isoDate,
            sunSign: sunSign,
            venusSign: venusSign,
            moonPhase: moonPhase,
            planetaryPositions: planetaryPositions,
            dominantElement: dominantElement,
            elementAssociations: ELEMENT_ASSOCIATIONS[dominantElement],
            rulingPlanet: sunSign.rulingPlanet,
            libraryAvailable: hasAstronomyLib()
        };
    }

    /**
     * Calculate the celestial profile for today's date.
     * Useful for the "today's sky" influence on floral arrangements.
     *
     * @returns {object} Same shape as getCelestialProfile return value
     */
    function getTodayCelestial() {
        return getCelestialProfile(new Date());
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------
    return {
        getSunSign: getSunSign,
        getVenusSign: getVenusSign,
        getMoonPhase: getMoonPhase,
        getPlanetaryPositions: getPlanetaryPositions,
        getCelestialProfile: getCelestialProfile,
        getTodayCelestial: getTodayCelestial,

        // Expose constants for use by other modules (e.g. SymbolismEngine)
        ZODIAC_SIGNS: ZODIAC_SIGNS,
        RULING_PLANETS: RULING_PLANETS,
        ELEMENT_ASSOCIATIONS: ELEMENT_ASSOCIATIONS,
        MOON_PHASES: MOON_PHASES
    };

})();
