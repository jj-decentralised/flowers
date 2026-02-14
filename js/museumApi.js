/**
 * museumApi.js — Metropolitan Museum of Art API Client (Primary)
 *
 * Fetches vase/vessel artwork from the Met Museum's public API (primary)
 * and the Cleveland Museum of Art API (fallback).
 *
 * The Met API is free, requires no key, and returns high-res image URLs
 * for public-domain works.
 *
 * Responsibilities:
 *   - Search for artworks classified as vases, vessels, or ceramics
 *   - Filter results to public-domain works with images
 *   - Return artwork metadata (title, date, culture, medium, image URL)
 *   - Provide a random vase selection for each generation
 *   - Fall back to CMA API or curated IDs on failure
 *
 * API base: https://collectionapi.metmuseum.org/public/collection/v1/
 *
 * Dependencies: none (vanilla fetch)
 */

const MuseumApi = (function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Configuration
    // -----------------------------------------------------------------------

    const MET_SEARCH_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/search';
    const MET_OBJECT_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

    const CMA_BASE = 'https://openaccess-api.clevelandart.org/api/artworks/';

    // Title keywords that indicate non-vase objects we want to skip
    const EXCLUSION_KEYWORDS = [
        'plate', 'dish', 'shard', 'fragment', 'lid', 'tile',
        'figurine', 'bowl', 'cup', 'teapot', 'spoon', 'fork',
        'knife', 'mirror', 'ring', 'pendant', 'coin', 'medal'
    ];

    // Curated list of known-good Met Museum vase/vessel object IDs.
    // These are public-domain ceramic/vessel works with reliable, high-quality photographs.
    // Covers Chinese, Japanese, Greek, Islamic, European traditions.
    const CURATED_MET_IDS = [
        // Chinese ceramics
        40082,   // Vase, Qing dynasty
        40213,   // Bottle vase, Qing dynasty
        40079,   // Vase with Flowers, Qing dynasty
        42175,   // Jar, Ming dynasty
        49397,   // Vase, Qing dynasty
        39596,   // Temple jar, Ming dynasty
        39575,   // Jar with dragon, Ming dynasty
        44662,   // Vase, Ming dynasty
        36625,   // Flower vase
        44927,   // Bottle vase, Qing dynasty
        44917,   // Vase, Qing dynasty
        40080,   // Vase with landscape
        // Japanese ceramics
        53241,   // Vase, Meiji period
        45543,   // Vase, Edo period
        58498,   // Bottle, stoneware
        // Greek vessels
        248907,  // Amphora
        253637,  // Lekythos
        254810,  // Amphora
        // Islamic ceramics
        449533,  // Bottle, Iznik
        451411,  // Jar, Kashan
        // European
        207862,  // Vase, Sevres
        189398,  // Vase, Art Nouveau
        6920,    // Vase
        23928,   // Vase, Korean
        38149,   // Bottle, Chinese
    ];

    // Curated CMA IDs (secondary fallback)
    const CURATED_CMA_IDS = [
        127508, 128541, 120766, 151069, 73105,
        83256, 83681, 83657, 73159, 120284,
        83193, 83270, 152973, 127926, 84065,
        121480, 127835, 83711, 83219, 83230
    ];

    // Search queries to try (in order) for diverse vase results
    const MET_SEARCH_QUERIES = [
        'vase ceramics',
        'porcelain vase',
        'ceramic vessel',
        'amphora',
        'jar porcelain'
    ];

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    function shouldExclude(title) {
        if (!title) return false;
        var lower = title.toLowerCase();
        return EXCLUSION_KEYWORDS.some(function (kw) {
            return lower.indexOf(kw) !== -1;
        });
    }

    function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    function normalizeMetObject(obj) {
        return {
            id: obj.objectID,
            title: obj.title || 'Untitled',
            date: obj.objectDate || 'Date unknown',
            culture: obj.culture || obj.artistDisplayName || 'Unknown',
            medium: obj.medium || 'Unknown medium',
            imageUrl: obj.primaryImage || obj.primaryImageSmall || '',
            creditLine: obj.creditLine || '',
            url: obj.objectURL || ('https://www.metmuseum.org/art/collection/search/' + obj.objectID),
            source: 'The Metropolitan Museum of Art',
            department: obj.department || '',
            period: obj.period || '',
            dynasty: obj.dynasty || ''
        };
    }

    function normalizeCmaArtwork(artwork) {
        var imageUrl = '';
        if (artwork.images && artwork.images.web && artwork.images.web.url) {
            imageUrl = artwork.images.web.url;
        }
        return {
            id: artwork.id,
            title: artwork.title || 'Untitled',
            date: artwork.creation_date || 'Date unknown',
            culture: artwork.culture || 'Unknown',
            medium: artwork.technique || artwork.medium || 'Unknown medium',
            imageUrl: imageUrl,
            creditLine: artwork.creditline || artwork.credit_line || '',
            url: artwork.url || ('https://www.clevelandart.org/art/' + artwork.id),
            source: 'Cleveland Museum of Art'
        };
    }

    /**
     * Fetch with timeout.
     */
    function fetchWithTimeout(url, timeoutMs) {
        timeoutMs = timeoutMs || 10000;
        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, timeoutMs);

        return fetch(url, { signal: controller.signal }).finally(function () {
            clearTimeout(timeoutId);
        });
    }

    // -----------------------------------------------------------------------
    // Met Museum API
    // -----------------------------------------------------------------------

    /**
     * Search Met Museum for vases and return a random suitable one.
     */
    async function fetchFromMetSearch() {
        // Pick a random search query for variety
        var query = MET_SEARCH_QUERIES[Math.floor(Math.random() * MET_SEARCH_QUERIES.length)];

        var searchUrl = MET_SEARCH_URL +
            '?q=' + encodeURIComponent(query) +
            '&hasImages=true' +
            '&isPublicDomain=true' +
            '&medium=Ceramics';

        var searchResponse = await fetchWithTimeout(searchUrl, 10000);
        if (!searchResponse.ok) {
            throw new Error('Met Museum search returned status ' + searchResponse.status);
        }

        var searchJson = await searchResponse.json();
        if (!searchJson.objectIDs || searchJson.objectIDs.length === 0) {
            throw new Error('Met Museum search returned no results for: ' + query);
        }

        // Shuffle a subset and try to find a good one
        var objectIDs = shuffle(searchJson.objectIDs.slice(0, 100));
        var maxAttempts = Math.min(8, objectIDs.length);

        for (var attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                var detailResponse = await fetchWithTimeout(MET_OBJECT_URL + objectIDs[attempt], 8000);
                if (!detailResponse.ok) continue;

                var obj = await detailResponse.json();

                // Must be public domain with an image
                if (!obj.isPublicDomain) continue;
                if (!obj.primaryImage && !obj.primaryImageSmall) continue;

                // Skip excluded object types
                if (shouldExclude(obj.title)) continue;

                console.log('[MuseumApi] Found Met vase:', obj.title, '(' + obj.objectID + ')');
                return normalizeMetObject(obj);
            } catch (_) {
                continue;
            }
        }

        throw new Error('No suitable Met Museum vase found after ' + maxAttempts + ' attempts');
    }

    /**
     * Fetch a specific Met Museum object by ID.
     */
    async function fetchMetById(id) {
        try {
            var response = await fetchWithTimeout(MET_OBJECT_URL + id, 8000);
            if (!response.ok) return null;

            var obj = await response.json();
            if (!obj.isPublicDomain && !obj.primaryImage && !obj.primaryImageSmall) return null;
            if (!obj.primaryImage && !obj.primaryImageSmall) return null;

            return normalizeMetObject(obj);
        } catch (_) {
            return null;
        }
    }

    /**
     * Try curated Met Museum IDs (shuffled).
     */
    async function fetchFromMetCurated() {
        var ids = shuffle(CURATED_MET_IDS.slice());
        var attempts = Math.min(6, ids.length);

        for (var k = 0; k < attempts; k++) {
            var vase = await fetchMetById(ids[k]);
            if (vase && vase.imageUrl) {
                console.log('[MuseumApi] Found curated Met vase:', vase.title);
                return vase;
            }
        }

        return null;
    }

    // -----------------------------------------------------------------------
    // CMA API (fallback)
    // -----------------------------------------------------------------------

    async function fetchFromCma() {
        var url = CMA_BASE + '?q=vase&type=Vessel&has_image=1&cc0=1&limit=40';
        var response = await fetchWithTimeout(url, 10000);
        if (!response.ok) throw new Error('CMA API returned status ' + response.status);

        var json = await response.json();
        if (!json.data || !Array.isArray(json.data)) {
            throw new Error('CMA API returned unexpected structure');
        }

        var filtered = json.data.filter(function (artwork) {
            if (!artwork.images || !artwork.images.web || !artwork.images.web.url) return false;
            if (shouldExclude(artwork.title)) return false;
            return true;
        });

        if (filtered.length === 0) throw new Error('CMA returned no suitable vases');

        var chosen = filtered[Math.floor(Math.random() * filtered.length)];
        console.log('[MuseumApi] Found CMA vase:', chosen.title);
        return normalizeCmaArtwork(chosen);
    }

    async function fetchCmaById(id) {
        try {
            var response = await fetchWithTimeout(CMA_BASE + id, 8000);
            if (!response.ok) return null;

            var json = await response.json();
            var artwork = json.data;
            if (!artwork) return null;
            if (!artwork.images || !artwork.images.web || !artwork.images.web.url) return null;

            return normalizeCmaArtwork(artwork);
        } catch (_) {
            return null;
        }
    }

    async function fetchFromCmaCurated() {
        var ids = shuffle(CURATED_CMA_IDS.slice());
        var attempts = Math.min(5, ids.length);

        for (var k = 0; k < attempts; k++) {
            var vase = await fetchCmaById(ids[k]);
            if (vase) return vase;
        }

        return null;
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Get a random museum vase using cascading fallback:
     *   1. Met Museum API search
     *   2. Curated Met Museum IDs
     *   3. CMA API search
     *   4. Curated CMA IDs
     */
    async function getRandomVase() {
        // Strategy 1: Met Museum search
        try {
            var metVase = await fetchFromMetSearch();
            if (metVase) return metVase;
        } catch (err) {
            console.warn('[MuseumApi] Met search failed:', err.message);
        }

        // Strategy 2: Curated Met IDs
        try {
            var curatedMet = await fetchFromMetCurated();
            if (curatedMet) return curatedMet;
        } catch (err) {
            console.warn('[MuseumApi] Met curated failed:', err.message);
        }

        // Strategy 3: CMA search
        try {
            var cmaVase = await fetchFromCma();
            if (cmaVase) return cmaVase;
        } catch (err) {
            console.warn('[MuseumApi] CMA search failed:', err.message);
        }

        // Strategy 4: Curated CMA IDs
        try {
            var curatedCma = await fetchFromCmaCurated();
            if (curatedCma) return curatedCma;
        } catch (err) {
            console.warn('[MuseumApi] CMA curated failed:', err.message);
        }

        // All exhausted
        throw new Error('MuseumApi: All vase sources exhausted. Check network connection.');
    }

    /**
     * Load a vase image as an HTMLImageElement.
     */
    function getVaseImage(vaseData) {
        return new Promise(function (resolve, reject) {
            if (!vaseData || !vaseData.imageUrl) {
                reject(new Error('No image URL provided'));
                return;
            }

            var img = new Image();
            img.crossOrigin = 'anonymous';

            var timeoutId = setTimeout(function () {
                img.onload = null;
                img.onerror = null;
                reject(new Error('Image load timed out'));
            }, 15000);

            img.onload = function () {
                clearTimeout(timeoutId);
                resolve(img);
            };

            img.onerror = function () {
                clearTimeout(timeoutId);
                reject(new Error('Failed to load image: ' + vaseData.imageUrl));
            };

            img.src = vaseData.imageUrl;
        });
    }

    return {
        getRandomVase: getRandomVase,
        getVaseImage: getVaseImage
    };
})();
