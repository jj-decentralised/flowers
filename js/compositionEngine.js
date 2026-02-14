/**
 * compositionEngine.js -- Fabric.js Canvas Rendering
 *
 * Takes the arrangement recipe from the symbolism engine and renders the
 * final composition onto the Fabric.js canvas.
 *
 * Responsibilities:
 *   - Initialise and manage the Fabric.js canvas instance
 *   - Place the vase image as the base layer
 *   - Render flower and foliage elements with procedural variation
 *   - Apply colour palettes, opacity, and layering
 *   - Handle arrangement shapes (fan, cascade, dome, ikebana, etc.)
 *   - Support canvas export to PNG for download
 *
 * Dependencies: window.fabric, ImageProcessor (global)
 */

const CompositionEngine = (function () {
    'use strict';

    // -----------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------

    let canvas = null;
    const CANVAS_WIDTH  = 800;
    const CANVAS_HEIGHT = 1000;
    const GOLDEN_ANGLE  = 137.508; // degrees

    // Singapore timezone offset from UTC in hours
    const SG_UTC_OFFSET = 8;

    // -----------------------------------------------------------------
    // Utility helpers
    // -----------------------------------------------------------------

    /**
     * Return a random number in [min, max].
     */
    function rand(min, max) {
        return min + Math.random() * (max - min);
    }

    /**
     * Return a random integer in [min, max] (inclusive).
     */
    function randInt(min, max) {
        return Math.floor(rand(min, max + 1));
    }

    /**
     * Linearly interpolate between two hex colour strings.
     * @param {string} c1 - hex colour like "#FF0000"
     * @param {string} c2 - hex colour like "#0000FF"
     * @param {number} t  - interpolation factor 0..1
     * @returns {string} hex colour
     */
    function lerpColor(c1, c2, t) {
        var r1 = parseInt(c1.slice(1, 3), 16);
        var g1 = parseInt(c1.slice(3, 5), 16);
        var b1 = parseInt(c1.slice(5, 7), 16);
        var r2 = parseInt(c2.slice(1, 3), 16);
        var g2 = parseInt(c2.slice(3, 5), 16);
        var b2 = parseInt(c2.slice(5, 7), 16);
        var r = Math.round(r1 + (r2 - r1) * t);
        var g = Math.round(g1 + (g2 - g1) * t);
        var b = Math.round(b1 + (b2 - b1) * t);
        return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
    }

    /**
     * Clamp a value to [min, max].
     */
    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    /**
     * Desaturate a hex colour toward grey by a given amount (0 = no change, 1 = full grey).
     */
    function desaturate(hex, amount) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        var grey = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        r = Math.round(r + (grey - r) * amount);
        g = Math.round(g + (grey - g) * amount);
        b = Math.round(b + (grey - b) * amount);
        return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
    }

    /**
     * Darken a hex colour by a factor (0 = no change, 1 = black).
     */
    function darken(hex, amount) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        r = Math.round(r * (1 - amount));
        g = Math.round(g * (1 - amount));
        b = Math.round(b * (1 - amount));
        return '#' + ((1 << 24) | (clamp(r, 0, 255) << 16) | (clamp(g, 0, 255) << 8) | clamp(b, 0, 255)).toString(16).slice(1);
    }

    /**
     * Lighten a hex colour by a factor (0 = no change, 1 = white).
     */
    function lighten(hex, amount) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        r = Math.round(r + (255 - r) * amount);
        g = Math.round(g + (255 - g) * amount);
        b = Math.round(b + (255 - b) * amount);
        return '#' + ((1 << 24) | (clamp(r, 0, 255) << 16) | (clamp(g, 0, 255) << 8) | clamp(b, 0, 255)).toString(16).slice(1);
    }

    // -----------------------------------------------------------------
    // Initialisation
    // -----------------------------------------------------------------

    /**
     * Initialise the Fabric.js canvas on the given element ID.
     * @param {string} canvasId - the id of the <canvas> element
     * @returns {fabric.Canvas} the initialised canvas
     */
    function init(canvasId) {
        canvas = new fabric.Canvas(canvasId, {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            selection: false,
            renderOnAddRemove: false, // batch rendering for performance
            preserveObjectStacking: true
        });
        canvas.hoverCursor = 'default';
        console.log('[CompositionEngine] Canvas initialised (' + CANVAS_WIDTH + 'x' + CANVAS_HEIGHT + ')');
        return canvas;
    }

    // -----------------------------------------------------------------
    // LAYER 0: Atmospheric Background
    // -----------------------------------------------------------------

    /**
     * Time-of-day periods mapped to gradient colour stops.
     * Each entry: { startHour, endHour, topColor, bottomColor }
     */
    var TIME_PALETTES = [
        { startHour: 5,  endHour: 7,  topColor: '#FFB6C1', bottomColor: '#D3D3D3', name: 'dawn'      },
        { startHour: 7,  endHour: 11, topColor: '#FFF8DC', bottomColor: '#E0FFFF', name: 'morning'   },
        { startHour: 11, endHour: 14, topColor: '#87CEEB', bottomColor: '#FFFFFF', name: 'noon'      },
        { startHour: 14, endHour: 17, topColor: '#FFD700', bottomColor: '#FFA07A', name: 'afternoon' },
        { startHour: 17, endHour: 19, topColor: '#4B0082', bottomColor: '#FF4500', name: 'dusk'      },
        { startHour: 19, endHour: 29, topColor: '#191970', bottomColor: '#000000', name: 'night'     }
        // Night wraps: 19-24 and 0-5, handled specially below
    ];

    /**
     * Calculate Singapore local time (UTC+8).
     * @param {Date} [dateOverride] - optional Date object; defaults to now
     * @returns {{ hour: number, minute: number, fractionalHour: number }}
     */
    function getSingaporeTime(dateOverride) {
        var now = dateOverride || new Date();
        // Get UTC hours and minutes
        var utcH = now.getUTCHours();
        var utcM = now.getUTCMinutes();
        var sgH  = (utcH + SG_UTC_OFFSET) % 24;
        var sgM  = utcM;
        return {
            hour: sgH,
            minute: sgM,
            fractionalHour: sgH + sgM / 60
        };
    }

    /**
     * Render the atmospheric background gradient reflecting Singapore time of day
     * and the current weather condition.
     *
     * @param {Object} weather - weather data object (from WeatherApi); may be null
     * @param {Date}   [timeOverride] - optional date for testing
     */
    function renderBackground(weather, timeOverride) {
        if (!canvas) {
            console.warn('[CompositionEngine] renderBackground called before init');
            return;
        }

        var sg = getSingaporeTime(timeOverride);
        var h  = sg.fractionalHour;

        // Determine top and bottom colours with smooth interpolation between periods
        var topColor, bottomColor;

        if (h >= 5 && h < 7) {
            // Dawn
            var t = (h - 5) / 2;
            topColor    = lerpColor('#191970', '#FFB6C1', t);
            bottomColor = lerpColor('#000000', '#D3D3D3', t);
        } else if (h >= 7 && h < 11) {
            // Morning
            var t = (h - 7) / 4;
            topColor    = lerpColor('#FFB6C1', '#FFF8DC', t);
            bottomColor = lerpColor('#D3D3D3', '#E0FFFF', t);
        } else if (h >= 11 && h < 14) {
            // Noon
            var t = (h - 11) / 3;
            topColor    = lerpColor('#FFF8DC', '#87CEEB', t);
            bottomColor = lerpColor('#E0FFFF', '#FFFFFF', t);
        } else if (h >= 14 && h < 17) {
            // Afternoon
            var t = (h - 14) / 3;
            topColor    = lerpColor('#87CEEB', '#FFD700', t);
            bottomColor = lerpColor('#FFFFFF', '#FFA07A', t);
        } else if (h >= 17 && h < 19) {
            // Dusk
            var t = (h - 17) / 2;
            topColor    = lerpColor('#FFD700', '#4B0082', t);
            bottomColor = lerpColor('#FFA07A', '#FF4500', t);
        } else if (h >= 19 && h < 21) {
            // Dusk to night transition
            var t = (h - 19) / 2;
            topColor    = lerpColor('#4B0082', '#191970', t);
            bottomColor = lerpColor('#FF4500', '#000000', t);
        } else {
            // Night (21:00 through 05:00)
            topColor    = '#191970';
            bottomColor = '#000000';
            // Pre-dawn hint from 3-5am
            if (h >= 3 && h < 5) {
                var t = (h - 3) / 2;
                topColor    = lerpColor('#191970', '#191970', t);
                bottomColor = lerpColor('#000000', '#1a1a2e', t);
            }
        }

        // Weather adjustments
        var condition = (weather && weather.condition) ? weather.condition : 'Fair';

        if (condition === 'Showers' || condition === 'Thundery') {
            // Desaturate and darken for rain
            topColor    = desaturate(topColor, 0.35);
            bottomColor = desaturate(bottomColor, 0.25);
            topColor    = darken(topColor, 0.15);
            bottomColor = darken(bottomColor, 0.1);
        } else if (condition === 'Hazy') {
            // Mute and warm for haze
            topColor    = desaturate(topColor, 0.3);
            bottomColor = desaturate(bottomColor, 0.2);
            topColor    = lerpColor(topColor, '#C8B89A', 0.2);
            bottomColor = lerpColor(bottomColor, '#D2C4A8', 0.15);
        } else if (condition === 'Cloudy') {
            // Slightly desaturated
            topColor    = desaturate(topColor, 0.2);
            bottomColor = desaturate(bottomColor, 0.15);
        }

        // Create the fabric gradient background rectangle
        var bgRect = new fabric.Rect({
            left: 0,
            top: 0,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            selectable: false,
            evented: false,
            fill: new fabric.Gradient({
                type: 'linear',
                coords: { x1: 0, y1: 0, x2: 0, y2: CANVAS_HEIGHT },
                colorStops: [
                    { offset: 0,    color: topColor },
                    { offset: 0.55, color: lerpColor(topColor, bottomColor, 0.45) },
                    { offset: 1,    color: bottomColor }
                ]
            })
        });

        canvas.add(bgRect);

        // Optional atmospheric particles for certain weather
        if (condition === 'Showers' || condition === 'Thundery') {
            _addRainOverlay();
        } else if (condition === 'Hazy') {
            _addHazeOverlay();
        }

        return { topColor: topColor, bottomColor: bottomColor, period: _getPeriodName(sg.hour) };
    }

    /**
     * Return the period name for a given hour.
     */
    function _getPeriodName(hour) {
        if (hour >= 5  && hour < 7)  return 'dawn';
        if (hour >= 7  && hour < 11) return 'morning';
        if (hour >= 11 && hour < 14) return 'noon';
        if (hour >= 14 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 19) return 'dusk';
        return 'night';
    }

    /**
     * Add subtle translucent vertical streaks to suggest rain.
     */
    function _addRainOverlay() {
        var streakCount = randInt(20, 40);
        for (var i = 0; i < streakCount; i++) {
            var x = rand(0, CANVAS_WIDTH);
            var y = rand(0, CANVAS_HEIGHT * 0.7);
            var length = rand(30, 80);
            var line = new fabric.Line([x, y, x + rand(-5, 5), y + length], {
                stroke: 'rgba(180, 200, 220, 0.15)',
                strokeWidth: rand(0.5, 1.5),
                selectable: false,
                evented: false
            });
            canvas.add(line);
        }
    }

    /**
     * Add a semi-transparent warm overlay to suggest haze.
     */
    function _addHazeOverlay() {
        var haze = new fabric.Rect({
            left: 0,
            top: 0,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            fill: 'rgba(200, 185, 155, 0.12)',
            selectable: false,
            evented: false
        });
        canvas.add(haze);
    }

    // -----------------------------------------------------------------
    // LAYER 1: Vase Placement
    // -----------------------------------------------------------------

    /**
     * Place the processed (background-removed) vase image onto the canvas.
     * The vase is scaled to roughly 60% of the canvas width and positioned
     * at the bottom-centre.
     *
     * @param {string} processedVaseDataUrl - a data-URL or image URL of the processed vase
     * @param {Function} callback - called with (fabricImage, positionData) on success
     */
    function placeVase(processedVaseDataUrl, callback) {
        if (!canvas) {
            console.warn('[CompositionEngine] placeVase called before init');
            if (callback) callback(null, null);
            return;
        }

        if (!processedVaseDataUrl) {
            console.warn('[CompositionEngine] No vase image URL provided -- using fallback vase shape');
            var fallbackVase = _createFallbackVase();
            canvas.add(fallbackVase);
            var posData = {
                centerX: CANVAS_WIDTH / 2,
                topY: fallbackVase.top,
                bottomY: CANVAS_HEIGHT - 20,
                mouthY: fallbackVase.top,
                mouthWidth: 120,
                width: 200,
                height: fallbackVase.height
            };
            if (callback) callback(fallbackVase, posData);
            return;
        }

        fabric.Image.fromURL(processedVaseDataUrl, function (img) {
            if (!img || !img.width) {
                console.warn('[CompositionEngine] Vase image failed to load -- using fallback');
                var fallbackVase = _createFallbackVase();
                canvas.add(fallbackVase);
                var posData = {
                    centerX: CANVAS_WIDTH / 2,
                    topY: fallbackVase.top,
                    bottomY: CANVAS_HEIGHT - 20,
                    mouthY: fallbackVase.top,
                    mouthWidth: 120,
                    width: 200,
                    height: fallbackVase.height
                };
                if (callback) callback(fallbackVase, posData);
                return;
            }

            // Scale vase to ~60% of canvas width
            var targetWidth = CANVAS_WIDTH * 0.6;
            var scaleFactor = targetWidth / img.width;

            // Cap vertical extent to 65% of canvas height
            var maxHeight = CANVAS_HEIGHT * 0.65;
            if (img.height * scaleFactor > maxHeight) {
                scaleFactor = maxHeight / img.height;
            }

            img.scale(scaleFactor);

            // Position at bottom-centre with 20px padding from bottom
            var vaseW = img.width * scaleFactor;
            var vaseH = img.height * scaleFactor;
            img.set({
                left: (CANVAS_WIDTH - vaseW) / 2,
                top: CANVAS_HEIGHT - vaseH - 20,
                selectable: false,
                evented: false,
                originX: 'left',
                originY: 'top'
            });

            canvas.add(img);

            // Compute the anchor (vase mouth) position.
            // The mouth is approximated as the top-centre of the vase, offset ~8% down
            // to account for rims.
            var mouthY  = img.top + vaseH * 0.08;
            var mouthW  = vaseW * 0.45; // mouth is narrower than the widest point

            var positionData = {
                centerX:    CANVAS_WIDTH / 2,
                topY:       img.top,
                bottomY:    img.top + vaseH,
                mouthY:     mouthY,
                mouthWidth: mouthW,
                width:      vaseW,
                height:     vaseH
            };

            if (callback) callback(img, positionData);
        }, { crossOrigin: 'anonymous' });
    }

    /**
     * Create a simple procedural vase shape as a fallback when no museum image
     * is available.
     * @returns {fabric.Group}
     */
    function _createFallbackVase() {
        var vaseW = 200;
        var vaseH = 320;
        var cx = CANVAS_WIDTH / 2;
        var baseY = CANVAS_HEIGHT - 20;

        // Build a classic amphora profile with a bezier path
        var halfW = vaseW / 2;
        var pathStr =
            'M ' + (cx - halfW * 0.35) + ' ' + (baseY - vaseH) +         // top-left of mouth
            ' Q ' + (cx - halfW * 0.5) + ' ' + (baseY - vaseH * 0.85) +  // neck left
            ' ' + (cx - halfW * 0.3) + ' ' + (baseY - vaseH * 0.7) +
            ' Q ' + (cx - halfW * 1.0) + ' ' + (baseY - vaseH * 0.45) +  // belly left
            ' ' + (cx - halfW * 0.45) + ' ' + (baseY - vaseH * 0.08) +   // base left
            ' L ' + (cx + halfW * 0.45) + ' ' + (baseY - vaseH * 0.08) + // base right
            ' Q ' + (cx + halfW * 1.0) + ' ' + (baseY - vaseH * 0.45) +  // belly right
            ' ' + (cx + halfW * 0.3) + ' ' + (baseY - vaseH * 0.7) +
            ' Q ' + (cx + halfW * 0.5) + ' ' + (baseY - vaseH * 0.85) +  // neck right
            ' ' + (cx + halfW * 0.35) + ' ' + (baseY - vaseH) +          // top-right of mouth
            ' Z';

        var vasePath = new fabric.Path(pathStr, {
            fill: new fabric.Gradient({
                type: 'linear',
                coords: { x1: cx - halfW, y1: 0, x2: cx + halfW, y2: 0 },
                colorStops: [
                    { offset: 0,   color: '#8B6F47' },
                    { offset: 0.3, color: '#B8956A' },
                    { offset: 0.7, color: '#C9A878' },
                    { offset: 1,   color: '#8B6F47' }
                ]
            }),
            stroke: '#6B5035',
            strokeWidth: 1.5,
            selectable: false,
            evented: false
        });

        // Lip ellipse
        var lipRx = halfW * 0.38;
        var lipRy = 8;
        var lip = new fabric.Ellipse({
            rx: lipRx,
            ry: lipRy,
            left: cx - lipRx,
            top: baseY - vaseH - lipRy,
            fill: '#A0845C',
            stroke: '#6B5035',
            strokeWidth: 1,
            selectable: false,
            evented: false
        });

        var group = new fabric.Group([vasePath, lip], {
            selectable: false,
            evented: false
        });

        return group;
    }

    // -----------------------------------------------------------------
    // LAYER 2: Shadow Foliage
    // -----------------------------------------------------------------

    /**
     * Render dark, large leaf shapes behind the main bouquet to add depth.
     *
     * @param {number} anchorX - x coordinate of the vase mouth centre
     * @param {number} anchorY - y coordinate of the vase mouth
     * @param {number} [count=4] - number of shadow leaves
     */
    function renderShadowFoliage(anchorX, anchorY, count) {
        count = count || 4;
        count = clamp(count, 2, 7);

        var leaves = [];

        for (var i = 0; i < count; i++) {
            var angle = rand(-Math.PI * 0.8, Math.PI * 0.8); // spread in an arc above vase
            var distance = rand(40, 140);

            var lx = anchorX + Math.cos(angle) * distance * rand(0.8, 1.4);
            var ly = anchorY - Math.abs(Math.sin(angle)) * distance - rand(20, 80);

            var leafW = rand(25, 50);
            var leafH = rand(60, 110);

            // Create a leaf path: pointed ellipse
            var leafAngle = angle * (180 / Math.PI) + rand(-20, 20);

            var leaf = _createLeafShape(lx, ly, leafW, leafH, leafAngle, true);
            leaves.push(leaf);
            canvas.add(leaf);
        }

        return leaves;
    }

    /**
     * Create a single leaf shape (a pointed ellipse via bezier path).
     *
     * @param {number} cx - centre x
     * @param {number} cy - centre y
     * @param {number} w  - width
     * @param {number} h  - height (tip to base)
     * @param {number} rotation - degrees
     * @param {boolean} isShadow - if true, dark/transparent
     * @returns {fabric.Path}
     */
    function _createLeafShape(cx, cy, w, h, rotation, isShadow) {
        // Leaf as a pointed oval path
        var hw = w / 2;
        var hh = h / 2;

        var pathStr =
            'M ' + 0 + ' ' + (-hh) +
            ' C ' + hw + ' ' + (-hh * 0.6) + ' ' + hw + ' ' + (hh * 0.6) + ' ' + 0 + ' ' + hh +
            ' C ' + (-hw) + ' ' + (hh * 0.6) + ' ' + (-hw) + ' ' + (-hh * 0.6) + ' ' + 0 + ' ' + (-hh) +
            ' Z';

        var greenVariant = isShadow
            ? darken('#2F4F2F', rand(0.15, 0.35))
            : lerpColor('#2F4F2F', '#556B2F', rand(0, 1));

        var leaf = new fabric.Path(pathStr, {
            left: cx,
            top: cy,
            originX: 'center',
            originY: 'center',
            fill: greenVariant,
            opacity: isShadow ? rand(0.3, 0.5) : rand(0.7, 0.9),
            angle: rotation,
            selectable: false,
            evented: false
        });

        // Add a centre vein
        var veinStr = 'M 0 ' + (-hh * 0.85) + ' L 0 ' + (hh * 0.85);
        var vein = new fabric.Path(veinStr, {
            left: cx,
            top: cy,
            originX: 'center',
            originY: 'center',
            stroke: isShadow ? 'rgba(0,0,0,0.15)' : 'rgba(20,40,10,0.3)',
            strokeWidth: 0.8,
            fill: '',
            angle: rotation,
            selectable: false,
            evented: false
        });

        canvas.add(vein);
        return leaf;
    }

    // -----------------------------------------------------------------
    // LAYER 3: Stems
    // -----------------------------------------------------------------

    /**
     * Render curved bezier stems from the vase mouth anchor down to each
     * flower position.
     *
     * @param {Array} flowerPositions - array of { x, y, ... } flower positions
     * @param {number} anchorX - vase mouth centre x
     * @param {number} anchorY - vase mouth centre y
     * @returns {Array} array of fabric.Path stem objects
     */
    function renderStems(flowerPositions, anchorX, anchorY) {
        if (!canvas || !flowerPositions || flowerPositions.length === 0) {
            return [];
        }

        var stems = [];
        var stemColors = ['#2F4F2F', '#3B5E3B', '#4A6B3A', '#556B2F', '#4E6B45', '#3D5C3D'];

        for (var i = 0; i < flowerPositions.length; i++) {
            var pos = flowerPositions[i];
            var fx = pos.x;
            var fy = pos.y;

            // Calculate control points for a smooth quadratic bezier
            // The stem starts at the anchor (vase mouth) and curves to the flower
            var dx = fx - anchorX;
            var dy = fy - anchorY;

            // Control point: offset from midpoint to give a natural curve
            var midX = anchorX + dx * 0.5;
            var midY = anchorY + dy * 0.5;

            // Add lateral sway based on the flower's horizontal offset
            var sway = dx * rand(0.15, 0.4);
            var cpX = midX + sway + rand(-15, 15);
            var cpY = midY + rand(-20, 10);

            var pathStr = 'M ' + anchorX + ' ' + anchorY +
                          ' Q ' + cpX + ' ' + cpY + ' ' + fx + ' ' + fy;

            var stemColor = stemColors[i % stemColors.length];
            var strokeW = rand(1.8, 3.5);

            var stem = new fabric.Path(pathStr, {
                stroke: stemColor,
                strokeWidth: strokeW,
                fill: '',
                strokeLineCap: 'round',
                selectable: false,
                evented: false,
                opacity: rand(0.75, 0.95)
            });

            stems.push(stem);
            canvas.add(stem);
        }

        return stems;
    }

    // -----------------------------------------------------------------
    // LAYER 4: Vase Lip Mask
    // -----------------------------------------------------------------

    /**
     * Place a vase lip mask image on top of the stems so stems appear
     * to enter the vase. If no mask image is provided, create a simple
     * elliptical mask in the vase mouth area.
     *
     * @param {string|null} lipMaskDataUrl - data URL of the lip mask image, or null
     * @param {Object} vasePosition - position data from placeVase
     */
    function placeVaseLipMask(lipMaskDataUrl, vasePosition) {
        if (!canvas || !vasePosition) return;

        if (lipMaskDataUrl) {
            fabric.Image.fromURL(lipMaskDataUrl, function (img) {
                if (!img || !img.width) {
                    _createProceduralLipMask(vasePosition);
                    return;
                }
                var maskW = vasePosition.mouthWidth * 1.4;
                var scale = maskW / img.width;
                img.scale(scale);
                img.set({
                    left: vasePosition.centerX - maskW / 2,
                    top: vasePosition.mouthY - (img.height * scale) * 0.3,
                    selectable: false,
                    evented: false,
                    originX: 'left',
                    originY: 'top'
                });
                canvas.add(img);
            }, { crossOrigin: 'anonymous' });
        } else {
            _createProceduralLipMask(vasePosition);
        }
    }

    /**
     * Create a procedural elliptical mask that covers the vase mouth,
     * hiding stem bottoms and creating the illusion of containment.
     */
    function _createProceduralLipMask(vasePosition) {
        var rx = vasePosition.mouthWidth * 0.55;
        var ry = 14;
        var maskEllipse = new fabric.Ellipse({
            rx: rx,
            ry: ry,
            left: vasePosition.centerX,
            top: vasePosition.mouthY,
            originX: 'center',
            originY: 'center',
            fill: new fabric.Gradient({
                type: 'radial',
                coords: { x1: rx, y1: ry, r1: 0, x2: rx, y2: ry, r2: rx },
                colorStops: [
                    { offset: 0,   color: 'rgba(60, 40, 25, 0.9)' },
                    { offset: 0.6, color: 'rgba(80, 55, 35, 0.7)' },
                    { offset: 1,   color: 'rgba(100, 70, 45, 0.3)' }
                ]
            }),
            selectable: false,
            evented: false
        });
        canvas.add(maskEllipse);

        // Add a subtle rim highlight
        var rimHighlight = new fabric.Ellipse({
            rx: rx * 0.95,
            ry: ry * 0.6,
            left: vasePosition.centerX,
            top: vasePosition.mouthY - 2,
            originX: 'center',
            originY: 'center',
            fill: '',
            stroke: 'rgba(200, 180, 150, 0.25)',
            strokeWidth: 1.2,
            selectable: false,
            evented: false
        });
        canvas.add(rimHighlight);
    }

    // -----------------------------------------------------------------
    // LAYER 5 & 6: Flower Distribution (Phyllotaxis)
    // -----------------------------------------------------------------

    /**
     * Distribute flowers using the phyllotaxis spiral (golden angle) pattern.
     * Primary flowers are placed first (inner, larger), accent flowers after
     * (outer, smaller).
     *
     * @param {Object} bouquetRecipe - the arrangement recipe from SymbolismEngine
     *   Expected shape: {
     *     primary:  [{ name, color, colors, role, ... }, ...],
     *     accent:   [{ name, color, colors, role, ... }, ...],
     *     foliage:  [{ name, color, ... }, ...],
     *     totalCount: number,
     *     scaleFactor: number (optional, defaults to 18)
     *   }
     * @param {number} anchorX - vase mouth centre x
     * @param {number} anchorY - vase mouth centre y
     * @param {number} mouthWidth - width of the vase mouth
     * @returns {Array} positions array: [{ x, y, rotation, scale, flowerData, role, index }]
     */
    function distributeFlowers(bouquetRecipe, anchorX, anchorY, mouthWidth) {
        if (!bouquetRecipe) {
            console.warn('[CompositionEngine] No bouquet recipe provided');
            return [];
        }

        var primary  = bouquetRecipe.primary  || [];
        // Merge all accent types from the symbolism engine
        var accent   = [].concat(
            bouquetRecipe.accent        || [],
            bouquetRecipe.loveAccent    || [],
            bouquetRecipe.moonAccent    || [],
            bouquetRecipe.weatherAccent || [],
            bouquetRecipe.paletteAccent || []
        );
        var foliage  = bouquetRecipe.foliage  || [];

        // If the recipe provides a pre-merged allFlowers list, prefer it
        if (bouquetRecipe.allFlowers && bouquetRecipe.allFlowers.length > 0 &&
            primary.length === 0 && accent.length === 0) {
            bouquetRecipe.allFlowers.forEach(function(f) {
                var role = (f.role || '').indexOf('primary') >= 0 ? 'primary' :
                           (f.role || '').indexOf('foliage') >= 0 ? 'foliage' : 'accent';
                if (role === 'primary') primary.push(f);
                else if (role === 'foliage') foliage.push(f);
                else accent.push(f);
            });
        }

        // Build an ordered list: primary first, then accent, then foliage
        var allFlowers = [];

        for (var p = 0; p < primary.length; p++) {
            allFlowers.push({ data: primary[p], role: 'primary' });
        }
        for (var a = 0; a < accent.length; a++) {
            allFlowers.push({ data: accent[a], role: 'accent' });
        }
        for (var f = 0; f < foliage.length; f++) {
            allFlowers.push({ data: foliage[f], role: 'foliage' });
        }

        // If no flowers at all, generate some defaults
        if (allFlowers.length === 0) {
            allFlowers = _generateDefaultBouquet();
        }

        var totalCount = bouquetRecipe.totalBlooms || bouquetRecipe.totalCount || allFlowers.length;
        // Ensure we have enough entries by cycling
        while (allFlowers.length < totalCount) {
            allFlowers.push(allFlowers[allFlowers.length % Math.max(1, primary.length + accent.length + foliage.length)]);
        }
        // Trim to total count
        allFlowers = allFlowers.slice(0, totalCount);

        var scaleFactor = bouquetRecipe.scaleFactor || 18;
        var positions = [];

        for (var n = 0; n < allFlowers.length; n++) {
            var angle  = n * GOLDEN_ANGLE * (Math.PI / 180);
            var radius = scaleFactor * Math.sqrt(n + 1); // +1 to avoid centre overlap

            var x = anchorX + radius * Math.cos(angle);
            var y = anchorY - radius * Math.sin(angle); // negative: flowers go UP

            // Apply jitter for natural irregularity
            x += rand(-15, 15);
            y += rand(-10, 10);

            // Flowers should stay within canvas bounds (with padding)
            x = clamp(x, 40, CANVAS_WIDTH - 40);
            y = clamp(y, 40, anchorY - 10);

            // Scale and rotation depend on role
            var entry = allFlowers[n];
            var baseScale, rotRange;

            if (entry.role === 'primary') {
                baseScale = rand(0.9, 1.3);
                rotRange  = rand(-25, 25);
            } else if (entry.role === 'accent') {
                baseScale = rand(0.6, 1.0);
                rotRange  = rand(-35, 35);
            } else {
                // foliage
                baseScale = rand(0.5, 0.85);
                rotRange  = rand(-45, 45);
            }

            // Flowers further from centre are slightly smaller (depth cue)
            var distFromCenter = Math.sqrt(Math.pow(x - anchorX, 2) + Math.pow(y - anchorY, 2));
            var depthScale = 1 - (distFromCenter / (CANVAS_WIDTH * 0.5)) * 0.25;
            depthScale = clamp(depthScale, 0.55, 1.0);

            positions.push({
                x:          x,
                y:          y,
                rotation:   rotRange,
                scale:      baseScale * depthScale,
                flowerData: entry.data,
                role:       entry.role,
                index:      n
            });
        }

        return positions;
    }

    /**
     * Generate a default bouquet when no recipe is provided.
     * @returns {Array} flower entries with data and role
     */
    function _generateDefaultBouquet() {
        var defaultColors = [
            { name: 'Rose',    colors: ['#E8557A', '#C94060', '#F4A0B0'], color: '#E8557A' },
            { name: 'Peony',   colors: ['#FFB6C1', '#FF69B4', '#FFC0CB'], color: '#FFB6C1' },
            { name: 'Dahlia',  colors: ['#FF6347', '#FF4500', '#FF8C69'], color: '#FF6347' },
            { name: 'Lily',    colors: ['#FFFAF0', '#FFF5EE', '#FAEBD7'], color: '#FFFAF0' },
            { name: 'Orchid',  colors: ['#DA70D6', '#BA55D3', '#DDA0DD'], color: '#DA70D6' }
        ];

        var accentColors = [
            { name: 'Lavender',    colors: ['#B57EDC', '#9370DB', '#D8BFD8'], color: '#B57EDC' },
            { name: 'Baby Breath', colors: ['#FFFFFF', '#FFFAF0', '#F0F8FF'], color: '#FFFFFF' },
            { name: 'Cornflower',  colors: ['#6495ED', '#4169E1', '#87CEEB'], color: '#6495ED' }
        ];

        var flowers = [];
        for (var i = 0; i < defaultColors.length; i++) {
            flowers.push({ data: defaultColors[i], role: 'primary' });
        }
        for (var j = 0; j < accentColors.length; j++) {
            flowers.push({ data: accentColors[j], role: 'accent' });
        }
        // Duplicate some primaries for density
        for (var k = 0; k < 4; k++) {
            flowers.push({ data: defaultColors[k % defaultColors.length], role: 'primary' });
        }
        for (var m = 0; m < 3; m++) {
            flowers.push({ data: accentColors[m % accentColors.length], role: 'accent' });
        }

        return flowers;
    }

    // -----------------------------------------------------------------
    // Flower Rendering
    // -----------------------------------------------------------------

    /**
     * Place flower images (or procedural fallbacks) at calculated positions.
     *
     * @param {Array} positions - from distributeFlowers
     * @param {Object} [flowerImages] - map of flower name to image URL; optional
     * @returns {Promise<Array>} array of fabric objects placed
     */
    async function renderFlowers(positions, flowerImages) {
        if (!canvas || !positions || positions.length === 0) {
            return [];
        }

        flowerImages = flowerImages || {};
        var placed = [];

        for (var i = 0; i < positions.length; i++) {
            var pos = positions[i];
            var flowerObj = null;

            // Try to load a real image first
            var imgUrl = null;
            if (pos.flowerData && pos.flowerData.name && flowerImages[pos.flowerData.name]) {
                imgUrl = flowerImages[pos.flowerData.name];
            } else if (pos.flowerData && pos.flowerData.imageUrl) {
                imgUrl = pos.flowerData.imageUrl;
            }

            if (imgUrl) {
                try {
                    flowerObj = await _loadFlowerImage(imgUrl, pos);
                } catch (err) {
                    console.warn('[CompositionEngine] Image load failed for "' +
                        (pos.flowerData.name || 'unknown') + '": ' + err.message);
                    flowerObj = null;
                }
            }

            // Fallback to procedural flower
            if (!flowerObj) {
                var size = _getFlowerSize(pos.role) * pos.scale;
                flowerObj = createProceduralFlower(
                    _getFlowerColors(pos.flowerData),
                    size
                );
                flowerObj.set({
                    left: pos.x,
                    top: pos.y,
                    originX: 'center',
                    originY: 'center',
                    angle: pos.rotation,
                    selectable: false,
                    evented: false
                });
            }

            canvas.add(flowerObj);
            placed.push(flowerObj);
        }

        return placed;
    }

    /**
     * Load a flower image from a URL and position it.
     * @returns {Promise<fabric.Image>}
     */
    function _loadFlowerImage(url, pos) {
        return new Promise(function (resolve, reject) {
            var timeout = setTimeout(function () {
                reject(new Error('Timeout loading flower image'));
            }, 10000);

            fabric.Image.fromURL(url, function (img) {
                clearTimeout(timeout);

                if (!img || !img.width) {
                    reject(new Error('Image loaded but has no dimensions'));
                    return;
                }

                var targetSize = _getFlowerSize(pos.role) * pos.scale;
                var scaleFactor = targetSize / Math.max(img.width, img.height);

                img.scale(scaleFactor);
                img.set({
                    left: pos.x,
                    top: pos.y,
                    originX: 'center',
                    originY: 'center',
                    angle: pos.rotation,
                    selectable: false,
                    evented: false
                });

                resolve(img);
            }, { crossOrigin: 'anonymous' });
        });
    }

    /**
     * Return the base pixel size for a flower based on its role.
     */
    function _getFlowerSize(role) {
        switch (role) {
            case 'primary': return rand(55, 80);
            case 'accent':  return rand(35, 55);
            case 'foliage': return rand(25, 45);
            default:        return rand(40, 60);
        }
    }

    /**
     * Extract a colour array from flower data.
     */
    function _getFlowerColors(flowerData) {
        if (!flowerData) return ['#E8557A', '#C94060', '#F4A0B0'];
        if (flowerData.colors && flowerData.colors.length > 0) return flowerData.colors;
        if (flowerData.color) return [flowerData.color, lighten(flowerData.color, 0.2), darken(flowerData.color, 0.15)];
        return ['#E8557A', '#C94060', '#F4A0B0'];
    }

    // -----------------------------------------------------------------
    // Procedural Flower Generation
    // -----------------------------------------------------------------

    /**
     * Create a beautiful procedural flower from Fabric.js shapes.
     * Guaranteed fallback that always produces something visually appealing.
     *
     * @param {Array} colors - array of hex colour strings [primary, secondary, accent...]
     * @param {number} size - overall diameter in pixels
     * @returns {fabric.Group}
     */
    function createProceduralFlower(colors, size) {
        if (!colors || colors.length === 0) {
            colors = ['#E8557A', '#C94060', '#F4A0B0'];
        }
        size = size || 60;

        var primaryColor   = colors[0];
        var secondaryColor = colors[1] || lighten(primaryColor, 0.2);
        var accentColor    = colors[2] || darken(primaryColor, 0.15);

        // Choose a random flower type for variety
        var flowerType = randInt(0, 3);
        var parts = [];

        switch (flowerType) {
            case 0:
                parts = _createRoseLike(primaryColor, secondaryColor, accentColor, size);
                break;
            case 1:
                parts = _createDaisyLike(primaryColor, secondaryColor, accentColor, size);
                break;
            case 2:
                parts = _createDahliaLike(primaryColor, secondaryColor, accentColor, size);
                break;
            case 3:
                parts = _createSimpleBlossom(primaryColor, secondaryColor, accentColor, size);
                break;
            default:
                parts = _createRoseLike(primaryColor, secondaryColor, accentColor, size);
        }

        var group = new fabric.Group(parts, {
            selectable: false,
            evented: false
        });

        return group;
    }

    /**
     * Rose-like flower: concentric circles of petals with a spiral feel.
     */
    function _createRoseLike(primary, secondary, accent, size) {
        var parts = [];
        var r = size / 2;

        // Outer layer: 7-9 large petals
        var outerCount = randInt(7, 9);
        for (var i = 0; i < outerCount; i++) {
            var angle = (i / outerCount) * Math.PI * 2 + rand(-0.1, 0.1);
            var px = Math.cos(angle) * r * 0.45;
            var py = Math.sin(angle) * r * 0.45;
            var petalColor = i % 2 === 0 ? primary : secondary;

            var petal = new fabric.Ellipse({
                rx: r * 0.38,
                ry: r * 0.55,
                left: px,
                top: py,
                originX: 'center',
                originY: 'center',
                fill: petalColor,
                opacity: rand(0.8, 0.95),
                angle: angle * (180 / Math.PI) + 90 + rand(-8, 8),
                selectable: false,
                evented: false
            });
            parts.push(petal);
        }

        // Middle layer: 5-6 smaller petals
        var midCount = randInt(5, 6);
        for (var j = 0; j < midCount; j++) {
            var angle = (j / midCount) * Math.PI * 2 + rand(-0.15, 0.15) + 0.3;
            var px = Math.cos(angle) * r * 0.2;
            var py = Math.sin(angle) * r * 0.2;
            var midColor = lerpColor(primary, secondary, rand(0.3, 0.7));

            var midPetal = new fabric.Ellipse({
                rx: r * 0.28,
                ry: r * 0.4,
                left: px,
                top: py,
                originX: 'center',
                originY: 'center',
                fill: midColor,
                opacity: rand(0.85, 1),
                angle: angle * (180 / Math.PI) + 90 + rand(-10, 10),
                selectable: false,
                evented: false
            });
            parts.push(midPetal);
        }

        // Inner swirl: tight cluster of small petals
        var innerCount = randInt(3, 5);
        for (var k = 0; k < innerCount; k++) {
            var angle = (k / innerCount) * Math.PI * 2 + rand(-0.2, 0.2);
            var px = Math.cos(angle) * r * 0.08;
            var py = Math.sin(angle) * r * 0.08;
            var innerColor = lerpColor(secondary, lighten(primary, 0.15), rand(0, 1));

            var innerPetal = new fabric.Ellipse({
                rx: r * 0.18,
                ry: r * 0.28,
                left: px,
                top: py,
                originX: 'center',
                originY: 'center',
                fill: innerColor,
                opacity: rand(0.9, 1),
                angle: angle * (180 / Math.PI) + 90 + rand(-15, 15),
                selectable: false,
                evented: false
            });
            parts.push(innerPetal);
        }

        // Centre dot
        var center = new fabric.Circle({
            radius: r * 0.08,
            left: 0,
            top: 0,
            originX: 'center',
            originY: 'center',
            fill: darken(accent, 0.2),
            selectable: false,
            evented: false
        });
        parts.push(center);

        return parts;
    }

    /**
     * Daisy-like flower: flat ring of elongated petals around a prominent centre.
     */
    function _createDaisyLike(primary, secondary, accent, size) {
        var parts = [];
        var r = size / 2;

        // Petals: long, narrow, arranged radially
        var petalCount = randInt(10, 16);

        for (var i = 0; i < petalCount; i++) {
            var angle = (i / petalCount) * Math.PI * 2;
            var px = Math.cos(angle) * r * 0.35;
            var py = Math.sin(angle) * r * 0.35;

            // Vary petal colour subtly
            var petalColor = lerpColor(primary, secondary, rand(0, 0.3));

            var petal = new fabric.Ellipse({
                rx: r * 0.15,
                ry: r * 0.5,
                left: px,
                top: py,
                originX: 'center',
                originY: 'center',
                fill: petalColor,
                opacity: rand(0.85, 1),
                angle: angle * (180 / Math.PI) + 90,
                selectable: false,
                evented: false
            });
            parts.push(petal);
        }

        // Large centre disc
        var centerOuter = new fabric.Circle({
            radius: r * 0.22,
            left: 0,
            top: 0,
            originX: 'center',
            originY: 'center',
            fill: accent,
            selectable: false,
            evented: false
        });
        parts.push(centerOuter);

        // Inner centre detail
        var centerInner = new fabric.Circle({
            radius: r * 0.12,
            left: 0,
            top: 0,
            originX: 'center',
            originY: 'center',
            fill: darken(accent, 0.25),
            selectable: false,
            evented: false
        });
        parts.push(centerInner);

        // Tiny stamen dots
        var stamenCount = randInt(5, 8);
        for (var s = 0; s < stamenCount; s++) {
            var sa = (s / stamenCount) * Math.PI * 2;
            var sr = r * 0.16;
            var dot = new fabric.Circle({
                radius: rand(1, 2.5),
                left: Math.cos(sa) * sr,
                top: Math.sin(sa) * sr,
                originX: 'center',
                originY: 'center',
                fill: lighten(accent, 0.3),
                selectable: false,
                evented: false
            });
            parts.push(dot);
        }

        return parts;
    }

    /**
     * Dahlia-like flower: many layers of petals getting smaller toward centre.
     */
    function _createDahliaLike(primary, secondary, accent, size) {
        var parts = [];
        var r = size / 2;

        // Three concentric rings of petals
        var layers = [
            { count: randInt(10, 14), radiusFactor: 0.48, petalRx: 0.13, petalRy: 0.35, offset: 0 },
            { count: randInt(8, 12),  radiusFactor: 0.3,  petalRx: 0.11, petalRy: 0.28, offset: 0.15 },
            { count: randInt(6, 9),   radiusFactor: 0.15, petalRx: 0.09, petalRy: 0.2,  offset: 0.3 }
        ];

        for (var L = 0; L < layers.length; L++) {
            var layer = layers[L];
            // Each layer slightly different colour
            var layerColor = lerpColor(primary, secondary, L * 0.25);

            for (var i = 0; i < layer.count; i++) {
                var angle = (i / layer.count) * Math.PI * 2 + layer.offset;
                var px = Math.cos(angle) * r * layer.radiusFactor;
                var py = Math.sin(angle) * r * layer.radiusFactor;

                var petalColor = lerpColor(layerColor, lighten(layerColor, 0.1), rand(0, 0.3));

                var petal = new fabric.Ellipse({
                    rx: r * layer.petalRx,
                    ry: r * layer.petalRy,
                    left: px,
                    top: py,
                    originX: 'center',
                    originY: 'center',
                    fill: petalColor,
                    opacity: rand(0.85, 1),
                    angle: angle * (180 / Math.PI) + 90 + rand(-5, 5),
                    selectable: false,
                    evented: false
                });
                parts.push(petal);
            }
        }

        // Centre
        var center = new fabric.Circle({
            radius: r * 0.1,
            left: 0,
            top: 0,
            originX: 'center',
            originY: 'center',
            fill: darken(accent, 0.15),
            selectable: false,
            evented: false
        });
        parts.push(center);

        return parts;
    }

    /**
     * Simple blossom: 5 wide petals (cherry-blossom style).
     */
    function _createSimpleBlossom(primary, secondary, accent, size) {
        var parts = [];
        var r = size / 2;
        var petalCount = 5;

        // Outer glow for softness
        var glow = new fabric.Circle({
            radius: r * 0.65,
            left: 0,
            top: 0,
            originX: 'center',
            originY: 'center',
            fill: lighten(primary, 0.35),
            opacity: 0.2,
            selectable: false,
            evented: false
        });
        parts.push(glow);

        for (var i = 0; i < petalCount; i++) {
            var angle = (i / petalCount) * Math.PI * 2 - Math.PI / 2; // start from top
            var px = Math.cos(angle) * r * 0.3;
            var py = Math.sin(angle) * r * 0.3;

            var petalColor = lerpColor(primary, secondary, rand(0, 0.35));

            // Heart-shaped petal: two overlapping ellipses
            var lobe1Angle = angle - 0.18;
            var lobe2Angle = angle + 0.18;

            var lobe1 = new fabric.Ellipse({
                rx: r * 0.26,
                ry: r * 0.42,
                left: px + Math.cos(lobe1Angle) * r * 0.06,
                top: py + Math.sin(lobe1Angle) * r * 0.06,
                originX: 'center',
                originY: 'center',
                fill: petalColor,
                opacity: rand(0.85, 0.95),
                angle: angle * (180 / Math.PI) + 90 + rand(-3, 3),
                selectable: false,
                evented: false
            });

            var lobe2 = new fabric.Ellipse({
                rx: r * 0.26,
                ry: r * 0.42,
                left: px + Math.cos(lobe2Angle) * r * 0.06,
                top: py + Math.sin(lobe2Angle) * r * 0.06,
                originX: 'center',
                originY: 'center',
                fill: petalColor,
                opacity: rand(0.85, 0.95),
                angle: angle * (180 / Math.PI) + 90 + rand(-3, 3),
                selectable: false,
                evented: false
            });

            parts.push(lobe1);
            parts.push(lobe2);
        }

        // Centre cluster of stamens
        var centerDisc = new fabric.Circle({
            radius: r * 0.15,
            left: 0,
            top: 0,
            originX: 'center',
            originY: 'center',
            fill: accent,
            selectable: false,
            evented: false
        });
        parts.push(centerDisc);

        // Stamen dots radiating from centre
        var stamenCount = randInt(6, 10);
        for (var s = 0; s < stamenCount; s++) {
            var sa = (s / stamenCount) * Math.PI * 2 + rand(-0.1, 0.1);
            var sd = r * rand(0.06, 0.14);
            var dot = new fabric.Circle({
                radius: rand(1.2, 2.5),
                left: Math.cos(sa) * sd,
                top: Math.sin(sa) * sd,
                originX: 'center',
                originY: 'center',
                fill: lighten(accent, rand(0.15, 0.4)),
                selectable: false,
                evented: false
            });
            parts.push(dot);
        }

        return parts;
    }

    // -----------------------------------------------------------------
    // Fallback Flower (coloured circle sprite)
    // -----------------------------------------------------------------

    /**
     * Generate a coloured circle "sprite" as a minimal fallback flower.
     *
     * @param {Object} flowerData - flower entry with colour info
     * @param {number} size - diameter in pixels
     * @returns {fabric.Group}
     */
    function createFallbackFlower(flowerData, size) {
        size = size || 50;
        var colors = _getFlowerColors(flowerData);
        var primary = colors[0];

        var parts = [];

        // Outer halo
        var halo = new fabric.Circle({
            radius: size * 0.52,
            left: 0,
            top: 0,
            originX: 'center',
            originY: 'center',
            fill: lighten(primary, 0.3),
            opacity: 0.35,
            selectable: false,
            evented: false
        });
        parts.push(halo);

        // Main body
        var body = new fabric.Circle({
            radius: size * 0.42,
            left: 0,
            top: 0,
            originX: 'center',
            originY: 'center',
            fill: primary,
            opacity: 0.9,
            selectable: false,
            evented: false
        });
        parts.push(body);

        // Inner highlight
        var highlight = new fabric.Circle({
            radius: size * 0.2,
            left: -size * 0.05,
            top: -size * 0.08,
            originX: 'center',
            originY: 'center',
            fill: lighten(primary, 0.4),
            opacity: 0.4,
            selectable: false,
            evented: false
        });
        parts.push(highlight);

        // Centre dot
        var center = new fabric.Circle({
            radius: size * 0.1,
            left: 0,
            top: 0,
            originX: 'center',
            originY: 'center',
            fill: darken(primary, 0.3),
            opacity: 0.8,
            selectable: false,
            evented: false
        });
        parts.push(center);

        return new fabric.Group(parts, {
            selectable: false,
            evented: false
        });
    }

    // -----------------------------------------------------------------
    // Decorative Foliage (small leaves interspersed)
    // -----------------------------------------------------------------

    /**
     * Add small decorative leaves among the flowers for a fuller arrangement.
     *
     * @param {Array} flowerPositions - distributed flower positions
     * @param {number} anchorX - vase mouth x
     * @param {number} anchorY - vase mouth y
     * @param {number} [count] - how many small leaves to add
     */
    function _addDecorativeFoliage(flowerPositions, anchorX, anchorY, count) {
        count = count || Math.max(3, Math.floor(flowerPositions.length * 0.4));
        count = clamp(count, 2, 15);

        for (var i = 0; i < count; i++) {
            // Place leaves in gaps between flowers
            var angle = rand(0, Math.PI * 2);
            var dist  = rand(30, 160);
            var lx = anchorX + Math.cos(angle) * dist + rand(-20, 20);
            var ly = anchorY - Math.abs(Math.sin(angle)) * dist - rand(10, 60);

            ly = clamp(ly, 30, anchorY - 5);
            lx = clamp(lx, 30, CANVAS_WIDTH - 30);

            var leafW = rand(10, 25);
            var leafH = rand(25, 55);
            var leafAngle = angle * (180 / Math.PI) + rand(-30, 30);

            _createLeafShape(lx, ly, leafW, leafH, leafAngle, false);
        }
    }

    // -----------------------------------------------------------------
    // Vintage / Unifying Filter
    // -----------------------------------------------------------------

    /**
     * Apply a subtle warm vintage tone over the entire composition.
     * Creates a translucent overlay that unifies all the visual elements.
     */
    function applyVintageFilter() {
        if (!canvas) return;

        // Warm sepia overlay
        var warmOverlay = new fabric.Rect({
            left: 0,
            top: 0,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            fill: 'rgba(255, 240, 210, 0.06)',
            selectable: false,
            evented: false
        });
        canvas.add(warmOverlay);

        // Subtle vignette: dark edges
        var vignetteSize = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT);
        var vignette = new fabric.Rect({
            left: 0,
            top: 0,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            selectable: false,
            evented: false,
            fill: new fabric.Gradient({
                type: 'radial',
                coords: {
                    x1: CANVAS_WIDTH / 2,
                    y1: CANVAS_HEIGHT / 2,
                    r1: vignetteSize * 0.2,
                    x2: CANVAS_WIDTH / 2,
                    y2: CANVAS_HEIGHT / 2,
                    r2: vignetteSize * 0.65
                },
                colorStops: [
                    { offset: 0,   color: 'rgba(0, 0, 0, 0)' },
                    { offset: 0.7, color: 'rgba(0, 0, 0, 0)' },
                    { offset: 1,   color: 'rgba(0, 0, 0, 0.18)' }
                ]
            })
        });
        canvas.add(vignette);

        // Very subtle paper grain noise overlay (tiny dots)
        _addGrainOverlay();
    }

    /**
     * Add a very faint grain texture with a sparse scattering of tiny dots.
     */
    function _addGrainOverlay() {
        var grainCount = 120;
        for (var i = 0; i < grainCount; i++) {
            var gx = rand(0, CANVAS_WIDTH);
            var gy = rand(0, CANVAS_HEIGHT);
            var dot = new fabric.Circle({
                radius: rand(0.3, 1.2),
                left: gx,
                top: gy,
                fill: Math.random() > 0.5
                    ? 'rgba(255, 255, 240, ' + rand(0.02, 0.06) + ')'
                    : 'rgba(0, 0, 0, ' + rand(0.02, 0.05) + ')',
                selectable: false,
                evented: false
            });
            canvas.add(dot);
        }
    }

    // -----------------------------------------------------------------
    // Main Composition Orchestrator
    // -----------------------------------------------------------------

    /**
     * Compose the full "living still life" from all data sources.
     *
     * @param {Object} vaseData - object with at minimum:
     *   { imageUrl: string, processedDataUrl: string (optional), lipMaskDataUrl: string (optional),
     *     title: string, culture: string, ... }
     * @param {Object} bouquetRecipe - arrangement recipe from SymbolismEngine:
     *   { primary: [...], accent: [...], foliage: [...], totalCount: number, scaleFactor: number }
     * @param {Object} weather - weather data from WeatherApi
     * @param {Object} [flowerImages] - optional map of flower name to image URL
     * @returns {Promise<Object>} composition metadata
     */
    async function compose(vaseData, bouquetRecipe, weather, flowerImages) {
        if (!canvas) {
            console.error('[CompositionEngine] Canvas not initialised -- call init() first');
            return null;
        }

        // Clear the canvas completely
        canvas.clear();
        canvas.backgroundColor = '#000000';

        console.log('[CompositionEngine] Beginning composition...');

        // ----------------------------------------------------------
        // LAYER 0: Atmospheric Background
        // ----------------------------------------------------------
        var bgInfo = renderBackground(weather);
        console.log('[CompositionEngine] Background rendered (' + (bgInfo ? bgInfo.period : 'unknown') + ')');

        // ----------------------------------------------------------
        // LAYER 1: Place the Vase
        // ----------------------------------------------------------
        var vaseImageUrl = null;
        if (vaseData) {
            vaseImageUrl = vaseData.processedImageDataUrl || vaseData.processedDataUrl || vaseData.imageUrl || null;
        }

        var vasePosition = await new Promise(function (resolve) {
            placeVase(vaseImageUrl, function (fabricImg, posData) {
                if (posData) {
                    resolve(posData);
                } else {
                    // Provide a sensible default position
                    resolve({
                        centerX:    CANVAS_WIDTH / 2,
                        topY:       CANVAS_HEIGHT * 0.4,
                        bottomY:    CANVAS_HEIGHT - 20,
                        mouthY:     CANVAS_HEIGHT * 0.4,
                        mouthWidth: 150,
                        width:      CANVAS_WIDTH * 0.5,
                        height:     CANVAS_HEIGHT * 0.55
                    });
                }
            });
        });

        var anchorX = vasePosition.centerX;
        var anchorY = vasePosition.mouthY;
        var mouthWidth = vasePosition.mouthWidth;

        console.log('[CompositionEngine] Vase placed at (' + anchorX + ', ' + anchorY + '), mouth width: ' + Math.round(mouthWidth));

        // ----------------------------------------------------------
        // LAYER 2: Shadow Foliage (behind the bouquet)
        // ----------------------------------------------------------
        var shadowCount = randInt(3, 5);
        renderShadowFoliage(anchorX, anchorY, shadowCount);

        // ----------------------------------------------------------
        // Calculate flower positions via phyllotaxis
        // ----------------------------------------------------------
        var positions = distributeFlowers(bouquetRecipe, anchorX, anchorY, mouthWidth);

        // ----------------------------------------------------------
        // LAYER 3: Stems (from vase mouth to each flower)
        // ----------------------------------------------------------
        renderStems(positions, anchorX, anchorY);

        // ----------------------------------------------------------
        // LAYER 4: Vase Lip Mask (stems disappear into vase)
        // ----------------------------------------------------------
        var lipMaskUrl = (vaseData && vaseData.lipMaskDataUrl) ? vaseData.lipMaskDataUrl : null;
        placeVaseLipMask(lipMaskUrl, vasePosition);

        // ----------------------------------------------------------
        // Add some small decorative foliage among the flower area
        // ----------------------------------------------------------
        _addDecorativeFoliage(positions, anchorX, anchorY);

        // ----------------------------------------------------------
        // LAYERS 5 & 6: Render Flowers (primary + accent + foliage)
        // ----------------------------------------------------------
        var placedFlowers = await renderFlowers(positions, flowerImages);
        console.log('[CompositionEngine] Placed ' + placedFlowers.length + ' flowers');

        // ----------------------------------------------------------
        // LAYER 7: Vintage / Unifying Filter
        // ----------------------------------------------------------
        applyVintageFilter();

        // ----------------------------------------------------------
        // Final render
        // ----------------------------------------------------------
        canvas.renderAll();
        console.log('[CompositionEngine] Composition complete (' + canvas.getObjects().length + ' objects)');

        // Return metadata about the composition
        return {
            canvasWidth:  CANVAS_WIDTH,
            canvasHeight: CANVAS_HEIGHT,
            background:   bgInfo,
            vasePosition: vasePosition,
            flowerCount:  placedFlowers.length,
            positions:    positions,
            objectCount:  canvas.getObjects().length,
            timestamp:    new Date().toISOString()
        };
    }

    // -----------------------------------------------------------------
    // Export
    // -----------------------------------------------------------------

    /**
     * Export the current canvas as a PNG data URL.
     * @param {Object} [options] - override format or quality
     * @returns {string} data URL of the rendered image
     */
    function exportAsImage(options) {
        if (!canvas) {
            console.warn('[CompositionEngine] Cannot export -- canvas not initialised');
            return '';
        }
        var defaults = { format: 'png', quality: 1.0, multiplier: 1 };
        var opts = Object.assign({}, defaults, options || {});
        return canvas.toDataURL(opts);
    }

    /**
     * Get the underlying Fabric.js canvas instance.
     * @returns {fabric.Canvas|null}
     */
    function getCanvas() {
        return canvas;
    }

    // -----------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------

    return {
        init:                  init,
        compose:               compose,
        renderBackground:      renderBackground,
        placeVase:             placeVase,
        renderShadowFoliage:   renderShadowFoliage,
        renderStems:           renderStems,
        placeVaseLipMask:      placeVaseLipMask,
        distributeFlowers:     distributeFlowers,
        renderFlowers:         renderFlowers,
        applyVintageFilter:    applyVintageFilter,
        createProceduralFlower: createProceduralFlower,
        createFallbackFlower:  createFallbackFlower,
        exportAsImage:         exportAsImage,
        getCanvas:             getCanvas,
        CANVAS_WIDTH:          CANVAS_WIDTH,
        CANVAS_HEIGHT:         CANVAS_HEIGHT
    };
})();
