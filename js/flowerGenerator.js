/**
 * flowerGenerator.js — SVG Procedural Flower Illustrations
 *
 * Generates beautiful stylized flower illustrations as SVG data URLs.
 * Each flower type has a distinct petal shape, layering pattern, and
 * color palette. All SVGs have transparent backgrounds.
 *
 * Replaces the Wikimedia Commons photo API approach which failed due
 * to CORS restrictions and non-white photo backgrounds.
 *
 * Public API:
 *   FlowerGenerator.generateFlower(name, colors, size) → SVG data URL
 *   FlowerGenerator.generateFlowerImages(flowers) → { name: dataUrl }
 */

const FlowerGenerator = (function () {
    'use strict';

    // -----------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------

    function rand(min, max) { return min + Math.random() * (max - min); }
    function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

    function lighten(hex, amount) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        r = Math.min(255, Math.round(r + (255 - r) * amount));
        g = Math.min(255, Math.round(g + (255 - g) * amount));
        b = Math.min(255, Math.round(b + (255 - b) * amount));
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function darken(hex, amount) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        r = Math.max(0, Math.round(r * (1 - amount)));
        g = Math.max(0, Math.round(g * (1 - amount)));
        b = Math.max(0, Math.round(b * (1 - amount)));
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function hexToRgba(hex, alpha) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    // -----------------------------------------------------------------
    // SVG wrapper
    // -----------------------------------------------------------------

    function svgWrap(size, content) {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size +
            '" viewBox="0 0 ' + size + ' ' + size + '">' + content + '</svg>';
    }

    function toDataUrl(svgStr) {
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
    }

    // -----------------------------------------------------------------
    // Flower templates
    // -----------------------------------------------------------------

    // --- ROSE: layered spiral of overlapping rounded petals ---
    function drawRose(size, colors) {
        var cx = size / 2, cy = size / 2;
        var baseColor = colors[0] || '#E8557A';
        var parts = '';
        // Outer petals (large, lighter)
        var outerCount = randInt(7, 9);
        for (var i = 0; i < outerCount; i++) {
            var angle = (Math.PI * 2 / outerCount) * i + rand(-0.15, 0.15);
            var pr = size * 0.38;
            var px = cx + Math.cos(angle) * pr * 0.25;
            var py = cy + Math.sin(angle) * pr * 0.25;
            var pw = pr * rand(0.38, 0.45);
            var ph = pr * rand(0.55, 0.7);
            var rot = (angle * 180 / Math.PI) + 90;
            parts += '<ellipse cx="' + px + '" cy="' + py + '" rx="' + pw + '" ry="' + ph +
                '" fill="' + lighten(baseColor, 0.15) + '" opacity="0.8" transform="rotate(' + rot + ' ' + px + ' ' + py + ')"/>';
        }
        // Middle petals (medium, base color)
        var midCount = randInt(5, 7);
        for (var j = 0; j < midCount; j++) {
            var ma = (Math.PI * 2 / midCount) * j + rand(-0.2, 0.2);
            var mr = size * 0.22;
            var mx = cx + Math.cos(ma) * mr * 0.2;
            var my = cy + Math.sin(ma) * mr * 0.2;
            var mw = mr * rand(0.4, 0.5);
            var mh = mr * rand(0.6, 0.75);
            var mrot = (ma * 180 / Math.PI) + 90;
            parts += '<ellipse cx="' + mx + '" cy="' + my + '" rx="' + mw + '" ry="' + mh +
                '" fill="' + baseColor + '" opacity="0.85" transform="rotate(' + mrot + ' ' + mx + ' ' + my + ')"/>';
        }
        // Inner petals (small, darker, tight spiral)
        var innerCount = randInt(4, 5);
        for (var k = 0; k < innerCount; k++) {
            var ia = (Math.PI * 2 / innerCount) * k + rand(-0.3, 0.3);
            var ir = size * 0.1;
            var ix = cx + Math.cos(ia) * ir * 0.15;
            var iy = cy + Math.sin(ia) * ir * 0.15;
            parts += '<ellipse cx="' + ix + '" cy="' + iy + '" rx="' + (ir * 0.45) + '" ry="' + (ir * 0.55) +
                '" fill="' + darken(baseColor, 0.2) + '" opacity="0.9" transform="rotate(' + (ia * 180 / Math.PI + 90) + ' ' + ix + ' ' + iy + ')"/>';
        }
        // Center bud
        parts += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.04) + '" fill="' + darken(baseColor, 0.35) + '"/>';
        return svgWrap(size, parts);
    }

    // --- SUNFLOWER: ray petals around dark textured center ---
    function drawSunflower(size, colors) {
        var cx = size / 2, cy = size / 2;
        var petalColor = colors[0] || '#FFD700';
        var parts = '';
        var petalCount = randInt(16, 22);
        for (var i = 0; i < petalCount; i++) {
            var angle = (Math.PI * 2 / petalCount) * i + rand(-0.05, 0.05);
            var pr = size * 0.42;
            var px = cx + Math.cos(angle) * size * 0.18;
            var py = cy + Math.sin(angle) * size * 0.18;
            var pw = size * 0.06;
            var ph = pr * rand(0.42, 0.5);
            var rot = (angle * 180 / Math.PI) + 90;
            parts += '<ellipse cx="' + px + '" cy="' + py + '" rx="' + pw + '" ry="' + ph +
                '" fill="' + petalColor + '" opacity="' + rand(0.8, 0.95) +
                '" transform="rotate(' + rot + ' ' + px + ' ' + py + ')"/>';
        }
        // Dark center
        parts += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.16) + '" fill="' + darken('#8B4513', 0.3) + '"/>';
        // Center texture dots
        for (var d = 0; d < 20; d++) {
            var da = rand(0, Math.PI * 2);
            var dr = rand(0, size * 0.13);
            parts += '<circle cx="' + (cx + Math.cos(da) * dr) + '" cy="' + (cy + Math.sin(da) * dr) +
                '" r="' + rand(1.5, 3) + '" fill="' + darken('#8B4513', rand(0.1, 0.5)) + '" opacity="0.7"/>';
        }
        return svgWrap(size, parts);
    }

    // --- TULIP: 3 cupped petals, pointed tips ---
    function drawTulip(size, colors) {
        var cx = size / 2, cy = size * 0.45;
        var baseColor = colors[0] || '#FF4500';
        var parts = '';
        var petalAngles = [-0.4, 0, 0.4];
        for (var i = 0; i < 3; i++) {
            var a = petalAngles[i];
            var tipX = cx + Math.sin(a) * size * 0.15;
            var tipY = cy - size * 0.28;
            var bl = cx - size * 0.12 + Math.sin(a) * size * 0.05;
            var br = cx + size * 0.12 + Math.sin(a) * size * 0.05;
            var col = i === 1 ? baseColor : lighten(baseColor, 0.1);
            parts += '<path d="M ' + bl + ' ' + cy + ' Q ' + (bl - size * 0.02) + ' ' + (cy - size * 0.18) +
                ' ' + tipX + ' ' + tipY + ' Q ' + (br + size * 0.02) + ' ' + (cy - size * 0.18) +
                ' ' + br + ' ' + cy + ' Z" fill="' + col + '" opacity="0.88"/>';
        }
        // Inner shadow
        parts += '<ellipse cx="' + cx + '" cy="' + (cy + size * 0.02) + '" rx="' + (size * 0.08) +
            '" ry="' + (size * 0.04) + '" fill="' + darken(baseColor, 0.3) + '" opacity="0.5"/>';
        // Stem hint
        parts += '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (size * 0.85) +
            '" stroke="#5a7a4a" stroke-width="' + (size * 0.02) + '" opacity="0.6"/>';
        return svgWrap(size, parts);
    }

    // --- LILY: 6 star-shaped recurved petals + stamens ---
    function drawLily(size, colors) {
        var cx = size / 2, cy = size / 2;
        var baseColor = colors[0] || '#FFF5F5';
        var parts = '';
        var petalCount = 6;
        for (var i = 0; i < petalCount; i++) {
            var angle = (Math.PI * 2 / petalCount) * i + rand(-0.06, 0.06);
            var tipDist = size * 0.4;
            var tipX = cx + Math.cos(angle) * tipDist;
            var tipY = cy + Math.sin(angle) * tipDist;
            var sideAngle1 = angle - 0.25;
            var sideAngle2 = angle + 0.25;
            var sideR = size * 0.12;
            var s1x = cx + Math.cos(sideAngle1) * sideR;
            var s1y = cy + Math.sin(sideAngle1) * sideR;
            var s2x = cx + Math.cos(sideAngle2) * sideR;
            var s2y = cy + Math.sin(sideAngle2) * sideR;
            var cp1x = cx + Math.cos(angle - 0.15) * tipDist * 0.65;
            var cp1y = cy + Math.sin(angle - 0.15) * tipDist * 0.65;
            var cp2x = cx + Math.cos(angle + 0.15) * tipDist * 0.65;
            var cp2y = cy + Math.sin(angle + 0.15) * tipDist * 0.65;
            parts += '<path d="M ' + s1x + ' ' + s1y + ' Q ' + cp1x + ' ' + cp1y + ' ' + tipX + ' ' + tipY +
                ' Q ' + cp2x + ' ' + cp2y + ' ' + s2x + ' ' + s2y + ' Z" fill="' +
                (i % 2 === 0 ? baseColor : lighten(baseColor, 0.1)) + '" opacity="0.85"/>';
        }
        // Stamens
        for (var s = 0; s < 5; s++) {
            var sa = (Math.PI * 2 / 5) * s;
            var sx = cx + Math.cos(sa) * size * 0.14;
            var sy = cy + Math.sin(sa) * size * 0.14;
            parts += '<line x1="' + cx + '" y1="' + cy + '" x2="' + sx + '" y2="' + sy +
                '" stroke="#8B7355" stroke-width="1.5" opacity="0.6"/>';
            parts += '<circle cx="' + sx + '" cy="' + sy + '" r="2.5" fill="#DAA520" opacity="0.8"/>';
        }
        parts += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.035) + '" fill="#90EE90" opacity="0.6"/>';
        return svgWrap(size, parts);
    }

    // --- DAISY/CHAMOMILE: many thin ray petals + round center ---
    function drawDaisy(size, colors) {
        var cx = size / 2, cy = size / 2;
        var petalColor = colors[0] || '#FAFAD2';
        var parts = '';
        var petalCount = randInt(14, 20);
        for (var i = 0; i < petalCount; i++) {
            var angle = (Math.PI * 2 / petalCount) * i + rand(-0.08, 0.08);
            var pr = size * rand(0.32, 0.4);
            var px = cx + Math.cos(angle) * (size * 0.15);
            var py = cy + Math.sin(angle) * (size * 0.15);
            var pw = size * 0.04;
            var ph = pr * 0.5;
            var rot = (angle * 180 / Math.PI) + 90;
            parts += '<ellipse cx="' + px + '" cy="' + py + '" rx="' + pw + '" ry="' + ph +
                '" fill="' + petalColor + '" opacity="0.85" transform="rotate(' + rot + ' ' + px + ' ' + py + ')"/>';
        }
        // Bright center
        parts += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.1) + '" fill="#FFD700"/>';
        parts += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.06) + '" fill="#FFA500" opacity="0.6"/>';
        return svgWrap(size, parts);
    }

    // --- PEONY: dense ruffled ball of petals ---
    function drawPeony(size, colors) {
        var cx = size / 2, cy = size / 2;
        var baseColor = colors[0] || '#FFB6C1';
        var parts = '';
        // 3 layers of petals, dense overlap
        var layers = [
            { count: randInt(9, 12), r: size * 0.38, pw: 0.15, ph: 0.22, opacity: 0.65, color: lighten(baseColor, 0.2) },
            { count: randInt(8, 10), r: size * 0.26, pw: 0.12, ph: 0.18, opacity: 0.75, color: baseColor },
            { count: randInt(6, 8), r: size * 0.15, pw: 0.1, ph: 0.14, opacity: 0.85, color: darken(baseColor, 0.1) }
        ];
        for (var l = 0; l < layers.length; l++) {
            var layer = layers[l];
            for (var i = 0; i < layer.count; i++) {
                var angle = (Math.PI * 2 / layer.count) * i + rand(-0.2, 0.2);
                var px = cx + Math.cos(angle) * layer.r * 0.3;
                var py = cy + Math.sin(angle) * layer.r * 0.3;
                var pw = size * layer.pw;
                var ph = size * layer.ph;
                var rot = (angle * 180 / Math.PI) + 90 + rand(-10, 10);
                parts += '<ellipse cx="' + px + '" cy="' + py + '" rx="' + pw + '" ry="' + ph +
                    '" fill="' + layer.color + '" opacity="' + layer.opacity +
                    '" transform="rotate(' + rot + ' ' + px + ' ' + py + ')"/>';
            }
        }
        parts += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.04) + '" fill="' + darken(baseColor, 0.3) + '" opacity="0.5"/>';
        return svgWrap(size, parts);
    }

    // --- ORCHID: 3+2 asymmetric petals + labellum ---
    function drawOrchid(size, colors) {
        var cx = size / 2, cy = size / 2;
        var baseColor = colors[0] || '#DA70D6';
        var parts = '';
        // 3 sepals (back, longer)
        var sepalAngles = [Math.PI * 0.5, Math.PI * 0.5 + Math.PI * 2 / 3, Math.PI * 0.5 + Math.PI * 4 / 3];
        for (var i = 0; i < 3; i++) {
            var sa = sepalAngles[i];
            var sx = cx + Math.cos(sa) * size * 0.08;
            var sy = cy + Math.sin(sa) * size * 0.08;
            var sw = size * 0.08;
            var sh = size * 0.25;
            var sr = (sa * 180 / Math.PI) + 90;
            parts += '<ellipse cx="' + sx + '" cy="' + sy + '" rx="' + sw + '" ry="' + sh +
                '" fill="' + lighten(baseColor, 0.15) + '" opacity="0.75" transform="rotate(' + sr + ' ' + sx + ' ' + sy + ')"/>';
        }
        // 2 lateral petals (wider, rounder)
        var latAngles = [Math.PI * 0.15, Math.PI * 0.85];
        for (var j = 0; j < 2; j++) {
            var la = latAngles[j];
            var lx = cx + Math.cos(la) * size * 0.06;
            var ly = cy - size * 0.06;
            var lw = size * 0.12;
            var lh = size * 0.18;
            var lr = (la * 180 / Math.PI) + 90;
            parts += '<ellipse cx="' + lx + '" cy="' + ly + '" rx="' + lw + '" ry="' + lh +
                '" fill="' + baseColor + '" opacity="0.82" transform="rotate(' + lr + ' ' + lx + ' ' + ly + ')"/>';
        }
        // Labellum (bottom lip, distinctive)
        parts += '<ellipse cx="' + cx + '" cy="' + (cy + size * 0.1) + '" rx="' + (size * 0.1) +
            '" ry="' + (size * 0.13) + '" fill="' + darken(baseColor, 0.15) + '" opacity="0.85"/>';
        // Center column
        parts += '<circle cx="' + cx + '" cy="' + (cy - size * 0.02) + '" r="' + (size * 0.03) +
            '" fill="#FFFACD" opacity="0.8"/>';
        return svgWrap(size, parts);
    }

    // --- IRIS: 3 standards (upright) + 3 falls ---
    function drawIris(size, colors) {
        var cx = size / 2, cy = size / 2;
        var baseColor = colors[0] || '#6495ED';
        var parts = '';
        // 3 falls (drooping, lower)
        for (var i = 0; i < 3; i++) {
            var fa = (Math.PI * 2 / 3) * i + Math.PI / 6;
            var fx = cx + Math.cos(fa) * size * 0.07;
            var fy = cy + Math.sin(fa) * size * 0.07;
            parts += '<ellipse cx="' + fx + '" cy="' + fy + '" rx="' + (size * 0.09) + '" ry="' + (size * 0.22) +
                '" fill="' + lighten(baseColor, 0.1) + '" opacity="0.8" transform="rotate(' + ((fa * 180 / Math.PI) + 90) + ' ' + fx + ' ' + fy + ')"/>';
        }
        // 3 standards (upright, overlapping falls)
        for (var j = 0; j < 3; j++) {
            var sa = (Math.PI * 2 / 3) * j + Math.PI / 6 + Math.PI / 3;
            var sx = cx + Math.cos(sa) * size * 0.05;
            var sy = cy + Math.sin(sa) * size * 0.05;
            parts += '<ellipse cx="' + sx + '" cy="' + sy + '" rx="' + (size * 0.07) + '" ry="' + (size * 0.2) +
                '" fill="' + baseColor + '" opacity="0.85" transform="rotate(' + ((sa * 180 / Math.PI) + 90) + ' ' + sx + ' ' + sy + ')"/>';
        }
        // Beard detail
        parts += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (size * 0.04) + '" ry="' + (size * 0.04) +
            '" fill="#FFD700" opacity="0.7"/>';
        return svgWrap(size, parts);
    }

    // --- HYDRANGEA: cluster of many small 4-petal florets ---
    function drawHydrangea(size, colors) {
        var cx = size / 2, cy = size / 2;
        var baseColor = colors[0] || '#5F9EA0';
        var parts = '';
        var floretCount = randInt(25, 40);
        for (var i = 0; i < floretCount; i++) {
            var angle = rand(0, Math.PI * 2);
            var dist = rand(0, size * 0.32);
            var fx = cx + Math.cos(angle) * dist;
            var fy = cy + Math.sin(angle) * dist;
            var fSize = rand(size * 0.04, size * 0.07);
            var col = Math.random() > 0.5 ? baseColor : lighten(baseColor, rand(0.1, 0.3));
            // 4 petals per floret
            for (var p = 0; p < 4; p++) {
                var pa = (Math.PI / 2) * p + rand(-0.15, 0.15);
                var px = fx + Math.cos(pa) * fSize * 0.5;
                var py = fy + Math.sin(pa) * fSize * 0.5;
                parts += '<ellipse cx="' + px + '" cy="' + py + '" rx="' + (fSize * 0.4) + '" ry="' + (fSize * 0.6) +
                    '" fill="' + col + '" opacity="' + rand(0.65, 0.9) +
                    '" transform="rotate(' + ((pa * 180 / Math.PI) + 90) + ' ' + px + ' ' + py + ')"/>';
            }
            parts += '<circle cx="' + fx + '" cy="' + fy + '" r="1.2" fill="#FFFACD" opacity="0.6"/>';
        }
        return svgWrap(size, parts);
    }

    // --- DAHLIA/CHRYSANTHEMUM: many pointed petals radiating outward ---
    function drawDahlia(size, colors) {
        var cx = size / 2, cy = size / 2;
        var baseColor = colors[0] || '#FF6347';
        var parts = '';
        // Multiple rings of pointed petals
        var rings = [
            { count: randInt(16, 20), r: size * 0.4, w: 0.035, h: 0.16, color: lighten(baseColor, 0.15), opacity: 0.7 },
            { count: randInt(12, 16), r: size * 0.28, w: 0.04, h: 0.13, color: baseColor, opacity: 0.8 },
            { count: randInt(8, 10), r: size * 0.16, w: 0.035, h: 0.1, color: darken(baseColor, 0.15), opacity: 0.85 }
        ];
        for (var l = 0; l < rings.length; l++) {
            var ring = rings[l];
            for (var i = 0; i < ring.count; i++) {
                var angle = (Math.PI * 2 / ring.count) * i + rand(-0.08, 0.08);
                var px = cx + Math.cos(angle) * ring.r * 0.35;
                var py = cy + Math.sin(angle) * ring.r * 0.35;
                var rot = (angle * 180 / Math.PI) + 90;
                parts += '<ellipse cx="' + px + '" cy="' + py + '" rx="' + (size * ring.w) + '" ry="' + (size * ring.h) +
                    '" fill="' + ring.color + '" opacity="' + ring.opacity +
                    '" transform="rotate(' + rot + ' ' + px + ' ' + py + ')"/>';
            }
        }
        parts += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.045) + '" fill="' + darken(baseColor, 0.4) + '"/>';
        return svgWrap(size, parts);
    }

    // --- CARNATION: frilly ruffled petals ---
    function drawCarnation(size, colors) {
        var cx = size / 2, cy = size / 2;
        var baseColor = colors[0] || '#FF69B4';
        var parts = '';
        // Dense cluster of small ruffled petals
        var count = randInt(30, 45);
        for (var i = 0; i < count; i++) {
            var angle = rand(0, Math.PI * 2);
            var dist = rand(0, size * 0.3);
            var px = cx + Math.cos(angle) * dist;
            var py = cy + Math.sin(angle) * dist;
            var pw = rand(size * 0.04, size * 0.08);
            var ph = rand(size * 0.03, size * 0.06);
            var rot = rand(0, 360);
            var distRatio = dist / (size * 0.3);
            var col = distRatio > 0.6 ? lighten(baseColor, 0.2) : baseColor;
            parts += '<ellipse cx="' + px + '" cy="' + py + '" rx="' + pw + '" ry="' + ph +
                '" fill="' + col + '" opacity="' + rand(0.6, 0.9) + '" transform="rotate(' + rot + ' ' + px + ' ' + py + ')"/>';
        }
        return svgWrap(size, parts);
    }

    // --- LAVENDER: spike of tiny florets ---
    function drawLavender(size, colors) {
        var cx = size / 2;
        var baseColor = colors[0] || '#B57EDC';
        var parts = '';
        // Stem
        parts += '<line x1="' + cx + '" y1="' + (size * 0.35) + '" x2="' + cx + '" y2="' + (size * 0.9) +
            '" stroke="#6B8E5A" stroke-width="' + (size * 0.015) + '" opacity="0.7"/>';
        // Florets along the spike
        var floretCount = randInt(12, 18);
        var spikeTop = size * 0.15;
        var spikeBottom = size * 0.55;
        for (var i = 0; i < floretCount; i++) {
            var t = i / (floretCount - 1);
            var fy = spikeTop + t * (spikeBottom - spikeTop);
            var spread = size * 0.06 * (1 - Math.abs(t - 0.4)); // wider in middle
            var fx = cx + rand(-spread, spread);
            var fsize = size * rand(0.025, 0.04);
            parts += '<ellipse cx="' + fx + '" cy="' + fy + '" rx="' + fsize + '" ry="' + (fsize * 0.7) +
                '" fill="' + (Math.random() > 0.3 ? baseColor : lighten(baseColor, 0.2)) +
                '" opacity="' + rand(0.7, 0.95) + '"/>';
        }
        return svgWrap(size, parts);
    }

    // --- SIMPLE 5-PETAL: generic flower for Pansy, Geranium, Jasmine, etc. ---
    function drawSimple5Petal(size, colors) {
        var cx = size / 2, cy = size / 2;
        var baseColor = colors[0] || '#DDA0DD';
        var parts = '';
        var petalCount = 5;
        var petalR = size * 0.32;
        for (var i = 0; i < petalCount; i++) {
            var angle = (Math.PI * 2 / petalCount) * i - Math.PI / 2 + rand(-0.08, 0.08);
            var px = cx + Math.cos(angle) * petalR * 0.35;
            var py = cy + Math.sin(angle) * petalR * 0.35;
            var pw = petalR * 0.38;
            var ph = petalR * 0.52;
            var rot = (angle * 180 / Math.PI) + 90;
            parts += '<ellipse cx="' + px + '" cy="' + py + '" rx="' + pw + '" ry="' + ph +
                '" fill="' + (i % 2 === 0 ? baseColor : lighten(baseColor, 0.12)) +
                '" opacity="0.82" transform="rotate(' + rot + ' ' + px + ' ' + py + ')"/>';
        }
        parts += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.07) + '" fill="#FFD700" opacity="0.85"/>';
        parts += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.035) + '" fill="#FFA500" opacity="0.6"/>';
        return svgWrap(size, parts);
    }

    // --- FOLIAGE: leaf shape with veins ---
    function drawLeaf(size, colors) {
        var cx = size / 2, cy = size / 2;
        var baseColor = colors[0] || '#228B22';
        var parts = '';
        // Main leaf shape
        var tipY = cy - size * 0.38;
        var stemY = cy + size * 0.38;
        parts += '<path d="M ' + cx + ' ' + tipY +
            ' Q ' + (cx + size * 0.25) + ' ' + (cy - size * 0.15) + ' ' + (cx + size * 0.15) + ' ' + cy +
            ' Q ' + (cx + size * 0.08) + ' ' + (cy + size * 0.2) + ' ' + cx + ' ' + stemY +
            ' Q ' + (cx - size * 0.08) + ' ' + (cy + size * 0.2) + ' ' + (cx - size * 0.15) + ' ' + cy +
            ' Q ' + (cx - size * 0.25) + ' ' + (cy - size * 0.15) + ' ' + cx + ' ' + tipY +
            ' Z" fill="' + baseColor + '" opacity="0.8"/>';
        // Center vein
        parts += '<line x1="' + cx + '" y1="' + (tipY + size * 0.05) + '" x2="' + cx + '" y2="' + (stemY - size * 0.05) +
            '" stroke="' + darken(baseColor, 0.2) + '" stroke-width="1.2" opacity="0.5"/>';
        // Side veins
        for (var v = 0; v < 4; v++) {
            var vy = tipY + (stemY - tipY) * (0.2 + v * 0.2);
            var vx = cx + (v % 2 === 0 ? 1 : -1) * size * 0.08;
            parts += '<line x1="' + cx + '" y1="' + vy + '" x2="' + vx + '" y2="' + (vy - size * 0.03) +
                '" stroke="' + darken(baseColor, 0.15) + '" stroke-width="0.8" opacity="0.4"/>';
        }
        return svgWrap(size, parts);
    }

    // --- PROTEA: large central cone + surrounding bracts ---
    function drawProtea(size, colors) {
        var cx = size / 2, cy = size / 2;
        var baseColor = colors[0] || '#C71585';
        var parts = '';
        // Outer bracts (pointed, stiff)
        var bractCount = randInt(12, 16);
        for (var i = 0; i < bractCount; i++) {
            var angle = (Math.PI * 2 / bractCount) * i + rand(-0.06, 0.06);
            var px = cx + Math.cos(angle) * size * 0.12;
            var py = cy + Math.sin(angle) * size * 0.12;
            var pw = size * 0.05;
            var ph = size * 0.22;
            var rot = (angle * 180 / Math.PI) + 90;
            parts += '<ellipse cx="' + px + '" cy="' + py + '" rx="' + pw + '" ry="' + ph +
                '" fill="' + lighten(baseColor, 0.1) + '" opacity="0.75" transform="rotate(' + rot + ' ' + px + ' ' + py + ')"/>';
        }
        // Central cone
        parts += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.15) + '" fill="' + darken(baseColor, 0.2) + '"/>';
        // Fuzzy texture on cone
        for (var f = 0; f < 15; f++) {
            var fa = rand(0, Math.PI * 2);
            var fr = rand(0, size * 0.12);
            parts += '<circle cx="' + (cx + Math.cos(fa) * fr) + '" cy="' + (cy + Math.sin(fa) * fr) +
                '" r="' + rand(1, 2.5) + '" fill="' + lighten(baseColor, rand(0.2, 0.5)) + '" opacity="0.7"/>';
        }
        return svgWrap(size, parts);
    }

    // --- BIRD OF PARADISE: distinctive asymmetric shape ---
    function drawBirdOfParadise(size, colors) {
        var cx = size / 2, cy = size * 0.55;
        var orange = colors[0] || '#FF8C00';
        var parts = '';
        // Blue/purple inner petals (fan)
        for (var b = 0; b < 3; b++) {
            var ba = -Math.PI * 0.3 + (Math.PI * 0.3 / 2) * b;
            var bx = cx + Math.cos(ba) * size * 0.05;
            var by = cy + Math.sin(ba) * size * 0.05;
            parts += '<ellipse cx="' + bx + '" cy="' + by + '" rx="' + (size * 0.03) + '" ry="' + (size * 0.22) +
                '" fill="#4169E1" opacity="0.8" transform="rotate(' + ((ba * 180 / Math.PI) + 80) + ' ' + bx + ' ' + by + ')"/>';
        }
        // Orange sepals (pointing up and back)
        for (var o = 0; o < 3; o++) {
            var oa = -Math.PI * 0.4 + (Math.PI * 0.4 / 2) * o;
            var ox = cx + Math.cos(oa) * size * 0.08;
            var oy = cy + Math.sin(oa) * size * 0.08;
            parts += '<ellipse cx="' + ox + '" cy="' + oy + '" rx="' + (size * 0.04) + '" ry="' + (size * 0.25) +
                '" fill="' + orange + '" opacity="0.85" transform="rotate(' + ((oa * 180 / Math.PI) + 95) + ' ' + ox + ' ' + oy + ')"/>';
        }
        // Green bract (boat shape)
        parts += '<ellipse cx="' + cx + '" cy="' + (cy + size * 0.08) + '" rx="' + (size * 0.18) + '" ry="' + (size * 0.05) +
            '" fill="#2E8B57" opacity="0.8" transform="rotate(-15 ' + cx + ' ' + (cy + size * 0.08) + ')"/>';
        // Stem
        parts += '<line x1="' + cx + '" y1="' + (cy + size * 0.1) + '" x2="' + (cx - size * 0.05) + '" y2="' + (size * 0.9) +
            '" stroke="#2E8B57" stroke-width="' + (size * 0.025) + '" opacity="0.7"/>';
        return svgWrap(size, parts);
    }

    // -----------------------------------------------------------------
    // Flower name → template mapping
    // -----------------------------------------------------------------

    var TEMPLATE_MAP = {
        // Rose family
        'Rose': drawRose, 'White Rose': drawRose, 'Red Rose': drawRose,
        // Sunflower
        'Sunflower': drawSunflower,
        // Tulip
        'Tulip': drawTulip,
        // Lily family
        'Lily': drawLily, 'Lily of the Valley': drawSimple5Petal, 'Water Lily': drawLily,
        // Daisy family
        'Daisy': drawDaisy, 'Chamomile': drawDaisy,
        // Peony / dense
        'Peony': drawPeony, 'Ranunculus': drawPeony,
        // Orchid
        'Orchid': drawOrchid,
        // Iris
        'Iris': drawIris,
        // Hydrangea
        'Hydrangea': drawHydrangea,
        // Dahlia / Chrysanthemum
        'Dahlia': drawDahlia, 'Chrysanthemum': drawDahlia, 'Aster': drawDahlia,
        // Carnation
        'Carnation': drawCarnation,
        // Lavender
        'Lavender': drawLavender,
        // Protea
        'Protea': drawProtea,
        // Bird of Paradise
        'Bird of Paradise': drawBirdOfParadise,
        // Simple flowers
        'Pansy': drawSimple5Petal, 'Geranium': drawSimple5Petal, 'Jasmine': drawSimple5Petal,
        'Bluebell': drawSimple5Petal, 'Crocus': drawSimple5Petal, 'Moonflower': drawSimple5Petal,
        'Honeysuckle': drawSimple5Petal, 'Sweet Pea': drawSimple5Petal,
        'Daffodil': drawSimple5Petal, 'Hellebore': drawSimple5Petal,
        'Hibiscus': drawSimple5Petal, 'Anemone': drawSimple5Petal,
        'Marigold': drawDahlia, 'Gardenia': drawRose, 'Camellia': drawRose,
        'Night-Blooming Cereus': drawLily, 'Evening Primrose': drawSimple5Petal,
        // Foliage
        'Eucalyptus': drawLeaf, 'Fern': drawLeaf, 'Ivy': drawLeaf
    };

    // -----------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------

    function generateFlower(name, colors, size) {
        size = size || 200;
        colors = colors || ['#E8557A'];
        var drawFn = TEMPLATE_MAP[name] || drawSimple5Petal;
        var svgStr = drawFn(size, colors);
        return toDataUrl(svgStr);
    }

    function generateFlowerImages(flowers) {
        var result = {};
        if (!flowers || flowers.length === 0) return result;
        for (var i = 0; i < flowers.length; i++) {
            var f = flowers[i];
            var name = f.name || 'Rose';
            var colors = f.colors || [f.color || '#E8557A'];
            if (!result[name]) {
                result[name] = generateFlower(name, colors, 200);
            }
        }
        return result;
    }

    // Also handle foliage
    function generateFoliageImages(foliageList) {
        var result = {};
        if (!foliageList) return result;
        for (var i = 0; i < foliageList.length; i++) {
            var f = foliageList[i];
            var fl = f.flower || f;
            var name = fl.common || fl.name || 'Fern';
            var colors = fl.colors || [fl.color || '#228B22'];
            if (!result[name]) {
                result[name] = generateFlower(name, colors, 180);
            }
        }
        return result;
    }

    return {
        generateFlower: generateFlower,
        generateFlowerImages: generateFlowerImages,
        generateFoliageImages: generateFoliageImages
    };

})();
