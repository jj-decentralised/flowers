/**
 * compositionEngine.js — SVG Flower Composition
 *
 * Composites SVG-generated flower illustrations with museum vase
 * photographs using HTML/CSS positioning.
 *
 * Layer architecture (bottom to top):
 *   z-index  5  — Vase photo (raw museum image, no processing)
 *   z-index  8  — Foliage SVGs
 *   z-index 15-35 — Flower SVGs (transparent backgrounds)
 *   z-index 50  — Cohesion overlay (vignette + warm wash)
 *
 * Dependencies: FlowerGenerator (global), optional html2canvas for export
 */

const CompositionEngine = (function () {
    'use strict';

    // -----------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------

    var container = null;
    var CONTAINER_WIDTH = 800;
    var CONTAINER_HEIGHT = 1000;

    // -----------------------------------------------------------------
    // Utility helpers
    // -----------------------------------------------------------------

    function rand(min, max) {
        return min + Math.random() * (max - min);
    }

    function randInt(min, max) {
        return Math.floor(rand(min, max + 1));
    }

    // -----------------------------------------------------------------
    // Initialization
    // -----------------------------------------------------------------

    function init(containerId) {
        container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            var section = document.getElementById('canvas-section');
            if (section) {
                section.appendChild(container);
            } else {
                document.body.appendChild(container);
            }
        }

        container.style.position = 'relative';
        container.style.width = CONTAINER_WIDTH + 'px';
        container.style.height = CONTAINER_HEIGHT + 'px';
        container.style.maxWidth = '100%';
        container.style.overflow = 'hidden';
        container.style.background = '#ffffff';
        container.style.margin = '0 auto';

        console.log('[CompositionEngine] Container initialized (' + CONTAINER_WIDTH + 'x' + CONTAINER_HEIGHT + ')');
    }

    // -----------------------------------------------------------------
    // Image loading
    // -----------------------------------------------------------------

    function loadImage(url, timeoutMs) {
        timeoutMs = timeoutMs || 12000;
        return new Promise(function (resolve, reject) {
            if (!url) { reject(new Error('No URL')); return; }

            var img = new Image();
            img.crossOrigin = 'anonymous';

            var tid = setTimeout(function () {
                img.onload = null; img.onerror = null;
                reject(new Error('Image load timed out'));
            }, timeoutMs);

            img.onload = function () { clearTimeout(tid); resolve(img); };

            img.onerror = function () {
                clearTimeout(tid);
                // Retry without crossOrigin (display only, no pixel access)
                var img2 = new Image();
                var tid2 = setTimeout(function () { reject(new Error('Image load failed')); }, 8000);
                img2.onload = function () { clearTimeout(tid2); resolve(img2); };
                img2.onerror = function () { clearTimeout(tid2); reject(new Error('Image load failed: ' + url)); };
                img2.src = url;
            };

            img.src = url;
        });
    }

    // -----------------------------------------------------------------
    // Composition: Main entry point
    // -----------------------------------------------------------------

    async function compose(vaseData, bouquetRecipe, weather, flowerImageMap) {
        if (!container) {
            console.warn('[CompositionEngine] compose called before init');
            return;
        }

        container.innerHTML = '';
        container.style.height = CONTAINER_HEIGHT + 'px';

        console.log('[CompositionEngine] Starting composition...');

        // Use raw vase image directly (no background removal — CORS blocks it)
        var vaseUrl = (vaseData && vaseData.imageUrl) || null;

        // Step 1: Place vase photo (z-index 5)
        var vaseInfo = null;
        try {
            vaseInfo = await placeVase(vaseUrl, vaseData);
            console.log('[CompositionEngine] Vase placed');
        } catch (e) {
            console.warn('[CompositionEngine] Vase placement failed:', e.message);
            vaseInfo = placeProceduralVase();
        }

        // Step 2: Use flower images from map (SVG data URLs from FlowerGenerator)
        var flowers = bouquetRecipe.flowers || [];
        var flowerImages = flowerImageMap || {};

        // Step 3: Place foliage (z-index 8) — behind flowers, in front of vase body
        try { placeFoliage(vaseInfo, bouquetRecipe, flowerImages); }
        catch (e) { console.warn('[CompositionEngine] Foliage failed:', e.message); }

        // Step 4: Place flowers (z-index 15-35) — SVGs with transparent backgrounds
        try {
            placeFlowers(vaseInfo, flowers, flowerImages, bouquetRecipe);
            console.log('[CompositionEngine] Flowers placed');
        } catch (e) {
            console.warn('[CompositionEngine] Flower placement failed:', e.message);
        }

        // Step 5: Cohesion overlay (z-index 50)
        addCohesionOverlay(vaseInfo);

        console.log('[CompositionEngine] Composition complete');
    }

    // -----------------------------------------------------------------
    // Layer: Vase (raw museum photo, no processing)
    // -----------------------------------------------------------------

    async function placeVase(vaseUrl, vaseData) {
        if (!vaseUrl) return placeProceduralVase();

        var loaded = await loadImage(vaseUrl);

        var naturalW = loaded.naturalWidth || loaded.width;
        var naturalH = loaded.naturalHeight || loaded.height;
        var displayH = Math.min(600, CONTAINER_HEIGHT * 0.6);
        var displayW = (naturalW / naturalH) * displayH;
        if (displayW > CONTAINER_WIDTH * 0.7) {
            displayW = CONTAINER_WIDTH * 0.7;
            displayH = (naturalH / naturalW) * displayW;
        }

        var vaseTop = CONTAINER_HEIGHT - 30 - displayH;

        var imgEl = document.createElement('img');
        imgEl.className = 'comp-vase';
        imgEl.alt = (vaseData && vaseData.title) || 'Museum vase';
        imgEl.draggable = false;
        imgEl.src = vaseUrl;

        imgEl.style.position = 'absolute';
        imgEl.style.zIndex = '5';
        imgEl.style.width = displayW + 'px';
        imgEl.style.height = displayH + 'px';
        imgEl.style.objectFit = 'contain';
        imgEl.style.left = '50%';
        imgEl.style.bottom = '30px';
        imgEl.style.transform = 'translateX(-50%)';
        imgEl.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))';

        container.appendChild(imgEl);

        // Estimate mouth position from image dimensions
        // Museum vase photos: mouth is typically ~10-15% from top
        var mouthX = CONTAINER_WIDTH / 2;
        var mouthY = vaseTop + displayH * 0.1;
        var mouthWidth = displayW * 0.4;

        return {
            mouthX: mouthX,
            mouthY: mouthY,
            mouthWidth: mouthWidth,
            vaseTop: vaseTop,
            vaseBottom: CONTAINER_HEIGHT - 30,
            vaseWidth: displayW,
            vaseHeight: displayH,
            hasPhoto: true
        };
    }

    function placeProceduralVase() {
        var cvs = document.createElement('canvas');
        cvs.width = 300;
        cvs.height = 500;
        cvs.style.position = 'absolute';
        cvs.style.left = '50%';
        cvs.style.bottom = '30px';
        cvs.style.transform = 'translateX(-50%)';
        cvs.style.zIndex = '5';

        var ctx = cvs.getContext('2d');
        var cx = 150, bot = 480, top = 30;
        var bodyW = 120, neckW = 45;

        ctx.beginPath();
        ctx.moveTo(cx - neckW, top);
        ctx.bezierCurveTo(cx - neckW, top + 80, cx - bodyW * 1.1, top + 160, cx - bodyW, top + 260);
        ctx.bezierCurveTo(cx - bodyW * 0.95, top + 380, cx - bodyW * 0.6, bot, cx, bot);
        ctx.bezierCurveTo(cx + bodyW * 0.6, bot, cx + bodyW * 0.95, top + 380, cx + bodyW, top + 260);
        ctx.bezierCurveTo(cx + bodyW * 1.1, top + 160, cx + neckW, top + 80, cx + neckW, top);
        ctx.closePath();

        var grad = ctx.createLinearGradient(cx - bodyW, 0, cx + bodyW, 0);
        grad.addColorStop(0, '#c8b8a8');
        grad.addColorStop(0.3, '#d8cec2');
        grad.addColorStop(0.7, '#c0b0a0');
        grad.addColorStop(1, '#a89888');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = '#8a7a6a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(cx, top, neckW, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#b8a898';
        ctx.fill();
        ctx.strokeStyle = '#8a7a6a';
        ctx.lineWidth = 1;
        ctx.stroke();

        container.appendChild(cvs);

        return {
            mouthX: CONTAINER_WIDTH / 2,
            mouthY: CONTAINER_HEIGHT - 30 - 500 + 30,
            mouthWidth: 90,
            vaseTop: CONTAINER_HEIGHT - 530,
            vaseBottom: CONTAINER_HEIGHT - 30,
            vaseWidth: 300,
            vaseHeight: 500,
            hasPhoto: false
        };
    }

    // -----------------------------------------------------------------
    // Layer: Foliage (z-index 8)
    // -----------------------------------------------------------------

    function placeFoliage(vaseInfo, bouquetRecipe, flowerImages) {
        if (!vaseInfo) return;

        var foliageItems = (bouquetRecipe.foliage || []).map(function (f) {
            var fl = f.flower || f;
            return fl.common || fl.name || 'Fern';
        });

        if (foliageItems.length === 0) foliageItems = ['Fern', 'Eucalyptus'];

        var mouthX = vaseInfo.mouthX;
        var mouthY = vaseInfo.mouthY;
        var spread = vaseInfo.mouthWidth * 1.2;

        for (var i = 0; i < foliageItems.length; i++) {
            var name = foliageItems[i];
            var imgUrl = flowerImages[name] || null;

            var size = rand(120, 180);
            var angle = Math.PI * (i + 0.5) / (foliageItems.length + 1);
            var radius = rand(50, 100);
            var fx = mouthX + Math.cos(angle - Math.PI) * spread * 0.7;
            var fy = mouthY - Math.sin(angle) * radius * 0.6;

            if (imgUrl) {
                var el = document.createElement('img');
                el.src = imgUrl;
                el.crossOrigin = 'anonymous';
                el.className = 'comp-foliage';
                el.draggable = false;
                el.style.position = 'absolute';
                el.style.zIndex = '8';
                el.style.opacity = '0.7';
                el.style.width = size + 'px';
                el.style.height = size + 'px';
                el.style.objectFit = 'contain';
                el.style.left = (fx - size / 2) + 'px';
                el.style.top = (fy - size / 2) + 'px';
                el.style.transform = 'rotate(' + rand(-30, 30) + 'deg)';

                el.onerror = function () {
                    this.style.display = 'none';
                };

                container.appendChild(el);
            } else {
                placeProceduralFoliage(fx, fy, size);
            }
        }
    }

    function placeProceduralFoliage(fx, fy, size) {
        var cvs = document.createElement('canvas');
        cvs.width = size;
        cvs.height = size;
        cvs.style.position = 'absolute';
        cvs.style.zIndex = '8';
        cvs.style.opacity = '0.5';
        cvs.style.left = (fx - size / 2) + 'px';
        cvs.style.top = (fy - size / 2) + 'px';
        cvs.style.transform = 'rotate(' + rand(-40, 40) + 'deg)';

        var ctx = cvs.getContext('2d');
        var greens = ['#5a8a5a', '#4a7a4a', '#6b9b6b', '#3d6b3d', '#7aab7a'];
        for (var l = 0; l < 6; l++) {
            var lx = size / 2 + rand(-size * 0.3, size * 0.3);
            var ly = size / 2 + rand(-size * 0.3, size * 0.3);
            var lw = rand(size * 0.2, size * 0.4);
            var lh = rand(size * 0.3, size * 0.5);
            var la = rand(0, Math.PI * 2);
            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(la);
            ctx.beginPath();
            ctx.ellipse(0, 0, lw, lh, 0, 0, Math.PI * 2);
            ctx.fillStyle = greens[l % greens.length];
            ctx.globalAlpha = 0.7;
            ctx.fill();
            ctx.restore();
        }

        container.appendChild(cvs);
    }

    // -----------------------------------------------------------------
    // Layer: Flowers (z-index 15-35, SVG with transparent backgrounds)
    // -----------------------------------------------------------------

    function placeFlowers(vaseInfo, flowers, flowerImages, bouquetRecipe) {
        if (!vaseInfo || !flowers || flowers.length === 0) return;

        var mouthX = vaseInfo.mouthX;
        var mouthY = vaseInfo.mouthY;
        var mouthWidth = vaseInfo.mouthWidth;
        var style = (bouquetRecipe.arrangementStyle || 'dome').toLowerCase();

        // Filter out foliage, keep only actual flowers
        var actualFlowers = flowers.filter(function (f) {
            return !f.role || f.role.indexOf('Foliage') === -1;
        });

        // Sort: primary flowers first (they go in center)
        var sortedFlowers = actualFlowers.slice().sort(function (a, b) {
            var order = {
                'Primary': 0, 'Primary (Zodiac)': 0,
                'Love Accent': 1, 'Love Accent (Venus)': 1,
                'Moon Accent': 2,
                'Weather Accent': 3, 'Weather Bloom': 3,
                'Palette Accent': 4
            };
            var ra = order[a.role] !== undefined ? order[a.role] : 3;
            var rb = order[b.role] !== undefined ? order[b.role] : 3;
            return ra - rb;
        });

        var placedCount = 0;

        for (var i = 0; i < sortedFlowers.length; i++) {
            var flower = sortedFlowers[i];
            var name = flower.name || 'Rose';
            var imgUrl = flowerImages[name] || null;
            var isPrimary = (flower.role || '').indexOf('Primary') !== -1;

            var pos = calculateFlowerPosition(i, sortedFlowers.length, mouthX, mouthY, mouthWidth, style);

            // Scale up images 15-30% compared to old version for more overlap
            var baseSize = isPrimary ? rand(150, 200) : rand(110, 160);

            if (imgUrl) {
                placeFlowerPhoto(imgUrl, name, pos, baseSize, i, isPrimary);
            } else {
                placeProceduralFlower(flower, pos, baseSize, i);
            }

            placedCount++;
        }

        console.log('[CompositionEngine] Placed ' + placedCount + ' flowers');
    }

    /**
     * Dense ring-based packing for natural bouquet dome shape.
     *
     * Ring 0: 1 center flower directly at the mouth (the hero flower)
     * Ring 1: 3 flowers tightly clustered around center (radius 45-75px)
     * Ring 2: remaining flowers in outer dome arc (radius 80-130px)
     */
    function calculateFlowerPosition(index, total, mouthX, mouthY, mouthWidth, style) {
        var x, y;

        // Ring 0: center flower (index 0)
        if (index === 0) {
            x = mouthX + rand(-8, 8);
            y = mouthY - rand(25, 45);
            return { x: x, y: y };
        }

        // Ring 1: inner tight cluster (indices 1-3)
        if (index <= 3) {
            var innerAngle = Math.PI * (0.25 + 0.5 * ((index - 1) / 2));
            var innerRadius = rand(45, 75);
            x = mouthX + Math.cos(innerAngle - Math.PI) * (mouthWidth * 0.5 + rand(-10, 10));
            y = mouthY - Math.sin(innerAngle) * innerRadius - rand(10, 25);
            x += rand(-12, 12);
            y += rand(-8, 8);
            return { x: x, y: y };
        }

        // Ring 2: outer dome (index 4+)
        var outerIndex = index - 4;
        var outerTotal = Math.max(total - 4, 1);
        var outerT = (outerIndex + 0.5) / outerTotal;

        switch (style) {
            case 'fan':
                var fanAngle = Math.PI * (0.1 + 0.8 * outerT);
                var fanRadius = rand(90, 140);
                x = mouthX + Math.cos(fanAngle - Math.PI) * (mouthWidth * 0.9);
                y = mouthY - Math.sin(fanAngle) * fanRadius;
                break;

            case 'cascade':
                x = mouthX + (outerT - 0.3) * mouthWidth * 2;
                y = mouthY - rand(50, 130) + outerT * 40;
                break;

            case 'ikebana':
                var ikeAngle = Math.PI * (0.2 + 0.6 * outerT);
                var ikeRadius = rand(80, 160);
                x = mouthX + Math.cos(ikeAngle - Math.PI * 0.8) * ikeRadius;
                y = mouthY - Math.sin(ikeAngle) * ikeRadius * 0.85;
                break;

            case 'crescent':
                var crescAngle = Math.PI * (0.1 + 0.8 * outerT);
                var crescRadius = 90 + 40 * Math.sin(crescAngle);
                x = mouthX + Math.cos(crescAngle - Math.PI) * mouthWidth * 1.1;
                y = mouthY - Math.sin(crescAngle) * crescRadius;
                break;

            default: // dome
                var domeAngle = Math.PI * (0.15 + 0.7 * outerT);
                var domeRadius = rand(80, 130);
                x = mouthX + Math.cos(domeAngle - Math.PI) * (mouthWidth * 0.8 + rand(-10, 15));
                y = mouthY - Math.sin(domeAngle) * domeRadius;
                break;
        }

        x += rand(-10, 10);
        y += rand(-8, 8);

        return { x: x, y: y };
    }

    /**
     * Place a flower SVG image (transparent background — no blend mode needed).
     */
    function placeFlowerPhoto(imgUrl, name, pos, size, index, isPrimary) {
        var el = document.createElement('img');
        el.alt = name;
        el.className = 'comp-flower';
        el.draggable = false;

        el.style.position = 'absolute';
        el.style.left = (pos.x - size / 2) + 'px';
        el.style.top = (pos.y - size / 2) + 'px';
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.objectFit = 'contain';
        el.style.zIndex = String(15 + index);

        el.style.transform = 'rotate(' + rand(-15, 15) + 'deg) scale(' + rand(0.92, 1.08) + ')';
        el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))';

        // Staggered fade-in
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.5s ease ' + (index * 0.08) + 's';

        el.src = imgUrl;
        container.appendChild(el);

        requestAnimationFrame(function () { el.style.opacity = '1'; });
    }

    function placeProceduralFlower(flower, pos, size, index) {
        var cvs = document.createElement('canvas');
        cvs.width = size;
        cvs.height = size;
        cvs.style.position = 'absolute';
        cvs.style.left = (pos.x - size / 2) + 'px';
        cvs.style.top = (pos.y - size / 2) + 'px';
        cvs.style.zIndex = String(15 + index);
        cvs.style.transform = 'rotate(' + rand(-15, 15) + 'deg)';

        var ctx = cvs.getContext('2d');
        var cx = size / 2;
        var cy = size / 2;
        var colors = flower.colors || ['#E8557A', '#C94060', '#F4A0B0'];
        var petalColor = colors[0] || '#E8557A';
        var petalCount = randInt(5, 8);
        var petalRadius = size * 0.35;

        for (var p = 0; p < petalCount; p++) {
            var pa = (Math.PI * 2 / petalCount) * p + rand(-0.1, 0.1);
            var px = cx + Math.cos(pa) * petalRadius * 0.4;
            var py = cy + Math.sin(pa) * petalRadius * 0.4;

            ctx.beginPath();
            ctx.ellipse(px, py, petalRadius * 0.45, petalRadius * 0.65, pa, 0, Math.PI * 2);
            ctx.fillStyle = petalColor;
            ctx.globalAlpha = 0.75;
            ctx.fill();
        }

        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, petalRadius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();

        cvs.style.WebkitMaskImage = 'radial-gradient(ellipse at center, black 35%, transparent 70%)';
        cvs.style.maskImage = 'radial-gradient(ellipse at center, black 35%, transparent 70%)';

        container.appendChild(cvs);
    }

    // -----------------------------------------------------------------
    // Layer: Cohesion overlay (z-index 50)
    // -----------------------------------------------------------------

    function addCohesionOverlay(vaseInfo) {
        // Vignette overlay
        var vignette = document.createElement('div');
        vignette.style.position = 'absolute';
        vignette.style.top = '0';
        vignette.style.left = '0';
        vignette.style.width = '100%';
        vignette.style.height = '100%';
        vignette.style.zIndex = '50';
        vignette.style.pointerEvents = 'none';
        vignette.style.background = 'radial-gradient(ellipse at center 40%, transparent 50%, rgba(255,255,255,0.4) 100%)';
        container.appendChild(vignette);

        // Subtle warm wash over bouquet area to unify different photo lighting
        if (vaseInfo) {
            var warmWash = document.createElement('div');
            warmWash.style.position = 'absolute';
            warmWash.style.zIndex = '51';
            warmWash.style.pointerEvents = 'none';
            warmWash.style.mixBlendMode = 'soft-light';
            warmWash.style.opacity = '0.12';

            // Position the warm wash centered on the bouquet area
            var washCenterY = vaseInfo.mouthY - 60;
            var washSize = Math.max(vaseInfo.mouthWidth * 2.5, 300);
            warmWash.style.left = (vaseInfo.mouthX - washSize / 2) + 'px';
            warmWash.style.top = (washCenterY - washSize / 2) + 'px';
            warmWash.style.width = washSize + 'px';
            warmWash.style.height = washSize + 'px';
            warmWash.style.borderRadius = '50%';
            warmWash.style.background = 'radial-gradient(ellipse at center, rgba(255,235,205,1) 0%, transparent 70%)';

            container.appendChild(warmWash);
        }
    }

    // -----------------------------------------------------------------
    // Export
    // -----------------------------------------------------------------

    function exportAsImage() {
        if (!container) return Promise.resolve(null);

        if (typeof html2canvas !== 'undefined') {
            return html2canvas(container, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: CONTAINER_WIDTH,
                height: CONTAINER_HEIGHT,
                scale: 2
            }).then(function (canvas) {
                return canvas.toDataURL('image/png');
            });
        }

        console.warn('[CompositionEngine] html2canvas not available for export');
        return Promise.resolve(null);
    }

    // -----------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------

    return {
        init: init,
        compose: compose,
        exportAsImage: exportAsImage
    };

})();
