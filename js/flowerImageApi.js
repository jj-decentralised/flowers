/**
 * FlowerImageApi Module
 *
 * Provides real flower photographs by searching the Wikimedia Commons API.
 * Maps common flower names to optimized search queries using scientific names
 * and returns thumbnail image URLs.
 *
 * Uses the Wikimedia Commons API with CORS support (origin=* parameter).
 */
const FlowerImageApi = (function () {
  // ── Constants ──────────────────────────────────────────────────────────

  const API_ENDPOINT = 'https://commons.wikimedia.org/w/api.php';
  const THUMBNAIL_WIDTH = 400;
  const REQUEST_TIMEOUT_MS = 6000;
  const MAX_CONCURRENT_REQUESTS = 4;
  const MIN_IMAGE_WIDTH = 200;
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];

  // ── Search Query Map ───────────────────────────────────────────────────

  const FLOWER_SEARCH_MAP = {
    'Rose': 'Rosa flower close-up',
    'Sunflower': 'Helianthus annuus flower',
    'Orchid': 'Orchidaceae flower photograph',
    'Lavender': 'Lavandula flower field',
    'Tulip': 'Tulipa flower',
    'Chrysanthemum': 'Chrysanthemum flower',
    'Poppy': 'Papaver flower red',
    'Water Lily': 'Nymphaea flower',
    'Jasmine': 'Jasminum flower white',
    'Hibiscus': 'Hibiscus rosa-sinensis flower',
    'Carnation': 'Dianthus caryophyllus flower',
    'Dahlia': 'Dahlia flower close',
    'Honeysuckle': 'Lonicera flower',
    'Bluebell': 'Hyacinthoides flower',
    'Geranium': 'Pelargonium flower',
    'Pansy': 'Viola tricolor pansy',
    'Iris': 'Iris flower purple',
    'Hydrangea': 'Hydrangea macrophylla flower',
    'Peony': 'Paeonia flower pink',
    'Gardenia': 'Gardenia jasminoides flower',
    'Lily': 'Lilium flower',
    'Aster': 'Aster flower purple',
    'Marigold': 'Tagetes flower',
    'Camellia': 'Camellia japonica flower',
    'Frangipani': 'Plumeria flower',
    'Bird of Paradise': 'Strelitzia reginae flower',
    'Heliconia': 'Heliconia flower tropical',
    'Bougainvillea': 'Bougainvillea flower',
    'Narcissus': 'Narcissus flower daffodil',
    // foliage
    'Eucalyptus': 'Eucalyptus leaves green',
    'Fern': 'Polypodiopsida fern green',
    'Ivy': 'Hedera helix ivy leaves'
  };

  // ── In-Memory Cache ────────────────────────────────────────────────────

  const imageCache = {};

  // ── Private Helpers ────────────────────────────────────────────────────

  /**
   * Builds the full Wikimedia Commons API URL for a given search query.
   *
   * @param {string} query - The search string to send to the API.
   * @returns {string} The fully-encoded API URL.
   */
  function buildApiUrl(query) {
    var params = [
      'action=query',
      'generator=search',
      'gsrsearch=' + encodeURIComponent(query),
      'gsrnamespace=6',
      'prop=imageinfo',
      'iiprop=url|size|mime',
      'iiurlwidth=' + THUMBNAIL_WIDTH,
      'format=json',
      'origin=*'
    ];
    return API_ENDPOINT + '?' + params.join('&');
  }

  /**
   * Fetches JSON from a URL with an AbortController-based timeout.
   * Falls back to a simple fetch without abort support for older browsers.
   *
   * @param {string} url - The URL to fetch.
   * @returns {Promise<Object|null>} Parsed JSON or null on failure.
   */
  function fetchWithTimeout(url) {
    var controller;
    var signal;
    var timeoutId;

    if (typeof AbortController !== 'undefined') {
      controller = new AbortController();
      signal = controller.signal;
      timeoutId = setTimeout(function () {
        controller.abort();
      }, REQUEST_TIMEOUT_MS);
    }

    var fetchOptions = {};
    if (signal) {
      fetchOptions.signal = signal;
    }

    return fetch(url, fetchOptions)
      .then(function (response) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (!response.ok) {
          throw new Error('HTTP error: ' + response.status);
        }
        return response.json();
      })
      .catch(function (error) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (error.name === 'AbortError') {
          console.warn('[FlowerImageApi] Request timed out for URL:', url);
        } else {
          console.warn('[FlowerImageApi] Fetch error:', error.message);
        }
        return null;
      });
  }

  /**
   * Determines how well a page title matches the desired flower content.
   * Higher scores indicate better matches. Prefers titles containing
   * "flower" or parts of the scientific search query.
   *
   * @param {string} title - The page title from Wikimedia Commons.
   * @param {string} searchQuery - The original search query used.
   * @returns {number} A relevance score (higher is better).
   */
  function titleRelevanceScore(title, searchQuery) {
    var score = 0;
    var lowerTitle = title.toLowerCase();
    var queryWords = searchQuery.toLowerCase().split(/\s+/);

    if (lowerTitle.indexOf('flower') !== -1) {
      score += 10;
    }

    for (var i = 0; i < queryWords.length; i++) {
      if (lowerTitle.indexOf(queryWords[i]) !== -1) {
        score += 3;
      }
    }

    return score;
  }

  /**
   * Computes how close an image's dimensions are to the ideal 400x400
   * square. Lower values indicate a closer match.
   *
   * @param {Object} imageInfo - The imageinfo object from the API.
   * @returns {number} Distance from the ideal dimensions.
   */
  function dimensionDistance(imageInfo) {
    var width = imageInfo.width || 0;
    var height = imageInfo.height || 0;
    return Math.abs(width - THUMBNAIL_WIDTH) + Math.abs(height - THUMBNAIL_WIDTH);
  }

  /**
   * Selects the best image from a set of Wikimedia Commons API page results.
   *
   * Filtering rules:
   *   - MIME type must be image/jpeg or image/png (no SVG).
   *   - Original image width must be at least 200px.
   *
   * Ranking strategy:
   *   - Prefer pages whose titles contain "flower" or the scientific name.
   *   - Among equally relevant pages, prefer the one whose dimensions are
   *     closest to 400x400.
   *
   * @param {Object} pages - The query.pages object from the API response.
   * @param {string} searchQuery - The search query that was used.
   * @returns {string|null} The best thumbnail URL or null if nothing qualifies.
   */
  function selectBestImage(pages, searchQuery) {
    var candidates = [];
    var pageIds = Object.keys(pages);

    for (var i = 0; i < pageIds.length; i++) {
      var page = pages[pageIds[i]];

      if (!page.imageinfo || page.imageinfo.length === 0) {
        continue;
      }

      var info = page.imageinfo[0];

      // Filter: must be JPEG or PNG
      if (ALLOWED_MIME_TYPES.indexOf(info.mime) === -1) {
        continue;
      }

      // Filter: must be at least MIN_IMAGE_WIDTH pixels wide
      if (info.width < MIN_IMAGE_WIDTH) {
        continue;
      }

      candidates.push({
        title: page.title || '',
        thumburl: info.thumburl,
        width: info.width,
        height: info.height,
        mime: info.mime,
        relevance: titleRelevanceScore(page.title || '', searchQuery),
        distance: dimensionDistance(info)
      });
    }

    if (candidates.length === 0) {
      return null;
    }

    // Sort: higher relevance first; on tie, smaller dimension distance first
    candidates.sort(function (a, b) {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }
      return a.distance - b.distance;
    });

    return candidates[0].thumburl;
  }

  /**
   * Resolves a flower name to the search query string that should be sent
   * to the Wikimedia Commons API.
   *
   * Performs a case-insensitive lookup against FLOWER_SEARCH_MAP. If no
   * mapping exists, falls back to "<flowerName> flower photograph".
   *
   * @param {string} flowerName - The common name of the flower.
   * @returns {string} The search query to use.
   */
  function resolveSearchQuery(flowerName) {
    // Try exact key match first
    if (FLOWER_SEARCH_MAP[flowerName]) {
      return FLOWER_SEARCH_MAP[flowerName];
    }

    // Try case-insensitive match
    var lowerName = flowerName.toLowerCase();
    var keys = Object.keys(FLOWER_SEARCH_MAP);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].toLowerCase() === lowerName) {
        return FLOWER_SEARCH_MAP[keys[i]];
      }
    }

    // Fallback: use the flower name directly with a generic suffix
    return flowerName + ' flower photograph';
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * Fetches a single flower image URL from Wikimedia Commons.
   *
   * Looks up the flower name in FLOWER_SEARCH_MAP, queries the Commons
   * API, filters and ranks the results, and returns the best thumbnail
   * URL at 400px width.
   *
   * Results are cached in memory so repeated calls for the same flower
   * name will not trigger additional network requests.
   *
   * @param {string} flowerName - The common name of the flower (e.g. "Rose").
   * @returns {Promise<string|null>} The thumbnail image URL, or null on failure.
   */
  function getFlowerImage(flowerName) {
    if (!flowerName || typeof flowerName !== 'string') {
      console.warn('[FlowerImageApi] Invalid flower name provided.');
      return Promise.resolve(null);
    }

    var trimmedName = flowerName.trim();

    // Return cached result if available
    if (imageCache[trimmedName] !== undefined) {
      return Promise.resolve(imageCache[trimmedName]);
    }

    var searchQuery = resolveSearchQuery(trimmedName);
    var url = buildApiUrl(searchQuery);

    return fetchWithTimeout(url)
      .then(function (data) {
        if (!data || !data.query || !data.query.pages) {
          console.warn('[FlowerImageApi] No results found for:', trimmedName);
          imageCache[trimmedName] = null;
          return null;
        }

        var imageUrl = selectBestImage(data.query.pages, searchQuery);

        // Cache the result (even if null, to avoid re-fetching failures)
        imageCache[trimmedName] = imageUrl;

        if (!imageUrl) {
          console.warn('[FlowerImageApi] No suitable image found for:', trimmedName);
        }

        return imageUrl;
      })
      .catch(function (error) {
        console.warn('[FlowerImageApi] Error fetching image for', trimmedName, ':', error.message);
        imageCache[trimmedName] = null;
        return null;
      });
  }

  /**
   * Fetches images for multiple flower names in parallel with a
   * concurrency limit of 4 simultaneous requests.
   *
   * @param {string[]} flowerNames - An array of common flower names.
   * @returns {Promise<Object>} An object mapping each flower name to its
   *   image URL (or null if the image could not be found).
   */
  function getMultipleFlowerImages(flowerNames) {
    if (!Array.isArray(flowerNames) || flowerNames.length === 0) {
      return Promise.resolve({});
    }

    var results = {};
    var queue = flowerNames.slice();
    var activeCount = 0;
    var index = 0;

    return new Promise(function (resolve) {
      function processNext() {
        // If we have processed everything and nothing is in-flight, we're done
        if (index >= queue.length && activeCount === 0) {
          resolve(results);
          return;
        }

        // Launch as many concurrent requests as the limit allows
        while (index < queue.length && activeCount < MAX_CONCURRENT_REQUESTS) {
          (function (currentName) {
            activeCount++;
            getFlowerImage(currentName)
              .then(function (url) {
                results[currentName] = url;
              })
              .catch(function () {
                results[currentName] = null;
              })
              .then(function () {
                activeCount--;
                processNext();
              });
          })(queue[index]);
          index++;
        }
      }

      processNext();
    });
  }

  /**
   * Clears the in-memory image cache so that subsequent calls to
   * getFlowerImage will make fresh API requests.
   */
  function clearCache() {
    var keys = Object.keys(imageCache);
    for (var i = 0; i < keys.length; i++) {
      delete imageCache[keys[i]];
    }
  }

  // ── Exposed Interface ──────────────────────────────────────────────────

  return {
    getFlowerImage: getFlowerImage,
    getMultipleFlowerImages: getMultipleFlowerImages,
    clearCache: clearCache
  };
})();
