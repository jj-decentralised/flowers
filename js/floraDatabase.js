/**
 * floraDatabase.js — Flower Data, Taxonomy & Symbolism
 *
 * A curated dataset of flowers, foliage, and botanical elements used by
 * the symbolism engine and composition engine.
 *
 * Responsibilities:
 *   - Store flower entries with: common name, botanical name, family,
 *     colours, season, symbolic meanings, zodiac associations, origin
 *   - Store foliage/greenery entries with similar metadata
 *   - Provide lookup methods by attribute (colour, season, symbolism, etc.)
 *   - Define colour palette presets tied to moods and seasons
 *   - Map cultural/historical periods to their characteristic flora
 *
 * Dependencies: none (pure data)
 */

const FloraDatabase = (function () {

    // -----------------------------------------------------------------------
    // Complete flower database with symbolism, BHL search terms, and visuals
    // -----------------------------------------------------------------------
    const FLOWERS = {

        // === Zodiac Flowers (one per sign) ===

        'honeysuckle': {
            scientific: 'Lonicera',
            common: 'Honeysuckle',
            family: 'Caprifoliaceae',
            zodiac: 'Aries',
            symbolism: 'Energy, heat, new beginnings',
            colors: ['#FFD700', '#FFA500', '#FF6347'],
            searchTerms: ['Lonicera', 'honeysuckle'],
            season: 'spring',
            type: 'accent',
            petalShape: 'tubular',
            stemLength: 'long',
            origin: 'Northern Hemisphere'
        },
        'poppy': {
            scientific: 'Papaver',
            common: 'Poppy',
            family: 'Papaveraceae',
            zodiac: 'Taurus',
            symbolism: 'Pleasure, sleep, earthly sensuality',
            colors: ['#DC143C', '#FF4500', '#FF6347'],
            searchTerms: ['Papaver', 'poppy'],
            season: 'spring',
            type: 'primary',
            petalShape: 'cupped',
            stemLength: 'medium',
            origin: 'Eurasia'
        },
        'lavender': {
            scientific: 'Lavandula',
            common: 'Lavender',
            family: 'Lamiaceae',
            zodiac: 'Gemini',
            symbolism: 'Multiplicity, communication, airiness',
            colors: ['#9370DB', '#8A2BE2', '#DDA0DD'],
            searchTerms: ['Lavandula', 'lavender'],
            season: 'summer',
            type: 'accent',
            petalShape: 'spike',
            stemLength: 'medium',
            origin: 'Mediterranean'
        },
        'white_rose': {
            scientific: 'Rosa alba',
            common: 'White Rose',
            family: 'Rosaceae',
            zodiac: 'Cancer',
            symbolism: 'Moon, purity, protection',
            colors: ['#FFFAF0', '#FFF5EE', '#F5F5DC'],
            searchTerms: ['Rosa alba', 'white rose'],
            season: 'summer',
            type: 'primary',
            petalShape: 'rosette',
            stemLength: 'long',
            origin: 'Europe'
        },
        'sunflower': {
            scientific: 'Helianthus annuus',
            common: 'Sunflower',
            family: 'Asteraceae',
            zodiac: 'Leo',
            symbolism: 'Solar rulership, radiance, loyalty',
            colors: ['#FFD700', '#FFA500', '#DAA520'],
            searchTerms: ['Helianthus', 'sunflower'],
            season: 'summer',
            type: 'primary',
            petalShape: 'radial',
            stemLength: 'tall',
            origin: 'North America'
        },
        'chrysanthemum': {
            scientific: 'Chrysanthemum',
            common: 'Chrysanthemum',
            family: 'Asteraceae',
            zodiac: 'Virgo',
            symbolism: 'Perfection, order, refinement',
            colors: ['#FFD700', '#FF69B4', '#FFFFFF'],
            searchTerms: ['Chrysanthemum'],
            season: 'autumn',
            type: 'primary',
            petalShape: 'pompon',
            stemLength: 'medium',
            origin: 'East Asia'
        },
        'bluebell': {
            scientific: 'Hyacinthoides',
            common: 'Bluebell',
            family: 'Asparagaceae',
            zodiac: 'Libra',
            symbolism: 'Balance, constancy, grace',
            colors: ['#4169E1', '#6495ED', '#7B68EE'],
            searchTerms: ['Hyacinthoides', 'bluebell', 'Scilla'],
            season: 'spring',
            type: 'accent',
            petalShape: 'bell',
            stemLength: 'short',
            origin: 'Western Europe'
        },
        'geranium': {
            scientific: 'Pelargonium',
            common: 'Geranium',
            family: 'Geraniaceae',
            zodiac: 'Scorpio',
            symbolism: 'Mystery, intensity, dark passion',
            colors: ['#8B0000', '#DC143C', '#B22222'],
            searchTerms: ['Pelargonium', 'geranium'],
            season: 'summer',
            type: 'primary',
            petalShape: 'rounded',
            stemLength: 'medium',
            origin: 'South Africa'
        },
        'carnation': {
            scientific: 'Dianthus caryophyllus',
            common: 'Carnation',
            family: 'Caryophyllaceae',
            zodiac: 'Sagittarius',
            symbolism: 'Adventure, caprice, fascination',
            colors: ['#FF69B4', '#FF1493', '#C71585'],
            searchTerms: ['Dianthus', 'carnation'],
            season: 'winter',
            type: 'primary',
            petalShape: 'fringed',
            stemLength: 'long',
            origin: 'Mediterranean'
        },
        'pansy': {
            scientific: 'Viola tricolor',
            common: 'Pansy',
            family: 'Violaceae',
            zodiac: 'Capricorn',
            symbolism: 'Thought, memory, longevity',
            colors: ['#4B0082', '#9400D3', '#FFD700'],
            searchTerms: ['Viola tricolor', 'pansy'],
            season: 'spring',
            type: 'accent',
            petalShape: 'flat',
            stemLength: 'short',
            origin: 'Europe'
        },
        'orchid': {
            scientific: 'Orchidaceae',
            common: 'Orchid',
            family: 'Orchidaceae',
            zodiac: 'Aquarius',
            symbolism: 'Exotic, alien, futuristic',
            colors: ['#DA70D6', '#BA55D3', '#9932CC'],
            searchTerms: ['Orchidaceae', 'orchid', 'Vanda'],
            season: 'tropical',
            type: 'primary',
            petalShape: 'labiate',
            stemLength: 'medium',
            origin: 'Pantropical'
        },
        'water_lily': {
            scientific: 'Nymphaea',
            common: 'Water Lily',
            family: 'Nymphaeaceae',
            zodiac: 'Pisces',
            symbolism: 'Subconscious, dreams, water',
            colors: ['#FFB6C1', '#FFFFFF', '#98FB98'],
            searchTerms: ['Nymphaea', 'water lily'],
            season: 'summer',
            type: 'primary',
            petalShape: 'cupped',
            stemLength: 'floating',
            origin: 'Worldwide'
        },

        // === Weather-triggered Flowers ===

        'hydrangea': {
            scientific: 'Hydrangea macrophylla',
            common: 'Hydrangea',
            family: 'Hydrangeaceae',
            weather: 'rain',
            symbolism: 'Gratitude for understanding, rain, tears',
            colors: ['#6495ED', '#87CEEB', '#B0C4DE'],
            searchTerms: ['Hydrangea'],
            season: 'summer',
            type: 'primary',
            petalShape: 'cluster',
            stemLength: 'medium',
            origin: 'East Asia'
        },
        'frangipani': {
            scientific: 'Plumeria',
            common: 'Frangipani',
            family: 'Apocynaceae',
            weather: 'rain',
            symbolism: 'Shelter from storm, devotion, welcome',
            colors: ['#FFFACD', '#FFD700', '#FF69B4'],
            searchTerms: ['Plumeria', 'frangipani'],
            season: 'tropical',
            type: 'accent',
            petalShape: 'pinwheel',
            stemLength: 'short',
            origin: 'Central America'
        },
        'hibiscus': {
            scientific: 'Hibiscus rosa-sinensis',
            common: 'Hibiscus',
            family: 'Malvaceae',
            weather: 'heat',
            symbolism: 'Passion, consuming love, tropical intensity',
            colors: ['#FF0000', '#FF4500', '#FF6347'],
            searchTerms: ['Hibiscus'],
            season: 'tropical',
            type: 'primary',
            petalShape: 'trumpet',
            stemLength: 'medium',
            origin: 'East Asia'
        },
        'bougainvillea': {
            scientific: 'Bougainvillea',
            common: 'Bougainvillea',
            family: 'Nyctaginaceae',
            weather: 'heat',
            symbolism: 'Welcome, warmth, tropical beauty',
            colors: ['#FF00FF', '#FF69B4', '#C71585'],
            searchTerms: ['Bougainvillea'],
            season: 'tropical',
            type: 'accent',
            petalShape: 'bract',
            stemLength: 'trailing',
            origin: 'South America'
        },
        'bird_of_paradise': {
            scientific: 'Strelitzia reginae',
            common: 'Bird of Paradise',
            family: 'Strelitziaceae',
            weather: 'heat',
            symbolism: 'Freedom, paradise, magnificence',
            colors: ['#FF8C00', '#4169E1', '#228B22'],
            searchTerms: ['Strelitzia', 'bird of paradise'],
            season: 'tropical',
            type: 'primary',
            petalShape: 'crane',
            stemLength: 'tall',
            origin: 'South Africa'
        },
        'anemone': {
            scientific: 'Anemone',
            common: 'Anemone (Windflower)',
            family: 'Ranunculaceae',
            weather: 'wind',
            symbolism: 'Anticipation, forsaken love, wind',
            colors: ['#FF0000', '#FFFFFF', '#4169E1'],
            searchTerms: ['Anemone'],
            season: 'spring',
            type: 'primary',
            petalShape: 'open',
            stemLength: 'medium',
            origin: 'Mediterranean'
        },
        'cosmos': {
            scientific: 'Cosmos bipinnatus',
            common: 'Cosmos',
            family: 'Asteraceae',
            weather: 'wind',
            symbolism: 'Order in chaos, harmony with nature',
            colors: ['#FF69B4', '#FFFFFF', '#C71585'],
            searchTerms: ['Cosmos bipinnatus', 'cosmos flower'],
            season: 'autumn',
            type: 'accent',
            petalShape: 'daisy',
            stemLength: 'tall',
            origin: 'Mexico'
        },
        'jasmine': {
            scientific: 'Jasminum sambac',
            common: 'Jasmine',
            family: 'Oleaceae',
            weather: 'humidity',
            symbolism: 'Sensuality, night, sweet persuasion',
            colors: ['#FFFFFF', '#FFFFF0', '#FFFACD'],
            searchTerms: ['Jasminum', 'jasmine'],
            season: 'tropical',
            type: 'accent',
            petalShape: 'star',
            stemLength: 'vine',
            origin: 'South Asia'
        },
        'vanda_miss_joaquim': {
            scientific: 'Papilionanthe Miss Joaquim',
            common: 'Vanda Miss Joaquim',
            family: 'Orchidaceae',
            weather: 'humidity',
            symbolism: 'Singapore national flower, resilience, hybrid vigour',
            colors: ['#DA70D6', '#DDA0DD', '#FF69B4'],
            searchTerms: ['Vanda', 'Papilionanthe', 'orchid Singapore'],
            season: 'tropical',
            type: 'primary',
            petalShape: 'labiate',
            stemLength: 'medium',
            origin: 'Singapore',
            special: 'singapore_national'
        },
        'snowdrop': {
            scientific: 'Galanthus',
            common: 'Snowdrop',
            family: 'Amaryllidaceae',
            weather: 'cold',
            symbolism: 'Hope, consolation, purity in adversity',
            colors: ['#FFFFFF', '#F0FFF0', '#E0FFE0'],
            searchTerms: ['Galanthus', 'snowdrop'],
            season: 'winter',
            type: 'accent',
            petalShape: 'drooping',
            stemLength: 'short',
            origin: 'Europe'
        },
        'hellebore': {
            scientific: 'Helleborus',
            common: 'Hellebore (Christmas Rose)',
            family: 'Ranunculaceae',
            weather: 'cold',
            symbolism: 'Serenity, tranquillity, overcoming hardship',
            colors: ['#DDA0DD', '#98FB98', '#FFFFF0'],
            searchTerms: ['Helleborus', 'hellebore', 'Christmas rose'],
            season: 'winter',
            type: 'primary',
            petalShape: 'cupped',
            stemLength: 'short',
            origin: 'Europe'
        },
        'marigold': {
            scientific: 'Tagetes',
            common: 'Marigold',
            family: 'Asteraceae',
            weather: 'haze',
            symbolism: 'Solar protection, purification through fire',
            colors: ['#FF8C00', '#FFD700', '#FF6347'],
            searchTerms: ['Tagetes', 'marigold'],
            season: 'summer',
            type: 'primary',
            petalShape: 'pompon',
            stemLength: 'medium',
            origin: 'Americas'
        },
        'lotus': {
            scientific: 'Nelumbo nucifera',
            common: 'Lotus',
            family: 'Nelumbonaceae',
            weather: 'haze',
            symbolism: 'Rising above murky conditions, spiritual clarity',
            colors: ['#FFB6C1', '#FF69B4', '#FFFFFF'],
            searchTerms: ['Nelumbo', 'lotus'],
            season: 'tropical',
            type: 'primary',
            petalShape: 'cupped',
            stemLength: 'floating',
            origin: 'Asia'
        }
    };

    // -----------------------------------------------------------------------
    // Foliage and greenery to fill out arrangements
    // -----------------------------------------------------------------------
    const FOLIAGE = {
        'monstera': {
            scientific: 'Monstera deliciosa',
            common: 'Monstera',
            colors: ['#228B22', '#006400', '#2E8B57'],
            type: 'tropical_leaf',
            stemLength: 'large',
            origin: 'Central America'
        },
        'eucalyptus': {
            scientific: 'Eucalyptus',
            common: 'Eucalyptus',
            colors: ['#708090', '#8FBC8F', '#C0C0C0'],
            type: 'silver_leaf',
            stemLength: 'long',
            origin: 'Australia'
        },
        'fern': {
            scientific: 'Polypodiopsida',
            common: 'Fern',
            colors: ['#228B22', '#32CD32', '#006400'],
            type: 'frond',
            stemLength: 'medium',
            origin: 'Worldwide'
        },
        'palm_frond': {
            scientific: 'Arecaceae',
            common: 'Palm Frond',
            colors: ['#228B22', '#006400', '#556B2F'],
            type: 'tropical_leaf',
            stemLength: 'tall',
            origin: 'Tropics'
        },
        'ivy': {
            scientific: 'Hedera',
            common: 'Ivy',
            colors: ['#006400', '#228B22', '#2E8B57'],
            type: 'vine',
            stemLength: 'trailing',
            origin: 'Europe'
        },
        'babys_breath': {
            scientific: 'Gypsophila',
            common: "Baby's Breath",
            colors: ['#FFFFFF', '#FFFAF0', '#F5F5DC'],
            type: 'filler',
            stemLength: 'medium',
            origin: 'Eurasia'
        }
    };

    // -----------------------------------------------------------------------
    // Colour palette presets for moods and seasons
    // -----------------------------------------------------------------------
    const PALETTES = {
        spring: {
            name: 'Vernal Awakening',
            dominant: ['#FFB6C1', '#98FB98', '#FFFACD', '#DDA0DD'],
            accent: ['#FF69B4', '#00FA9A', '#FFD700']
        },
        summer: {
            name: 'Solstice Fire',
            dominant: ['#FF4500', '#FFD700', '#FF6347', '#FFA500'],
            accent: ['#DC143C', '#FF8C00', '#DAA520']
        },
        autumn: {
            name: 'Harvest Ember',
            dominant: ['#8B4513', '#D2691E', '#CD853F', '#DAA520'],
            accent: ['#FF6347', '#FF4500', '#800000']
        },
        winter: {
            name: 'Frost Reverie',
            dominant: ['#F0F8FF', '#E6E6FA', '#B0C4DE', '#D3D3D3'],
            accent: ['#4169E1', '#9370DB', '#FFFFFF']
        },
        tropical: {
            name: 'Equatorial Bloom',
            dominant: ['#FF00FF', '#FF4500', '#00CED1', '#FFD700'],
            accent: ['#FF69B4', '#228B22', '#FF6347']
        },
        monsoon: {
            name: 'Rain Veil',
            dominant: ['#4682B4', '#6495ED', '#87CEEB', '#708090'],
            accent: ['#B0C4DE', '#5F9EA0', '#2F4F4F']
        },
        haze: {
            name: 'Amber Shroud',
            dominant: ['#DEB887', '#D2B48C', '#BC8F8F', '#C0C0C0'],
            accent: ['#FF8C00', '#FFD700', '#808080']
        }
    };

    // -----------------------------------------------------------------------
    // Cultural/historical period to flora mappings
    // -----------------------------------------------------------------------
    const PERIOD_FLORA = {
        'ancient_egyptian': {
            flowers: ['lotus', 'water_lily'],
            foliage: ['palm_frond'],
            palette: 'summer',
            description: 'Sacred lotus and papyrus of the Nile'
        },
        'classical_greek': {
            flowers: ['anemone', 'poppy', 'white_rose'],
            foliage: ['ivy'],
            palette: 'spring',
            description: 'Mythological blooms of the Mediterranean'
        },
        'chinese_imperial': {
            flowers: ['chrysanthemum', 'orchid', 'lotus'],
            foliage: ['fern'],
            palette: 'autumn',
            description: 'Four Gentlemen of Chinese art'
        },
        'japanese': {
            flowers: ['chrysanthemum', 'water_lily'],
            foliage: ['fern'],
            palette: 'spring',
            description: 'Ikebana tradition and seasonal awareness'
        },
        'dutch_golden_age': {
            flowers: ['poppy', 'white_rose', 'sunflower', 'carnation'],
            foliage: ['ivy', 'eucalyptus'],
            palette: 'autumn',
            description: 'Vanitas still-life abundance'
        },
        'victorian': {
            flowers: ['white_rose', 'lavender', 'pansy', 'carnation'],
            foliage: ['fern', 'ivy', 'babys_breath'],
            palette: 'spring',
            description: 'Language of flowers (floriography)'
        },
        'art_nouveau': {
            flowers: ['orchid', 'water_lily', 'poppy'],
            foliage: ['fern', 'ivy'],
            palette: 'tropical',
            description: 'Organic curves and exotic blooms'
        },
        'southeast_asian': {
            flowers: ['orchid', 'hibiscus', 'vanda_miss_joaquim', 'jasmine', 'frangipani', 'lotus'],
            foliage: ['monstera', 'palm_frond', 'fern'],
            palette: 'tropical',
            description: 'Tropical exuberance of the Malay Archipelago'
        },
        'islamic': {
            flowers: ['white_rose', 'jasmine', 'carnation'],
            foliage: ['ivy'],
            palette: 'summer',
            description: 'Paradise garden motifs'
        },
        'modern': {
            flowers: ['orchid', 'bird_of_paradise', 'sunflower'],
            foliage: ['monstera', 'eucalyptus'],
            palette: 'tropical',
            description: 'Bold, structural, statement blooms'
        }
    };


    // -----------------------------------------------------------------------
    // Lookup functions
    // -----------------------------------------------------------------------

    /**
     * Get the zodiac flower for a given sign name.
     * @param {string} signName - e.g. 'Aries', 'Scorpio' (case-insensitive)
     * @returns {object|null} The flower entry with its key, or null if not found
     */
    function getByZodiac(signName) {
        var target = (signName || '').toLowerCase().trim();
        var keys = Object.keys(FLOWERS);
        for (var i = 0; i < keys.length; i++) {
            var flower = FLOWERS[keys[i]];
            if (flower.zodiac && flower.zodiac.toLowerCase() === target) {
                return Object.assign({ key: keys[i] }, flower);
            }
        }
        return null;
    }

    /**
     * Get all flowers associated with a weather condition.
     * @param {string} condition - 'rain', 'heat', 'wind', 'humidity', 'cold', 'haze'
     * @returns {Array} Array of flower entries with their keys
     */
    function getByWeather(condition) {
        var target = (condition || '').toLowerCase().trim();
        var results = [];
        var keys = Object.keys(FLOWERS);
        for (var i = 0; i < keys.length; i++) {
            var flower = FLOWERS[keys[i]];
            if (flower.weather && flower.weather.toLowerCase() === target) {
                results.push(Object.assign({ key: keys[i] }, flower));
            }
        }
        return results;
    }

    /**
     * Get all flowers matching a given season.
     * @param {string} season - 'spring', 'summer', 'autumn', 'winter', 'tropical'
     * @returns {Array} Array of flower entries with their keys
     */
    function getBySeason(season) {
        var target = (season || '').toLowerCase().trim();
        var results = [];
        var keys = Object.keys(FLOWERS);
        for (var i = 0; i < keys.length; i++) {
            var flower = FLOWERS[keys[i]];
            if (flower.season && flower.season.toLowerCase() === target) {
                results.push(Object.assign({ key: keys[i] }, flower));
            }
        }
        return results;
    }

    /**
     * Get accent flowers whose colours complement a given palette.
     * Selects flowers of type 'accent' whose colours are not already
     * dominant in the provided palette array.
     * @param {string[]} palette - Array of hex colour strings already in use
     * @returns {Array} Accent flowers sorted by colour distance from palette
     */
    function getAccentFlowers(palette) {
        var normalised = (palette || []).map(function (c) { return c.toUpperCase(); });
        var results = [];
        var keys = Object.keys(FLOWERS);

        for (var i = 0; i < keys.length; i++) {
            var flower = FLOWERS[keys[i]];
            if (flower.type !== 'accent') continue;

            // Check that at least one of the flower's colours is NOT already in the palette
            var hasDistinctColor = flower.colors.some(function (c) {
                return normalised.indexOf(c.toUpperCase()) === -1;
            });

            if (hasDistinctColor) {
                // Score by average colour distance from the palette
                var distance = averageColorDistance(flower.colors, normalised);
                results.push(Object.assign({ key: keys[i], colorDistance: distance }, flower));
            }
        }

        // Sort by colour distance descending — most contrasting accents first
        results.sort(function (a, b) { return b.colorDistance - a.colorDistance; });
        return results;
    }

    /**
     * Get all flower entries.
     * @returns {Object} The complete FLOWERS map
     */
    function getAll() {
        return FLOWERS;
    }

    /**
     * Get a single flower by its key.
     * @param {string} key - The flower key, e.g. 'poppy', 'vanda_miss_joaquim'
     * @returns {object|null} The flower entry with its key, or null
     */
    function getByKey(key) {
        var flower = FLOWERS[(key || '').toLowerCase().trim()];
        if (!flower) return null;
        return Object.assign({ key: key }, flower);
    }

    /**
     * Get all foliage entries.
     * @returns {Object} The complete FOLIAGE map
     */
    function getAllFoliage() {
        return FOLIAGE;
    }

    /**
     * Get a foliage entry by its key.
     * @param {string} key
     * @returns {object|null}
     */
    function getFoliageByKey(key) {
        var foliage = FOLIAGE[(key || '').toLowerCase().trim()];
        if (!foliage) return null;
        return Object.assign({ key: key }, foliage);
    }

    /**
     * Get a named colour palette.
     * @param {string} name - 'spring', 'summer', 'monsoon', etc.
     * @returns {object|null}
     */
    function getPalette(name) {
        return PALETTES[(name || '').toLowerCase().trim()] || null;
    }

    /**
     * Get flora suggestions for a cultural/historical period.
     * @param {string} period - e.g. 'victorian', 'southeast_asian'
     * @returns {object|null} Period flora mapping or null
     */
    function getByPeriod(period) {
        return PERIOD_FLORA[(period || '').toLowerCase().trim()] || null;
    }

    /**
     * Search flowers by a text query across common name, scientific name,
     * symbolism, and search terms.
     * @param {string} query
     * @returns {Array} Matching flower entries with keys
     */
    function search(query) {
        var q = (query || '').toLowerCase().trim();
        if (!q) return [];

        var results = [];
        var keys = Object.keys(FLOWERS);
        for (var i = 0; i < keys.length; i++) {
            var flower = FLOWERS[keys[i]];
            var haystack = [
                flower.common,
                flower.scientific,
                flower.symbolism,
                keys[i]
            ].concat(flower.searchTerms || []).join(' ').toLowerCase();

            if (haystack.indexOf(q) !== -1) {
                results.push(Object.assign({ key: keys[i] }, flower));
            }
        }
        return results;
    }

    /**
     * Get flowers that serve as the Singapore-specific national override.
     * @returns {Array} Flowers with special === 'singapore_national'
     */
    function getSingaporeNational() {
        var results = [];
        var keys = Object.keys(FLOWERS);
        for (var i = 0; i < keys.length; i++) {
            var flower = FLOWERS[keys[i]];
            if (flower.special === 'singapore_national') {
                results.push(Object.assign({ key: keys[i] }, flower));
            }
        }
        return results;
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    /**
     * Parse a hex colour string into {r, g, b}.
     */
    function hexToRgb(hex) {
        var cleaned = hex.replace('#', '');
        return {
            r: parseInt(cleaned.substring(0, 2), 16),
            g: parseInt(cleaned.substring(2, 4), 16),
            b: parseInt(cleaned.substring(4, 6), 16)
        };
    }

    /**
     * Euclidean distance between two RGB colours.
     */
    function colorDistance(hex1, hex2) {
        var a = hexToRgb(hex1);
        var b = hexToRgb(hex2);
        return Math.sqrt(
            Math.pow(a.r - b.r, 2) +
            Math.pow(a.g - b.g, 2) +
            Math.pow(a.b - b.b, 2)
        );
    }

    /**
     * Average minimum colour distance from a set of colours to a palette.
     * Higher values mean the colours are more distant (more contrasting).
     */
    function averageColorDistance(colors, palette) {
        if (!palette || palette.length === 0) return 999;

        var totalMinDist = 0;
        for (var i = 0; i < colors.length; i++) {
            var minDist = Infinity;
            for (var j = 0; j < palette.length; j++) {
                var d = colorDistance(colors[i], palette[j]);
                if (d < minDist) minDist = d;
            }
            totalMinDist += minDist;
        }
        return totalMinDist / colors.length;
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------
    return {
        FLOWERS: FLOWERS,
        FOLIAGE: FOLIAGE,
        PALETTES: PALETTES,
        PERIOD_FLORA: PERIOD_FLORA,
        getByZodiac: getByZodiac,
        getByWeather: getByWeather,
        getBySeason: getBySeason,
        getAccentFlowers: getAccentFlowers,
        getAll: getAll,
        getByKey: getByKey,
        getAllFoliage: getAllFoliage,
        getFoliageByKey: getFoliageByKey,
        getPalette: getPalette,
        getByPeriod: getByPeriod,
        search: search,
        getSingaporeNational: getSingaporeNational
    };

})();
