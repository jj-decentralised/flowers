/**
 * app.js - Main Application Orchestrator for "The Living Vases"
 *
 * Coordinates the full pipeline:
 *   1. Fetch real-time data (weather, astronomy, museum artwork)
 *   2. Run the symbolism engine to map data into a flora selection
 *   3. Fetch real flower photographs from Wikimedia Commons
 *   4. Hand flora list, vase image, and flower photos to composition engine
 *   5. Render the final arrangement as an HTML/CSS composition
 *   6. Update the UI with data readouts and the arrangement receipt
 *
 * Dependencies (expected as globals via <script> tags):
 *   - Astronomy (window.Astronomy)
 *   - All project modules: MuseumApi, WeatherApi, AstronomyEngine,
 *     SymbolismEngine, CompositionEngine, FloraDatabase, FlowerImageApi,
 *     ImageProcessor, UI
 */

const App = (function () {
    'use strict';

    var isGenerating = false;

    // -------------------------------------------------------------------
    // Initialisation
    // -------------------------------------------------------------------

    async function init() {
        UI.init();

        if (typeof CompositionEngine !== 'undefined' &&
            typeof CompositionEngine.init === 'function') {
            try {
                CompositionEngine.init('arrangement-container');
            } catch (e) {
                console.warn('[App] CompositionEngine.init failed:', e.message);
            }
        }

        var generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', function () { generate(); });
        }

        // Display today's bird
        try {
            if (typeof BirdSongs !== 'undefined' && typeof BirdSongs.getTodaysBird === 'function') {
                UI.displayBird(BirdSongs.getTodaysBird());
            }
        } catch (e) { console.warn('[App] Bird display failed:', e.message); }

        // Display today's poem
        try {
            if (typeof LovePoems !== 'undefined' && typeof LovePoems.getTodaysPoem === 'function') {
                UI.displayPoem(LovePoems.getTodaysPoem());
            }
        } catch (e) { console.warn('[App] Poem display failed:', e.message); }

        await generate();
    }

    // -------------------------------------------------------------------
    // Main generation pipeline
    // -------------------------------------------------------------------

    async function generate() {
        if (isGenerating) return;
        isGenerating = true;

        var birthdayInput = document.getElementById('birthday-input');
        var dateStr = birthdayInput ? birthdayInput.value : '1995-11-04';
        if (!dateStr || isNaN(Date.parse(dateStr))) dateStr = '1995-11-04';

        UI.showLoading();

        try {
            // PHASE 1: Data Collection
            UI.updateLoadingText('Consulting the stars\u2026');
            var celestialProfile = normalizeCelestialProfile(getCelestialProfile(dateStr));
            console.log('[App] Celestial profile:', celestialProfile);

            UI.updateLoadingText('Reading the Singapore sky\u2026');
            var weather = await getWeather();
            console.log('[App] Weather:', weather);

            UI.updateLoadingText('Searching the museum archives\u2026');
            var vaseData = await getVaseData();
            console.log('[App] Vase data:', vaseData);

            // PHASE 2: Symbolism Processing
            UI.updateLoadingText('Selecting the blooms\u2026');
            var bouquetRecipe = composeBouquet(weather, celestialProfile);
            bouquetRecipe = normalizeBouquetRecipe(bouquetRecipe);
            console.log('[App] Bouquet recipe:', bouquetRecipe);

            // PHASE 3: Generate Flower SVGs
            UI.updateLoadingText('Painting the blooms\u2026');
            var flowerImageMap = generateFlowerSVGs(bouquetRecipe);
            console.log('[App] Flower SVGs generated:', Object.keys(flowerImageMap).length);

            // PHASE 4: Composition (pass flower images to engine)
            UI.updateLoadingText('Arranging the bouquet\u2026');
            await renderComposition(vaseData, bouquetRecipe, weather, flowerImageMap);

            // PHASE 5: Display results
            UI.updateLoadingText('Applying the finishing touches\u2026');
            await pause(600);

            try {
                UI.showReceipt({ vaseInfo: vaseData, weather: weather, celestialProfile: celestialProfile, bouquetRecipe: bouquetRecipe });
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
    // Data normalization
    // -------------------------------------------------------------------

    function normalizeCelestialProfile(profile) {
        if (!profile) return getFallbackCelestialProfile('1995-11-04');
        var normalized = {};
        for (var key in profile) { if (profile.hasOwnProperty(key)) normalized[key] = profile[key]; }

        if (normalized.sunSign && typeof normalized.sunSign === 'object') {
            normalized.sunSignData = normalized.sunSign;
            normalized.sunSign = normalized.sunSign.name || 'Aries';
        }
        if (normalized.venusSign && typeof normalized.venusSign === 'object') {
            normalized.venusSignData = normalized.venusSign;
            normalized.venusSign = normalized.venusSign.name || 'Libra';
        }
        if (normalized.marsSign && typeof normalized.marsSign === 'object') {
            normalized.marsSign = normalized.marsSign.name || 'Aries';
        }
        if (normalized.moonPhase && typeof normalized.moonPhase === 'object') {
            normalized.moonIllumination = normalized.moonPhase.illumination;
            normalized.moonPhaseAngle = normalized.moonPhase.angle;
            normalized.moonPhaseEmoji = normalized.moonPhase.emoji;
            normalized.moonPhase = normalized.moonPhase.phase || 'Waxing Crescent';
        }
        if (typeof normalized.moonIllumination !== 'number') normalized.moonIllumination = 0.5;
        return normalized;
    }

    function normalizeBouquetRecipe(recipe) {
        if (!recipe) return getFallbackBouquet({}, {});
        var flowers = [];

        function extractFlower(item, fallbackRole) {
            if (!item) return null;
            var fd = item.flower || item;
            return {
                name: fd.common || fd.name || fd.scientific || 'Unknown bloom',
                scientific: fd.scientific || '',
                role: item.role || fallbackRole || '',
                reason: item.reason || '',
                symbolism: fd.symbolism || item.symbolism || '',
                meaning: fd.symbolism || item.meaning || '',
                colors: fd.colors || item.colors || ['#E8557A', '#C94060', '#F4A0B0'],
                color: (fd.colors && fd.colors[0]) || '#E8557A'
            };
        }

        (recipe.primary || []).forEach(function(f) { var n = extractFlower(f, 'Primary (Zodiac)'); if (n) flowers.push(n); });
        (recipe.loveAccent || []).forEach(function(f) { var n = extractFlower(f, 'Love Accent (Venus)'); if (n) flowers.push(n); });
        (recipe.moonAccent || []).forEach(function(f) { var n = extractFlower(f, 'Moon Accent'); if (n) flowers.push(n); });
        (recipe.weatherAccent || []).forEach(function(f) { var n = extractFlower(f, 'Weather Accent'); if (n) flowers.push(n); });
        (recipe.paletteAccent || []).forEach(function(f) { var n = extractFlower(f, 'Palette Accent'); if (n) flowers.push(n); });

        if (flowers.length === 0 && recipe.flowers) flowers = recipe.flowers;

        var normalized = {};
        for (var key in recipe) { if (recipe.hasOwnProperty(key)) normalized[key] = recipe[key]; }
        normalized.flowers = flowers;
        normalized.selections = flowers;
        if (!normalized.accent) {
            normalized.accent = [].concat(recipe.loveAccent || [], recipe.moonAccent || [], recipe.weatherAccent || [], recipe.paletteAccent || []);
        }
        normalized.totalBlooms = normalized.totalBlooms || normalized.totalCount || flowers.length || 8;
        return normalized;
    }

    // -------------------------------------------------------------------
    // Phase helpers
    // -------------------------------------------------------------------

    function getCelestialProfile(dateStr) {
        if (typeof AstronomyEngine !== 'undefined' && typeof AstronomyEngine.getCelestialProfile === 'function') {
            try {
                var profile = AstronomyEngine.getCelestialProfile(dateStr);
                if (profile && profile.sunSign) { profile.birthday = dateStr; return profile; }
            } catch (e) { console.warn('[App] AstronomyEngine failed:', e.message); }
        }
        return getFallbackCelestialProfile(dateStr);
    }

    async function getWeather() {
        if (typeof WeatherApi !== 'undefined' && typeof WeatherApi.fetchAllWeather === 'function') {
            try { return await WeatherApi.fetchAllWeather(); }
            catch (e) { console.warn('[App] WeatherApi failed:', e.message); }
        }
        if (typeof WeatherApi !== 'undefined' && typeof WeatherApi.getFallbackWeather === 'function') {
            return WeatherApi.getFallbackWeather();
        }
        return getFallbackWeather();
    }

    async function getVaseData() {
        if (typeof MuseumApi !== 'undefined' && typeof MuseumApi.getRandomVase === 'function') {
            try { return await MuseumApi.getRandomVase(); }
            catch (e) { console.warn('[App] MuseumApi failed:', e.message); }
        }
        return getFallbackVase();
    }

    function composeBouquet(weather, celestialProfile) {
        if (typeof SymbolismEngine !== 'undefined' && typeof SymbolismEngine.composeBouquet === 'function') {
            try {
                var recipe = SymbolismEngine.composeBouquet(weather, celestialProfile);
                if (recipe) return recipe;
            } catch (e) { console.warn('[App] SymbolismEngine failed:', e.message); }
        }
        return getFallbackBouquet(weather, celestialProfile);
    }

    function generateFlowerSVGs(bouquetRecipe) {
        if (typeof FlowerGenerator === 'undefined') {
            console.warn('[App] FlowerGenerator not available');
            return {};
        }
        try {
            var flowers = bouquetRecipe.flowers || [];
            var result = FlowerGenerator.generateFlowerImages(flowers);
            // Also generate foliage
            var foliageResult = FlowerGenerator.generateFoliageImages(bouquetRecipe.foliage || []);
            for (var key in foliageResult) {
                if (foliageResult.hasOwnProperty(key)) {
                    result[key] = foliageResult[key];
                }
            }
            return result;
        } catch (e) {
            console.warn('[App] Flower SVG generation failed:', e.message);
            return {};
        }
    }

    async function renderComposition(vaseData, bouquetRecipe, weather, flowerImageMap) {
        if (typeof CompositionEngine !== 'undefined' && typeof CompositionEngine.compose === 'function') {
            try { await CompositionEngine.compose(vaseData, bouquetRecipe, weather, flowerImageMap); return; }
            catch (e) { console.warn('[App] CompositionEngine.compose failed:', e.message); }
        }
        renderFallbackComposition(bouquetRecipe, weather);
    }

    // -------------------------------------------------------------------
    // Fallback data generators
    // -------------------------------------------------------------------

    function getFallbackVase() {
        var vases = [
            { id: 'fallback-ming', title: 'Blue and White Porcelain Vase', date: 'Ming Dynasty, c. 1600', culture: 'Chinese', medium: 'Porcelain with cobalt blue underglaze', imageUrl: null, url: '#', source: 'The Living Vases Archive' },
            { id: 'fallback-celadon', title: 'Celadon Meiping Vase', date: 'Song Dynasty, c. 1150', culture: 'Chinese', medium: 'Stoneware with celadon glaze', imageUrl: null, url: '#', source: 'The Living Vases Archive' },
            { id: 'fallback-greek', title: 'Red-Figure Amphora', date: 'c. 450 BCE', culture: 'Greek, Attic', medium: 'Terracotta, red-figure technique', imageUrl: null, url: '#', source: 'The Living Vases Archive' },
            { id: 'fallback-persian', title: 'Lustre-Painted Bottle Vase', date: 'c. 1200 CE', culture: 'Persian, Kashan', medium: 'Fritware with lustre overglaze', imageUrl: null, url: '#', source: 'The Living Vases Archive' },
            { id: 'fallback-japanese', title: 'Satsuma Earthenware Vase', date: 'Meiji Period, c. 1880', culture: 'Japanese', medium: 'Earthenware with overglaze enamel', imageUrl: null, url: '#', source: 'The Living Vases Archive' }
        ];
        return vases[Math.floor(Math.random() * vases.length)];
    }

    function getFallbackWeather() {
        var hour = new Date().getHours();
        var diurnal = 3 * Math.sin((hour - 6) * Math.PI / 12);
        var temp = Math.max(25, Math.min(35, 28 + diurnal + (Math.random() * 2 - 1)));
        var humidity = Math.max(60, Math.min(100, 90 - diurnal * 3 + (Math.random() * 6 - 3)));
        var rainChance = (hour >= 12 && hour <= 18) ? 0.55 : 0.2;
        var rainfall = Math.random() < rainChance ? Math.random() * 20 : 0;
        var forecastOpts = rainfall > 10 ? ['Thundery Showers'] : rainfall > 0 ? ['Light Showers'] : humidity > 85 ? ['Partly Cloudy'] : ['Fair'];
        var forecast = forecastOpts[Math.floor(Math.random() * forecastOpts.length)];
        return { temperature: Math.round(temp * 10) / 10, rainfall: Math.round(rainfall * 10) / 10, humidity: Math.round(humidity * 10) / 10, windSpeed: Math.round((5 + Math.random() * 15) * 10) / 10, psi: Math.round(20 + Math.random() * 60), forecast: forecast, condition: classifyCondition(forecast), isLive: false, timestamp: new Date().toISOString() };
    }

    function classifyCondition(text) {
        if (!text) return 'Fair';
        var l = text.toLowerCase();
        if (l.indexOf('thunder') !== -1) return 'Thundery';
        if (l.indexOf('haz') !== -1) return 'Hazy';
        if (l.indexOf('shower') !== -1 || l.indexOf('rain') !== -1) return 'Showers';
        if (l.indexOf('cloud') !== -1) return 'Cloudy';
        return 'Fair';
    }

    function getFallbackCelestialProfile(dateStr) {
        var date = new Date(dateStr + 'T12:00:00');
        if (isNaN(date.getTime())) date = new Date('1995-11-04T12:00:00');
        var month = date.getMonth() + 1, day = date.getDate();
        var sunSign = getZodiacSign(month, day);
        var zodiacOrder = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
        var si = zodiacOrder.indexOf(sunSign);
        var vo = Math.floor((date.getFullYear() * 7 + month * 3 + day) % 12);
        var mo = Math.floor((date.getFullYear() * 11 + month * 5 + day * 2) % 12);
        return { birthday: dateStr, sunSign: sunSign, venusSign: zodiacOrder[(si + 12 - 1 + vo % 3) % 12], marsSign: zodiacOrder[mo], moonPhase: getMoonPhaseForDate(date) };
    }

    function getZodiacSign(m, d) {
        if ((m===3&&d>=21)||(m===4&&d<=19)) return 'Aries';
        if ((m===4&&d>=20)||(m===5&&d<=20)) return 'Taurus';
        if ((m===5&&d>=21)||(m===6&&d<=20)) return 'Gemini';
        if ((m===6&&d>=21)||(m===7&&d<=22)) return 'Cancer';
        if ((m===7&&d>=23)||(m===8&&d<=22)) return 'Leo';
        if ((m===8&&d>=23)||(m===9&&d<=22)) return 'Virgo';
        if ((m===9&&d>=23)||(m===10&&d<=22)) return 'Libra';
        if ((m===10&&d>=23)||(m===11&&d<=21)) return 'Scorpio';
        if ((m===11&&d>=22)||(m===12&&d<=21)) return 'Sagittarius';
        if ((m===12&&d>=22)||(m===1&&d<=19)) return 'Capricorn';
        if ((m===1&&d>=20)||(m===2&&d<=18)) return 'Aquarius';
        return 'Pisces';
    }

    function getMoonPhaseForDate(date) {
        var ref = new Date(2000, 0, 6, 18, 14, 0);
        var days = (date.getTime() - ref.getTime()) / 86400000;
        var pos = ((days % 29.53058867) + 29.53058867) % 29.53058867;
        var p = pos / 29.53058867;
        if (p < 0.0625) return 'New Moon';
        if (p < 0.1875) return 'Waxing Crescent';
        if (p < 0.3125) return 'First Quarter';
        if (p < 0.4375) return 'Waxing Gibbous';
        if (p < 0.5625) return 'Full Moon';
        if (p < 0.6875) return 'Waning Gibbous';
        if (p < 0.8125) return 'Last Quarter';
        if (p < 0.9375) return 'Waning Crescent';
        return 'New Moon';
    }

    function getFallbackBouquet(weather, celestial) {
        var flowers = [], palette = [];
        var zf = { Aries:{name:'Honeysuckle',color:'#FF6B6B',meaning:'Devotion'}, Taurus:{name:'Lily of the Valley',color:'#F5F5DC',meaning:'Sweetness'}, Gemini:{name:'Lavender',color:'#B57EDC',meaning:'Serenity'}, Cancer:{name:'White Rose',color:'#FFF5F5',meaning:'Purity'}, Leo:{name:'Sunflower',color:'#FFD700',meaning:'Adoration'}, Virgo:{name:'Chrysanthemum',color:'#FFFACD',meaning:'Perfection'}, Libra:{name:'Bluebell',color:'#6495ED',meaning:'Balance'}, Scorpio:{name:'Geranium',color:'#8B0000',meaning:'Mystery'}, Sagittarius:{name:'Carnation',color:'#FF69B4',meaning:'Fascination'}, Capricorn:{name:'Pansy',color:'#7B68EE',meaning:'Thoughtfulness'}, Aquarius:{name:'Orchid',color:'#DA70D6',meaning:'Refinement'}, Pisces:{name:'Water Lily',color:'#E6E6FA',meaning:'Enlightenment'} };
        var ss = (celestial&&celestial.sunSign)||'Scorpio';
        var pf = zf[ss]||zf.Scorpio;
        flowers.push({name:pf.name,role:'Primary',reason:ss+' sun',meaning:pf.meaning,color:pf.color});
        palette.push(pf.color);

        var vf = { Aries:{name:'Tulip',color:'#FF4500'}, Taurus:{name:'Rose',color:'#FF007F'}, Gemini:{name:'Ranunculus',color:'#FFDAB9'}, Cancer:{name:'Peony',color:'#FFB6C1'}, Leo:{name:'Dahlia',color:'#FF6347'}, Virgo:{name:'Aster',color:'#9370DB'}, Libra:{name:'Bluebell',color:'#6495ED'}, Scorpio:{name:'Anemone',color:'#800020'}, Sagittarius:{name:'Protea',color:'#C71585'}, Capricorn:{name:'Camellia',color:'#C41E3A'}, Aquarius:{name:'Bird of Paradise',color:'#FF8C00'}, Pisces:{name:'Jasmine',color:'#FFFDD0'} };
        var vs = (celestial&&celestial.venusSign)||'Libra';
        var vfl = vf[vs]||vf.Libra;
        flowers.push({name:vfl.name,role:'Love Accent',reason:'Venus in '+vs,meaning:'Love accent',color:vfl.color});
        palette.push(vfl.color);

        var cond = (weather&&weather.condition||'Fair').toLowerCase();
        var wf;
        if (cond.indexOf('thunder')!==-1) wf={name:'Iris',color:'#4B0082'};
        else if (cond.indexOf('shower')!==-1||cond.indexOf('rain')!==-1) wf={name:'Hydrangea',color:'#5F9EA0'};
        else if (cond.indexOf('cloud')!==-1) wf={name:'Sweet Pea',color:'#DDA0DD'};
        else wf={name:'Chamomile',color:'#FAFAD2'};
        flowers.push({name:wf.name,role:'Weather Bloom',reason:(weather&&weather.forecast)||'Fair',meaning:'Weather bloom',color:wf.color});
        palette.push(wf.color);

        var mp = (celestial&&celestial.moonPhase)||'Waxing Crescent';
        var mfs = {'New Moon':{name:'Night-Blooming Cereus',color:'#F0F0F0'},'Waxing Crescent':{name:'Crocus',color:'#E6E200'},'First Quarter':{name:'Daffodil',color:'#FFD700'},'Waxing Gibbous':{name:'Gardenia',color:'#FFF8DC'},'Full Moon':{name:'Moonflower',color:'#F8F8FF'},'Waning Gibbous':{name:'Evening Primrose',color:'#FFE4C4'},'Last Quarter':{name:'Marigold',color:'#FF8C00'},'Waning Crescent':{name:'Hellebore',color:'#9ACD32'}};
        var mf = mfs[mp]||mfs['Waxing Crescent'];
        flowers.push({name:mf.name,role:'Moon Accent',reason:mp,meaning:'Moon accent',color:mf.color});
        palette.push(mf.color);

        var fol = [{name:'Eucalyptus',color:'#8FBC8F'},{name:'Fern',color:'#228B22'},{name:'Ivy',color:'#2E8B57'}];
        var fg = fol[Math.floor(Math.random()*fol.length)];
        flowers.push({name:fg.name,role:'Foliage',reason:'Greenery',meaning:'Foliage',color:fg.color});
        palette.push(fg.color);

        var styles = ['Dome','Fan','Cascade','Ikebana','Crescent'];
        return { flowers:flowers, palette:palette, arrangementStyle:styles[Math.floor(Math.random()*styles.length)], density:'moderate', mood:deriveMood(weather||{},celestial||{}) };
    }

    function deriveMood(w, c) {
        var cond = (w.condition||'').toLowerCase();
        var moon = (c.moonPhase||'').toLowerCase();
        if (cond.indexOf('thunder')!==-1) return 'dramatic';
        if (cond.indexOf('rain')!==-1||cond.indexOf('shower')!==-1) return 'contemplative';
        if (moon.indexOf('full')!==-1) return 'luminous';
        if (w.temperature&&w.temperature>33) return 'vibrant';
        return 'serene';
    }

    // -------------------------------------------------------------------
    // Fallback composition
    // -------------------------------------------------------------------

    function renderFallbackComposition(bouquetRecipe, weather) {
        var cont = document.getElementById('arrangement-container');
        if (!cont) return;
        cont.innerHTML = '';
        cont.style.height = '1000px';

        var cvs = document.createElement('canvas');
        cvs.width = 800; cvs.height = 1000;
        cvs.style.width = '100%'; cvs.style.height = '100%';
        cont.appendChild(cvs);

        var ctx = cvs.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 1000);

        var cx = 400, botY = 880, topY = 420, bw = 160, nw = 64;
        ctx.beginPath();
        ctx.moveTo(cx-nw, topY);
        ctx.bezierCurveTo(cx-nw, topY+70, cx-bw*1.1, topY+160, cx-bw, topY+255);
        ctx.bezierCurveTo(cx-bw*0.95, topY+370, cx-bw*0.6, botY, cx, botY);
        ctx.bezierCurveTo(cx+bw*0.6, botY, cx+bw*0.95, topY+370, cx+bw, topY+255);
        ctx.bezierCurveTo(cx+bw*1.1, topY+160, cx+nw, topY+70, cx+nw, topY);
        ctx.closePath();
        var g = ctx.createLinearGradient(cx-bw,0,cx+bw,0);
        g.addColorStop(0,'#c8b8a8'); g.addColorStop(0.5,'#d8cec2'); g.addColorStop(1,'#a89888');
        ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = '#8a7a6a'; ctx.lineWidth = 1.5; ctx.stroke();

        var fl = (bouquetRecipe&&bouquetRecipe.flowers)||[];
        var pal = (bouquetRecipe&&bouquetRecipe.palette)||['#c0392b','#e74c3c','#f39c12','#27ae60'];
        var fc = Math.max(fl.length, 5);
        for (var i = 0; i < fc; i++) {
            var a = (Math.PI/(fc+1))*(i+1);
            var r = 80+Math.random()*120;
            var fx = cx+Math.cos(a-Math.PI)*r*1.8;
            var fy = topY-5-Math.sin(a)*r;
            ctx.beginPath(); ctx.moveTo(cx+(fx-cx)*0.15, topY);
            ctx.quadraticCurveTo(cx+(fx-cx)*0.5, topY-r*0.4, fx, fy);
            ctx.strokeStyle = '#5a8a5a'; ctx.lineWidth = 2; ctx.stroke();
            var pc = pal[i%pal.length]||'#c0392b';
            var pr = 12+Math.random()*16;
            for (var p = 0; p < 6; p++) {
                var pa = (Math.PI*2/6)*p;
                ctx.beginPath(); ctx.arc(fx+Math.cos(pa)*pr*0.5, fy+Math.sin(pa)*pr*0.5, pr*0.55, 0, Math.PI*2);
                ctx.fillStyle = pc; ctx.globalAlpha = 0.7; ctx.fill(); ctx.globalAlpha = 1;
            }
            ctx.beginPath(); ctx.arc(fx, fy, pr*0.3, 0, Math.PI*2);
            ctx.fillStyle = '#ffd700'; ctx.fill();
        }
    }

    function pause(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    document.addEventListener('DOMContentLoaded', init);

    return { generate: generate };

})();
