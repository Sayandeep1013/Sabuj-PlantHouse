/* ------------------------------------------------------------------
   Procedural plant illustrations (inline SVG). Each product carries an
   `art` spec; Art.render(spec, opts) returns an <svg> string.
   Seeded by product id so a plant always looks the same.
------------------------------------------------------------------- */
(function () {
  let uid = 0;
  const P = (n) => +n.toFixed(1);
  const rad = (d) => d * Math.PI / 180;

  function hash(str) { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    let a = hash(seed) || 1;
    const r = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    r.range = (lo, hi) => lo + r() * (hi - lo);
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    return r;
  }
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = (c) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
    return "#" + ((1 << 24) | (f(r) << 16) | (f(g) << 8) | f(b)).toString(16).slice(1);
  }

  /* ---- shape primitives: all point "up" (-y) from origin ---- */
  const leafPath = (l, w) => `M0 0Q${P(w)} ${P(-l * .45)} 0 ${P(-l)}Q${P(-w)} ${P(-l * .45)} 0 0Z`;
  const fatLeaf = (l, w) => `M0 0C${P(w * 1.1)} ${P(-l * .3)} ${P(w * .8)} ${P(-l * .9)} 0 ${P(-l)}C${P(-w * .8)} ${P(-l * .9)} ${P(-w * 1.1)} ${P(-l * .3)} 0 0Z`;
  const heartLeaf = (l, w) => `M0 0C${P(w)} ${P(-l * .1)} ${P(w * .9)} ${P(-l * .7)} 0 ${P(-l)}C${P(-w * .9)} ${P(-l * .7)} ${P(-w)} ${P(-l * .1)} 0 0Z`;
  const at = (x, y, rot, inner, extra = "") => `<g transform="translate(${P(x)} ${P(y)}) rotate(${P(rot)})" ${extra}>${inner}</g>`;
  const quad = (p0, c, p1, t) => {
    const u = 1 - t;
    return {
      x: u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
      y: u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1],
      a: Math.atan2(2 * u * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1]), 2 * u * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0])) * 180 / Math.PI
    };
  };

  /* ---- pots ---- */
  function pot(hex, shape, pattern, id) {
    const dark = shade(hex, -.28), light = shade(hex, .14);
    const grad = `<linearGradient id="pg${id}" x1="0" x2="1"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${hex}"/><stop offset="1" stop-color="${shade(hex, -.16)}"/></linearGradient>`;
    if (shape === "shallow") {
      return grad + `<path d="M42 178L158 178L152 206Q151 209 147 209L53 209Q49 209 48 206Z" fill="url(#pg${id})"/>
        <rect x="36" y="169" width="128" height="10" rx="3" fill="${light}"/>
        <ellipse cx="100" cy="171" rx="59" ry="2.6" fill="#4A3426"/>
        <rect x="58" y="204" width="10" height="7" rx="2" fill="${dark}"/><rect x="132" y="204" width="10" height="7" rx="2" fill="${dark}"/>`;
    }
    let pat = "";
    if (pattern === "dots") for (let i = 0; i < 4; i++) for (let j = 0; j < 7; j++) pat += `<circle cx="${70 + j * 10 + (i % 2) * 5 - i * 1.2}" cy="${172 + i * 11}" r="1.6" fill="${light}" opacity=".7"/>`;
    if (pattern === "band") pat = `<path d="M60 172L140 172L139 178L61 178Z" fill="${dark}" opacity=".35"/>`;
    return grad + `<path d="M58 160L142 160L133 211Q132 215 128 215L72 215Q68 215 67 211Z" fill="url(#pg${id})"/>${pat}
      <rect x="58" y="161" width="84" height="3.5" fill="${dark}" opacity=".35"/>
      <rect x="52" y="147" width="96" height="15" rx="4" fill="${light}"/>
      <rect x="52" y="157" width="96" height="5" rx="2" fill="${hex}" opacity=".6"/>
      <ellipse cx="100" cy="149" rx="43" ry="3.4" fill="#4A3426"/>`;
  }
  function glass(id) {
    let peb = "";
    const cols = ["#E9E4DA", "#C9C2B6", "#A39C90", "#F2EEE6", "#8F887C"];
    for (let i = 0; i < 14; i++) peb += `<ellipse cx="${76 + (i * 37) % 48}" cy="${206 - (i % 3) * 4}" rx="${4 + (i % 3)}" ry="3.2" fill="${cols[i % 5]}"/>`;
    return `<rect x="70" y="124" width="60" height="91" rx="11" fill="#CFE6EA" opacity=".28" stroke="#9CC4CC" stroke-width="1.5"/>
      <rect x="72" y="150" width="56" height="63" rx="9" fill="#8FC8D6" opacity=".32"/>${peb}
      <path d="M76 132L76 200" stroke="#fff" stroke-width="3" opacity=".45" stroke-linecap="round"/>`;
  }

  /* ---- plants: each returns {back, front, shape} ---- */
  const T = {};

  T.snake = (r, a) => {
    let s = ""; const n = 7, c = a.leaf;
    for (let i = 0; i < n; i++) {
      const x = 100 + (i - (n - 1) / 2) * 8 + r.range(-3, 3), h = r.range(72, 120), w = r.range(8, 11), rot = (x - 100) * .45 + r.range(-4, 4);
      let bands = "";
      for (let y = 12; y < h - 12; y += r.range(9, 14)) bands += `<path d="M${P(-w * .75)} ${P(-y)}Q0 ${P(-y - 4)} ${P(w * .75)} ${P(-y)}" stroke="${shade(c, -.35)}" stroke-width="2" fill="none" opacity=".45"/>`;
      s += at(x, 152, rot, `<path d="M${-w} 0C${-w} ${P(-h * .6)} ${P(-w * .3)} ${P(-h * .9)} 0 ${P(-h)}C${P(w * .3)} ${P(-h * .9)} ${w} ${P(-h * .6)} ${w} 0Z" fill="${i % 2 ? c : shade(c, .08)}" stroke="${a.edge || "#D8C65A"}" stroke-width="2"/>${bands}`);
    }
    return { back: s };
  };

  T.monstera = (r, a) => {
    let stems = "", leaves = ""; const c = a.leaf;
    const angs = [-62, -36, -12, 12, 36, 62];
    angs.forEach((ang, i) => {
      const reach = r.range(62, 92) * (i === 2 || i === 3 ? 1.08 : .9);
      const bx = 100 + Math.sin(rad(ang)) * reach * .75, by = 150 - Math.cos(rad(ang)) * reach;
      stems += `<path d="M${P(100 + ang * .08)} 150Q${P(100 + (bx - 100) * .25)} ${P(by + 35)} ${P(bx)} ${P(by)}" stroke="${shade(c, -.15)}" stroke-width="3" fill="none"/>`;
      const l = r.range(44, 56), w = l * .62, col = i % 2 ? c : shade(c, .07);
      let slits = "";
      [.34, .52, .7].forEach(k => [-1, 1].forEach(sd => {
        slits += `<path d="M${P(sd * w * .38)} ${P(-l * k)}L${P(sd * w * 1.05)} ${P(-l * (k - .1))}" style="stroke:var(--tile,#F4EFE3)" stroke-width="2.6" stroke-linecap="round"/>`;
      }));
      const leaf = `<path d="M0 0C${P(w * .5)} 4 ${P(w * 1.05)} ${P(-l * .25)} ${P(w * .9)} ${P(-l * .55)}C${P(w * .75)} ${P(-l * .85)} ${P(w * .25)} ${P(-l)} 0 ${P(-l)}C${P(-w * .25)} ${P(-l)} ${P(-w * .75)} ${P(-l * .85)} ${P(-w * .9)} ${P(-l * .55)}C${P(-w * 1.05)} ${P(-l * .25)} ${P(-w * .5)} 4 0 0Z" fill="${col}"/>
        <path d="M0 0L0 ${P(-l * .92)}" stroke="${shade(c, .3)}" stroke-width="1.2" opacity=".7"/>${slits}`;
      leaves += at(bx, by, ang * 1.15 + r.range(-6, 6), leaf);
    });
    return { back: stems + leaves };
  };

  T.pothos = (r, a) => {
    const c = a.leaf, v = a.variegate || shade(c, .4);
    const hl = (l, w, col) => `<path d="${heartLeaf(l, w)}" fill="${col}"/><path d="M0 ${P(-l * .15)}Q${P(w * .45)} ${P(-l * .5)} ${P(w * .1)} ${P(-l * .82)}" stroke="${v}" stroke-width="1.8" fill="none" opacity=".8" stroke-linecap="round"/>`;
    let back = "", front = "";
    [-55, -25, 0, 22, 50].forEach(ang => back += at(100 + ang * .35, 148, ang + r.range(-8, 8), hl(r.range(24, 32), 12, r() > .5 ? c : shade(c, .08))));
    const vines = [[[66, 150], [34, 168], [46, 212]], [[134, 150], [168, 166], [156, 206]], [[112, 150], [126, 175], [118, 190]]];
    vines.forEach(([p0, cp, p1], vi) => {
      front += `<path d="M${p0[0]} ${p0[1]}Q${cp[0]} ${cp[1]} ${p1[0]} ${p1[1]}" stroke="${shade(c, -.2)}" stroke-width="1.6" fill="none"/>`;
      const steps = vi === 2 ? [.45, .8, 1] : [.18, .36, .54, .72, .88, 1];
      steps.forEach((t, k) => {
        const q = quad(p0, cp, p1, t), side = k % 2 ? 1 : -1;
        front += at(q.x, q.y, q.a + 90 + side * 55 + 180 * (vi === 1 ? 0 : 0), hl(r.range(13, 18), 7.5, k % 2 ? c : shade(c, .1)));
      });
    });
    return { back, front };
  };

  function frond(r, p0, cp, p1, len, color, step, sweep) {
    let s = `<path d="M${p0[0]} ${p0[1]}Q${P(cp[0])} ${P(cp[1])} ${P(p1[0])} ${P(p1[1])}" stroke="${shade(color, -.2)}" stroke-width="1.6" fill="none"/>`;
    for (let t = .14; t <= 1; t += step) {
      const q = quad(p0, cp, p1, t), L = len * (.35 + .75 * Math.sin(Math.PI * Math.min(t, .95)));
      [-1, 1].forEach(sd => s += at(q.x, q.y, q.a + 90 + sd * sweep, `<path d="${leafPath(L, L * .16)}" fill="${sd > 0 ? color : shade(color, -.08)}"/>`));
    }
    return s;
  }
  T.palm = (r, a) => {
    let s = ""; const c = a.leaf;
    [[-70, 70], [-40, 28], [-12, 12], [14, 18], [42, 30], [72, 74]].forEach(([dx, y]) => {
      const p1 = [100 + dx, y + r.range(-6, 6) + 20], cp = [100 + dx * .2, 40 + r.range(-10, 10)];
      s += frond(r, [100, 150], cp, p1, r.range(20, 26), r() > .5 ? c : shade(c, .08), .07, 62);
    });
    return { back: s };
  };
  T.fern = (r, a) => {
    let s = ""; const c = a.leaf;
    const ends = [[22, 150], [36, 112], [56, 70], [86, 40], [112, 42], [142, 66], [164, 108], [178, 146], [64, 168], [140, 170]];
    ends.forEach(([x, y], i) => {
      const cp = [100 + (x - 100) * .45, Math.min(y, 120) - 50 + r.range(-8, 8)];
      s += frond(r, [100 + (x - 100) * .05, 150], cp, [x, y], r.range(9, 12), i % 2 ? c : shade(c, -.1), .055, 70);
    });
    return { back: s };
  };

  T.lily = (r, a) => {
    let s = "", fl = ""; const c = a.leaf;
    [-58, -40, -22, -6, 8, 24, 42, 60].forEach(ang => s += at(100 + ang * .1, 150, ang + r.range(-5, 5), `<path d="${leafPath(r.range(62, 86), 17)}" fill="${r() > .5 ? c : shade(c, .1)}"/><path d="M0 0L0 -60" stroke="${shade(c, .25)}" stroke-width="1" opacity=".6"/>`));
    [[74, 48, -14], [124, 40, 12], [98, 26, 2]].forEach(([fx, fy, rot]) => {
      fl += `<path d="M100 150Q${P((100 + fx) / 2)} ${P((150 + fy) / 2 + 10)} ${fx} ${fy + 4}" stroke="${shade(c, .1)}" stroke-width="2" fill="none"/>`;
      fl += at(fx, fy + 6, rot, `<path d="${fatLeaf(30, 12)}" fill="#FBFAF4" stroke="#E2E0D4" stroke-width=".8"/><ellipse cx="1" cy="-12" rx="3" ry="8" fill="#EDE3B5"/>`, `class="bloom"`);
    });
    return { back: s + fl };
  };

  T.zz = (r, a) => {
    let s = ""; const c = a.leaf;
    [[-48, 52], [-22, 26], [0, 16], [24, 30], [52, 58]].forEach(([dx, y]) => {
      const p0 = [100 + dx * .1, 150], p1 = [100 + dx, y], cp = [100 + dx * .2, (150 + y) / 2];
      s += `<path d="M${p0[0]} ${p0[1]}Q${cp[0]} ${cp[1]} ${p1[0]} ${p1[1]}" stroke="${shade(c, -.1)}" stroke-width="2.6" fill="none"/>`;
      for (let t = .3; t <= 1.01; t += .12) {
        const q = quad(p0, cp, p1, t);
        [-1, 1].forEach(sd => s += at(q.x, q.y, q.a + 90 + sd * 62, `<path d="${fatLeaf(16, 6.5)}" fill="${shade(c, sd > 0 ? 0 : .08)}"/><path d="M-1.5 -4Q-2 -9 0 -12" stroke="#fff" stroke-width="1.2" opacity=".35" fill="none"/>`));
      }
      s += at(p1[0], p1[1], cp[0] < p1[0] ? 20 : -20, `<path d="${fatLeaf(12, 5)}" fill="${shade(c, .12)}"/>`);
    });
    return { back: s };
  };

  T.rubber = (r, a) => {
    let s = ""; const c = a.leaf;
    const stems = [[[100, 150], [96, 90], [102, 30]], [[104, 150], [124, 110], [128, 70]]];
    stems.forEach(([p0, cp, p1], si) => {
      s += `<path d="M${p0[0]} ${p0[1]}Q${cp[0]} ${cp[1]} ${p1[0]} ${p1[1]}" stroke="${shade(c, .1)}" stroke-width="3.5" fill="none"/>`;
      const steps = si === 0 ? [.2, .36, .52, .68, .84] : [.35, .6, .85];
      steps.forEach((t, k) => {
        const q = quad(p0, cp, p1, t), sd = k % 2 ? 1 : -1;
        s += at(q.x, q.y, sd * r.range(48, 70), `<path d="${fatLeaf(r.range(34, 42), 14)}" fill="${k % 2 ? c : shade(c, .1)}"/><path d="M0 0L0 -34" stroke="#B5545A" stroke-width="1.4" opacity=".8"/><path d="M-5 -10Q-7 -22 -2 -30" stroke="#fff" stroke-width="2" opacity=".18" fill="none"/>`);
      });
      s += at(p1[0], p1[1], 4, `<path d="${leafPath(16, 4)}" fill="#B5545A"/>`);
    });
    return { back: s };
  };

  T.grass = (r, a) => {
    let s = "", front = ""; const c = a.leaf;
    for (let i = 0; i < 16; i++) {
      const x = r.range(26, 174), y = r.range(58, 150), sx = 100 + r.range(-8, 8);
      const cp = [100 + (x - 100) * .5, Math.min(y, 120) - r.range(40, 70)];
      const d = `M${P(sx)} 150Q${P(cp[0])} ${P(cp[1])} ${P(x)} ${P(y)}`;
      s += `<path d="${d}" stroke="${i % 2 ? c : shade(c, .1)}" stroke-width="5" stroke-linecap="round" fill="none"/><path d="${d}" stroke="#F4F2E4" stroke-width="1.4" fill="none" opacity=".9"/>`;
    }
    [[78, 146, 50, 196], [126, 146, 152, 192]].forEach(([x0, y0, x1, y1]) => {
      front += `<path d="M${x0} ${y0}Q${(x0 + x1) / 2 + (x1 > x0 ? 20 : -20)} ${y0} ${x1} ${y1}" stroke="#C8D58C" stroke-width="1.4" fill="none"/>`;
      [-50, -20, 10, 40].forEach(g => front += at(x1, y1, g, `<path d="${leafPath(14, 2.6)}" fill="${c}"/>`));
    });
    return { back: s, front };
  };

  function flower(style, x, y, s, col, r) {
    const dk = shade(col, -.25);
    let g = "";
    if (style === "five") {
      for (let i = 0; i < 5; i++) { const ang = i * 72; g += `<circle cx="${P(Math.cos(rad(ang)) * s * .5)}" cy="${P(Math.sin(rad(ang)) * s * .5)}" r="${P(s * .55)}" fill="${i % 2 ? col : shade(col, .06)}"/>`; }
      g += `<circle r="${P(s * .25)}" fill="${dk}"/><path d="M0 0L${P(s * .5)} ${P(-s * .9)}" stroke="#F3D36B" stroke-width="1.2"/><circle cx="${P(s * .5)}" cy="${P(-s * .9)}" r="1.6" fill="#F3D36B"/>`;
    } else if (style === "star" || style === "shiuli") {
      for (let i = 0; i < 6; i++) g += `<g transform="rotate(${i * 60})"><path d="${fatLeaf(s, s * .38)}" fill="${col}" stroke="#E7E2CF" stroke-width=".6"/></g>`;
      g += `<circle r="${P(style === "shiuli" ? s * .32 : s * .16)}" fill="${style === "shiuli" ? "#EE7A1C" : "#F0D36A"}"/>`;
    } else if (style === "pea") {
      g += `<circle r="${P(s * .8)}" fill="${col}"/><ellipse cy="${P(s * .15)}" rx="${P(s * .28)}" ry="${P(s * .4)}" fill="#F7F3E2"/><circle cy="${P(s * .25)}" r="${P(s * .14)}" fill="#F0C94A"/>`;
      for (let i = -2; i <= 2; i++) g += `<path d="M${P(i * s * .14)} ${P(-s * .1)}L${P(i * s * .3)} ${P(-s * .7)}" stroke="${dk}" stroke-width=".8" opacity=".6"/>`;
    } else if (style === "rose") {
      g += `<circle r="${P(s * .8)}" fill="${col}"/><path d="M${P(-s * .5)} 0A${P(s * .5)} ${P(s * .5)} 0 1 1 ${P(s * .3)} ${P(s * .4)}" stroke="${dk}" stroke-width="1.3" fill="none"/><path d="M${P(-s * .2)} ${P(-s * .05)}A${P(s * .22)} ${P(s * .22)} 0 1 1 ${P(s * .15)} ${P(s * .15)}" stroke="${dk}" stroke-width="1.2" fill="none"/>`;
    } else if (style === "pom") {
      for (let k = 0; k < 2; k++) for (let i = 0; i < 10; i++) { const ang = i * 36 + k * 18, rr = s * (k ? .3 : .55); g += `<circle cx="${P(Math.cos(rad(ang)) * rr)}" cy="${P(Math.sin(rad(ang)) * rr)}" r="${P(s * (k ? .3 : .36))}" fill="${k ? shade(col, .15) : col}"/>`; }
      g += `<circle r="${P(s * .2)}" fill="${shade(col, .3)}"/>`;
    } else if (style === "bract") {
      for (let i = 0; i < 3; i++) g += `<g transform="rotate(${i * 120})"><path d="${heartLeaf(s, s * .7)}" fill="${i ? col : shade(col, .1)}"/></g>`;
      g += `<circle r="1.5" fill="#FBF6E8"/>`;
    }
    return at(x, y, r.range(-30, 30), g, `class="bloom" style="animation-delay:${P(r.range(0, 2))}s"`);
  }

  function dome(r, c, opts) {
    const { cx = 100, cy = 98, rx = 54, ry = 50, n = 95, L = [15, 22], W = 7.5, colors } = opts;
    let s = "";
    [-30, -10, 10, 30].forEach(dx => s += `<path d="M100 150Q${100 + dx * .4} 128 ${100 + dx} ${cy + 10}" stroke="#6A5A3C" stroke-width="2.4" fill="none"/>`);
    for (let i = 0; i < n; i++) {
      const t = r() * Math.PI * 2, d = Math.sqrt(r());
      const x = cx + Math.cos(t) * rx * d, y = cy + Math.sin(t) * ry * d;
      const rot = Math.atan2(y - cy - 20, x - cx) * 180 / Math.PI + 90 + r.range(-25, 25);
      const col = colors ? r.pick(colors) : r.pick([c, shade(c, .1), shade(c, -.12)]);
      const l = r.range(L[0], L[1]);
      s += at(x, y, rot, `<path d="${leafPath(l, W)}" fill="${col}"/>` + (colors ? `<path d="M0 0L0 ${P(-l * .85)}" stroke="#F1D45A" stroke-width=".9" opacity=".8"/>` : ""));
    }
    return s;
  }
  T.bush = (r, a) => {
    let s = dome(r, a.leaf, {});
    const n = a.style === "pom" || a.style === "rose" ? 7 : 9;
    for (let i = 0; i < n; i++) {
      const t = r.range(-Math.PI * .95, -Math.PI * .05) + (i > 5 ? Math.PI * .4 : 0), d = r.range(.35, .95);
      s += flower(a.style, 100 + Math.cos(t) * 50 * d, 98 + Math.sin(t) * 46 * d, a.style === "star" || a.style === "shiuli" ? r.range(6, 8) : r.range(8, 11.5), a.flower, r);
    }
    return { back: s };
  };
  T.croton = (r, a) => ({ back: dome(r, a.leaf, { n: 34, L: [22, 32], W: 9, colors: ["#2F6B37", "#D9A531", "#C2452D", "#E2C744", "#7A2E2A", "#3E7A3E"] }) });

  T.herb = (r, a) => {
    let s = dome(r, a.leaf, { cx: 100, cy: 100, rx: 42, ry: 46, n: 80, L: [9, 13], W: 5 });
    if (a.flower) for (let i = 0; i < 6; i++) {
      const x = r.range(70, 130), y = r.range(58, 76), h = r.range(18, 26);
      s += `<path d="M${P(x)} ${P(y + 10)}L${P(x + r.range(-3, 3))} ${P(y - h)}" stroke="${shade(a.leaf, -.2)}" stroke-width="1.3"/>`;
      for (let k = 0; k < 5; k++) s += `<circle cx="${P(x + (k % 2 ? 2 : -2))}" cy="${P(y - k * h / 5)}" r="1.8" fill="${a.flower}"/>`;
    }
    return { back: s };
  };

  T.spike = (r, a) => {
    let s = "";
    for (let i = 0; i < 10; i++) {
      const x = r.range(46, 154), y = r.range(92, 140);
      s += `<path d="M${P(100 + r.range(-6, 6))} 150Q${P(100 + (x - 100) * .4)} ${P(y - 30)} ${P(x)} ${P(y)}" stroke="${i % 2 ? a.leaf : shade(a.leaf, .1)}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
    }
    [[84, 34], [104, 18], [122, 42]].forEach(([x, y]) => {
      s += `<path d="M100 150Q${(100 + x) / 2} 100 ${x} ${y}" stroke="${shade(a.leaf, .05)}" stroke-width="2.4" fill="none"/>`;
      for (let k = 0; k < 7; k++) {
        const q = quad([100, 150], [(100 + x) / 2, 100], [x, y], 1 - k * .07), sd = k % 2 ? 1 : -1;
        s += k < 3 ? flower("star", q.x + sd * 4, q.y, 5, a.flower, r) : at(q.x + sd * 4, q.y, sd * 30, `<ellipse rx="2.6" ry="5" fill="#EDF0D8"/>`);
      }
    });
    return { back: s };
  };

  T.aloe = (r, a) => {
    let s = "";
    [-66, -48, -30, -14, 0, 14, 30, 48, 66].forEach((ang, i) => {
      const l = 86 - Math.abs(ang) * .5 + r.range(-6, 6), w = 10;
      let spots = "";
      for (let k = 1; k < 6; k++) spots += `<circle cx="${P(r.range(-3, 3))}" cy="${P(-l * k / 7)}" r="1.1" fill="#EAF2E2" opacity=".85"/>`;
      s += at(100 + ang * .12, 150, ang, `<path d="M${-w} 0Q${-w} ${P(-l * .5)} 0 ${P(-l)}Q${w} ${P(-l * .5)} ${w} 0Z" fill="${i % 2 ? a.leaf : shade(a.leaf, -.1)}" stroke="${shade(a.leaf, -.3)}" stroke-width="1" stroke-dasharray="2 3"/>${spots}`);
    });
    return { back: s };
  };

  T.succulent = (r, a) => {
    let s = "";
    const rings = [[11, 54, 17, -84, 84], [9, 44, 16, -64, 64], [7, 34, 14, -44, 44], [5, 24, 12, -24, 24], [3, 14, 9, -10, 10]];
    rings.forEach(([n, l, w, lo, hi], ri) => {
      for (let i = 0; i < n; i++) {
        const ang = lo + (hi - lo) * (n === 1 ? .5 : i / (n - 1));
        s += at(100, 148, ang, `<path d="${fatLeaf(l, w)}" fill="${shade(a.leaf, ri * .08)}" stroke="${a.tip}" stroke-width="1.2" stroke-opacity=".7"/><circle cy="${-l + 1.5}" r="1.6" fill="${a.tip}"/>`);
      }
    });
    return { back: s };
  };

  T.jade = (r, a) => {
    let s = "";
    const br = [[100, 150, 98, 110, 78, 84, 7], [99, 128, 116, 100, 128, 70, 5], [98, 112, 104, 80, 102, 56, 4.5], [100, 140, 130, 128, 146, 104, 4]];
    br.forEach(([x0, y0, cx, cy, x1, y1, w]) => s += `<path d="M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}" stroke="#7C6A4A" stroke-width="${w}" stroke-linecap="round" fill="none"/>`);
    [[78, 84], [128, 70], [102, 56], [146, 104], [90, 110], [114, 96]].forEach(([x, y]) => {
      for (let k = 0; k < 6; k++) s += at(x, y, k * 60 + r.range(-15, 15), `<path d="${fatLeaf(r.range(12, 16), 7)}" fill="${k % 2 ? a.leaf : shade(a.leaf, .1)}" stroke="#B5584A" stroke-width=".9"/>`);
    });
    return { back: s };
  };

  T.cactus = (r, a) => {
    const c = a.leaf, dk = shade(c, -.25);
    let spines = "";
    [86, 93, 100, 107, 114].forEach(x => { for (let y = 66; y < 146; y += 10) spines += `<path d="M${x - 1.5} ${y}L${x + 1.5} ${y - 2}M${x - 1.5} ${y - 2}L${x + 1.5} ${y}" stroke="#F4EDD6" stroke-width=".8"/>`; });
    const body = `<path d="M82 152L82 72Q82 52 100 52Q118 52 118 72L118 152Z" fill="${c}"/>
      <path d="M84 116L70 116Q60 116 60 106L60 86Q60 77 67 77Q74 77 74 86L74 102L84 102Z" fill="${shade(c, .06)}"/>
      <path d="M116 96L130 96Q140 96 140 86L140 72Q140 63 133 63Q126 63 126 72L126 84L116 84Z" fill="${shade(c, -.06)}"/>
      <path d="M90 58L90 150M100 54L100 150M110 58L110 150" stroke="${dk}" stroke-width="1.5" opacity=".45"/>
      <path d="M86 70Q86 60 94 56" stroke="#fff" stroke-width="3" opacity=".25" fill="none" stroke-linecap="round"/>${spines}`;
    let fl = "";
    if (a.flower) fl = flower("five", 100, 50, 7, a.flower, r) + flower("five", 132, 61, 5, a.flower, r);
    return { back: body + fl };
  };
  T.barrel = (r, a) => {
    const c = a.leaf;
    let s = `<ellipse cx="100" cy="118" rx="42" ry="38" fill="${c}"/><ellipse cx="88" cy="104" rx="16" ry="20" fill="#fff" opacity=".1"/>`;
    [-34, -22, -10, 0, 10, 22, 34].forEach(dx => s += `<path d="M100 80Q${100 + dx * 1.3} 118 100 156" stroke="${shade(c, -.3)}" stroke-width="1.4" fill="none" opacity=".5"/>`);
    for (let i = 0; i < 46; i++) {
      const t = r() * Math.PI * 2, d = r.range(.2, .95), x = 100 + Math.cos(t) * 40 * d, y = 118 + Math.sin(t) * 36 * d;
      s += at(x, y, r.range(0, 360), `<path d="M0 0L0 -4.5M0 0L3.5 2.5M0 0L-3.5 2.5" stroke="#E9C24A" stroke-width=".9"/>`);
    }
    return { back: s + `<ellipse cx="100" cy="82" rx="10" ry="4" fill="#E9D58A"/>` };
  };

  T.bonsai = (r, a) => {
    const c = a.leaf;
    let s = `<path d="M88 171C82 150 114 142 104 120C98 106 78 104 86 84L94 84C92 98 110 104 113 120C120 142 100 152 106 171Z" fill="#6B5139"/>
      <path d="M98 128C110 120 128 116 136 104" stroke="#6B5139" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M90 100C78 96 70 90 64 92" stroke="#6B5139" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M90 90C94 76 100 66 102 58" stroke="#6B5139" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M86 171Q78 172 72 170M106 171Q116 173 122 170" stroke="#6B5139" stroke-width="2.4" fill="none"/>`;
    [[64, 88, 26], [138, 100, 24], [102, 52, 30], [126, 70, 18], [76, 62, 16]].forEach(([x, y, R]) => {
      for (let i = 0; i < 12; i++) {
        const t = r() * Math.PI * 2, d = r() * R * .6;
        s += `<circle cx="${P(x + Math.cos(t) * d)}" cy="${P(y + Math.sin(t) * d * .55)}" r="${P(r.range(R * .28, R * .42))}" fill="${r.pick([c, shade(c, .12), shade(c, -.15)])}"/>`;
      }
    });
    return { back: s, shape: "shallow" };
  };

  T.bamboo = (r, a) => {
    let s = "";
    [[84, 52], [94, 26], [104, 40], [114, 64], [100, 80]].forEach(([x, top], i) => {
      s += `<rect x="${x - 3.5}" y="${top}" width="7" height="${206 - top}" rx="3" fill="${i % 2 ? "#86BC4E" : "#74AD43"}"/>`;
      for (let y = top + 18; y < 200; y += 22) s += `<rect x="${x - 4.5}" y="${y}" width="9" height="2.6" rx="1.2" fill="#5E8E33"/>`;
      s += at(x, top + 4, -38 + r.range(-8, 8), `<path d="${leafPath(24, 6)}" fill="${a.leaf}"/>`) + at(x, top + 8, 40 + r.range(-8, 8), `<path d="${leafPath(20, 5)}" fill="${shade(a.leaf, -.1)}"/>`);
    });
    s += `<path d="M78 120Q100 112 122 120" stroke="#C9A24A" stroke-width="3" fill="none"/>`;
    return { back: s, shape: "glass" };
  };

  T.planter = () => ({ back: "", planter: true });

  T.bag = (r, a) => {
    const c = a.tint || "#B98E5C";
    return { shape: "none", back: `<path d="M56 70L64 56L74 66L84 54L94 66L104 54L114 66L124 54L134 66L144 56L144 70L150 206Q150 214 142 214L58 214Q50 214 50 206Z" fill="${c}"/>
      <path d="M56 70L144 70" stroke="${shade(c, -.25)}" stroke-width="2"/>
      <path d="M60 80L56 200" stroke="#fff" stroke-width="5" opacity=".14" stroke-linecap="round"/>
      <rect x="66" y="96" width="68" height="74" rx="8" fill="#FBF7EC"/>
      <g transform="translate(118 104) rotate(20)"><path d="${leafPath(14, 5)}" fill="#6EA548"/></g>@@FACE:100:122:1.2:#FBF7EC@@
      <text x="100" y="150" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="11" fill="#2A3A2E" letter-spacing="1.5">${a.label || "SOIL"}</text>
      <text x="100" y="162" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="5.2" fill="#6B776C" letter-spacing=".6">SABUJ · KOLKATA</text>
      <ellipse cx="146" cy="211" rx="16" ry="3.5" fill="#4A3426"/>` };
  };
  T.packet = (r, a) => {
    return { shape: "none", back: `<g transform="rotate(-5 100 120)">
      <rect x="60" y="34" width="80" height="170" rx="6" fill="#F6EBD3"/>
      <rect x="60" y="34" width="80" height="26" rx="6" fill="${a.flower}"/><rect x="60" y="54" width="80" height="6" fill="${a.flower}"/>
      <path d="M60 40L140 40" stroke="#fff" stroke-dasharray="3 3" opacity=".7"/>
      ${flower("pom", 100, 112, 22, a.flower, r)}<circle cx="100" cy="112" r="13" fill="#FFF3D6"/>@@FACE:100:111:.72:#FFF3D6@@
      <path d="M100 136L100 168" stroke="#4C8A3B" stroke-width="2.4"/>
      <g transform="translate(100 156) rotate(-50)"><path d="${leafPath(16, 6)}" fill="#4C8A3B"/></g>
      <text x="100" y="186" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="11" fill="#2A3A2E" letter-spacing="2">SEEDS</text>
      </g>
      <ellipse cx="62" cy="208" rx="3" ry="2" fill="#6B4E2E"/><ellipse cx="70" cy="211" rx="3" ry="2" fill="#6B4E2E"/><ellipse cx="146" cy="207" rx="3" ry="2" fill="#6B4E2E"/>` };
  };


  /* ---- goofy layer: faces + sticker outline ---- */
  const INK = "#1E2B22";
  const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (.299 * (n >> 16) + .587 * ((n >> 8) & 255) + .114 * (n & 255)) / 255; };
  const MOODS = ["smile", "grin", "tongue", "cat", "happy", "wow", "smile", "happy"];
  function face(cx, cy, s, bg, r) {
    const c = lum(bg) < .42 ? "#FFF6E6" : INK;
    const mood = r.pick(MOODS);
    const ex = 9 * s, ey = -2 * s;
    const eye = (x) => mood === "happy"
      ? `<path d="M${P(x - 3.4 * s)} ${P(ey + 1.5 * s)}Q${P(x)} ${P(ey - 4 * s)} ${P(x + 3.4 * s)} ${P(ey + 1.5 * s)}" stroke="${c}" stroke-width="${P(2.2 * s)}" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="${P(x)}" cy="${P(ey)}" rx="${P(3 * s)}" ry="${P(3.9 * s)}" fill="${c}"/><circle cx="${P(x + 1.1 * s)}" cy="${P(ey - 1.4 * s)}" r="${P(1.1 * s)}" fill="${c === INK ? "#fff" : INK}"/>`;
    const st = `stroke="${c}" stroke-width="${P(2.1 * s)}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
    const mouths = {
      smile: `<path d="M${P(-4.5 * s)} ${P(5 * s)}Q0 ${P(10 * s)} ${P(4.5 * s)} ${P(5 * s)}" ${st}/>`,
      grin: `<path d="M${P(-5 * s)} ${P(4.5 * s)}Q0 ${P(13 * s)} ${P(5 * s)} ${P(4.5 * s)}Z" fill="${c}"/><path d="M${P(-2.4 * s)} ${P(8.6 * s)}Q0 ${P(7 * s)} ${P(2.4 * s)} ${P(8.6 * s)}" fill="#E8707A"/>`,
      tongue: `<path d="M${P(-4.5 * s)} ${P(5 * s)}Q0 ${P(9.5 * s)} ${P(4.5 * s)} ${P(5 * s)}" ${st}/><path d="M${P(.5 * s)} ${P(7 * s)}q${P(1.6 * s)} ${P(4.4 * s)} ${P(3.2 * s)} 0" fill="#E8707A"/>`,
      cat: `<path d="M${P(-5 * s)} ${P(5 * s)}q${P(2.5 * s)} ${P(3.5 * s)} ${P(5 * s)} 0q${P(2.5 * s)} ${P(3.5 * s)} ${P(5 * s)} 0" ${st}/>`,
      happy: `<path d="M${P(-5 * s)} ${P(4.5 * s)}Q0 ${P(12 * s)} ${P(5 * s)} ${P(4.5 * s)}Z" fill="${c}"/>`,
      wow: `<ellipse cx="0" cy="${P(7 * s)}" rx="${P(2.6 * s)}" ry="${P(3.2 * s)}" fill="${c}"/>`
    };
    const alt = mood === "grin" ? mouths.happy : mouths.grin;
    return `<g class="face" transform="translate(${P(cx)} ${P(cy)})">
      <ellipse cx="${P(-ex - 4 * s)}" cy="${P(4 * s)}" rx="${P(3.6 * s)}" ry="${P(2.2 * s)}" fill="#F27D86" opacity=".55"/>
      <ellipse cx="${P(ex + 4 * s)}" cy="${P(4 * s)}" rx="${P(3.6 * s)}" ry="${P(2.2 * s)}" fill="#F27D86" opacity=".55"/>
      <g class="eyes" style="animation-delay:-${P(r.range(0, 5))}s">${eye(-ex)}${eye(ex)}</g>
      <g class="m1">${mouths[mood]}</g><g class="m2">${alt}</g></g>`;
  }
  const FACE_POS = { standard: [100, 186, 1.45], shallow: [100, 191, 1.05], glass: [100, 180, 1.15] };
  const SHADOW = { standard: [216, 46], shallow: [213, 62], glass: [216, 36], none: [214, 46], planter: [217, 58] };
  const outline = (id) => `<filter id="ol${id}" x="-8%" y="-8%" width="116%" height="116%"><feMorphology in="SourceAlpha" operator="dilate" radius="1.7" result="d"/><feFlood flood-color="${INK}"/><feComposite in2="d" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

  function render(spec, opts = {}) {
    spec = spec || { type: "monstera", leaf: "#2F7A45" };
    const id = ++uid;
    const r = rng((opts.seed || "") + spec.type);
    const make = T[spec.type] || T.monstera;
    const out = make(r, spec);
    const potKey = opts.pot || spec.pot || "terracotta";
    const potHex = (window.SITE.potColors[potKey] || window.SITE.potColors.terracotta).hex;
    const shape = out.shape || "standard";
    const fr = rng((opts.seed || "") + "face");
    let body, shKey = shape;
    if (out.planter) {
      shKey = "planter";
      body = `<g transform="translate(100 216) scale(1.3) translate(-100 -216)">${pot(potHex, "standard", spec.pattern, id)}<ellipse cx="100" cy="149" rx="43" ry="3.4" fill="${shade(potHex, -.45)}"/>${face(100, 186, 1.3, potHex, fr)}</g>`;
    } else if (shape === "none") {
      body = `<g class="sway sway-soft">${out.back}</g>`;
    } else if (shape === "glass") {
      body = `<g class="sway">${out.back}</g>${glass(id)}${face(100, 180, 1.15, "#D9EEF2", fr)}`;
    } else {
      const [fx, fy, fs] = FACE_POS[shape];
      body = `<g class="sway" style="animation-delay:-${P(r.range(0, 5))}s">${out.back}</g>${pot(potHex, shape, spec.pattern, id)}${face(fx, fy, fs, potHex, fr)}${out.front ? `<g class="sway sway-hang">${out.front}</g>` : ""}`;
    }
    body = body.replace(/@@FACE:([\d.]+):([\d.]+):([\d.]+):(#[0-9A-Fa-f]{6})@@/g, (_, x, y, sc, bg) => face(+x, +y, +sc, bg, fr));
    const [sy, sr] = SHADOW[shKey] || SHADOW.standard;
    return `<svg class="art" viewBox="0 0 200 222" role="img" aria-label="${opts.label || "Plant illustration"}" xmlns="http://www.w3.org/2000/svg"><defs>${outline(id)}</defs><ellipse cx="100" cy="${sy}" rx="${sr}" ry="4" fill="#000" opacity=".13"/><g filter="url(#ol${id})">${body}</g></svg>`;
  }

  window.Art = { render, shade };
})();
