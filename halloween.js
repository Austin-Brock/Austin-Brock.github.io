/* ============================================================
   HALLOWEEN — seasonal page behaviour
   ============================================================

   Interactive spider hanging off the header, plus the tab-title
   haunting further down.

   Builds a small orb web tucked under the header's bottom edge,
   with a spider on a dragline you can play with:

     hover  — it drops a little and its legs twitch
     drag   — pull it anywhere; the dragline follows
     release— springs back with momentum carried from the drag
     tap    — it scurries up, then settles

   Self-disabling: bails immediately unless <html> carries the
   .halloween class, so removing that class turns this off along
   with halloween.css. Nothing here touches the rest of the page.
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  if (!root.classList.contains('halloween')) return;

  var NS = 'http://www.w3.org/2000/svg';

  var W = 220, H = 420;        /* svg canvas */
  var AX = 110, AY = 0;        /* web anchor, flush with the header edge */
  var WEB_R = 54;              /* web radius */
  var REST_X = AX, REST_Y = 122;

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  /* polar → cartesian, sweeping downward from an arbitrary anchor */
  function pt(ax, ay, a, r) { return [ax - Math.cos(a) * r, ay + Math.sin(a) * r]; }

  /* Spokes fanning out from (ax,ay) across [from,to], plus strands
     sagging back toward the anchor. Used for the spider's web (a half
     circle) and the corner web (a quarter). */
  function buildWeb(ax, ay, radius, from, to) {
    var g = el('g', { 'class': 'hw-web' });
    var SPOKES = 7, ang = [], i;
    for (i = 0; i < SPOKES; i++) ang.push(from + (to - from) * i / (SPOKES - 1));

    ang.forEach(function (a) {
      var p = pt(ax, ay, a, radius);
      g.appendChild(el('line', { x1: ax, y1: ay, x2: p[0].toFixed(2), y2: p[1].toFixed(2) }));
    });

    [0.34, 0.62, 0.9].forEach(function (f) {
      var r = radius * f, d = '';
      for (var j = 0; j < ang.length - 1; j++) {
        var a = pt(ax, ay, ang[j], r);
        var b = pt(ax, ay, ang[j + 1], r);
        var c = pt(ax, ay, (ang[j] + ang[j + 1]) / 2, r * 0.86);
        if (j === 0) d += 'M' + a[0].toFixed(2) + ',' + a[1].toFixed(2);
        d += ' Q' + c[0].toFixed(2) + ',' + c[1].toFixed(2) +
             ' '  + b[0].toFixed(2) + ',' + b[1].toFixed(2);
      }
      g.appendChild(el('path', { d: d }));
    });
    return g;
  }

  /* ── container ──────────────────────────────────────────── */
  var wrap = document.createElement('div');
  wrap.className = 'hw-spider-wrap';
  wrap.setAttribute('aria-hidden', 'true');   /* decorative only */

  var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H });
  wrap.appendChild(svg);

  /* ── the spider's web: a half circle under the header ──── */
  svg.appendChild(buildWeb(AX, AY, WEB_R, 0, Math.PI));

  /* ── dragline ───────────────────────────────────────────── */
  var thread = el('line', { 'class': 'hw-thread', x1: AX, y1: AY, x2: REST_X, y2: REST_Y });
  svg.appendChild(thread);

  /* ── spider ─────────────────────────────────────────────── */
  var spider = el('g', { 'class': 'hw-spider' });

  var legs = el('g', { 'class': 'hw-legs' });
  var LEG = [
    'M-5,-3 C-14,-12 -23,-13 -28,-6 C-30,-3 -30,1 -28,5',
    'M-6,0  C-16,-4  -26,-4  -30,2  C-32,5  -32,10 -30,13',
    'M-6,3  C-16,4   -25,8   -28,14 C-29,17 -28,21 -26,23',
    'M-5,6  C-13,11  -20,16  -22,22 C-23,25 -22,29 -20,31'
  ];
  LEG.forEach(function (d) {
    legs.appendChild(el('path', { d: d }));
    legs.appendChild(el('path', { d: d, transform: 'scale(-1,1)' }));
  });
  spider.appendChild(legs);

  spider.appendChild(el('ellipse', { 'class': 'hw-abdomen', cx: 0, cy: 7, rx: 9, ry: 10.5 }));
  spider.appendChild(el('path',    { 'class': 'hw-mark', d: 'M0,2 L3.2,7 L0,12 L-3.2,7 Z' }));
  spider.appendChild(el('circle',  { 'class': 'hw-head', cx: 0, cy: -4, r: 6 }));
  spider.appendChild(el('circle',  { 'class': 'hw-eye', cx: -2.3, cy: -5.5, r: 1.5 }));
  spider.appendChild(el('circle',  { 'class': 'hw-eye', cx:  2.3, cy: -5.5, r: 1.5 }));
  svg.appendChild(spider);

  /* ── motion ─────────────────────────────────────────────── */
  var x = REST_X, y = REST_Y, vx = 0, vy = 0;
  var dragging = false, hovering = false, travelled = 0;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var t0 = (window.performance && performance.now) ? performance.now() : Date.now();

  function render() {
    spider.setAttribute('transform', 'translate(' + x.toFixed(2) + ',' + y.toFixed(2) + ')');
    thread.setAttribute('x2', x.toFixed(2));
    thread.setAttribute('y2', y.toFixed(2));
  }

  function frame(now) {
    if (!dragging) {
      var still = reduce.matches;
      var sway = still ? 0 : Math.sin((now - t0) * 0.0011) * 11;
      var bob  = still ? 0 : Math.sin((now - t0) * 0.0019) * 3;
      var tx = REST_X + sway;
      var ty = REST_Y + bob + (hovering ? 34 : 0);
      vx += (tx - x) * 0.10;
      vy += (ty - y) * 0.10;
      vx *= 0.86;
      vy *= 0.86;
      x += vx;
      y += vy;
    }
    render();
    requestAnimationFrame(frame);
  }
  render();
  requestAnimationFrame(frame);

  /* ── interaction ────────────────────────────────────────── */
  /* viewBox units per CSS pixel, so any responsive scaling of the
     wrapper still maps the pointer to the right spot */
  function toLocal(e) {
    var r = svg.getBoundingClientRect();
    return [
      clamp((e.clientX - r.left) * (W / r.width),  16, W - 16),
      clamp((e.clientY - r.top)  * (H / r.height), 34, H - 24)
    ];
  }

  spider.addEventListener('pointerdown', function (e) {
    dragging = true;
    travelled = 0;
    wrap.classList.add('is-grabbed');
    if (spider.setPointerCapture) {
      try { spider.setPointerCapture(e.pointerId); } catch (err) { /* older webkit */ }
    }
    e.preventDefault();
  });

  window.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var p = toLocal(e);
    travelled += Math.abs(p[0] - x) + Math.abs(p[1] - y);
    vx = p[0] - x;            /* carry the throw into the spring */
    vy = p[1] - y;
    x = p[0];
    y = p[1];
  });

  function release() {
    if (!dragging) return;
    dragging = false;
    wrap.classList.remove('is-grabbed');
    if (travelled < 6) vy -= 15;      /* a tap, not a drag: scurry up */
  }
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);

  spider.addEventListener('pointerenter', function () {
    hovering = true;
    wrap.classList.add('is-hover');
  });
  spider.addEventListener('pointerleave', function () {
    hovering = false;
    wrap.classList.remove('is-hover');
  });

  /* ── tab-title haunting ─────────────────────────────────── */
  /* look away and the page notices */
  var realTitle = document.title;
  var AWAY = '\uD83D\uDC7B come back\u2026';
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      realTitle = document.title === AWAY ? realTitle : document.title;
      document.title = AWAY;
    } else {
      document.title = realTitle;
    }
  });

  /* ── quote glitch ───────────────────────────────────────── */
  /* Every so often the daily quote briefly corrupts, then resolves.
     The text is re-read at each glitch rather than cached, because
     dailyQuote.js writes it on DOMContentLoaded too and we must not
     restore a stale value. */
  (function haunt() {
    var GLYPHS = '!<>-_\\/[]{}\u2014=+*^?#\u2591\u2592\u2593';
    var node = null;

    function scramble(text, intensity) {
      var out = '';
      for (var i = 0; i < text.length; i++) {
        var c = text.charAt(i);
        out += (c === ' ' || Math.random() > intensity)
          ? c
          : GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
      }
      return out;
    }

    function glitch() {
      node = document.getElementById('quote-text');
      if (!node || reduce.matches) return schedule();

      var truth = node.textContent;
      var steps = 5, i = 0;
      var tick = setInterval(function () {
        i++;
        if (i >= steps) {
          clearInterval(tick);
          node.textContent = truth;        /* always resolve to the real text */
          return schedule();
        }
        node.textContent = scramble(truth, 0.28 * (1 - i / steps));
      }, 55);
    }

    function schedule() {
      setTimeout(glitch, 9000 + Math.random() * 11000);   /* 9-20s apart */
    }
    schedule();
  })();

  /* ── corner web: a quarter, strung into the top-right ───── */
  var CR = 132;                               /* reach into the corner */
  var cornerWrap = document.createElement('div');
  cornerWrap.className = 'hw-corner-web';
  cornerWrap.setAttribute('aria-hidden', 'true');
  var cornerSvg = el('svg', {
    viewBox: '0 0 ' + CR + ' ' + CR, width: CR, height: CR
  });
  /* anchored at its own top-right, sweeping from along-the-top (0) round
     to straight-down (PI/2) so it hugs the corner instead of spilling out */
  cornerSvg.appendChild(buildWeb(CR, 0, CR, 0, Math.PI / 2));
  cornerWrap.appendChild(cornerSvg);

  /* ── mount ──────────────────────────────────────────────── */
  function mount() {
    document.body.appendChild(wrap);
    document.body.appendChild(cornerWrap);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
