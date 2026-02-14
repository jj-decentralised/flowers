/**
 * museumApi.js — Cleveland Museum of Art API Client
 *
 * Fetches vase/vessel artwork from the Cleveland Museum of Art's open API.
 * The CMA API is free, requires no key, and returns high-res image URLs.
 *
 * Responsibilities:
 *   - Search for artworks classified as vases, vessels, or ceramics
 *   - Filter results to those with publicly available CC0 images
 *   - Return artwork metadata (title, date, culture, medium, image URL)
 *   - Provide a random vase selection for each generation
 *   - Fall back to curated IDs or the Met Museum API on failure
 *
 * API base: https://openaccess-api.clevelandart.org/api/artworks/
 *
 * Dependencies: none (vanilla fetch)
 */

const MuseumApi = (function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Configuration
    // -----------------------------------------------------------------------

    const CMA_BASE = 'https://openaccess-api.clevelandart.org/api/artworks/';

    // Default search parameters targeting ceramic vessels
    const DEFAULT_PARAMS = {
        q: 'vase',
        type: 'Vessel',
        has_image: 1,
        cc0: 1,
        limit: 40
    };

    // Title keywords that indicate non-vase objects we want to skip
    const EXCLUSION_KEYWORDS = [
        'plate', 'dish', 'shard', 'fragment', 'lid', 'tile',
        'figurine', 'bowl', 'cup', 'teapot', 'spoon', 'fork'
    ];

    // Curated list of known-good CMA vase artwork IDs.
    // These are CC0 ceramic/vessel works with reliable, high-quality images.
    // Used as a second-tier fallback when the API search yields poor results.
    const CURATED_CMA_IDS = [
        127508, // Bottle Vase
        128541, // Vase
        120766, // Vase with Floral Design
        151069, // Vase
        73105,  // Bottle
        83256,  // Vase
        83681,  // Vase
        83657,  // Bottle Vase
        73159,  // Flower Vase
        120284, // Vase
        83193,  // Vase
        83270,  // Vase
        152973, // Bottle Vase
        127926, // Vase
        84065,  // Vase
        121480, // Amphora
        127835, // Vase
        83711,  // Vase
        83219,  // Vase
        83230   // Vase
    ];

    // Met Museum API base URLs (fallback)
    const MET_SEARCH_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/search';
    const MET_OBJECT_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    /**
     * Build a URL query string from a plain object.
     * @param {Object} params - key/value pairs
     * @returns {string} encoded query string without leading '?'
     */
    function buildQueryString(params) {
        return Object.entries(params)
            .map(function (pair) {
                return encodeURIComponent(pair[0]) + '=' + encodeURIComponent(pair[1]);
            })
            .join('&');
    }

    /**
     * Check whether a title contains any exclusion keyword (case-insensitive).
     * @param {string} title
     * @returns {boolean} true if the title should be excluded
     */
    function shouldExclude(title) {
        if (!title) return false;
        var lower = title.toLowerCase();
        return EXCLUSION_KEYWORDS.some(function (kw) {
            return lower.indexOf(kw) !== -1;
        });
    }

    /**
     * Determine whether an artwork's aspect ratio suggests a tall vessel.
     * Acceptable range: 0.4 < (width / height) < 0.9
     * If dimension data is unavailable the image is accepted by default.
     * @param {Object} artwork - CMA artwork record
     * @returns {boolean}
     */
    function hasAcceptableAspectRatio(artwork) {
        try {
            var w = null;
            var h = null;

            // Try the image metadata first
            if (artwork.images && artwork.images.web) {
                w = artwork.images.web.width;
                h = artwork.images.web.height;
            }

            // Fall back to the dimensions string (e.g. "35.5 x 20 cm")
            if ((!w || !h) && artwork.dimensions) {
                var match = artwork.dimensions.match(/([\d.]+)\s*x\s*([\d.]+)/);
                if (match) {
                    // CMA dimensions are typically height x width
                    h = parseFloat(match[1]);
                    w = parseFloat(match[2]);
                }
            }

            if (w && h && h > 0) {
                var ratio = w / h;
                return ratio > 0.4 && ratio < 0.9;
            }
        } catch (_) {
            // Accept image when dimensions cannot be parsed
        }

        return true;
    }

    /**
     * Normalize a CMA artwork record into the standard vase object shape.
     * @param {Object} artwork - raw CMA API record
     * @returns {Object} normalized vase data
     */
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
     * Fisher-Yates shuffle of an array (in place).
     * @param {Array} arr
     * @returns {Array} the same array, shuffled
     */
    function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    // -----------------------------------------------------------------------
    // Core API functions
    // -----------------------------------------------------------------------

    /**
     * Fetch vases from the Cleveland Museum of Art API.
     * Applies filtering for image availability, aspect ratio, and title keywords.
     *
     * @param {string} [query='vase'] - search query term
     * @returns {Promise<Object[]>} filtered array of normalized vase objects
     */
    async function fetchVases(query) {
        if (query === undefined || query === null) {
            query = 'vase';
        }

        var params = Object.assign({}, DEFAULT_PARAMS, { q: query });
        var url = CMA_BASE + '?' + buildQueryString(params);

        var response = await fetch(url);

        if (!response.ok) {
            throw new Error('CMA API returned status ' + response.status);
        }

        var json = await response.json();

        if (!json.data || !Array.isArray(json.data)) {
            throw new Error('CMA API returned unexpected response structure');
        }

        // Apply all three filters then normalize
        var filtered = json.data.filter(function (artwork) {
            // 1. Must have a web image URL
            if (!artwork.images || !artwork.images.web || !artwork.images.web.url) {
                return false;
            }

            // 2. Title must not contain excluded keywords
            if (shouldExclude(artwork.title)) {
                return false;
            }

            // 3. Aspect ratio should suggest a tall vessel
            if (!hasAcceptableAspectRatio(artwork)) {
                return false;
            }

            return true;
        });

        return filtered.map(normalizeCmaArtwork);
    }

    /**
     * Fetch a single artwork by its CMA ID.
     * @param {number|string} id - CMA artwork ID
     * @returns {Promise<Object|null>} normalized vase object or null on failure
     */
    async function fetchCmaById(id) {
        try {
            var response = await fetch(CMA_BASE + id);
            if (!response.ok) return null;

            var json = await response.json();
            var artwork = json.data;

            if (!artwork) return null;
            if (!artwork.images || !artwork.images.web || !artwork.images.web.url) {
                return null;
            }

            return normalizeCmaArtwork(artwork);
        } catch (_) {
            return null;
        }
    }

    /**
     * Try fetching a random vase from the curated ID list.
     * Shuffles the list and tries IDs one by one until one succeeds.
     * @returns {Promise<Object|null>} vase object or null if all tried IDs fail
     */
    async function fetchFromCuratedList() {
        var ids = shuffle(CURATED_CMA_IDS.slice());

        // Try up to 5 IDs to keep latency reasonable
        var attempts = Math.min(5, ids.length);
        for (var k = 0; k < attempts; k++) {
            var vase = await fetchCmaById(ids[k]);
            if (vase) return vase;
        }

        return null;
    }

    /**
     * Fallback: Fetch a public-domain vase image from the Met Museum API.
     *
     * Steps:
     *   1. GET /search?q=vase&hasImages=true  -> array of objectIDs
     *   2. Shuffle a subset and fetch individual object details
     *   3. Return the first that is public domain and has a primary image
     *
     * @returns {Promise<Object>} vase object in the same normalized shape
     */
    async function fetchFromMet() {
        // Step 1 — search
        var searchUrl = MET_SEARCH_URL + '?q=vase&hasImages=true';
        var searchResponse = await fetch(searchUrl);

        if (!searchResponse.ok) {
            throw new Error('Met Museum search API returned status ' + searchResponse.status);
        }

        var searchJson = await searchResponse.json();

        if (!searchJson.objectIDs || searchJson.objectIDs.length === 0) {
            throw new Error('Met Museum search returned no results');
        }

        // Take a manageable slice and shuffle
        var objectIDs = shuffle(searchJson.objectIDs.slice(0, 80));

        // Step 2 — fetch details until we find a match
        var maxAttempts = Math.min(10, objectIDs.length);

        for (var attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                var detailResponse = await fetch(MET_OBJECT_URL + objectIDs[attempt]);
                if (!detailResponse.ok) continue;

                var obj = await detailResponse.json();

                // Must be public domain with an image
                if (!obj.isPublicDomain) continue;
                if (!obj.primaryImage && !obj.primaryImageSmall) continue;

                // Skip excluded object types
                if (shouldExclude(obj.title)) continue;

                return {
                    id: obj.objectID,
                    title: obj.title || 'Untitled',
                    date: obj.objectDate || 'Date unknown',
                    culture: obj.culture || obj.artistDisplayName || 'Unknown',
                    medium: obj.medium || 'Unknown medium',
                    imageUrl: obj.primaryImage || obj.primaryImageSmall,
                    creditLine: obj.creditLine || '',
                    url: obj.objectURL || ('https://www.metmuseum.org/art/collection/search/' + obj.objectID),
                    source: 'The Metropolitan Museum of Art'
                };
            } catch (_) {
                continue;
            }
        }

        throw new Error('Could not find a suitable public-domain vase from Met Museum');
    }

    // -----------------------------------------------------------------------
    // Public methods
    // -----------------------------------------------------------------------

    /**
     * Get a single random vase using a cascading fallback strategy:
     *   1. CMA API keyword search
     *   2. Curated CMA artwork IDs
     *   3. Met Museum API
     *
     * @returns {Promise<Object>} vase object with id, title, date, culture,
     *   medium, imageUrl, creditLine, url, and source fields
     */
    async function getRandomVase() {
        // Strategy 1 — CMA API search
        try {
            var vases = await fetchVases('vase');
            if (vases.length > 0) {
                return vases[Math.floor(Math.random() * vases.length)];
            }
        } catch (err) {
            console.warn('MuseumApi: CMA search failed:', err.message);
        }

        // Strategy 2 — Curated CMA IDs
        try {
            var curated = await fetchFromCuratedList();
            if (curated) return curated;
        } catch (err) {
            console.warn('MuseumApi: Curated CMA lookup failed:', err.message);
        }

        // Strategy 3 — Metropolitan Museum of Art
        try {
            return await fetchFromMet();
        } catch (err) {
            console.warn('MuseumApi: Met Museum fallback failed:', err.message);
        }

        // All sources exhausted
        throw new Error(
            'MuseumApi: All vase sources exhausted. Check your network connection.'
        );
    }

    /**
     * Load a vase image as an HTMLImageElement.
     * Sets crossOrigin for canvas compatibility and includes a 15-second timeout.
     *
     * @param {Object} vaseData - vase object (must have an imageUrl property)
     * @returns {Promise<HTMLImageElement>} resolves with the fully loaded image
     */
    function getVaseImage(vaseData) {
        return new Promise(function (resolve, reject) {
            if (!vaseData || !vaseData.imageUrl) {
                reject(new Error('No image URL provided'));
                return;
            }

            var img = new Image();
            img.crossOrigin = 'anonymous';

            // Guard against slow / stalled downloads
            var timeoutId = setTimeout(function () {
                img.onload = null;
                img.onerror = null;
                reject(new Error('Image load timed out for: ' + vaseData.imageUrl));
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

    // Expose public API
    return {
        fetchVases: fetchVases,
        getRandomVase: getRandomVase,
        getVaseImage: getVaseImage
    };
})();
