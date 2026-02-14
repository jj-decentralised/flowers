/**
 * ui.js - User Interface: Inputs, Loading Animations, and Receipt Display
 *
 * Manages all DOM interactions outside the Fabric.js canvas.
 *
 * Responsibilities:
 *   - Show/hide the loading overlay with poetic status messages
 *   - Update the info panel with weather, astronomy, and museum data
 *   - Populate the flora list with the current arrangement contents
 *   - Generate and display the "Digital Florist Receipt" (a poetic summary)
 *   - Wire up the Generate and Download buttons
 *   - Handle responsive layout adjustments
 *
 * Dependencies: none (vanilla DOM)
 */

const UI = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // DOM References (populated in init)
    // -------------------------------------------------------------------

    var elements = {};

    // -------------------------------------------------------------------
    // Poetic loading messages — cycled during generation
    // -------------------------------------------------------------------

    var LOADING_MESSAGES = [
        'Consulting the stars\u2026',
        'Reading the Singapore sky\u2026',
        'Searching the museum archives\u2026',
        'Selecting the blooms\u2026',
        'Arranging the bouquet\u2026',
        'Applying the finishing touches\u2026'
    ];

    // Handle for the message cycling interval so we can clear it
    var loadingInterval = null;
    var loadingMessageIndex = 0;

    // -------------------------------------------------------------------
    // Zodiac & Moon Unicode helpers
    // -------------------------------------------------------------------

    var ZODIAC_SYMBOLS = {
        Aries:       '\u2648',
        Taurus:      '\u2649',
        Gemini:      '\u264A',
        Cancer:      '\u264B',
        Leo:         '\u264C',
        Virgo:       '\u264D',
        Libra:       '\u264E',
        Scorpio:     '\u264F',
        Sagittarius: '\u2650',
        Capricorn:   '\u2651',
        Aquarius:    '\u2652',
        Pisces:      '\u2653'
    };

    var MOON_PHASE_ICONS = {
        'New Moon':        '\uD83C\uDF11',
        'Waxing Crescent': '\uD83C\uDF12',
        'First Quarter':   '\uD83C\uDF13',
        'Waxing Gibbous':  '\uD83C\uDF14',
        'Full Moon':       '\uD83C\uDF15',
        'Waning Gibbous':  '\uD83C\uDF16',
        'Last Quarter':    '\uD83C\uDF17',
        'Waning Crescent': '\uD83C\uDF18'
    };

    // -------------------------------------------------------------------
    // Initialisation
    // -------------------------------------------------------------------

    function init() {
        // Cache DOM references — use getElementById for speed and safety.
        // Any element that does not exist in the HTML will simply be null
        // and we guard against that throughout.
        elements = {
            birthdayInput:    document.getElementById('birthday-input'),
            generateBtn:      document.getElementById('generate-btn'),
            canvas:           document.getElementById('main-canvas'),
            loadingOverlay:   document.getElementById('loading-overlay'),
            loadingMessage:   document.getElementById('loading-message'),
            receipt:          document.getElementById('receipt'),
            receiptContent:   document.getElementById('receipt-content'),
            downloadBtn:      document.getElementById('download-btn'),
            weatherDetails:   document.getElementById('weather-details'),
            astronomyDetails: document.getElementById('astronomy-details'),
            museumDetails:    document.getElementById('museum-details'),
            floraList:        document.getElementById('flora-list'),
            // New elements for white aesthetic
            birdName:         document.getElementById('bird-name'),
            birdScientific:   document.getElementById('bird-scientific'),
            birdDescription:  document.getElementById('bird-description'),
            birdPlayBtn:      document.getElementById('bird-play-btn'),
            poemLines:        document.getElementById('poem-lines'),
            poemAttribution:  document.getElementById('poem-attribution'),
            detailsToggle:    document.getElementById('details-toggle'),
            detailsBody:      document.getElementById('details-body')
        };

        setupEventListeners();

        // Set a sensible default date on the birthday input if it exists
        if (elements.birthdayInput) {
            try {
                elements.birthdayInput.valueAsDate = new Date(1995, 10, 4); // Nov 4, 1995
            } catch (_) {
                elements.birthdayInput.value = '1995-11-04';
            }
        }

        // Set up details toggle
        if (elements.detailsToggle && elements.detailsBody) {
            elements.detailsToggle.addEventListener('click', function () {
                elements.detailsBody.classList.toggle('hidden');
                elements.detailsToggle.textContent =
                    elements.detailsBody.classList.contains('hidden') ? 'Details' : 'Hide details';
            });
        }
    }

    // -------------------------------------------------------------------
    // Event listeners
    // -------------------------------------------------------------------

    function setupEventListeners() {
        // Download button
        if (elements.downloadBtn) {
            elements.downloadBtn.addEventListener('click', function (e) {
                e.preventDefault();
                downloadImage();
            });
        }

        // Enter key on the birthday input triggers generation
        if (elements.birthdayInput) {
            elements.birthdayInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (elements.generateBtn) {
                        elements.generateBtn.click();
                    }
                }
            });
        }
    }

    // -------------------------------------------------------------------
    // Loading overlay
    // -------------------------------------------------------------------

    /**
     * Show the loading overlay and begin cycling through poetic messages.
     * Each message fades in gently, holding for 2.8 seconds before the
     * next appears — giving the "slow web" feeling of careful work.
     */
    function showLoading() {
        if (!elements.loadingOverlay) return;

        // Reset state
        loadingMessageIndex = 0;
        elements.loadingOverlay.classList.remove('hidden');

        // Set the first message immediately
        setLoadingMessageWithFade(LOADING_MESSAGES[0]);

        // Cycle subsequent messages
        clearInterval(loadingInterval);
        loadingInterval = setInterval(function () {
            loadingMessageIndex++;
            if (loadingMessageIndex < LOADING_MESSAGES.length) {
                setLoadingMessageWithFade(LOADING_MESSAGES[loadingMessageIndex]);
            } else {
                // Stay on last message — the pipeline will hide loading soon
                clearInterval(loadingInterval);
                loadingInterval = null;
            }
        }, 2800);
    }

    /**
     * Hide the loading overlay with a gentle fade-out.
     */
    function hideLoading() {
        // Stop cycling messages
        if (loadingInterval) {
            clearInterval(loadingInterval);
            loadingInterval = null;
        }

        if (!elements.loadingOverlay) return;

        // The CSS transition on .loading-overlay handles the fade.
        elements.loadingOverlay.classList.add('hidden');
    }

    /**
     * Directly update the loading message text. Called by the app
     * orchestrator to override the automatic cycling when it reaches
     * specific pipeline phases.
     *
     * @param {string} message - the message to display
     */
    function updateLoadingText(message) {
        if (!elements.loadingMessage) return;
        setLoadingMessageWithFade(message);
    }

    /**
     * Internal: set loading message text with a brief fade transition.
     * @param {string} text
     */
    function setLoadingMessageWithFade(text) {
        if (!elements.loadingMessage) return;

        // Fade out
        elements.loadingMessage.style.transition = 'opacity 0.35s ease';
        elements.loadingMessage.style.opacity = '0';

        setTimeout(function () {
            elements.loadingMessage.textContent = text;
            // Fade in
            elements.loadingMessage.style.opacity = '1';
        }, 350);
    }

    // -------------------------------------------------------------------
    // Digital Florist Receipt
    // -------------------------------------------------------------------

    /**
     * Display the "Digital Florist Receipt" — a beautifully formatted
     * summary of the generation, rendered with Unicode box-drawing
     * characters for an elegant monospaced aesthetic.
     *
     * @param {Object} data
     * @param {Object} data.vaseInfo     - Museum vase metadata
     * @param {Object} data.weather      - Weather data object
     * @param {Object} data.celestialProfile - Astronomy/zodiac data
     * @param {Object} data.bouquetRecipe    - Symbolism engine output
     */
    function showReceipt(data) {
        if (!elements.receipt || !elements.receiptContent) return;

        var vase      = data.vaseInfo || {};
        var weather   = data.weather || {};
        var celestial = data.celestialProfile || {};
        var bouquet   = data.bouquetRecipe || {};

        // -----------------------------------------------------------
        // Build receipt lines
        // -----------------------------------------------------------
        var lines = [];

        // Header
        lines.push('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
        lines.push('');
        lines.push('         THE LIVING VASES');
        lines.push('      Digital Florist Receipt');
        lines.push('');
        lines.push('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
        lines.push('');

        // --- THE VESSEL ---
        lines.push('\u2502 THE VESSEL');
        lines.push('\u2502');
        lines.push('\u2502  ' + (vase.title || 'Unknown Vessel'));
        if (vase.date) {
            lines.push('\u2502  ' + vase.date);
        }
        var cultureAndMedium = [];
        if (vase.culture && vase.culture !== 'Unknown') cultureAndMedium.push(vase.culture);
        if (vase.medium && vase.medium !== 'Unknown medium')  cultureAndMedium.push(vase.medium);
        if (cultureAndMedium.length > 0) {
            lines.push('\u2502  ' + cultureAndMedium.join(' \u00B7 '));
        }
        if (vase.source) {
            lines.push('\u2502  Courtesy of ' + vase.source);
        }
        lines.push('\u2502');
        lines.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
        lines.push('');

        // --- THE ATMOSPHERE ---
        lines.push('\u2502 THE ATMOSPHERE (Singapore)');
        lines.push('\u2502');
        lines.push('\u2502  Temperature: ' + formatTemp(weather.temperature));
        lines.push('\u2502  Humidity:    ' + formatPercent(weather.humidity));
        lines.push('\u2502  Rainfall:    ' + formatRainfall(weather.rainfall));
        lines.push('\u2502  Wind:        ' + formatWind(weather.windSpeed));
        lines.push('\u2502  Condition:   ' + (weather.forecast || weather.condition || 'Fair'));
        lines.push('\u2502  Air Quality: PSI ' + (weather.psi != null ? weather.psi : '--'));

        // Weather protocol
        var protocol = deriveWeatherProtocol(weather);
        if (protocol) {
            lines.push('\u2502');
            lines.push('\u2502  Protocol: ' + protocol);
        }

        lines.push('\u2502');
        lines.push('\u2502  ' + (weather.isLive ? '\u25CF Live data' : '\u25CB Simulated data'));
        lines.push('\u2502');
        lines.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
        lines.push('');

        // --- THE CELESTIAL PORTRAIT ---
        lines.push('\u2502 THE CELESTIAL PORTRAIT');
        lines.push('\u2502');

        if (celestial.sunSign) {
            var sunSymbol = ZODIAC_SYMBOLS[celestial.sunSign] || '';
            lines.push('\u2502  Sun:     ' + sunSymbol + ' ' + celestial.sunSign);
        }
        if (celestial.venusSign) {
            var venusSymbol = ZODIAC_SYMBOLS[celestial.venusSign] || '';
            lines.push('\u2502  Venus:   ' + venusSymbol + ' ' + celestial.venusSign);
        }
        if (celestial.marsSign) {
            var marsSymbol = ZODIAC_SYMBOLS[celestial.marsSign] || '';
            lines.push('\u2502  Mars:    ' + marsSymbol + ' ' + celestial.marsSign);
        }
        if (celestial.moonPhase) {
            var moonIcon = MOON_PHASE_ICONS[celestial.moonPhase] || '\uD83C\uDF19';
            lines.push('\u2502  Moon:    ' + moonIcon + ' ' + celestial.moonPhase);
        }
        if (celestial.risingSign) {
            var risingSymbol = ZODIAC_SYMBOLS[celestial.risingSign] || '';
            lines.push('\u2502  Rising:  ' + risingSymbol + ' ' + celestial.risingSign);
        }

        // If no celestial data at all, show a gentle fallback
        if (!celestial.sunSign && !celestial.moonPhase) {
            lines.push('\u2502  The stars remain veiled tonight.');
        }

        lines.push('\u2502');
        lines.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
        lines.push('');

        // --- THE BOUQUET ---
        lines.push('\u2502 THE BOUQUET');
        lines.push('\u2502');

        var flowers = bouquet.flowers || bouquet.selections || [];
        if (flowers.length > 0) {
            for (var i = 0; i < flowers.length; i++) {
                var flower = flowers[i];
                var role = flower.role || flower.category || '';
                var name = flower.name || flower.commonName || 'Unknown bloom';
                var meaning = flower.meaning || flower.symbolism || '';
                var reason = flower.reason || '';

                var roleLine = role ? (role + ': ') : '';
                lines.push('\u2502  ' + roleLine + name);
                if (reason) {
                    lines.push('\u2502    (' + reason + ')');
                }
                if (meaning) {
                    lines.push('\u2502    \u201C' + meaning + '\u201D');
                }
                lines.push('\u2502');
            }
        } else {
            // No bouquet data from symbolism engine — show poetic fallback
            lines.push('\u2502  Wild arrangement \u2014 nature chose freely.');
            lines.push('\u2502');
        }

        // Arrangement style if present
        if (bouquet.arrangementStyle || bouquet.style) {
            lines.push('\u2502  Arrangement: ' + (bouquet.arrangementStyle || bouquet.style));
            lines.push('\u2502');
        }

        // Palette if present
        if (bouquet.palette && bouquet.palette.length > 0) {
            lines.push('\u2502  Palette: ' + bouquet.palette.join(', '));
            lines.push('\u2502');
        }

        lines.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
        lines.push('');

        // Footer
        var now = new Date();
        var timestamp = formatTimestamp(now);
        lines.push('  Generated: ' + timestamp);
        if (celestial.birthday) {
            lines.push('  Birthday:  ' + celestial.birthday);
        }
        lines.push('  Location:  Singapore (1.35\u00B0N, 103.82\u00B0E)');
        lines.push('');
        lines.push('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');

        // -----------------------------------------------------------
        // Render into DOM
        // -----------------------------------------------------------
        var pre = document.createElement('pre');
        pre.style.fontFamily = "'Courier New', Courier, monospace";
        pre.style.fontSize = '0.82rem';
        pre.style.lineHeight = '1.55';
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.wordBreak = 'break-word';
        pre.style.color = '#3a3a3a';
        pre.style.margin = '0';
        pre.style.padding = '0.5rem 0';
        pre.textContent = lines.join('\n');

        // Clear previous receipt and insert
        elements.receiptContent.innerHTML = '';
        elements.receiptContent.appendChild(pre);

        // Show the receipt container (remove .hidden)
        elements.receipt.classList.remove('hidden');

        // Gentle scroll into view
        setTimeout(function () {
            elements.receipt.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 200);
    }

    // -------------------------------------------------------------------
    // Formatting helpers for the receipt
    // -------------------------------------------------------------------

    function formatTemp(value) {
        if (value == null) return '--';
        return Math.round(value * 10) / 10 + '\u00B0C';
    }

    function formatPercent(value) {
        if (value == null) return '--';
        return Math.round(value) + '%';
    }

    function formatRainfall(value) {
        if (value == null) return '--';
        if (value === 0) return 'None';
        return Math.round(value * 10) / 10 + ' mm';
    }

    function formatWind(value) {
        if (value == null) return '--';
        return Math.round(value * 10) / 10 + ' knots';
    }

    function formatTimestamp(date) {
        var months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        var d = date.getDate();
        var m = months[date.getMonth()];
        var y = date.getFullYear();
        var h = String(date.getHours()).padStart(2, '0');
        var min = String(date.getMinutes()).padStart(2, '0');
        return d + ' ' + m + ' ' + y + ', ' + h + ':' + min;
    }

    /**
     * Derive a poetic "weather protocol" name based on conditions.
     * These names give the receipt its distinctive personality.
     */
    function deriveWeatherProtocol(weather) {
        if (!weather) return null;

        var condition = (weather.condition || weather.forecast || '').toLowerCase();
        var temp = weather.temperature;
        var humidity = weather.humidity;
        var rainfall = weather.rainfall;
        var windSpeed = weather.windSpeed;

        // Thunderstorm conditions
        if (condition.indexOf('thunder') !== -1) {
            return 'Monsoon Protocol';
        }

        // Haze conditions
        if (condition.indexOf('haz') !== -1) {
            if (weather.psi && weather.psi > 100) {
                return 'Haze Veil Protocol';
            }
            return 'Mist Garden Protocol';
        }

        // Rain conditions
        if (condition.indexOf('rain') !== -1 || condition.indexOf('shower') !== -1) {
            if (rainfall && rainfall > 10) {
                return 'Monsoon Protocol';
            }
            return 'Rain Garden Protocol';
        }

        // Hot and humid
        if (temp && temp > 33 && humidity && humidity > 80) {
            return 'Tropical Blaze Protocol';
        }

        // Windy conditions
        if (windSpeed && windSpeed > 15) {
            return 'Trade Wind Protocol';
        }

        // Cool morning
        if (temp && temp < 26) {
            return 'Dawn Mist Protocol';
        }

        // Hot midday
        if (temp && temp > 32) {
            return 'Meridian Sun Protocol';
        }

        // Cloudy
        if (condition.indexOf('cloud') !== -1 || condition.indexOf('overcast') !== -1) {
            return 'Overcast Canopy Protocol';
        }

        // Default fair weather
        return 'Golden Light Protocol';
    }

    // -------------------------------------------------------------------
    // Download functionality
    // -------------------------------------------------------------------

    /**
     * Export the canvas as a PNG image and trigger a download.
     * Attempts to use CompositionEngine.exportAsImage() first, then
     * falls back to direct canvas toDataURL.
     */
    function downloadImage() {
        var dataUrl = null;

        // Strategy 1: Ask the CompositionEngine (Fabric.js wrapper)
        if (typeof CompositionEngine !== 'undefined' &&
            typeof CompositionEngine.exportAsImage === 'function') {
            try {
                dataUrl = CompositionEngine.exportAsImage();
            } catch (e) {
                console.warn('[UI] CompositionEngine.exportAsImage failed:', e.message);
            }
        }

        // Strategy 2: Direct canvas export
        if (!dataUrl && elements.canvas) {
            try {
                dataUrl = elements.canvas.toDataURL('image/png');
            } catch (e) {
                console.warn('[UI] Canvas toDataURL failed (likely tainted):', e.message);
            }
        }

        if (!dataUrl) {
            console.error('[UI] Unable to export canvas image.');
            return;
        }

        // Create a temporary link and trigger the download
        var link = document.createElement('a');
        link.download = 'living-vase-' + Date.now() + '.png';
        link.href = dataUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        // Clean up
        setTimeout(function () {
            document.body.removeChild(link);
        }, 100);
    }

    // -------------------------------------------------------------------
    // Info panel updates
    // -------------------------------------------------------------------

    /**
     * Display weather information in the info panel sidebar.
     * @param {Object} weather - weather data from WeatherApi
     */
    function displayWeather(weather) {
        if (!elements.weatherDetails || !weather) return;

        var parts = [];

        parts.push(formatTemp(weather.temperature));

        if (weather.humidity != null) {
            parts.push(formatPercent(weather.humidity) + ' humidity');
        }

        if (weather.forecast) {
            parts.push(weather.forecast);
        } else if (weather.condition) {
            parts.push(weather.condition);
        }

        if (weather.rainfall && weather.rainfall > 0) {
            parts.push(formatRainfall(weather.rainfall) + ' rain');
        }

        var liveTag = weather.isLive ? ' (live)' : ' (simulated)';
        elements.weatherDetails.textContent = parts.join(' \u00B7 ') + liveTag;
    }

    /**
     * Display celestial / astronomical information in the info panel.
     * @param {Object} profile - celestial profile from AstronomyEngine
     */
    function displayCelestial(profile) {
        if (!elements.astronomyDetails || !profile) return;

        var parts = [];

        if (profile.sunSign) {
            var sunSym = ZODIAC_SYMBOLS[profile.sunSign] || '';
            parts.push('Sun ' + sunSym + ' ' + profile.sunSign);
        }

        if (profile.moonPhase) {
            var moonIco = MOON_PHASE_ICONS[profile.moonPhase] || '';
            parts.push(moonIco + ' ' + profile.moonPhase);
        }

        if (profile.venusSign) {
            var venusSym = ZODIAC_SYMBOLS[profile.venusSign] || '';
            parts.push('Venus ' + venusSym + ' ' + profile.venusSign);
        }

        if (parts.length === 0) {
            parts.push('Celestial data unavailable');
        }

        elements.astronomyDetails.textContent = parts.join(' \u00B7 ');
    }

    /**
     * Display museum vase information in the info panel.
     * @param {Object} vaseInfo - vase data from MuseumApi
     */
    function displayMuseum(vaseInfo) {
        if (!elements.museumDetails || !vaseInfo) return;

        var parts = [];

        if (vaseInfo.title) parts.push(vaseInfo.title);
        if (vaseInfo.date)  parts.push(vaseInfo.date);
        if (vaseInfo.source) parts.push(vaseInfo.source);

        elements.museumDetails.textContent = parts.join(' \u2014 ');

        // Make it clickable if we have a URL
        if (vaseInfo.url && vaseInfo.url !== '#') {
            elements.museumDetails.innerHTML = '';
            var link = document.createElement('a');
            link.href = vaseInfo.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = parts.join(' \u2014 ');
            link.style.color = 'inherit';
            link.style.textDecoration = 'underline';
            link.style.textDecorationColor = '#ccc';
            elements.museumDetails.appendChild(link);
        }
    }

    /**
     * Populate the flora list in the composition info section.
     * @param {Object} bouquetRecipe - output of SymbolismEngine
     */
    function displayFloraList(bouquetRecipe) {
        if (!elements.floraList || !bouquetRecipe) return;

        elements.floraList.innerHTML = '';

        var flowers = bouquetRecipe.flowers || bouquetRecipe.selections || [];

        for (var i = 0; i < flowers.length; i++) {
            var flower = flowers[i];
            var li = document.createElement('li');

            var name = flower.name || flower.commonName || 'Unknown';
            var role = flower.role || flower.category || '';
            var meaning = flower.meaning || flower.symbolism || '';

            var nameSpan = document.createElement('strong');
            nameSpan.textContent = name;
            li.appendChild(nameSpan);

            if (role) {
                var roleSpan = document.createElement('span');
                roleSpan.textContent = ' \u2014 ' + role;
                roleSpan.style.color = '#999';
                roleSpan.style.fontSize = '0.85em';
                li.appendChild(roleSpan);
            }

            if (meaning) {
                var meaningEl = document.createElement('div');
                meaningEl.textContent = '\u201C' + meaning + '\u201D';
                meaningEl.style.fontSize = '0.82em';
                meaningEl.style.color = '#888';
                meaningEl.style.fontStyle = 'italic';
                meaningEl.style.marginTop = '0.15rem';
                li.appendChild(meaningEl);
            }

            elements.floraList.appendChild(li);
        }

        // If no flowers, show a gentle message
        if (flowers.length === 0) {
            var li = document.createElement('li');
            li.textContent = 'An arrangement drawn from the air itself.';
            li.style.fontStyle = 'italic';
            li.style.color = '#999';
            elements.floraList.appendChild(li);
        }
    }

    /**
     * Show a graceful error message to the user — never raw stack traces.
     * @param {string} message - human-readable error description
     */
    function showError(message) {
        // Display in the receipt area so it is visible but not alarming
        if (elements.receiptContent && elements.receipt) {
            var pre = document.createElement('pre');
            pre.style.fontFamily = "'Courier New', Courier, monospace";
            pre.style.fontSize = '0.85rem';
            pre.style.lineHeight = '1.55';
            pre.style.color = '#8a6d5b';
            pre.style.whiteSpace = 'pre-wrap';
            pre.style.margin = '0';

            var errorLines = [];
            errorLines.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
            errorLines.push('');
            errorLines.push('  A gentle interruption\u2026');
            errorLines.push('');
            errorLines.push('  ' + (message || 'Something went awry while'));
            errorLines.push('  composing your arrangement.');
            errorLines.push('');
            errorLines.push('  Please try again \u2014 the garden');
            errorLines.push('  is always willing to bloom anew.');
            errorLines.push('');
            errorLines.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

            pre.textContent = errorLines.join('\n');
            elements.receiptContent.innerHTML = '';
            elements.receiptContent.appendChild(pre);
            elements.receipt.classList.remove('hidden');
        }

        // Also update loading text if still visible
        if (elements.loadingMessage) {
            elements.loadingMessage.textContent = 'The garden rests\u2026';
        }
    }

    // -------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------

    // -------------------------------------------------------------------
    // Bird display
    // -------------------------------------------------------------------

    function displayBird(birdData) {
        if (!birdData) return;
        if (elements.birdName) {
            elements.birdName.textContent = birdData.name || '';
        }
        if (elements.birdScientific) {
            elements.birdScientific.textContent = birdData.scientific || '';
        }
        if (elements.birdDescription) {
            elements.birdDescription.textContent = birdData.description || '';
        }
        // Wire play button
        if (elements.birdPlayBtn && typeof BirdSongs !== 'undefined') {
            elements.birdPlayBtn.onclick = function () {
                try {
                    BirdSongs.playChirp(birdData);
                } catch (e) {
                    console.warn('[UI] Bird chirp failed:', e.message);
                }
            };
        }
    }

    // -------------------------------------------------------------------
    // Poem display
    // -------------------------------------------------------------------

    function displayPoem(poemData) {
        if (!poemData) return;
        if (elements.poemLines) {
            // Convert \n to <br> for line breaks
            elements.poemLines.innerHTML = (poemData.lines || '').replace(/\n/g, '<br>');
        }
        if (elements.poemAttribution) {
            var attribution = '';
            if (poemData.poet) attribution += poemData.poet;
            if (poemData.title) attribution += ', \u201C' + poemData.title + '\u201D';
            elements.poemAttribution.textContent = attribution ? '\u2014 ' + attribution : '';
        }
    }

    return {
        init:              init,
        showLoading:       showLoading,
        hideLoading:       hideLoading,
        updateLoadingText: updateLoadingText,
        showReceipt:       showReceipt,
        downloadImage:     downloadImage,
        displayWeather:    displayWeather,
        displayCelestial:  displayCelestial,
        displayMuseum:     displayMuseum,
        displayFloraList:  displayFloraList,
        displayBird:       displayBird,
        displayPoem:       displayPoem,
        showError:         showError
    };

})();
