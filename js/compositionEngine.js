/**
 * compositionEngine.js — HTML/CSS Photo Composition
 *
 * Creates a photorealistic floral arrangement by compositing real
 * flower photographs with a museum vase photograph using HTML/CSS.
 *
 * Replaces the previous Fabric.js canvas approach with an HTML-based
 * composition that uses CSS positioning, transforms, masks, and
 * blend modes for natural-looking photo compositing.
 *
 * Responsibilities:
 *   - Create and manage the composition container element
 *   - Load and place the vase photograph (from Met Museum / CMA)
 *   - Fetch and arrange real flower photographs (from Wikimedia Commons)
 *   - Use CSS masks and blending for soft, natural edges
 *   - Support arrangement shapes (dome, fan, cascade)
 *   - Export the composition as a PNG via html2canvas
 *
 * Dependencies: FlowerImageApi (global), optional html2canvas for export
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

    /**
     * Initialize the composition container.
     * @param {string} containerId - the id of the container element
     */
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
                // Retry without crossOrigin (display only)
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

        var vaseUrl = null;
        if (vaseData) {
            vaseUrl = vaseData.processedImageDataUrl ||
                      vaseData.processedDataUrl ||
                      vaseData.imageUrl ||
                      vaseData.originalUrl || null;
        }

        // Step 1: Place vase
        var vaseInfo = null;
        try {
            vaseInfo = await placeVase(vaseUrl, vaseData);
            console.log('[CompositionEngine] Vase placed');
        } catch (e) {
            console.warn('[CompositionEngine] Vase placement failed:', e.message);
            vaseInfo = placeProceduralVase();
        }

        // Step 2: Fetch flower images
        var flowers = bouquetRecipe.flowers || [];
        var flowerImages = {};

        if (flowerImageMap && Object.keys(flowerImageMap).length > 0) {
            flowerImages = flowerImageMap;
        } else if (typeof FlowerImageApi !== 'undefined') {
            try {
                var flowerNames = flowers.map(function (f) { return f.name || 'Rose'; });
                flowerImages = await FlowerImageApi.getMultipleFlowerImages(flowerNames);
                console.log('[CompositionEngine] Flower images loaded:', Object.keys(flowerImages).length);
            } catch (e) {
                console.warn('[CompositionEngine] Flower image fetch failed:', e.message);
            }
        }

        // Step 3: Place foliage
        try { placeFoliage(vaseInfo, bouquetRecipe, flowerImages); }
        catch (e) { console.warn('[CompositionEngine] Foliage failed:', e.message); }

        // Step 4: Place stems
        try { placeStems(vaseInfo, flowers, bouquetRecipe); }
        catch (e) { console.warn('[CompositionEngine] Stems failed:', e.message); }

        // Step 5: Place flowers
        try {
            placeFlowers(vaseInfo, flowers, flowerImages, bouquetRecipe);
            console.log('[CompositionEngine] Flowers placed');
        } catch (e) {
            console.warn('[CompositionEngine] Flower placement failed:', e.message);
        }

        // Step 6: Cohesion overlay
        addCohesionOverlay();

        console.log('[CompositionEngine] Composition complete');
    }

    // -----------------------------------------------------------------
    // Layer: Vase
    // -----------------------------------------------------------------

    async function placeVase(vaseUrl, vaseData) {
        if (!vaseUrl) return placeProceduralVase();

        var imgEl = document.createElement('img');
        imgEl.className = 'comp-vase';
        imgEl.alt = (vaseData && vaseData.title) || 'Museum vase';
        imgEl.draggable = false;

        imgEl.style.position = 'absolute';
        imgEl.style.zIndex = '10';
        imgEl.style.maxWidth = '70%';
        imgEl.style.maxHeight = '600px';
        imgEl.style.objectFit = 'contain';
        imgEl.style.left = '50%';
        imgEl.style.bottom = '30px';
        imgEl.style.transform = 'translateX(-50%)';
        imgEl.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))';

        var loaded = await loadImage(vaseUrl);
        imgEl.src = vaseUrl;

        var naturalW = loaded.naturalWidth;
        var naturalH = loaded.naturalHeight;
        var displayH = Math.min(600, CONTAINER_HEIGHT * 0.6);
        var displayW = (naturalW / naturalH) * displayH;
        if (displayW > CONTAINER_WIDTH * 0.7) {
            displayW = CONTAINER_WIDTH * 0.7;
            displayH = (naturalH / naturalW) * displayW;
        }

        imgEl.style.width = displayW + 'px';
        imgEl.style.height = displayH + 'px';

        container.appendChild(imgEl);

        var vaseTop = CONTAINER_HEIGHT - 30 - displayH;

        return {
            mouthX: CONTAINER_WIDTH / 2,
            mouthY: vaseTop + displayH * 0.05,
            mouthWidth: displayW * 0.45,
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
        cvs.style.zIndex = '10';

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
    // Layer: Foliage
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
        var spread = vaseInfo.mouthWidth * 1.8;

        for (var i = 0; i < foliageItems.length; i++) {
            var name = foliageItems[i];
            var imgUrl = flowerImages[name] || null;

            var size = rand(100, 160);
            var angle = Math.PI * (i + 0.5) / (foliageItems.length + 1);
            var radius = rand(80, 140);
            var fx = mouthX + Math.cos(angle - Math.PI) * spread * 0.8;
            var fy = mouthY - Math.sin(angle) * radius * 0.7;

            if (imgUrl) {
                var el = document.createElement('img');
                el.src = imgUrl;
                el.className = 'comp-foliage';
                el.draggable = false;
                el.style.position = 'absolute';
                el.style.zIndex = '5';
                el.style.opacity = '0.6';
                el.style.width = size + 'px';
                el.style.height = size + 'px';
                el.style.objectFit = 'cover';
                el.style.left = (fx - size / 2) + 'px';
                el.style.top = (fy - size / 2) + 'px';
                el.style.borderRadius = '50%';
                el.style.transform = 'rotate(' + rand(-30, 30) + 'deg)';
                el.style.filter = 'saturate(0.7) brightness(0.95)';
                el.style.WebkitMaskImage = 'radial-gradient(ellipse at center, black 30%, transparent 70%)';
                el.style.maskImage = 'radial-gradient(ellipse at center, black 30%, transparent 70%)';
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
        cvs.style.zIndex = '5';
        cvs.style.opacity = '0.45';
        cvs.style.left = (fx - size / 2) + 'px';
        cvs.style.top = (fy - size / 2) + 'px';
        cvs.style.borderRadius = '50%';
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
    // Layer: Stems
    // -----------------------------------------------------------------

    function placeStems(vaseInfo, flowers, bouquetRecipe) {
        if (!vaseInfo) return;

        var cvs = document.createElement('canvas');
        cvs.width = CONTAINER_WIDTH;
        cvs.height = CONTAINER_HEIGHT;
        cvs.style.position = 'absolute';
        cvs.style.left = '0';
        cvs.style.top = '0';
        cvs.style.zIndex = '8';
        cvs.style.pointerEvents = 'none';

        var ctx = cvs.getContext('2d');
        var mouthX = vaseInfo.mouthX;
        var mouthY = vaseInfo.mouthY;
        var mouthWidth = vaseInfo.mouthWidth;
        var style = (bouquetRecipe.arrangementStyle || 'dome').toLowerCase();

        for (var i = 0; i < flowers.length; i++) {
            var flower = flowers[i];
            if (!flower) continue;
            var role = flower.role || '';
            if (role.indexOf('Foliage') !== -1) continue;

            var pos = calculateFlowerPosition(i, flowers.length, mouthX, mouthY, mouthWidth, style);

            var stemStartX = mouthX + (pos.x - mouthX) * 0.15;
            var stemStartY = mouthY + 10;

            ctx.beginPath();
            ctx.moveTo(stemStartX, stemStartY);
            ctx.quadraticCurveTo(
                mouthX + (pos.x - mouthX) * 0.4,
                mouthY - (mouthY - pos.y) * 0.3,
                pos.x,
                pos.y + 20
            );

            ctx.strokeStyle = '#5a7a4a';
            ctx.lineWidth = rand(1.5, 3);
            ctx.globalAlpha = 0.35;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        container.appendChild(cvs);
    }

    // -----------------------------------------------------------------
    // Layer: Flowers
    // -----------------------------------------------------------------

    function placeFlowers(vaseInfo, flowers, flowerImages, bouquetRecipe) {
        if (!vaseInfo || !flowers || flowers.length === 0) return;

        var mouthX = vaseInfo.mouthX;
        var mouthY = vaseInfo.mouthY;
        var mouthWidth = vaseInfo.mouthWidth;
        var style = (bouquetRecipe.arrangementStyle || 'dome').toLowerCase();

        var sortedFlowers = flowers.slice().sort(function (a, b) {
            var order = { 'Primary': 0, 'Primary (Zodiac)': 0, 'Love Accent': 1, 'Love Accent (Venus)': 1, 'Moon Accent': 2, 'Weather Accent': 3, 'Weather Bloom': 3, 'Palette Accent': 4, 'Foliage': 5 };
            var ra = order[a.role] !== undefined ? order[a.role] : 3;
            var rb = order[b.role] !== undefined ? order[b.role] : 3;
            return ra - rb;
        });

        var placedCount = 0;

        for (var i = 0; i < sortedFlowers.length; i++) {
            var flower = sortedFlowers[i];
            var name = flower.name || 'Rose';
            var imgUrl = flowerImages[name] || null;
            var role = flower.role || '';
            var isPrimary = role.indexOf('Primary') !== -1;
            var isFoliage = role.indexOf('Foliage') !== -1;

            if (isFoliage) continue;

            var pos = calculateFlowerPosition(i, sortedFlowers.length, mouthX, mouthY, mouthWidth, style);
            var baseSize = isPrimary ? rand(130, 170) : rand(90, 130);

            if (imgUrl) {
                placeFlowerPhoto(imgUrl, name, pos, baseSize, i, isPrimary);
            } else {
                placeProceduralFlower(flower, pos, baseSize, i);
            }

            placedCount++;
        }

        console.log('[CompositionEngine] Placed ' + placedCount + ' flowers');
    }

    function calculateFlowerPosition(index, total, mouthX, mouthY, mouthWidth, style) {
        var t = (index + 1) / (total + 1);
        var x, y;

        switch (style) {
            case 'fan':
                var fanAngle = Math.PI * 0.15 + Math.PI * 0.7 * t;
                var fanRadius = rand(100, 200);
                x = mouthX + Math.cos(fanAngle - Math.PI) * mouthWidth * 1.8;
                y = mouthY - Math.sin(fanAngle) * fanRadius;
                break;

            case 'cascade':
                x = mouthX + (t - 0.3) * mouthWidth * 2.5;
                y = mouthY - rand(40, 180) + t * 60;
                break;

            case 'ikebana':
                var ikeAngle = Math.PI * 0.2 + Math.PI * 0.6 * t;
                var ikeRadius = rand(120, 250);
                x = mouthX + Math.cos(ikeAngle - Math.PI * 0.8) * ikeRadius;
                y = mouthY - Math.sin(ikeAngle) * ikeRadius * 0.9;
                break;

            case 'crescent':
                var crescAngle = Math.PI * 0.1 + Math.PI * 0.8 * t;
                var crescRadius = 120 + 60 * Math.sin(crescAngle);
                x = mouthX + Math.cos(crescAngle - Math.PI) * mouthWidth * 1.5;
                y = mouthY - Math.sin(crescAngle) * crescRadius;
                break;

            default: // dome
                var domeAngle = Math.PI * (0.15 + 0.7 * t);
                var layer = Math.floor(index / 3);
                var layerOffset = (index % 3 - 1) * rand(20, 40);
                var domeRadius = 80 + layer * 45 + rand(-15, 15);
                x = mouthX + Math.cos(domeAngle - Math.PI) * (mouthWidth * 1.2 + layerOffset);
                y = mouthY - Math.sin(domeAngle) * domeRadius - layer * 15;
                break;
        }

        x += rand(-15, 15);
        y += rand(-10, 10);

        return { x: x, y: y };
    }

    function placeFlowerPhoto(imgUrl, name, pos, size, index, isPrimary) {
        var el = document.createElement('img');
        el.src = imgUrl;
        el.alt = name;
        el.className = 'comp-flower';
        el.draggable = false;

        el.style.position = 'absolute';
        el.style.left = (pos.x - size / 2) + 'px';
        el.style.top = (pos.y - size / 2) + 'px';
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.objectFit = 'cover';
        el.style.borderRadius = '50%';
        el.style.zIndex = String(20 + index);
        el.style.transform = 'rotate(' + rand(-15, 15) + 'deg) scale(' + rand(0.95, 1.05) + ')';

        var maskGrad = isPrimary
            ? 'radial-gradient(ellipse at center, black 45%, transparent 72%)'
            : 'radial-gradient(ellipse at center, black 40%, transparent 68%)';
        el.style.WebkitMaskImage = maskGrad;
        el.style.maskImage = maskGrad;

        el.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))';

        el.style.opacity = '0';
        el.style.transition = 'opacity 0.6s ease ' + (index * 0.1) + 's';

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
        cvs.style.zIndex = String(20 + index);
        cvs.style.borderRadius = '50%';
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

        cvs.style.WebkitMaskImage = 'radial-gradient(ellipse at center, black 35%, transparent 65%)';
        cvs.style.maskImage = 'radial-gradient(ellipse at center, black 35%, transparent 65%)';

        container.appendChild(cvs);
    }

    // -----------------------------------------------------------------
    // Layer: Cohesion overlay
    // -----------------------------------------------------------------

    function addCohesionOverlay() {
        var overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.zIndex = '50';
        overlay.style.pointerEvents = 'none';
        overlay.style.background = 'radial-gradient(ellipse at center, transparent 60%, rgba(255,255,255,0.3) 100%)';
        container.appendChild(overlay);
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
