/* The IMIN beat strip, animated: "Neon Unfold Flicker" from the beat gallery (imin-beat-core.js), cut down to the
   one animation the site uses. The wordmark snaps together and unfolds into the full row as its M and N tubes switch
   on like neon, holds for two bars while random tubes blaze and flicker, then the tubes flick off and the copies fold
   back in: a 16-beat loop at 100 BPM. Drawing code is the gallery's (unused helpers dropped); only the wiring at the end is new.
   Every [data-beat] gets a canvas; strips draw only while on screen, and reduced motion gets one still frame. */
(function () {
  var BPM = 100, FILL = 0.7;          // the gallery hero's tempo and stroke size (share of the strip's height)
  var CLOCK = { beatPos: 0, bpm: BPM }; // stands in for the gallery's audio engine: a steady beat, no sound
  var HOLD_B = 8, reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (err) {}

  var C = {P:'#F4EFE7', H:'#9C8CFF', D:'#16B877'};
  // [xTop, xBottom, colour, letter, kind]
  var BAR = [
    [4,4,C.P,'I','v'],[15,15,C.H,'M','v'],[26,39,C.H,'M','d'],[64,50,C.H,'M','d'],[74,74,C.H,'M','v'],
    [85,85,C.P,'I2','v'],[95,95,C.D,'N','v'],[106,123,C.D,'N','d'],[134,134,C.D,'N','v']
  ];
  var BW=141, GH=58, SW=7;
  // layout(w,h,opts) -> strokes positioned in canvas px. opts: {height (px, default h*0.5), cy (centre y), bars (force count), pad}
  function layout(w,h,o){
    o=o||{}; var H=o.height||Math.round(h*(FILL||0.5)), k=H/GH, bw=BW*k, sw=SW*k;
    var n=o.bars||Math.ceil(w/bw)+1, cy=o.cy==null?h/2:o.cy, top=cy-H/2, bot=cy+H/2, out=[], i=0;
    var x0=o.x0==null?0:o.x0;
    for(var b=0;b<n;b++){ for(var s=0;s<BAR.length;s++){ var d=BAR[s];
      out.push({i:i++, bar:b, slot:s, xt:x0+(b*BW+d[0])*k, xb:x0+(b*BW+d[1])*k, top:top, bot:bot,
        color:d[2], letter:d[3], kind:d[4], lean:d[4]==='d'?(d[1]>d[0]?-1:1):0, w:sw}); } }
    out.k=k; out.H=H; out.sw=sw; out.barW=bw; out.count=i; return out;
  }
  // stroke(ctx,x1,y1,x2,y2,width,colour,alpha) — round-capped line
  function stroke(ctx,x1,y1,x2,y2,w,c,a){
    ctx.save(); if(a!=null) ctx.globalAlpha=a; ctx.strokeStyle=c; ctx.lineWidth=w; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.restore();
  }
  function clear(ctx,w,h){ ctx.clearRect(0,0,w,h); }

  function cl(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }
  function seg(t, a, d){ return cl((t - a) / d); }
  function p1io(u){ return u < .5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u); }
  function expoIO(u){ return u <= 0 ? 0 : u >= 1 ? 1 : u < .5 ? Math.pow(2, 20 * u - 10) / 2 : (2 - Math.pow(2, -20 * u + 10)) / 2; }
  function expoO(u){ return u >= 1 ? 1 : 1 - Math.pow(2, -10 * u); }
  function expoI(u){ return u <= 0 ? 0 : Math.pow(2, 10 * u - 10); }
  // beat position inside the 16-beat cycle, 0 <= b < 16
  function beat(S){
    if (reduce) return HOLD_B;
    var a = S.audio || CLOCK, p = a && a.beatPos || 0, r = p % 8;
    if (r < 0) r += 8;
    // real 8-beat loop mapped onto the 16-beat score: build 0-4 as is, the 9-beat hold squeezed into 1 beat, out 13-16 as is
    return r < 4 ? r : r < 5 ? 4 + (r - 4) * 9 : r + 8;
  }
  // the gallery also draws cards; the site only ever draws the hero strip
  function isHero(){ return true; }
  function bpos(S){ var a = S.audio || CLOCK; return a && a.beatPos || 0; }
  function bpmOf(S){ var a = S.audio || CLOCK; return a && a.bpm || 80; }

  // Wordmark Unfold: the airy wordmark snaps together, copies unfold to both sides, then fold back in
  var WU = ({
    init: function(st, w, h){
      var hero = isHero(), H = Math.round(h * (hero ? FILL : 0.5)), k = H / 58, bw = 141 * k, n = Math.ceil(w / bw) + 2;
      if (n % 2 === 0) n++;
      st.x0 = w / 2 - n * bw / 2;
      st.L = layout(w, h, {bars: n, x0: st.x0});
      st.n = n; st.c = (n - 1) / 2; st.bw = bw; st.k = k;
      // 2.4x where the frame allows; fit stroke plus round caps with a margin, and the airy width
      st.s0 = Math.max(1, Math.min(hero ? 1.15 : 2.4, 0.84 * h / (H + 7 * k), 0.9 * w / (156 * k)));
      st.hero = hero;
      st.maxDu = Math.max(1, st.c);
      st.stg = Math.min(0.15, 0.6 / Math.max(1, st.maxDu - 1)); // beats between rings of copies
    },
    draw: function(ctx, S){
      clear(ctx, S.w, S.h);
      var st = S.st, L = st.L, b = beat(S), k = st.k, cx = S.w / 2, cy = S.h / 2, hero = st.hero;
      // hero: copies start sooner and fold later, and reveal in place so spacing never goes uneven
      var cIn = hero ? 0.75 : 1.25, cOut = hero ? 14 : 13;
      // centre unit: airy -> snapped over beats 0-1.5, snapped -> airy over 14.5-15.75
      var e = expoIO(seg(b, 0, 1.5)) * (1 - expoIO(seg(b, 14.5, 1.25)));
      var sc = st.s0 + (1 - st.s0) * e, gapF = 1.6 + (1 - 1.6) * e;
      var LET = {I: 0, M: 1, I2: 2, N: 3}, gap = 10.5 * k;
      // boundary between bar j-1 and j sits mid-gap; each copy is clipped to its own side of the
      // bar inside it, so it slides out from (and back under) that bar without overlapping another
      function bx(j){ return cx + (st.x0 + (j * 141 - 1.5) * k - cx) * sc; }
      for (var i = 0; i < L.length; i++) {
        var s = L[i], du = s.bar - st.c, dx = 0, clipped = false, revealP = 1;
        if (du === 0) dx = (gapF - 1) * gap * (LET[s.letter] - 1.5);
        else {
          var ring = Math.abs(du);
          var p = expoO(seg(b, cIn + st.stg * (ring - 1), 1)) * (1 - expoI(seg(b, cOut + st.stg * (st.maxDu - ring), 0.9)));
          if (p <= 0.002) continue;
          if (hero) { revealP = p; }
          else dx = -Math.sign(du) * st.bw * (1 - p);
          if (p < 1 && !hero) {
            clipped = true; ctx.save(); ctx.beginPath();
            if (du > 0) ctx.rect(bx(s.bar), 0, S.w - bx(s.bar) + 1, S.h);
            else ctx.rect(0, 0, bx(s.bar + 1), S.h);
            ctx.clip();
          }
        }
        var x1 = cx + (s.xt + dx - cx) * sc, x2 = cx + (s.xb + dx - cx) * sc;
        var y1 = cy + (s.top - cy) * sc, y2 = cy + (s.bot - cy) * sc;
        var al = hero && s.letter === 'N' ? 0.85 : 1; // hero: the I'M IN button stays the loudest green
        if (revealP < 1) { // grow from the centre line (never below 40% length) while fading in, so no cap dot shows
          var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, q = 0.4 + 0.6 * revealP;
          x1 = mx + (x1 - mx) * q; x2 = mx + (x2 - mx) * q; y1 = my + (y1 - my) * q; y2 = my + (y2 - my) * q;
          al *= cl((revealP - 0.05) * 2);
          if (al <= 0.01) continue;
        }
        if (st.neon && (s.letter === 'M' || s.letter === 'N')) neonTube(ctx, S, st, i, du, b, x1, y1, x2, y2, s.w * sc, s.color, al, cIn, cOut);
        else stroke(ctx, x1, y1, x2, y2, s.w * sc, s.color, al);
        if (clipped) ctx.restore();
      }
    }
  });

  // 3b. Neon Unfold: Wordmark Unfold where the M and N are neon tubes that switch on as each copy slides out
  var IGNITE = [[0, 0.3], [0.12, 0.75], [0.16, 0.3], [0.27, 1], [0.31, 0.35], [0.40, 1]], REST_A = 0.85, REST_G = 0.2;
  function stepAt(tr, t){ var v = tr[0][1]; for (var i = 0; i < tr.length; i++) { if (tr[i][0] <= t) v = tr[i][1]; else break; } return v; }
  // [opacity, glow] of a tube t seconds after it switches on: sparks, blazes, settles to a low hum
  function ignite(t){
    if (t < 0) return [0.3, 0];
    if (t < 0.4) { var o = stepAt(IGNITE, t); return [o, o * 0.4]; }
    if (t < 1.8) return [1, p1io(Math.min(1, (t - 0.4) / 0.3))];
    if (t < 2.6) { var e = p1io((t - 1.8) / 0.8); return [1 + (REST_A - 1) * e, 1 + (REST_G - 1) * e]; }
    return [REST_A, REST_G];
  }
  function neonTube(ctx, S, st, i, du, b, x1, y1, x2, y2, w, c, al, cIn, cOut){
    var ring = Math.abs(du), sec = 60 / bpmOf(S), jit = st.jit[i] || 0;
    var on = du === 0 ? 1.2 : cIn + st.stg * (ring - 1), off = du === 0 ? 14.4 : cOut + st.stg * (st.maxDu - ring) - 0.3;
    var og = ignite((b - on - jit) * sec);
    if (st.rand) og = randomTube(st, i, og, sec);
    if (b > off) { var f = stepAt(IGNITE, Math.max(0, 0.4 - (b - off) * sec)); og = [Math.min(og[0], f), Math.min(og[1], f * 0.4)]; }
    if (og[1] > 0.01) { // halo pass, then the sharp tube on top
      ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = Math.max(6, w * 2.2) * og[1];
      stroke(ctx, x1, y1, x2, y2, w, c, al * 0.6 * og[1]); ctx.restore();
    }
    stroke(ctx, x1, y1, x2, y2, w, c, al * og[0]);
  }
  // Neon Door's random life during the hold: per bar and letter, a seeded roll each loop picks a tube that blazes on or flickers
  var FLICK = [[0, 1], [0.03, 0.3], [0.07, 1], [0.12, 0.45], [0.17, 1], [0.5, 0.25], [0.55, 1], [0.6, 1]];
  function hash(n){ n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n ^= n >>> 4; n = Math.imul(n, 0x27d4eb2d); n ^= n >>> 15; return (n >>> 0) / 4294967296; }
  function randomTube(st, i, og, sec){
    var s = st.L[i], r = st.r16; if (reduce || r < 4 || r > 13) return og;
    var key = st.loop * 7919 + s.bar * 31 + (s.letter === 'N' ? 1 : 0), roll = hash(key), t0 = 4.3 + hash(key + 101) * 7.5, t = (r - t0) * sec;
    if (t < 0) return og;
    if (roll < 0.28) { if (t < 0.4) { var o = stepAt(IGNITE, t); return [o, o * 0.4]; } if (t < 1.4) return [1, 1]; if (t < 2.2) { var e = p1io((t - 1.4) / 0.8); return [1 + (REST_A - 1) * e, 1 + (REST_G - 1) * e]; } return og; }
    if (roll < 0.5 && t < 0.6) { var f = stepAt(FLICK, t); return [f, f]; }
    return og;
  }

  // Neon Unfold Flicker: the same unfold on a 16-beat loop, with a hold where random tubes blaze and flicker
  var FLICKER = ({
    init: function(st, w, h){
      WU.init(st, w, h); st.neon = true; st.rand = true; st.A2 = {}; st.S2 = {};
      var a = 7; st.jit = st.L.map(function(){ a = (a * 16807) % 2147483647; return (a / 2147483647) * 0.25; });
    },
    draw: function(ctx, S){
      // real 16-beat loop: build 0-4, hold 4-13 (the score's single hold beat stretched), out 13-16
      var st = S.st, p = bpos(S), r = ((p % 16) + 16) % 16, A = st.A2, S2 = st.S2;
      st.r16 = r; st.loop = Math.floor(p / 16);
      A.beatPos = r < 4 ? r : r < 13 ? 4 + (r - 4) / 9 : r - 8; A.bpm = bpmOf(S);
      for (var k in S) S2[k] = S[k];
      S2.audio = A; WU.draw(ctx, S2);
    }
  });

  var strips = [], raf = 0, last = null;
  function draw(s) {
    var d = Math.min(window.devicePixelRatio || 1, 2), w = s.cv.clientWidth, h = s.cv.clientHeight;
    if (!w || !h) return;
    if (s.cv.width !== Math.round(w * d) || s.cv.height !== Math.round(h * d)) { s.cv.width = Math.round(w * d); s.cv.height = Math.round(h * d); }
    if (w !== s.w || h !== s.h) { s.st = {}; FLICKER.init(s.st, w, h); s.w = w; s.h = h; }
    s.ctx.setTransform(d, 0, 0, d, 0, 0);
    FLICKER.draw(s.ctx, { w: w, h: h, audio: CLOCK, st: s.st });
  }
  function tick(now) {
    var t = now / 1000, dt = last == null ? 0 : Math.max(0, Math.min(0.1, t - last));
    last = t; CLOCK.beatPos += dt * BPM / 60;
    var any = false;
    strips.forEach(function (s) { if (s.on) { any = true; draw(s); } });
    raf = any ? requestAnimationFrame(tick) : 0;
    if (!any) last = null;
  }
  function wake() { if (!raf && !reduce) raf = requestAnimationFrame(tick); }

  Array.prototype.forEach.call(document.querySelectorAll('[data-beat]'), function (el) {
    var cv = document.createElement('canvas');
    el.replaceChildren(cv);
    var s = { el: el, cv: cv, ctx: cv.getContext('2d'), st: {}, w: 0, h: 0, on: !('IntersectionObserver' in window) };
    strips.push(s);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { s.on = es[0].isIntersecting; if (s.on) { if (reduce) draw(s); else wake(); } }).observe(el);
  });
  // the hold of the loop, still: every tube lit at rest
  if (reduce) { CLOCK.beatPos = 8; strips.forEach(draw); }
  else wake();
  var rz;
  addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { strips.forEach(function (s) { s.w = 0; if (reduce || !raf) draw(s); }); }, 150); });
})();
