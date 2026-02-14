/**
 * app.js - Main Application Orchestrator for "The Living Vases"
 *
 * The entry point that coordinates the full pipeline:
 *
 *   1. Fetch real-time data (weather, astronomy, museum artwork)
 *   2. Run the symbolism engine to map data into a flora selection
 *   3. Hand the flora list and vase image to the composition engine
 *   4. Render the final arrangement on the Fabric.js canvas
 *   5. Update the UI with data readouts and the arrangement receipt
 *
 * Every external dependency is wrapped in try/catch with graceful
 * fallbacks. The application will ALWAYS produce something beautiful,
 * even if every API call fails and every optional module is a stub.
 *
 * Dependencies (expected as globals via <script> tags):
 *   - fabric (window.fabric)
 *   - Astronomy (window.Astronomy)
 *   - All project modules: MuseumApi, WeatherApi, AstronomyEngine,
 *     SymbolismEngine, CompositionEngine, FloraDatabase, ImageProcessor, UI
 */

const App = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------

    var isGenerating = false;

    // -------------------------------------------------------------------
    // Initialisation
    // -------------------------------------------------------------------

    async function init() {
        // 1. Initialise the UI (DOM caching, event listeners)
        UI.init();

        // 2. Initialise the Composition Engine (Fabric.js canvas)
        if (typeof CompositionEngine !== 'undefined' &&
            typeof CompositionEngine.init === 'function') {
            try {
                CompositionEngine.init('main-canvas');
            } catch (e) {
                console.warn('[App] CompositionEngine.init failed:', e.message);
            }
        }

        // 3. Wire the Generate button to the orchestration pipeline
        var generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', function () {
                generate();
            });
        }

        // 4. Display today's bird
        try {
            if (typeof BirdSongs !== 'undefined' && typeof BirdSongs.getTodaysBird === 'function') {
                var bird = BirdSongs.getTodaysBird();
                UI.displayBird(bird);
            }
        } catch (e) {
            console.warn('[App] Bird display failed:', e.message);
        }

        // 5. Display today's poem
        try {
            if (typeof LovePoems !== 'undefined' && typeof LovePoems.getTodaysPoem === 'function') {
                var poem = LovePoems.getTodaysPoem();
                UI.displayPoem(poem);
            }
        } catch (e) {
            console.warn('[App] Poem display failed:', e.message);
        }

        // 6. Auto-generate on first load with the default date
        await generate();
    }

    // -------------------------------------------------------------------
    // Main generation pipeline
    // -------------------------------------------------------------------

    async function generate() {
        // Guard against overlapping generations
        if (isGenerating) return;
        isGenerating = true;

        // Read the birthday input (if it exists in the DOM)
        var birthdayInput = document.getElementById('birthday-input');
        var dateStr = birthdayInput ? birthdayInput.value : '1995-11-04';

        // Validate date string — fall back to default if empty or invalid
        if (!dateStr || isNaN(Date.parse(dateStr))) {
            dateStr = '1995-11-04';
        }

        UI.showLoading();

        try {
            // -------------------------------------------------------
            // PHASE 1: Data Collection (parallel where possible)
            // -------------------------------------------------------

            UI.updateLoadingText('Consulting the stars\u2026');
            var celestialProfile = normalizeCelestialProfile(getCelestialProfile(dateStr));
            console.log('[App] Celestial profile:', celestialProfile);

            UI.updateLoadingText('Reading the Singapore sky\u2026');
            var weather = await getWeather();
            console.log('[App] Weather:', weather);

            UI.updateLoadingText('Searching the museum archives\u2026');
            var vaseData = await getVaseData();
            console.log('[App] Vase data:', vaseData);

            // -------------------------------------------------------
            // PHASE 2: Symbolism Processing
            // -------------------------------------------------------

            UI.updateLoadingText('Selecting the blooms\u2026');
            var bouquetRecipe = composeBouquet(weather, celestialProfile);
            bouquetRecipe = normalizeBouquetRecipe(bouquetRecipe);
            console.log('[App] Bouquet recipe:', bouquetRecipe);

            // -------------------------------------------------------
            // PHASE 3: Image Processing
            // -------------------------------------------------------

            UI.updateLoadingText('Preparing the vessel\u2026');
            var processedVase = await processVaseImage(vaseData);

            // -------------------------------------------------------
            // PHASE 4: Canvas Composition
            // -------------------------------------------------------

            UI.updateLoadingText('Arranging the bouquet\u2026');
            await renderComposition(processedVase, bouquetRecipe, weather);

            // -------------------------------------------------------
            // PHASE 5: Display results
            // -------------------------------------------------------

            UI.updateLoadingText('Applying the finishing touches\u2026');

            // Small intentional pause for the "slow web" aesthetic —
            // let the final message linger before revealing results
            await pause(600);

            try {
                UI.showReceipt({
                    vaseInfo:         vaseData,
                    weather:          weather,
                    celestialProfile: celestialProfile,
                    bouquetRecipe:    bouquetRecipe
                });
                UI.displayWeather(weather);
                UI.displayCelestial(celestialProfile);
                UI.displayMuseum(vaseData);
                UI.displayFloraList(bouquetRecipe);
            } catch (uiError) {
                console.warn('[App] UI display error (non-fatal):', uiError);
            }

        } catch (error) {
            console.error('[App] Generation failed:', error);
            UI.showError('The arrangement could not be completed. (' + (error.message || error) + ')');
        } finally {
            UI.hideLoading();
            isGenerating = false;
        }
    }

    // -------------------------------------------------------------------
    // Data normalization — bridge different module return shapes
    // -------------------------------------------------------------------

    /**
     * Normalize the celestial profile so sunSign, venusSign, moonPhase
     * are always STRINGS (the AstronomyEngine may return objects).
     */
    function normalizeCelestialProfile(profile) {
        if (!profile) return getFallbackCelestialProfile('1995-11-04');

        var normalized = {};
        for (var key in profile) {
            if (profile.hasOwnProperty(key)) {
                normalized[key] = profile[key];
            }
        }

        // sunSign: could be object { name, symbol, ... } or string
        if (normalized.sunSign && typeof normalized.sunSign === 'object') {
            normalized.sunSignData = normalized.sunSign; // preserve original
            normalized.sunSign = normalized.sunSign.name || 'Aries';
        }

        // venusSign: could be object { name, symbol, ... } or string
        if (normalized.venusSign && typeof normalized.venusSign === 'object') {
            normalized.venusSignData = normalized.venusSign;
            normalized.venusSign = normalized.venusSign.name || 'Libra';
        }

        // marsSign: could be object or string
        if (normalized.marsSign && typeof normalized.marsSign === 'object') {
            normalized.marsSign = normalized.marsSign.name || 'Aries';
        }

        // moonPhase: could be object { phase, angle, illumination, emoji } or string
        if (normalized.moonPhase && typeof normalized.moonPhase === 'object') {
            normalized.moonIllumination = normalized.moonPhase.illumination;
            normalized.moonPhaseAngle = normalized.moonPhase.angle;
            normalized.moonPhaseEmoji = normalized.moonPhase.emoji;
            normalized.moonPhase = normalized.moonPhase.phase || 'Waxing Crescent';
        }

        // Ensure moonIllumination is always a number (0-1)
        if (typeof normalized.moonIllumination !== 'number') {
            normalized.moonIllumination = 0.5;
        }

        return normalized;
    }

    /**
     * Normalize the bouquet recipe so it has:
     * - flowers: flat array of { name, role, reason, symbolism, colors }
     * - allFlowers: same as flowers (alias)
     * - primary, accent, foliage arrays for the CompositionEngine
     */
    function normalizeBouquetRecipe(recipe) {
        if (!recipe) return getFallbackBouquet({}, {});

        // Build a flat "flowers" array for the UI from the structured recipe
        var flowers = [];

        function extractFlower(item, fallbackRole) {
            if (!item) return null;
            // The SymbolismEngine items have shape: { flower: {...}, role, reason }
            var flowerData = item.flower || item;
            return {
                name: flowerData.common || flowerData.name || flowerData.scientific || 'Unknown bloom',
                scientific: flowerData.scientific || '',
                role: item.role || fallbackRole || '',
                reason: item.reason || '',
                symbolism: flowerData.symbolism || item.symbolism || '',
                meaning: flowerData.symbolism || item.meaning || '',
                colors: flowerData.colors || item.colors || ['#E8557A', '#C94060', '#F4A0B0'],
                color: (flowerData.colors && flowerData.colors[0]) || '#E8557A'
            };
        }

        // Extract from SymbolismEngine structure
        var primary = recipe.primary || [];
        var loveAccent = recipe.loveAccent || [];
        var moonAccent = recipe.moonAccent || [];
        var weatherAccent = recipe.weatherAccent || [];
        var paletteAccent = recipe.paletteAccent || [];

        primary.forEach(function(f) { var n = extractFlower(f, 'Primary (Zodiac)'); if (n) flowers.push(n); });
        loveAccent.forEach(function(f) { var n = extractFlower(f, 'Love Accent (Venus)'); if (n) flowers.push(n); });
        moonAccent.forEach(function(f) { var n = extractFlower(f, 'Moon Accent'); if (n) flowers.push(n); });
        weatherAccent.forEach(function(f) { var n = extractFlower(f, 'Weather Accent'); if (n) flowers.push(n); });
        paletteAccent.forEach(function(f) { var n = extractFlower(f, 'Palette Accent'); if (n) flowers.push(n); });

        // If we already have a flat "flowers" array from the fallback system, use it
        if (flowers.length === 0 && recipe.flowers) {
            flowers = recipe.flowers;
        }

        // Copy the recipe and augment it
        var normalized = {};
        for (var key in recipe) {
            if (recipe.hasOwnProperty(key)) {
                normalized[key] = recipe[key];
            }
        }
        normalized.flowers = flowers;
        normalized.selections = flowers; // alias for UI compat

        // Ensure primary/accent/foliage arrays exist for CompositionEngine
        if (!normalized.accent) {
            normalized.accent = [].concat(loveAccent, moonAccent, weatherAccent, paletteAccent);
        }

        // Ensure totalBlooms
        normalized.totalBlooms = normalized.totalBlooms || normalized.totalCount || flowers.length || 8;

        return normalized;
    }

    // -------------------------------------------------------------------
    // Phase helpers — each wraps its module with graceful fallbacks
    // -------------------------------------------------------------------

    /**
     * PHASE 1a: Get the celestial profile for the given birthday.
     * Falls back to a rich synthetic profile if AstronomyEngine is
     * unavailable or not yet implemented.
     *
     * @param {string} dateStr - ISO date string (YYYY-MM-DD)
     * @returns {Object} celestial profile
     */
    function getCelestialProfile(dateStr) {
        // Try the real AstronomyEngine first
        if (typeof AstronomyEngine !== 'undefined' &&
            typeof AstronomyEngine.getCelestialProfile === 'function') {
            try {
                var profile = AstronomyEngine.getCelestialProfile(dateStr);
                if (profile && profile.sunSign) {
                    profile.birthday = dateStr;
                    return profile;
                }
            } catch (e) {
                console.warn('[App] AstronomyEngine.getCelestialProfile failed:', e.message);
            }
        }

        // Fallback: derive a plausible profile from the date itself
        return getFallbackCelestialProfile(dateStr);
    }

    /**
     * PHASE 1b: Get Singapore weather data.
     * Falls back to simulated tropical weather if the API is unreachable.
     *
     * @returns {Promise<Object>} weather data
     */
    async function getWeather() {
        if (typeof WeatherApi !== 'undefined' &&
            typeof WeatherApi.fetchAllWeather === 'function') {
            try {
                return await WeatherApi.fetchAllWeather();
            } catch (e) {
                console.warn('[App] WeatherApi.fetchAllWeather failed:', e.message);
            }
        }

        // Fallback
        if (typeof WeatherApi !== 'undefined' &&
            typeof WeatherApi.getFallbackWeather === 'function') {
            return WeatherApi.getFallbackWeather();
        }

        return getFallbackWeather();
    }

    /**
     * PHASE 1c: Get a museum vase artwork.
     * Cascading fallback: MuseumApi -> hardcoded vase data.
     *
     * @returns {Promise<Object>} vase data with id, title, date, etc.
     */
    async function getVaseData() {
        if (typeof MuseumApi !== 'undefined' &&
            typeof MuseumApi.getRandomVase === 'function') {
            try {
                return await MuseumApi.getRandomVase();
            } catch (e) {
                console.warn('[App] MuseumApi.getRandomVase failed:', e.message);
            }
        }

        return getFallbackVase();
    }

    /**
     * PHASE 2: Compose the bouquet recipe via the SymbolismEngine.
     * Falls back to a manually assembled bouquet if the engine is
     * not yet implemented.
     *
     * @param {Object} weather
     * @param {Object} celestialProfile
     * @returns {Object} bouquet recipe
     */
    function composeBouquet(weather, celestialProfile) {
        if (typeof SymbolismEngine !== 'undefined' &&
            typeof SymbolismEngine.composeBouquet === 'function') {
            try {
                var recipe = SymbolismEngine.composeBouquet(weather, celestialProfile);
                if (recipe) {
                    return recipe;
                }
            } catch (e) {
                console.warn('[App] SymbolismEngine.composeBouquet failed:', e.message);
            }
        }

        return getFallbackBouquet(weather, celestialProfile);
    }

    /**
     * PHASE 3: Process the vase image (background removal, mouth detection).
     * Falls back to passing vase data through unprocessed.
     *
     * @param {Object} vaseData
     * @returns {Promise<Object>} processed vase with imageDataUrl, mouth position, etc.
     */
    async function processVaseImage(vaseData) {
        if (typeof ImageProcessor !== 'undefined' &&
            typeof ImageProcessor.processVaseImage === 'function') {
            try {
                var processed = await ImageProcessor.processVaseImage(vaseData.imageUrl);
                if (processed) return processed;
            } catch (e) {
                console.warn('[App] ImageProcessor.processVaseImage failed:', e.message);
            }
        }

        // Pass through: the composition engine can work with the raw image
        // or generate a procedural vase if imageUrl is null
        return {
            processedImageDataUrl: vaseData.imageUrl || null,
            originalUrl:           vaseData.imageUrl || null,
            mouthCenter:           { x: 400, y: 250 },
            mouthWidth:            200,
            mouthAngle:            0,
            vaseBottom:            850,
            vaseData:              vaseData
        };
    }

    /**
     * PHASE 4: Render the composition on the Fabric.js canvas.
     * Falls back to a simple canvas drawing if CompositionEngine is
     * not yet implemented.
     *
     * @param {Object} processedVase
     * @param {Object} bouquetRecipe
     * @param {Object} weather
     */
    async function renderComposition(processedVase, bouquetRecipe, weather) {
        if (typeof CompositionEngine !== 'undefined' &&
            typeof CompositionEngine.compose === 'function') {
            try {
                await CompositionEngine.compose(processedVase, bouquetRecipe, weather);
                return;
            } catch (e) {
                console.warn('[App] CompositionEngine.compose failed:', e.message);
            }
        }

        // Fallback: render a gentle placeholder on the raw canvas
        renderFallbackCanvas(bouquetRecipe, weather);
    }

    // -------------------------------------------------------------------
    // Fallback data generators
    // -------------------------------------------------------------------

    /**
     * Hardcoded fallback vase when the museum APIs are unreachable.
     * Returns a recognisable, culturally rich vessel description that
     * the receipt can display beautifully.
     */
    function getFallbackVase() {
        var fallbackVases = [
            {
                id:         'fallback-ming',
                title:      'Blue and White Porcelain Vase',
                date:       'Ming Dynasty, c. 1600',
                culture:    'Chinese',
                medium:     'Porcelain with cobalt blue underglaze',
                imageUrl:   null,
                creditLine: 'Digital reconstruction',
                url:        '#',
                source:     'The Living Vases Archive'
            },
            {
                id:         'fallback-celadon',
                title:      'Celadon Meiping Vase',
                date:       'Song Dynasty, c. 1150',
                culture:    'Chinese',
                medium:     'Stoneware with celadon glaze',
                imageUrl:   null,
                creditLine: 'Digital reconstruction',
                url:        '#',
                source:     'The Living Vases Archive'
            },
            {
                id:         'fallback-greek',
                title:      'Red-Figure Amphora',
                date:       'c. 450 BCE',
                culture:    'Greek, Attic',
                medium:     'Terracotta, red-figure technique',
                imageUrl:   null,
                creditLine: 'Digital reconstruction',
                url:        '#',
                source:     'The Living Vases Archive'
            },
            {
                id:         'fallback-persian',
                title:      'Lustre-Painted Bottle Vase',
                date:       'c. 1200 CE',
                culture:    'Persian, Kashan',
                medium:     'Fritware with lustre overglaze',
                imageUrl:   null,
                creditLine: 'Digital reconstruction',
                url:        '#',
                source:     'The Living Vases Archive'
            },
            {
                id:         'fallback-japanese',
                title:      'Satsuma Earthenware Vase',
                date:       'Meiji Period, c. 1880',
                culture:    'Japanese',
                medium:     'Earthenware with overglaze enamel and gilt',
                imageUrl:   null,
                creditLine: 'Digital reconstruction',
                url:        '#',
                source:     'The Living Vases Archive'
            }
        ];

        return fallbackVases[Math.floor(Math.random() * fallbackVases.length)];
    }

    /**
     * Simulated Singapore weather when WeatherApi is entirely unavailable.
     */
    function getFallbackWeather() {
        var hour = new Date().getHours();
        var baseTempC = 28;
        var diurnal = 3 * Math.sin((hour - 6) * Math.PI / 12);
        var temperature = baseTempC + diurnal + (Math.random() * 2 - 1);
        temperature = Math.max(25, Math.min(35, temperature));

        var humidity = 90 - diurnal * 3 + (Math.random() * 6 - 3);
        humidity = Math.max(60, Math.min(100, humidity));

        var rainChance = (hour >= 12 && hour <= 18) ? 0.55 : 0.2;
        var rainfall = Math.random() < rainChance ? Math.random() * 20 : 0;

        var forecastOptions;
        if (rainfall > 10) {
            forecastOptions = ['Thundery Showers', 'Heavy Thundery Showers'];
        } else if (rainfall > 0) {
            forecastOptions = ['Light Showers', 'Passing Showers'];
        } else if (humidity > 85) {
            forecastOptions = ['Partly Cloudy', 'Cloudy'];
        } else {
            forecastOptions = ['Fair', 'Fair & Warm'];
        }
        var forecast = forecastOptions[Math.floor(Math.random() * forecastOptions.length)];

        return {
            temperature: Math.round(temperature * 10) / 10,
            rainfall:    Math.round(rainfall * 10) / 10,
            humidity:    Math.round(humidity * 10) / 10,
            windSpeed:   Math.round((5 + Math.random() * 15) * 10) / 10,
            psi:         Math.round(20 + Math.random() * 60),
            uv:          Math.round((hour >= 10 && hour <= 15) ? 8 + Math.random() * 4 : 1 + Math.random() * 4),
            forecast:    forecast,
            condition:   classifyCondition(forecast),
            isLive:      false,
            timestamp:   new Date().toISOString()
        };
    }

    /**
     * Simple forecast text classifier (mirrors WeatherApi.classifyForecast).
     */
    function classifyCondition(text) {
        if (!text) return 'Fair';
        var lower = text.toLowerCase();
        if (lower.indexOf('thunder') !== -1) return 'Thundery';
        if (lower.indexOf('haz') !== -1)     return 'Hazy';
        if (lower.indexOf('shower') !== -1 || lower.indexOf('rain') !== -1) return 'Showers';
        if (lower.indexOf('cloud') !== -1)   return 'Cloudy';
        return 'Fair';
    }

    /**
     * Derive a celestial profile from a birthday string when the
     * AstronomyEngine is not available. Uses the date to compute
     * the Western zodiac sun sign and simulates Venus/Mars signs
     * and moon phase.
     *
     * @param {string} dateStr - ISO date string
     * @returns {Object} celestial profile
     */
    function getFallbackCelestialProfile(dateStr) {
        var date = new Date(dateStr + 'T12:00:00');
        if (isNaN(date.getTime())) {
            date = new Date('1995-11-04T12:00:00');
        }

        var month = date.getMonth() + 1; // 1-12
        var day   = date.getDate();

        // Western zodiac sun sign
        var sunSign = getZodiacSign(month, day);

        // Approximate Venus sign: Venus is roughly 1 sign behind the Sun
        // in its 225-day synodic period. This is a simplified heuristic.
        var zodiacOrder = [
            'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ];
        var sunIndex = zodiacOrder.indexOf(sunSign);
        var venusOffset = Math.floor((date.getFullYear() * 7 + month * 3 + day) % 12);
        var marsOffset  = Math.floor((date.getFullYear() * 11 + month * 5 + day * 2) % 12);

        var venusSign = zodiacOrder[(sunIndex + 12 - 1 + venusOffset % 3) % 12];
        var marsSign  = zodiacOrder[marsOffset];

        // Moon phase from a simple synodic calculation
        var moonPhase = getMoonPhaseForDate(date);

        return {
            birthday:  dateStr,
            sunSign:   sunSign,
            venusSign: venusSign,
            marsSign:  marsSign,
            moonPhase: moonPhase
        };
    }

    /**
     * Get the Western zodiac sign for a given month/day.
     * @param {number} month - 1-12
     * @param {number} day   - 1-31
     * @returns {string} zodiac sign name
     */
    function getZodiacSign(month, day) {
        // Zodiac date boundaries (start day of each sign in its month)
        if ((month === 3 && day >= 21) || (month === 4 && day <= 19))  return 'Aries';
        if ((month === 4 && day >= 20) || (month === 5 && day <= 20))  return 'Taurus';
        if ((month === 5 && day >= 21) || (month === 6 && day <= 20))  return 'Gemini';
        if ((month === 6 && day >= 21) || (month === 7 && day <= 22))  return 'Cancer';
        if ((month === 7 && day >= 23) || (month === 8 && day <= 22))  return 'Leo';
        if ((month === 8 && day >= 23) || (month === 9 && day <= 22))  return 'Virgo';
        if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
        if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
        if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
        if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
        if ((month === 1 && day >= 20) || (month === 2 && day <= 18))  return 'Aquarius';
        return 'Pisces'; // Feb 19 - Mar 20
    }

    /**
     * Approximate the moon phase for a given date using the synodic period.
     * Based on a known New Moon reference date (Jan 6, 2000).
     *
     * @param {Date} date
     * @returns {string} moon phase name
     */
    function getMoonPhaseForDate(date) {
        // Reference: New Moon on January 6, 2000 at 18:14 UTC
        var referenceNewMoon = new Date(2000, 0, 6, 18, 14, 0);
        var synodicPeriod = 29.53058867; // days

        var daysSinceRef = (date.getTime() - referenceNewMoon.getTime()) / (1000 * 60 * 60 * 24);
        var cyclePosition = ((daysSinceRef % synodicPeriod) + synodicPeriod) % synodicPeriod;
        var phase = cyclePosition / synodicPeriod; // 0 to 1

        if (phase < 0.0625)  return 'New Moon';
        if (phase < 0.1875)  return 'Waxing Crescent';
        if (phase < 0.3125)  return 'First Quarter';
        if (phase < 0.4375)  return 'Waxing Gibbous';
        if (phase < 0.5625)  return 'Full Moon';
        if (phase < 0.6875)  return 'Waning Gibbous';
        if (phase < 0.8125)  return 'Last Quarter';
        if (phase < 0.9375)  return 'Waning Crescent';
        return 'New Moon';
    }

    /**
     * Build a fallback bouquet recipe when the SymbolismEngine is
     * not available. Uses zodiac-flower associations, weather conditions,
     * and traditional flower language to create a meaningful arrangement.
     *
     * @param {Object} weather
     * @param {Object} celestialProfile
     * @returns {Object} bouquet recipe
     */
    function getFallbackBouquet(weather, celestialProfile) {
        var flowers = [];
        var palette = [];

        // -----------------------------------------------------------
        // 1. Primary bloom: zodiac flower (based on sun sign)
        // -----------------------------------------------------------
        var zodiacFlowers = {
            Aries:       { name: 'Honeysuckle',      color: '#FF6B6B', meaning: 'Devotion and new beginnings' },
            Taurus:      { name: 'Lily of the Valley', color: '#F5F5DC', meaning: 'Sweetness and returning happiness' },
            Gemini:      { name: 'Lavender',          color: '#B57EDC', meaning: 'Serenity and grace' },
            Cancer:      { name: 'White Rose',        color: '#FFF5F5', meaning: 'Purity and eternal love' },
            Leo:         { name: 'Sunflower',         color: '#FFD700', meaning: 'Adoration and loyalty' },
            Virgo:       { name: 'Buttercup',         color: '#FFFACD', meaning: 'Humility and neatness' },
            Libra:       { name: 'Bluebell',          color: '#6495ED', meaning: 'Balance and constancy' },
            Scorpio:     { name: 'Dark Red Geranium',  color: '#8B0000', meaning: 'Mystery and intensity' },
            Sagittarius: { name: 'Carnation',         color: '#FF69B4', meaning: 'Fascination and distinction' },
            Capricorn:   { name: 'Pansy',             color: '#7B68EE', meaning: 'Thoughtfulness and remembrance' },
            Aquarius:    { name: 'Orchid',            color: '#DA70D6', meaning: 'Refinement and rare beauty' },
            Pisces:      { name: 'Water Lily',        color: '#E6E6FA', meaning: 'Enlightenment and rebirth' }
        };

        var sunSign = celestialProfile.sunSign || 'Scorpio';
        var primaryFlower = zodiacFlowers[sunSign] || zodiacFlowers.Scorpio;
        flowers.push({
            name:    primaryFlower.name,
            role:    'Primary',
            reason:  sunSign + ' sun sign',
            meaning: primaryFlower.meaning,
            color:   primaryFlower.color
        });
        palette.push(primaryFlower.color);

        // -----------------------------------------------------------
        // 2. Love accent: Venus sign flower
        // -----------------------------------------------------------
        var venusFlowers = {
            Aries:       { name: 'Tulip',              color: '#FF4500', meaning: 'Passionate declaration' },
            Taurus:      { name: 'Rose',               color: '#FF007F', meaning: 'Enduring love and beauty' },
            Gemini:      { name: 'Ranunculus',         color: '#FFDAB9', meaning: 'Radiant charm' },
            Cancer:      { name: 'Peony',              color: '#FFB6C1', meaning: 'Romance and prosperity' },
            Leo:         { name: 'Dahlia',             color: '#FF6347', meaning: 'Elegance and inner strength' },
            Virgo:       { name: 'Aster',              color: '#9370DB', meaning: 'Wisdom and devotion' },
            Libra:       { name: 'Bluebell',           color: '#6495ED', meaning: 'Balance and grace' },
            Scorpio:     { name: 'Anemone',            color: '#800020', meaning: 'Anticipation and protection' },
            Sagittarius: { name: 'Protea',             color: '#C71585', meaning: 'Courage and transformation' },
            Capricorn:   { name: 'Camellia',           color: '#C41E3A', meaning: 'Admiration and perfection' },
            Aquarius:    { name: 'Bird of Paradise',   color: '#FF8C00', meaning: 'Freedom and joyfulness' },
            Pisces:      { name: 'Jasmine',            color: '#FFFDD0', meaning: 'Sensuality and grace' }
        };

        var venusSign = celestialProfile.venusSign || 'Libra';
        var venusFlower = venusFlowers[venusSign] || venusFlowers.Libra;
        flowers.push({
            name:    venusFlower.name,
            role:    'Love Accent',
            reason:  'Venus in ' + venusSign,
            meaning: venusFlower.meaning,
            color:   venusFlower.color
        });
        palette.push(venusFlower.color);

        // -----------------------------------------------------------
        // 3. Weather bloom: based on current Singapore conditions
        // -----------------------------------------------------------
        var condition = (weather.condition || 'Fair').toLowerCase();
        var weatherFlower;

        if (condition.indexOf('thunder') !== -1) {
            weatherFlower = { name: 'Iris',         color: '#4B0082', meaning: 'Courage in the storm, a message of hope' };
        } else if (condition.indexOf('shower') !== -1 || condition.indexOf('rain') !== -1) {
            weatherFlower = { name: 'Hydrangea',    color: '#5F9EA0', meaning: 'Gratitude for understanding, heartfelt emotion' };
        } else if (condition.indexOf('haz') !== -1) {
            weatherFlower = { name: 'Dusty Miller', color: '#C0C0C0', meaning: 'Delicacy and quiet endurance' };
        } else if (condition.indexOf('cloud') !== -1) {
            weatherFlower = { name: 'Sweet Pea',    color: '#DDA0DD', meaning: 'Blissful pleasure and gentle departure' };
        } else if (weather.temperature && weather.temperature > 33) {
            weatherFlower = { name: 'Plumeria',     color: '#FFE4B5', meaning: 'Warmth, welcome, and new beginnings' };
        } else {
            weatherFlower = { name: 'Chamomile',    color: '#FAFAD2', meaning: 'Patience and calm in the sunlight' };
        }

        var weatherReason = weather.forecast || weather.condition || 'Fair weather';
        flowers.push({
            name:    weatherFlower.name,
            role:    'Weather Bloom',
            reason:  weatherReason + ' detected',
            meaning: weatherFlower.meaning,
            color:   weatherFlower.color
        });
        palette.push(weatherFlower.color);

        // -----------------------------------------------------------
        // 4. Moon accent: based on moon phase
        // -----------------------------------------------------------
        var moonPhase = celestialProfile.moonPhase || 'Waxing Crescent';
        var moonFlowers = {
            'New Moon':        { name: 'Night-Blooming Cereus', color: '#F0F0F0', meaning: 'Hidden potential, new chapter' },
            'Waxing Crescent': { name: 'Crocus',               color: '#E6E200', meaning: 'Youthful gladness, emerging hope' },
            'First Quarter':   { name: 'Daffodil',             color: '#FFD700', meaning: 'Regard and fresh perspective' },
            'Waxing Gibbous':  { name: 'Gardenia',             color: '#FFF8DC', meaning: 'Joy and purity, secret love' },
            'Full Moon':       { name: 'Moonflower',           color: '#F8F8FF', meaning: 'Dreaming of love, full illumination' },
            'Waning Gibbous':  { name: 'Evening Primrose',     color: '#FFE4C4', meaning: 'Gentle memory and patience' },
            'Last Quarter':    { name: 'Marigold',             color: '#FF8C00', meaning: 'Passion and creativity endure' },
            'Waning Crescent': { name: 'Hellebore',            color: '#9ACD32', meaning: 'Serenity and quiet resilience' }
        };

        var moonFlower = moonFlowers[moonPhase] || moonFlowers['Waxing Crescent'];
        flowers.push({
            name:    moonFlower.name,
            role:    'Moon Accent',
            reason:  moonPhase,
            meaning: moonFlower.meaning,
            color:   moonFlower.color
        });
        palette.push(moonFlower.color);

        // -----------------------------------------------------------
        // 5. Foliage: always add a green element
        // -----------------------------------------------------------
        var foliageOptions = [
            { name: 'Eucalyptus',    color: '#8FBC8F', meaning: 'Protection and healing' },
            { name: 'Fern',          color: '#228B22', meaning: 'Sincerity and fascination' },
            { name: 'Olive Branch',  color: '#6B8E23', meaning: 'Peace and wisdom' },
            { name: 'Ivy',           color: '#2E8B57', meaning: 'Fidelity and eternal life' },
            { name: 'Dusty Miller',  color: '#708090', meaning: 'Industriousness and delicacy' }
        ];

        var foliage = foliageOptions[Math.floor(Math.random() * foliageOptions.length)];
        flowers.push({
            name:    foliage.name,
            role:    'Foliage',
            reason:  'Complementary greenery',
            meaning: foliage.meaning,
            color:   foliage.color
        });
        palette.push(foliage.color);

        // -----------------------------------------------------------
        // Arrangement style
        // -----------------------------------------------------------
        var styles = ['Ikebana', 'Fan', 'Cascade', 'Dome', 'Crescent', 'Naturalistic'];
        var style = styles[Math.floor(Math.random() * styles.length)];

        return {
            flowers:          flowers,
            palette:          palette,
            arrangementStyle: style,
            density:          weather.humidity ? (weather.humidity > 80 ? 'lush' : 'moderate') : 'moderate',
            mood:             deriveMood(weather, celestialProfile)
        };
    }

    /**
     * Derive a poetic mood word from weather + celestial data.
     */
    function deriveMood(weather, celestial) {
        var condition = (weather.condition || '').toLowerCase();
        var moonPhase = (celestial.moonPhase || '').toLowerCase();

        if (condition.indexOf('thunder') !== -1) return 'dramatic';
        if (condition.indexOf('rain') !== -1 || condition.indexOf('shower') !== -1) return 'contemplative';
        if (condition.indexOf('haz') !== -1) return 'ethereal';
        if (moonPhase.indexOf('full') !== -1) return 'luminous';
        if (moonPhase.indexOf('new') !== -1) return 'introspective';
        if (weather.temperature && weather.temperature > 33) return 'vibrant';
        return 'serene';
    }

    // -------------------------------------------------------------------
    // Fallback canvas rendering
    // -------------------------------------------------------------------

    /**
     * When the CompositionEngine is not available, render a gentle
     * placeholder on the raw HTML canvas. This ensures the user always
     * sees something beautiful.
     */
    function renderFallbackCanvas(bouquetRecipe, weather) {
        var canvas = document.getElementById('main-canvas');
        if (!canvas) return;

        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        var w = canvas.width;
        var h = canvas.height;

        // -----------------------------------------------------------
        // Background gradient — warm parchment tones
        // -----------------------------------------------------------
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        // -----------------------------------------------------------
        // Draw a simple elegant vase silhouette
        // -----------------------------------------------------------
        var vaseCenterX = w / 2;
        var vaseBottomY = h * 0.88;
        var vaseTopY = h * 0.42;
        var vaseWidth = w * 0.2;
        var neckWidth = w * 0.08;

        ctx.beginPath();
        ctx.moveTo(vaseCenterX - neckWidth, vaseTopY);
        // Left side: neck to body
        ctx.bezierCurveTo(
            vaseCenterX - neckWidth, vaseTopY + (vaseBottomY - vaseTopY) * 0.15,
            vaseCenterX - vaseWidth * 1.1, vaseTopY + (vaseBottomY - vaseTopY) * 0.35,
            vaseCenterX - vaseWidth, vaseTopY + (vaseBottomY - vaseTopY) * 0.55
        );
        // Left side: body to base
        ctx.bezierCurveTo(
            vaseCenterX - vaseWidth * 0.95, vaseTopY + (vaseBottomY - vaseTopY) * 0.8,
            vaseCenterX - vaseWidth * 0.6, vaseBottomY,
            vaseCenterX, vaseBottomY
        );
        // Right side: base to body
        ctx.bezierCurveTo(
            vaseCenterX + vaseWidth * 0.6, vaseBottomY,
            vaseCenterX + vaseWidth * 0.95, vaseTopY + (vaseBottomY - vaseTopY) * 0.8,
            vaseCenterX + vaseWidth, vaseTopY + (vaseBottomY - vaseTopY) * 0.55
        );
        // Right side: body to neck
        ctx.bezierCurveTo(
            vaseCenterX + vaseWidth * 1.1, vaseTopY + (vaseBottomY - vaseTopY) * 0.35,
            vaseCenterX + neckWidth, vaseTopY + (vaseBottomY - vaseTopY) * 0.15,
            vaseCenterX + neckWidth, vaseTopY
        );
        ctx.closePath();

        // Vase fill — soft gradient
        var vaseGrad = ctx.createLinearGradient(vaseCenterX - vaseWidth, 0, vaseCenterX + vaseWidth, 0);
        vaseGrad.addColorStop(0, '#c8b8a8');
        vaseGrad.addColorStop(0.3, '#d8cec2');
        vaseGrad.addColorStop(0.7, '#c0b0a0');
        vaseGrad.addColorStop(1, '#a89888');
        ctx.fillStyle = vaseGrad;
        ctx.fill();

        // Vase outline
        ctx.strokeStyle = '#8a7a6a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Vase rim
        ctx.beginPath();
        ctx.ellipse(vaseCenterX, vaseTopY, neckWidth, neckWidth * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#b8a898';
        ctx.fill();
        ctx.strokeStyle = '#8a7a6a';
        ctx.lineWidth = 1;
        ctx.stroke();

        // -----------------------------------------------------------
        // Draw flower circles above the vase
        // -----------------------------------------------------------
        var flowers = (bouquetRecipe && bouquetRecipe.flowers) ? bouquetRecipe.flowers : [];
        var palette = (bouquetRecipe && bouquetRecipe.palette) ? bouquetRecipe.palette : ['#c0392b', '#e74c3c', '#f39c12', '#27ae60', '#2980b9'];

        var flowerCount = Math.max(flowers.length, 5);
        var mouthY = vaseTopY - 5;

        for (var i = 0; i < flowerCount; i++) {
            var angle = (Math.PI / (flowerCount + 1)) * (i + 1);
            var radius = 80 + Math.random() * 120;
            var fx = vaseCenterX + Math.cos(angle - Math.PI) * radius * 1.8;
            var fy = mouthY - Math.sin(angle) * radius;

            // Stem
            ctx.beginPath();
            ctx.moveTo(vaseCenterX + (fx - vaseCenterX) * 0.15, mouthY);
            ctx.quadraticCurveTo(
                vaseCenterX + (fx - vaseCenterX) * 0.5, mouthY - radius * 0.4,
                fx, fy
            );
            ctx.strokeStyle = '#5a8a5a';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Flower head
            var petalColor = palette[i % palette.length] || '#c0392b';
            var petalRadius = 12 + Math.random() * 16;

            // Draw petals as overlapping circles
            var petalCount = 5 + Math.floor(Math.random() * 3);
            for (var p = 0; p < petalCount; p++) {
                var pa = (Math.PI * 2 / petalCount) * p;
                var px = fx + Math.cos(pa) * petalRadius * 0.5;
                var py = fy + Math.sin(pa) * petalRadius * 0.5;

                ctx.beginPath();
                ctx.arc(px, py, petalRadius * 0.55, 0, Math.PI * 2);
                ctx.fillStyle = petalColor;
                ctx.globalAlpha = 0.7;
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            // Flower center
            ctx.beginPath();
            ctx.arc(fx, fy, petalRadius * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = '#ffd700';
            ctx.fill();
        }

        // -----------------------------------------------------------
        // Title text at the top
        // -----------------------------------------------------------
        ctx.font = 'italic 18px Georgia, serif';
        ctx.fillStyle = '#8a7a6a';
        ctx.textAlign = 'center';
        ctx.fillText('The Living Vases', w / 2, 40);

        // Mood text at the bottom
        var mood = (bouquetRecipe && bouquetRecipe.mood) ? bouquetRecipe.mood : 'serene';
        ctx.font = 'italic 14px Georgia, serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText('A ' + mood + ' arrangement', w / 2, h - 30);
    }

    // -------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------

    /**
     * Promise-based pause for the slow-web aesthetic.
     * @param {number} ms - milliseconds to wait
     * @returns {Promise<void>}
     */
    function pause(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    // -------------------------------------------------------------------
    // Bootstrap
    // -------------------------------------------------------------------

    document.addEventListener('DOMContentLoaded', init);

    // -------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------

    return {
        generate: generate
    };

})();
