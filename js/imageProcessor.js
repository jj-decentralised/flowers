/**
 * imageProcessor.js — Background Removal & Mouth Detection
 *
 * Handles image processing tasks needed to composite museum vase images
 * cleanly onto the canvas and detect the vase opening for flower placement.
 *
 * Responsibilities:
 *   - Load artwork images via CORS-friendly proxying if needed
 *   - Perform simple background removal (e.g. flood-fill from corners)
 *   - Detect the vase "mouth" — the top opening where flowers emerge
 *   - Return mouth position, width, and angle for the composition engine
 *   - Generate silhouette masks for layering flowers behind the rim
 *
 * Dependencies: Canvas API (no external libraries required)
 */

const ImageProcessor = (function () {

    // -----------------------------------------------------------------------
    //  Internal helpers
    // -----------------------------------------------------------------------

    /**
     * Calculate the Euclidean distance between two RGB colours.
     * Each colour is an object or array of [r, g, b].
     */
    function colorDistance(r1, g1, b1, r2, g2, b2) {
        const dr = r1 - r2;
        const dg = g1 - g2;
        const db = b1 - b2;
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    /**
     * Sample the average RGB colour from several corner regions of an ImageData
     * buffer.  We sample small 5x5 patches from each of the four corners and
     * average the results.  This gives a reliable estimate of the background
     * colour for typical museum photographs where the background extends to
     * every edge.
     */
    function sampleBackgroundColor(data, width, height) {
        const patchSize = 5;
        const patches = [
            { x: 0, y: 0 },                                    // top-left
            { x: width - patchSize, y: 0 },                    // top-right
            { x: 0, y: height - patchSize },                   // bottom-left
            { x: width - patchSize, y: height - patchSize },   // bottom-right
        ];

        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        let count = 0;

        for (const patch of patches) {
            for (let py = patch.y; py < patch.y + patchSize; py++) {
                for (let px = patch.x; px < patch.x + patchSize; px++) {
                    const idx = (py * width + px) * 4;
                    totalR += data[idx];
                    totalG += data[idx + 1];
                    totalB += data[idx + 2];
                    count++;
                }
            }
        }

        return {
            r: Math.round(totalR / count),
            g: Math.round(totalG / count),
            b: Math.round(totalB / count),
        };
    }

    /**
     * Build a binary transparency map from an ImageData buffer:
     *   true  = transparent (background)
     *   false = opaque (foreground)
     *
     * Used by the edge-feathering pass to determine boundary pixels.
     */
    function buildTransparencyMap(data, width, height) {
        const map = new Uint8Array(width * height);
        for (let i = 0; i < width * height; i++) {
            map[i] = data[i * 4 + 3] === 0 ? 1 : 0;
        }
        return map;
    }

    /**
     * Find the minimum distance (in pixels) from each opaque pixel to the
     * nearest transparent pixel, up to a maximum search radius.  This is used
     * for edge feathering so that pixels close to the transparency boundary
     * get a gradually reduced alpha.
     *
     * Uses a simple two-pass (forward + backward) distance-transform approach
     * that is far cheaper than per-pixel flood-fill.
     */
    function computeDistanceToEdge(transparencyMap, width, height, maxRadius) {
        const size = width * height;
        const dist = new Float32Array(size);
        const INF = maxRadius + 1;

        // Initialise: transparent pixels = 0, opaque pixels = INF
        for (let i = 0; i < size; i++) {
            dist[i] = transparencyMap[i] === 1 ? 0 : INF;
        }

        // Forward pass (top-left to bottom-right)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = y * width + x;
                if (dist[i] === 0) continue;
                if (x > 0) dist[i] = Math.min(dist[i], dist[i - 1] + 1);
                if (y > 0) dist[i] = Math.min(dist[i], dist[i - width] + 1);
            }
        }

        // Backward pass (bottom-right to top-left)
        for (let y = height - 1; y >= 0; y--) {
            for (let x = width - 1; x >= 0; x--) {
                const i = y * width + x;
                if (dist[i] === 0) continue;
                if (x < width - 1) dist[i] = Math.min(dist[i], dist[i + 1] + 1);
                if (y < height - 1) dist[i] = Math.min(dist[i], dist[i + width] + 1);
            }
        }

        return dist;
    }

    /**
     * Apply edge feathering to an ImageData buffer in-place.
     * Pixels within `radius` of a transparent boundary get a gradual alpha
     * ramp from 0 (at the boundary) to 255 (at full opacity).
     */
    function applyEdgeFeathering(data, width, height, radius) {
        if (radius <= 0) return;

        const transparencyMap = buildTransparencyMap(data, width, height);
        const distMap = computeDistanceToEdge(transparencyMap, width, height, radius);

        for (let i = 0; i < width * height; i++) {
            // Only adjust opaque pixels that are near the boundary
            if (transparencyMap[i] === 1) continue; // already transparent
            const d = distMap[i];
            if (d < radius) {
                const alpha = Math.round(255 * (d / radius));
                const idx = i * 4 + 3;
                data[idx] = Math.min(data[idx], alpha);
            }
        }
    }

    /**
     * Create an offscreen canvas of given dimensions and optionally draw an
     * image onto it.  Returns { canvas, ctx }.
     */
    function createOffscreenCanvas(width, height, imageElement) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (imageElement) {
            ctx.drawImage(imageElement, 0, 0, width, height);
        }
        return { canvas, ctx };
    }

    /**
     * Safely retrieve ImageData from a canvas context.  If CORS taints the
     * canvas we catch the security error and return null.
     */
    function safeGetImageData(ctx, width, height) {
        try {
            return ctx.getImageData(0, 0, width, height);
        } catch (err) {
            console.warn('ImageProcessor: Unable to read pixel data (CORS).', err);
            return null;
        }
    }

    // -----------------------------------------------------------------------
    //  Public API
    // -----------------------------------------------------------------------

    /**
     * Remove the background from a museum vase photograph.
     *
     * Museum photos typically feature a neutral grey, black, or white
     * backdrop.  The algorithm samples the four corners to estimate that
     * colour, then makes every pixel within `tolerance` Euclidean distance
     * transparent, finishing with an edge-feathering pass for a clean cut-out.
     *
     * @param {HTMLImageElement} imageElement  - The loaded image.
     * @param {number}          [tolerance=30] - RGB distance threshold.
     * @param {number}          [featherRadius=3] - Edge feathering in pixels.
     * @returns {{ dataUrl: string, imageData: ImageData, width: number, height: number } | null}
     *          Processed result, or null on CORS / error.
     */
    function removeBackground(imageElement, tolerance, featherRadius) {
        if (tolerance === undefined || tolerance === null) tolerance = 30;
        if (featherRadius === undefined || featherRadius === null) featherRadius = 3;

        const width = imageElement.naturalWidth || imageElement.width;
        const height = imageElement.naturalHeight || imageElement.height;
        const { canvas, ctx } = createOffscreenCanvas(width, height, imageElement);

        const imageData = safeGetImageData(ctx, width, height);
        if (!imageData) return null;

        const data = imageData.data;
        const bg = sampleBackgroundColor(data, width, height);

        // First pass: make background pixels transparent
        for (let i = 0; i < width * height; i++) {
            const idx = i * 4;
            const dist = colorDistance(
                data[idx], data[idx + 1], data[idx + 2],
                bg.r, bg.g, bg.b
            );
            if (dist < tolerance) {
                data[idx + 3] = 0; // transparent
            }
        }

        // Second pass: edge feathering
        applyEdgeFeathering(data, width, height, featherRadius);

        ctx.putImageData(imageData, 0, 0);

        return {
            dataUrl: canvas.toDataURL('image/png'),
            imageData: imageData,
            width: width,
            height: height,
        };
    }

    /**
     * Detect the "mouth" (opening) of a vase.
     *
     * Scans rows from the top of the image downward looking for the first
     * cluster of non-transparent pixels that spans a significant portion of
     * the width.  To be robust against noise and stray pixels we require
     * several consecutive rows to agree before accepting a rim line.
     *
     * @param {ImageData} imageData - Pixel buffer (must already have
     *                                background removed / transparent bg).
     * @param {number}    width     - Image width in pixels.
     * @param {number}    height    - Image height in pixels.
     * @returns {{ anchorX: number, anchorY: number, mouthWidth: number,
     *             rimY: number, xMin: number, xMax: number }}
     */
    function detectMouth(imageData, width, height) {
        const data = imageData.data;
        const minPixelFraction = 0.05; // row must have >= 5 % opaque pixels
        const requiredConsecutive = 3;  // number of consecutive qualifying rows
        const alphaThreshold = 30;      // pixel counts as opaque if alpha > this

        /**
         * Analyse a single row: return { count, xMin, xMax } of opaque pixels.
         */
        function analyseRow(y) {
            let count = 0;
            let xMin = width;
            let xMax = -1;
            for (let x = 0; x < width; x++) {
                const alpha = data[(y * width + x) * 4 + 3];
                if (alpha > alphaThreshold) {
                    count++;
                    if (x < xMin) xMin = x;
                    if (x > xMax) xMax = x;
                }
            }
            return { count, xMin, xMax };
        }

        // Scan downward, looking for `requiredConsecutive` qualifying rows
        let consecutiveCount = 0;
        let firstQualifyingY = -1;

        for (let y = 0; y < height; y++) {
            const row = analyseRow(y);
            if (row.count >= width * minPixelFraction) {
                if (consecutiveCount === 0) {
                    firstQualifyingY = y;
                }
                consecutiveCount++;
                if (consecutiveCount >= requiredConsecutive) {
                    break;
                }
            } else {
                consecutiveCount = 0;
                firstQualifyingY = -1;
            }
        }

        // If we never found enough consecutive rows, fall back to the first
        // row that had *any* qualifying pixel count.
        if (firstQualifyingY === -1) {
            for (let y = 0; y < height; y++) {
                const row = analyseRow(y);
                if (row.count >= width * minPixelFraction) {
                    firstQualifyingY = y;
                    break;
                }
            }
        }

        // Ultimate fallback: place the mouth at 10 % from the top, full width
        if (firstQualifyingY === -1) {
            const fallbackY = Math.round(height * 0.1);
            return {
                anchorX: Math.round(width / 2),
                anchorY: Math.round(fallbackY + height * 0.05),
                mouthWidth: Math.round(width * 0.5),
                rimY: fallbackY,
                xMin: Math.round(width * 0.25),
                xMax: Math.round(width * 0.75),
            };
        }

        // Average xMin / xMax across a small band of rows starting at the rim
        // for a more stable measurement.
        const bandSize = Math.min(5, height - firstQualifyingY);
        let avgXMin = 0;
        let avgXMax = 0;
        let bandCount = 0;

        for (let y = firstQualifyingY; y < firstQualifyingY + bandSize; y++) {
            const row = analyseRow(y);
            if (row.count >= width * minPixelFraction) {
                avgXMin += row.xMin;
                avgXMax += row.xMax;
                bandCount++;
            }
        }

        if (bandCount === 0) {
            // Should not happen given the logic above, but be safe.
            const row = analyseRow(firstQualifyingY);
            avgXMin = row.xMin;
            avgXMax = row.xMax;
            bandCount = 1;
        }

        const xMin = Math.round(avgXMin / bandCount);
        const xMax = Math.round(avgXMax / bandCount);
        const mouthWidth = xMax - xMin;
        const anchorX = Math.round((xMin + xMax) / 2);
        const anchorY = Math.round(firstQualifyingY + height * 0.05);

        return {
            anchorX: anchorX,
            anchorY: anchorY,
            mouthWidth: mouthWidth,
            rimY: firstQualifyingY,
            xMin: xMin,
            xMax: xMax,
        };
    }

    /**
     * Create a "lip mask" -- the top portion of the vase image that will be
     * placed ABOVE the flower stems in the Z-order so that stems appear to
     * go *into* the vase.
     *
     * @param {HTMLImageElement} imageElement - The *original* (or
     *        background-removed) vase image.
     * @param {number} rimY       - The y-coordinate of the detected rim.
     * @param {number} maskHeight - How many pixels below the rim to include.
     * @returns {string} A data-URL of the lip-mask PNG.
     */
    function createLipMask(imageElement, rimY, maskHeight) {
        const width = imageElement.naturalWidth || imageElement.width;
        const height = imageElement.naturalHeight || imageElement.height;

        if (maskHeight === undefined || maskHeight === null) {
            maskHeight = Math.round(height * 0.08);
        }

        const clipBottom = Math.min(rimY + maskHeight, height);
        const { canvas, ctx } = createOffscreenCanvas(width, height);

        // Draw only the top slice of the image (0 .. clipBottom).
        // We keep the canvas full-size so it aligns perfectly when layered.
        ctx.drawImage(
            imageElement,
            0, 0, width, clipBottom,   // source rectangle
            0, 0, width, clipBottom    // destination rectangle
        );

        return canvas.toDataURL('image/png');
    }

    /**
     * Full pipeline: load a vase image, remove its background, detect the
     * mouth, and create the lip mask.  Returns everything needed by the
     * composition engine.
     *
     * @param {string} imageUrl - URL of the vase photograph.
     * @param {object} [options]
     * @param {number} [options.tolerance=30]       - Background removal tolerance.
     * @param {number} [options.featherRadius=3]    - Edge feathering radius.
     * @param {number} [options.lipMaskHeight]       - Lip mask depth (auto if omitted).
     * @returns {Promise<{ processedImageDataUrl: string,
     *                      lipMaskDataUrl: string,
     *                      mouth: { anchorX: number, anchorY: number, mouthWidth: number,
     *                               rimY: number, xMin: number, xMax: number },
     *                      dimensions: { width: number, height: number } }>}
     */
    async function processVaseImage(imageUrl, options) {
        const opts = options || {};
        const tolerance = opts.tolerance !== undefined ? opts.tolerance : 30;
        const featherRadius = opts.featherRadius !== undefined ? opts.featherRadius : 3;

        // 1. Load image
        const img = await loadImage(imageUrl);
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        // 2. Remove background
        const bgResult = removeBackground(img, tolerance, featherRadius);

        if (!bgResult) {
            // CORS prevented pixel access.  Return the raw image with
            // best-guess mouth coordinates so the rest of the pipeline can
            // still run.
            console.warn(
                'ImageProcessor: CORS blocked pixel access. Using raw image with estimated mouth.'
            );

            const rawDataUrl = (function () {
                const c = document.createElement('canvas');
                c.width = width;
                c.height = height;
                const cx = c.getContext('2d');
                cx.drawImage(img, 0, 0);
                try { return c.toDataURL('image/png'); } catch (_e) { return imageUrl; }
            })();

            return {
                processedImageDataUrl: rawDataUrl,
                lipMaskDataUrl: rawDataUrl,
                mouth: {
                    anchorX: Math.round(width / 2),
                    anchorY: Math.round(height * 0.15),
                    mouthWidth: Math.round(width * 0.5),
                    rimY: Math.round(height * 0.1),
                    xMin: Math.round(width * 0.25),
                    xMax: Math.round(width * 0.75),
                },
                dimensions: { width: width, height: height },
            };
        }

        // 3. Detect mouth
        const mouth = detectMouth(bgResult.imageData, bgResult.width, bgResult.height);

        // 4. Create lip mask.  We draw the processed (background-removed)
        //    image onto a temporary Image so that createLipMask receives an
        //    HTMLImageElement.  For speed we reuse a canvas instead.
        const lipMaskHeight = opts.lipMaskHeight !== undefined
            ? opts.lipMaskHeight
            : Math.round(height * 0.08);

        const lipMaskDataUrl = (function () {
            const c = document.createElement('canvas');
            c.width = width;
            c.height = height;
            const cx = c.getContext('2d');
            cx.putImageData(bgResult.imageData, 0, 0);

            // Clip everything below rimY + lipMaskHeight
            const clipBottom = Math.min(mouth.rimY + lipMaskHeight, height);
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = width;
            maskCanvas.height = height;
            const mctx = maskCanvas.getContext('2d');
            mctx.drawImage(
                c,
                0, 0, width, clipBottom,
                0, 0, width, clipBottom
            );
            return maskCanvas.toDataURL('image/png');
        })();

        return {
            processedImageDataUrl: bgResult.dataUrl,
            lipMaskDataUrl: lipMaskDataUrl,
            mouth: mouth,
            dimensions: { width: width, height: height },
        };
    }

    /**
     * Remove white / cream backgrounds from botanical illustrations such as
     * scans from the Biodiversity Heritage Library (BHL).
     *
     * Works the same way as `removeBackground` but with a higher default
     * tolerance (paper colour varies across the page) and stronger feathering
     * for a natural soft edge.
     *
     * @param {HTMLImageElement} imageElement     - The loaded image.
     * @param {number}          [tolerance=40]    - RGB distance threshold.
     * @param {number}          [featherRadius=5] - Edge feathering radius.
     * @returns {{ dataUrl: string, imageData: ImageData, width: number, height: number } | null}
     */
    function removeFloralBackground(imageElement, tolerance, featherRadius) {
        if (tolerance === undefined || tolerance === null) tolerance = 40;
        if (featherRadius === undefined || featherRadius === null) featherRadius = 5;

        const width = imageElement.naturalWidth || imageElement.width;
        const height = imageElement.naturalHeight || imageElement.height;
        const { canvas, ctx } = createOffscreenCanvas(width, height, imageElement);

        const imageData = safeGetImageData(ctx, width, height);
        if (!imageData) return null;

        const data = imageData.data;
        const bg = sampleBackgroundColor(data, width, height);

        // For botanical scans the background can shift slightly across the
        // page, so we also consider luminance.  If a pixel is both close to
        // the sampled background AND very light (luminance > 200) we treat it
        // as background even if the Euclidean distance is a bit above the
        // tolerance.
        const luminanceThreshold = 200;
        const extendedTolerance = tolerance * 1.4;

        for (let i = 0; i < width * height; i++) {
            const idx = i * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const dist = colorDistance(r, g, b, bg.r, bg.g, bg.b);
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;

            if (dist < tolerance) {
                data[idx + 3] = 0;
            } else if (dist < extendedTolerance && lum > luminanceThreshold) {
                // Gradual fade for near-background bright pixels
                const t = (dist - tolerance) / (extendedTolerance - tolerance);
                data[idx + 3] = Math.round(255 * t);
            }
        }

        // Stronger feathering for a softer edge
        applyEdgeFeathering(data, width, height, featherRadius);

        ctx.putImageData(imageData, 0, 0);

        return {
            dataUrl: canvas.toDataURL('image/png'),
            imageData: imageData,
            width: width,
            height: height,
        };
    }

    /**
     * Load an image from a URL with CORS support.
     *
     * If the initial CORS-enabled load fails we retry without the
     * `crossOrigin` attribute.  The image will be usable for drawing but
     * pixel-level operations (getImageData) will be blocked by the browser.
     *
     * @param {string} url - The image URL.
     * @returns {Promise<HTMLImageElement>}
     */
    function loadImage(url) {
        return new Promise(function (resolve, reject) {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = function () {
                resolve(img);
            };

            img.onerror = function () {
                // Retry without CORS header -- the image can still be drawn
                // to a canvas (just not read back).
                console.warn(
                    'ImageProcessor: CORS load failed for', url,
                    '-- retrying without crossOrigin.'
                );
                const fallback = new Image();
                fallback.onload = function () {
                    resolve(fallback);
                };
                fallback.onerror = function () {
                    reject(new Error('Failed to load image: ' + url));
                };
                fallback.src = url;
            };

            img.src = url;
        });
    }

    // -----------------------------------------------------------------------
    //  Public surface
    // -----------------------------------------------------------------------

    return {
        removeBackground: removeBackground,
        removeFloralBackground: removeFloralBackground,
        detectMouth: detectMouth,
        createLipMask: createLipMask,
        processVaseImage: processVaseImage,
        loadImage: loadImage,
    };

})();
