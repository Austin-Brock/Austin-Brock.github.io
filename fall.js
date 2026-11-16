/* ============================================================
   FALL — seasonal page behaviour
   ============================================================

     falling leaves — drift down the viewport; sweep the pointer
                      through them and they scatter on the gust
     hanging acorn  — on a thread under the header:
                        hover   — it drops a little
                        drag    — pull it anywhere; the thread follows
                        release — swings back with the throw's momentum
                        tap     — it hops
     corner branch  — the last leaves holding on, top-right
     peeking turkey — hiding behind the about photo
     tab title      — look away and the turkey calls you back

   Self-disabling: bails immediately unless <html> carries the
   .fall class, so removing that class turns this off along with
   fall.css. Nothing here touches the rest of the page.
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  if (!root.classList.contains('fall')) return;

  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function rand(lo, hi) { return lo + Math.random() * (hi - lo); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  /* ── leaves ─────────────────────────────────────────────── */
  /* Both shapes are drawn around (0,0), tip up, with the stem
     ending at (0,14) — so a leaf can be hung by its stem. */
  var COLORS = ['#d9622b', '#e8912d', '#c0392b', '#e0a526', '#a65a2a'];
  var MAPLE = 'M0,-14 L3,-8 L7,-10 L6,-4 L12,-5 L9,0 L13,3 L7,4 L8,9 L2,7 L0,8 ' +
              'L-2,7 L-8,9 L-7,4 L-13,3 L-9,0 L-12,-5 L-6,-4 L-7,-10 L-3,-8 Z';
  var OVAL  = 'M0,-13 C8,-7 8,5 0,10 C-8,5 -8,-7 0,-13 Z';
  var VEIN  = { fill: 'none', stroke: 'rgba(0,0,0,.24)', 'stroke-width': 0.8, 'stroke-linecap': 'round' };
  var STEM  = { fill: 'none', stroke: '#6b4423', 'stroke-width': 1.4, 'stroke-linecap': 'round' };

  function attrs(base, extra) {
    var out = {}, k;
    for (k in base) out[k] = base[k];
    for (k in extra) out[k] = extra[k];
    return out;
  }

  function leaf(kind, color) {
    var g = el('g', {});
    g.appendChild(el('path', attrs(STEM, { d: 'M0,7 L0,14' })));
    if (kind === 'maple') {
      g.appendChild(el('path', {
        d: MAPLE, fill: color, stroke: color, 'stroke-width': 1.2, 'stroke-linejoin': 'round'
      }));
      g.appendChild(el('path', attrs(VEIN, { d: 'M0,8 L0,-9 M0,3 L7,-3 M0,3 L-7,-3' })));
    } else {
      g.appendChild(el('path', { d: OVAL, fill: color }));
      g.appendChild(el('path', attrs(VEIN, { d: 'M0,9 L0,-9 M0,3 L4,-1 M0,3 L-4,-1 M0,-2 L3,-5 M0,-2 L-3,-5' })));
    }
    return g;
  }

  /* a leaf hung by its stem from (x,y), rotated r degrees (180 = straight down) */
  function hung(kind, color, x, y, r, s) {
    var g = leaf(kind, color);
    g.setAttribute('transform',
      'translate(' + x + ',' + y + ') rotate(' + r + ') scale(' + (s || 1) + ') translate(0,-14)');
    return g;
  }

  /* ── falling leaves ─────────────────────────────────────── */
  var leafLayer = null;
  (function falling() {
    if (reduce.matches) return;        /* purely decorative motion */

    leafLayer = document.createElement('div');
    leafLayer.className = 'fl-leaves';
    leafLayer.setAttribute('aria-hidden', 'true');

    var COUNT = window.innerWidth < 600 ? 7 : 13;
    var leaves = [];

    function reset(l, anywhere) {
      l.x = rand(0, window.innerWidth);
      l.y = anywhere ? rand(-40, window.innerHeight) : rand(-120, -30);
      l.fall = rand(24, 52);            /* px / second */
      l.gx = 0; l.gy = 0;               /* gust velocity, decays */
      l.amp = rand(14, 42);
      l.rate = rand(0.5, 1.1);
      l.phase = rand(0, 6.28);
      l.rot = rand(0, 360);
      l.spin = rand(-45, 45);
      l.flip = rand(0, 6.28);
      l.flipRate = rand(0.6, 1.6);
    }

    for (var i = 0; i < COUNT; i++) {
      var size = Math.round(rand(16, 28));
      var node = document.createElement('div');
      node.className = 'fl-leaf';
      node.style.opacity = rand(0.6, 0.9).toFixed(2);
      var s = el('svg', { viewBox: '-16 -16 32 32', width: size, height: size });
      s.appendChild(leaf(Math.random() < 0.6 ? 'maple' : 'oval', pick(COLORS)));
      node.appendChild(s);
      leafLayer.appendChild(node);
      var l = { node: node, half: size / 2 };
      reset(l, true);
      leaves.push(l);
    }

    /* the pointer drags a little gust of air behind it */
    var lastX = null, lastY = null;
    window.addEventListener('pointermove', function (e) {
      if (lastX !== null) {
        var mx = e.clientX - lastX, my = e.clientY - lastY;
        for (var j = 0; j < leaves.length; j++) {
          var q = leaves[j];
          var dx = q.x - e.clientX, dy = q.y - e.clientY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            var f = (1 - dist / 120) * 7;
            q.gx = clamp(q.gx + mx * f, -460, 460);
            q.gy = clamp(q.gy + my * f, -460, 460);
          }
        }
      }
      lastX = e.clientX;
      lastY = e.clientY;
    }, { passive: true });

    var last = null;
    function frame(now) {
      var dt = last === null ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      var t = now / 1000;
      var decay = Math.max(0, 1 - 2.4 * dt);

      for (var j = 0; j < leaves.length; j++) {
        var q = leaves[j];
        q.x += q.gx * dt;
        q.y += (q.fall + q.gy) * dt;
        q.gx *= decay;
        q.gy *= decay;
        q.rot += (q.spin + q.gx * 0.8) * dt;

        if (q.y > window.innerHeight + 40 || q.x < -80 || q.x > window.innerWidth + 80) {
          reset(q, false);
        }

        var sway = Math.sin(t * q.rate + q.phase) * q.amp;
        var flip = Math.cos(t * q.flipRate + q.flip);
        q.node.style.transform =
          'translate3d(' + (q.x + sway - q.half).toFixed(1) + 'px,' + (q.y - q.half).toFixed(1) + 'px,0) ' +
          'rotate(' + q.rot.toFixed(1) + 'deg) scaleX(' + (0.35 + 0.65 * Math.abs(flip)).toFixed(2) + ')';
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  /* ── hanging acorn ──────────────────────────────────────── */
  var W = 220, H = 420;        /* svg canvas */
  var AX = 110, AY = 0;        /* anchor, flush with the header edge */
  var REST_X = AX, REST_Y = 108;
  var TOP = 11;                /* acorn origin → top of its stem */

  var wrap = document.createElement('div');
  wrap.className = 'fl-acorn-wrap';
  wrap.setAttribute('aria-hidden', 'true');   /* decorative only */

  var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H });
  wrap.appendChild(svg);

  /* a stub of twig under the header, with two oak leaves */
  svg.appendChild(el('path', { 'class': 'fl-twig', d: 'M' + (AX - 26) + ',0 C' + (AX - 12) + ',5 ' + (AX + 12) + ',5 ' + (AX + 26) + ',0' }));
  svg.appendChild(hung('oval', '#c0392b', AX - 14, 3, 140, 1.25));
  svg.appendChild(hung('oval', '#e0a526', AX + 15, 3, 215, 1.1));

  var thread = el('line', { 'class': 'fl-thread', x1: AX, y1: AY + 3, x2: REST_X, y2: REST_Y - TOP });
  svg.appendChild(thread);

  var acorn = el('g', { 'class': 'fl-acorn' });
  var acornBody = el('g', {});
  acornBody.appendChild(el('line', { 'class': 'fl-acorn-stem', x1: 0, y1: -8, x2: 0, y2: -TOP }));
  acornBody.appendChild(el('path', { 'class': 'fl-acorn-nut', d: 'M-9,0 C-9,13 -4,19 0,22 C4,19 9,13 9,0 Z' }));
  acornBody.appendChild(el('ellipse', { 'class': 'fl-acorn-shine', cx: -4, cy: 7, rx: 1.8, ry: 4.2 }));
  acornBody.appendChild(el('path', { 'class': 'fl-acorn-cap', d: 'M-11,2 C-11,-11 11,-11 11,2 Z' }));
  acornBody.appendChild(el('path', { 'class': 'fl-acorn-hatch', d: 'M-8,-3 L-3,2 M-3,-6 L5,2 M4,-6 L9,-1 M8,-3 L3,2 M3,-6 L-5,2 M-4,-6 L-9,-1' }));
  /* an invisible, larger hit area so it is easy to grab on touch */
  acornBody.appendChild(el('circle', { cx: 0, cy: 6, r: 20, fill: 'transparent' }));
  acorn.appendChild(acornBody);
  svg.appendChild(acorn);

  var x = REST_X, y = REST_Y, vx = 0, vy = 0;
  var dragging = false, hovering = false, travelled = 0;
  var t0 = (window.performance && performance.now) ? performance.now() : Date.now();

  function render() {
    /* lean into the swing: tilt along the line back to the anchor */
    var tilt = clamp(Math.atan2(AX - x, y - AY) * 180 / Math.PI, -60, 60);
    acorn.setAttribute('transform', 'translate(' + x.toFixed(2) + ',' + y.toFixed(2) + ')');
    acornBody.setAttribute('transform', 'rotate(' + tilt.toFixed(2) + ')');
    var rad = tilt * Math.PI / 180;
    thread.setAttribute('x2', (x + Math.sin(rad) * TOP).toFixed(2));
    thread.setAttribute('y2', (y - Math.cos(rad) * TOP).toFixed(2));
  }

  function frame(now) {
    if (!dragging) {
      var still = reduce.matches;
      var sway = still ? 0 : Math.sin((now - t0) * 0.0011) * 13;
      var bob  = still ? 0 : Math.sin((now - t0) * 0.0019) * 2;
      var tx = REST_X + sway;
      var ty = REST_Y + bob + (hovering ? 30 : 0);
      vx += (tx - x) * 0.10;
      vy += (ty - y) * 0.10;
      vx *= 0.88;
      vy *= 0.88;
      x += vx;
      y += vy;
    }
    render();
    requestAnimationFrame(frame);
  }
  render();
  requestAnimationFrame(frame);

  /* viewBox units per CSS pixel, so any responsive scaling of the
     wrapper still maps the pointer to the right spot */
  function toLocal(e) {
    var r = svg.getBoundingClientRect();
    return [
      clamp((e.clientX - r.left) * (W / r.width),  16, W - 16),
      clamp((e.clientY - r.top)  * (H / r.height), 30, H - 26)
    ];
  }

  acorn.addEventListener('pointerdown', function (e) {
    dragging = true;
    travelled = 0;
    wrap.classList.add('is-grabbed');
    if (acorn.setPointerCapture) {
      try { acorn.setPointerCapture(e.pointerId); } catch (err) { /* older webkit */ }
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
    if (travelled < 6) vy -= 15;      /* a tap, not a drag: hop */
  }
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);

  acorn.addEventListener('pointerenter', function () {
    hovering = true;
    wrap.classList.add('is-hover');
  });
  acorn.addEventListener('pointerleave', function () {
    hovering = false;
    wrap.classList.remove('is-hover');
  });

  /* ── tab title ──────────────────────────────────────────── */
  var realTitle = document.title;
  var AWAY = '🦃 gobble gobble…';
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      realTitle = document.title === AWAY ? realTitle : document.title;
      document.title = AWAY;
    } else {
      document.title = realTitle;
    }
  });

  /* ── turkey peeking over the about photo ────────────────── */
  function peeker() {
    var holder = document.querySelector('.about-img-wrap');
    if (!holder) return;

    var t = document.createElement('div');
    t.className = 'fl-turkey';
    t.setAttribute('aria-hidden', 'true');

    var ts = el('svg', { viewBox: '0 0 64 64', width: 104, height: 104 });
    [[-66, 24, 14, '#c0392b'], [66, 24, 14, '#c0392b'],
     [-34, 22, 15, '#e67e22'], [34, 22, 15, '#e67e22'],
     [0, 21, 16, '#f1c40f']].forEach(function (f) {
      ts.appendChild(el('ellipse', {
        cx: 32, cy: f[1], rx: 6.5, ry: f[2], fill: f[3],
        transform: 'rotate(' + f[0] + ' 32 44)'
      }));
    });
    ts.appendChild(el('ellipse', { cx: 32, cy: 45, rx: 15, ry: 14, fill: '#7a4a21' }));
    ts.appendChild(el('circle',  { cx: 32, cy: 29, r: 8.5, fill: '#93602f' }));
    ts.appendChild(el('circle',  { cx: 28.6, cy: 27, r: 1.7, fill: '#1a0e05' }));
    ts.appendChild(el('circle',  { cx: 35.4, cy: 27, r: 1.7, fill: '#1a0e05' }));
    ts.appendChild(el('path',    { d: 'M29 30.5h6l-3 5z', fill: '#f5b301' }));
    ts.appendChild(el('path',    { d: 'M33.5 33c2.6 1 3 4.5 1.4 7-1.8-1.2-2.6-4-1.4-7z', fill: '#d62828' }));
    t.appendChild(ts);

    holder.appendChild(t);
  }

  /* ── corner branch: reaching in from the top-right ──────── */
  var BW = 190, BH = 130;
  var branch = document.createElement('div');
  branch.className = 'fl-branch';
  branch.setAttribute('aria-hidden', 'true');
  var bs = el('svg', { viewBox: '0 0 ' + BW + ' ' + BH, width: BW, height: BH });
  bs.appendChild(el('path', { 'class': 'fl-branch-wood', 'stroke-width': 4.5, d: 'M194,2 C160,8 126,20 98,42 C82,55 68,64 50,70' }));
  bs.appendChild(el('path', { 'class': 'fl-branch-wood', 'stroke-width': 2.6, d: 'M134,19 C128,32 124,42 122,54' }));
  bs.appendChild(el('path', { 'class': 'fl-branch-wood', 'stroke-width': 2.4, d: 'M100,41 C90,36 78,35 66,38' }));
  bs.appendChild(el('path', { 'class': 'fl-branch-wood', 'stroke-width': 2.2, d: 'M164,8 C162,16 162,22 164,30' }));
  bs.appendChild(hung('maple', '#d9622b', 50, 70, 235, 1.7));
  bs.appendChild(hung('maple', '#e0a526', 122, 54, 185, 1.5));
  bs.appendChild(hung('maple', '#c0392b', 66, 38, 290, 1.35));
  bs.appendChild(hung('oval',  '#e8912d', 164, 30, 170, 1.3));
  bs.appendChild(hung('oval',  '#a65a2a', 84, 53, 200, 1.2));
  branch.appendChild(bs);

  /* ── mount ──────────────────────────────────────────────── */
  function mount() {
    if (leafLayer) document.body.appendChild(leafLayer);
    document.body.appendChild(branch);
    document.body.appendChild(wrap);
    peeker();               /* needs the about section in the DOM */
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
