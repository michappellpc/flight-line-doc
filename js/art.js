// Flight Line Doc: pixel art. Everything is drawn in code at 320x240 and scaled up crisp.
window.FLD_ART = (() => {
'use strict';

const INK = '#2a2118';
const rc = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const shade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = f < 0 ? 0 : 255, p = Math.abs(f);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
};

// 3x5 bitmap font for signs
const GLYPH = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
  F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
  K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
  P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101101111101', X: '101101010101101', Y: '101101010010010',
  Z: '111001010100111',
};
function pxText(c, s, x, y, col) {
  for (const ch of s) {
    const g = GLYPH[ch];
    if (g) for (let i = 0; i < 15; i++) if (g[i] === '1') rc(c, x + (i % 3), y + Math.floor(i / 3), 1, 1, col);
    x += 4;
  }
}

// ---------- seasons ----------
const SEASON = {
  spring: { grass: ['#6dae46', '#68a842', '#72b54a'], tuft: '#5b9838', hi: '#86c85b', flowers: .88, leaf: ['#2f6b2a', '#3f8f35', '#63b84e'] },
  summer: { grass: ['#7aa63e', '#749f3a', '#80ad44'], tuft: '#668c32', hi: '#94bd55', flowers: .95, leaf: ['#2c5e24', '#3a7f2e', '#5aa843'] },
  fall:   { grass: ['#8a9a3e', '#93a043', '#857f38'], tuft: '#6e6a2c', hi: '#a8a85a', flowers: 2, leaf: ['#7a3a12', '#d9822b', '#f2b13a'], litter: true },
  winter: { grass: ['#e8eef4', '#e2e9f0', '#eef3f8'], tuft: '#9aa58a', hi: '#ffffff', flowers: 2, snow: true },
};

// ---------- terrain ----------
function ground(c, world, season) {
  const P = SEASON[season];
  for (let ty = 0; ty < 15; ty++) for (let tx = 0; tx < 20; tx++) {
    const px = tx * 16, py = ty * 16;
    rc(c, px, py, 16, 16, P.grass[Math.floor(hash(tx, ty) * 3)]);
    for (let k = 0; k < (P.snow ? 1 : 4); k++) {
      const gx = px + Math.floor(hash(tx * 5 + k, ty + 7) * 14), gy = py + Math.floor(hash(tx + 3, ty * 5 + k) * 13);
      rc(c, gx, gy, 1, 2, P.tuft); rc(c, gx + 1, gy, 1, 1, P.hi);
    }
    if (hash(tx + 11, ty + 5) > P.flowers) {
      const fx = px + 4 + Math.floor(hash(tx, ty) * 8), fy = py + 4 + Math.floor(hash(ty, tx) * 8);
      const col = ['#f06292', '#ffd54f', '#ffffff', '#ba68c8'][Math.floor(hash(tx * 2, ty * 3) * 4)];
      rc(c, fx - 1, fy, 3, 1, col); rc(c, fx, fy - 1, 1, 3, col); rc(c, fx, fy, 1, 1, '#fff3a0');
    }
    if (P.litter) for (let k = 0; k < 3; k++) {
      const lx = px + Math.floor(hash(tx * 7 + k, ty * 3) * 15), ly = py + Math.floor(hash(tx * 3, ty * 7 + k) * 15);
      rc(c, lx, ly, 2, 1, ['#c0392b', '#d9822b', '#f2b13a'][k]);
    }
  }
  const dirt = (y0, y1) => {
    const base = P.snow ? ['#a49c8e', '#c3bcb0', '#b5ad9f'] : ['#b48a4f', '#dcc08a', '#c9a66b'];
    for (let y = y0; y < y1; y++) for (let x = 0; x < 320; x++) {
      const h = hash(x, y);
      rc(c, x, y, 1, 1, h < .08 ? base[0] : h > .94 ? base[1] : base[2]);
    }
    for (let x = 0; x < 320; x++) {
      const edge = P.snow ? '#f4f8fb' : '#a47c45';
      if (hash(x, y0) < .75) rc(c, x, y0, 1, P.snow ? 2 : 1, edge);
      if (hash(x, y1) < .75) rc(c, x, y1 - (P.snow ? 2 : 1), 1, P.snow ? 2 : 1, edge);
    }
  };
  dirt(80, 112); dirt(176, 192);
  for (let y = 192; y < 240; y++) for (let x = 0; x < 320; x++) {
    const h = hash(x + 99, y);
    rc(c, x, y, 1, 1, h < .1 ? '#444a52' : h > .93 ? '#5a606a' : '#4d535c');
  }
  for (let x = 0; x < 320; x++) if (x % 8 < 5) rc(c, x, 192, 1, 1, '#d8d8d8');
  if (P.snow) for (let x = 0; x < 320; x++) if (hash(x, 7) < .6) rc(c, x, 193, 1, 1 + Math.floor(hash(x, 9) * 2), '#e8eef4');
  world.helis.forEach(hl => {
    const x = hl.x * 16 - 3, y = hl.y * 16 - 4;
    rc(c, x, y, 38, 22, '#575d67');
    const m = '#e5c84a';
    rc(c, x, y, 5, 1, m); rc(c, x, y, 1, 4, m); rc(c, x + 33, y, 5, 1, m); rc(c, x + 37, y, 1, 4, m);
    rc(c, x, y + 21, 5, 1, m); rc(c, x, y + 18, 1, 4, m); rc(c, x + 33, y + 21, 5, 1, m); rc(c, x + 37, y + 18, 1, 4, m);
    rc(c, x + 16, y + 6, 1, 10, '#6a707a'); rc(c, x + 21, y + 6, 1, 10, '#6a707a'); rc(c, x + 17, y + 10, 4, 1, '#6a707a');
  });
}

function building(c, b, door, season) {
  const x = b.x * 16, y = b.y * 16, w = b.w * 16, h = b.h * 16;
  rc(c, x + 2, y + h, w, 3, 'rgba(0,0,0,.22)');
  rc(c, x, y, w, h, b.body);
  for (let yy = y + 17; yy < y + h - 1; yy += 4) rc(c, x + 1, yy, w - 2, 1, shade(b.body, -.1));
  rc(c, x, y, w, 14, b.roof);
  for (let r = 0; r < 4; r++) {
    const ry = y + 2 + r * 3;
    rc(c, x + 1, ry + 2, w - 2, 1, shade(b.roof, -.25));
    for (let sx = x + 1 + (r % 2) * 3; sx < x + w - 1; sx += 6) rc(c, sx, ry, 1, 2, shade(b.roof, -.2));
  }
  rc(c, x, y, w, 1, shade(b.roof, .3));
  rc(c, x, y + 14, w, 2, shade(b.body, -.3));
  if (season === 'winter') {
    rc(c, x, y, w, 4, '#f4f8fb');
    for (let i = 0; i < w; i += 3) rc(c, x + i, y + 4, 2, 1 + Math.floor(hash(x + i, y) * 3), '#f4f8fb');
  }
  rc(c, x, y, w, 1, INK); rc(c, x, y + h - 1, w, 1, INK); rc(c, x, y, 1, h, INK); rc(c, x + w - 1, y, 1, h, INK);
  if (b.steeple) {
    const sx = x + Math.floor(w / 2) - 3;
    rc(c, sx, y - 8, 7, 9, INK); rc(c, sx + 1, y - 7, 5, 8, b.body);
    rc(c, sx + 1, y - 7, 5, 2, season === 'winter' ? '#f4f8fb' : b.roof); rc(c, sx + 2, y - 4, 3, 3, '#f5d77a');
  }
  const label = b.label, tw = label.length * 4 - 1, sx = x + Math.floor((w - tw) / 2);
  rc(c, sx - 2, y + 3, tw + 4, 8, INK); rc(c, sx - 1, y + 4, tw + 2, 6, '#3a2f22');
  pxText(c, label, sx, y + 5, '#fff3d0');
  const dx = door ? door.x * 16 + 4 : -99;
  for (let wx = x + 7; wx + 8 < x + w - 4; wx += 17) {
    if (wx + 8 > dx - 4 && wx < dx + 12) continue;
    rc(c, wx, y + 19, 8, 9, INK); rc(c, wx + 1, y + 20, 6, 7, '#9fd3ea');
    rc(c, wx + 3, y + 20, 1, 7, INK); rc(c, wx + 1, y + 23, 6, 1, INK);
    rc(c, wx + 1, y + 20, 2, 1, '#e8f7ff');
    rc(c, wx - 1, y + 28, 10, 1, season === 'winter' ? '#f4f8fb' : shade(b.body, -.25));
  }
  if (door) {
    rc(c, dx, y + h - 12, 8, 12, INK); rc(c, dx + 1, y + h - 11, 6, 11, '#8a5a2b');
    rc(c, dx + 1, y + h - 11, 6, 1, '#a8733a'); rc(c, dx + 5, y + h - 6, 1, 1, '#ffd34d');
    rc(c, dx + 3, y + h - 11, 1, 11, '#6b4a2a');
    if (season === 'winter') rc(c, dx - 1, y + h - 13, 10, 1, '#f4f8fb');
  }
}

function tree(c, tx, ty, season) {
  const px = tx * 16, py = ty * 16;
  rc(c, px + 3, py + 14, 10, 2, 'rgba(0,0,0,.22)');
  rc(c, px + 6, py + 10, 4, 6, '#5a3d20'); rc(c, px + 6, py + 10, 1, 6, '#7a5530');
  if (season === 'winter') {
    const br = '#5a3d20';
    rc(c, px + 7, py + 3, 2, 8, br); rc(c, px + 3, py + 5, 4, 1, br); rc(c, px + 2, py + 3, 1, 2, br);
    rc(c, px + 9, py + 4, 4, 1, br); rc(c, px + 12, py + 2, 1, 2, br); rc(c, px + 5, py + 8, 2, 1, br); rc(c, px + 9, py + 7, 3, 1, br);
    rc(c, px + 7, py + 2, 2, 1, '#f4f8fb'); rc(c, px + 3, py + 4, 4, 1, '#f4f8fb'); rc(c, px + 9, py + 3, 4, 1, '#f4f8fb'); rc(c, px + 2, py + 2, 1, 1, '#f4f8fb'); rc(c, px + 12, py + 1, 1, 1, '#f4f8fb');
    return;
  }
  const L = SEASON[season].leaf;
  const rows = [[1, 5, 11], [2, 3, 13], [3, 2, 14], [4, 1, 15], [5, 1, 15], [6, 1, 15], [7, 2, 14], [8, 3, 13], [9, 4, 12], [10, 6, 10]];
  rows.forEach(([r, a, b]) => rc(c, px + a - 1, py + r, b - a + 2, 1, L[0]));
  rows.forEach(([r, a, b]) => rc(c, px + a, py + r, b - a, 1, L[1]));
  rows.slice(0, 6).forEach(([r, a]) => rc(c, px + a + 1, py + r + 1, 3, 1, L[2]));
  rc(c, px + 5, py + 3, 2, 1, shade(L[2], .25)); rc(c, px + 9, py + 6, 2, 1, L[0]); rc(c, px + 4, py + 7, 3, 1, L[0]);
  if (season === 'fall') { rc(c, px + 10, py + 4, 2, 1, '#c0392b'); rc(c, px + 4, py + 5, 1, 1, '#c0392b'); }
}

function buildBG(c, world, season) {
  ground(c, world, season);
  world.buildings.forEach(b => building(c, b, world.stations.find(s => s.x >= b.x && s.x < b.x + b.w && s.y === b.y + b.h), season));
  world.trees.forEach(t => tree(c, t[0], t[1], season));
}

// ---------- station props (16x16, in front of each door) ----------
function crate(c, x, y) {
  rc(c, x, y, 7, 7, '#4a3319'); rc(c, x + 1, y + 1, 5, 5, '#a9753c');
  rc(c, x + 1, y + 3, 5, 1, '#7a5226'); rc(c, x + 1, y + 1, 5, 1, '#c68f50');
}
const STATION_ART = {
  clinic: c => { rc(c, 7, 9, 2, 7, '#6b4a2a'); rc(c, 2, 1, 12, 9, INK); rc(c, 3, 2, 10, 7, '#f5f5f5'); rc(c, 7, 3, 2, 5, '#d63a3a'); rc(c, 5, 4, 6, 2, '#d63a3a'); },
  hq: c => {
    rc(c, 3, 11, 1, 5, '#6b4a2a'); rc(c, 12, 11, 1, 5, '#6b4a2a');
    rc(c, 1, 1, 14, 11, INK); rc(c, 2, 2, 12, 9, '#b98d5a');
    rc(c, 3, 3, 4, 4, '#ffffff'); rc(c, 8, 3, 5, 3, '#f5e27a'); rc(c, 4, 8, 5, 2, '#9fd3ea'); rc(c, 10, 7, 3, 3, '#ffffff');
    rc(c, 4, 3, 1, 1, '#d63a3a'); rc(c, 10, 3, 1, 1, '#d63a3a');
  },
  chapel: (c, t) => {
    rc(c, 4, 13, 8, 2, '#6b6b6b'); rc(c, 6, 9, 4, 4, '#8a8a8a');
    rc(c, 7, 5, 2, 4, '#f5f0e0'); rc(c, 7, 3, 2, 2, '#ffb02e'); rc(c, 7 + ((t * 4 | 0) % 2), 2, 1, 1, '#fff3a0');
  },
  quarters: c => { rc(c, 1, 4, 14, 11, INK); rc(c, 2, 5, 12, 9, '#8a5a2b'); rc(c, 2, 5, 12, 7, '#f2f2f2'); rc(c, 3, 6, 4, 3, '#dfe8f5'); rc(c, 7, 6, 7, 6, '#4f5a3a'); rc(c, 7, 6, 7, 1, '#6d7a52'); rc(c, 2, 12, 12, 2, '#6b4a2a'); },
  dfac: (c, t) => {
    rc(c, 1, 8, 14, 2, '#8a5a2b'); rc(c, 1, 8, 14, 1, '#a8733a'); rc(c, 2, 10, 2, 5, '#6b4a2a'); rc(c, 12, 10, 2, 5, '#6b4a2a');
    rc(c, 5, 4, 6, 4, '#7b8491'); rc(c, 4, 4, 8, 1, '#aab2bd'); rc(c, 11, 7, 3, 1, '#fff');
    const k = (t * 3 | 0) % 2; rc(c, 6 + k, 1, 1, 2, '#ffffff'); rc(c, 9 - k, 0, 1, 3, '#ffffff');
  },
  gym: c => {
    rc(c, 1, 7, 14, 2, '#9aa1ab'); rc(c, 1, 3, 2, 10, INK); rc(c, 1, 4, 2, 8, '#c23b3b'); rc(c, 4, 5, 1, 6, '#444');
    rc(c, 13, 3, 2, 10, INK); rc(c, 13, 4, 2, 8, '#c23b3b'); rc(c, 11, 5, 1, 6, '#444');
  },
  ops: c => {
    rc(c, 7, 11, 2, 5, '#6b4a2a'); rc(c, 3, 9, 10, 2, '#8a5a2b');
    rc(c, 4, 2, 8, 2, INK); rc(c, 3, 3, 2, 2, INK); rc(c, 11, 3, 2, 2, INK);
    rc(c, 2, 5, 4, 4, '#3a3a3a'); rc(c, 10, 5, 4, 4, '#3a3a3a'); rc(c, 3, 6, 2, 2, '#5d6b44'); rc(c, 11, 6, 2, 2, '#5d6b44');
    rc(c, 5, 8, 4, 1, '#555'); rc(c, 8, 7, 2, 2, '#222');
  },
};
function station(c, s, t, season) {
  c.save(); c.translate(s.x * 16, s.y * 16);
  rc(c, 0, 0, 16, 16, '#cdbd94'); rc(c, 0, 0, 16, 1, '#a8946a'); rc(c, 0, 15, 16, 1, '#a8946a'); rc(c, 0, 0, 1, 16, '#a8946a'); rc(c, 15, 0, 1, 16, '#a8946a');
  STATION_ART[s.id](c, t);
  if (season === 'winter') { rc(c, 1, 14, 14, 1, '#f4f8fb'); }
  c.restore();
}

// ---------- decor ----------
function flag(c, d, t) {
  const x = d.x * 16, y = d.y * 16;
  rc(c, x + 6, y + 14, 4, 2, 'rgba(0,0,0,.2)'); rc(c, x + 7, y - 12, 1, 28, '#c9c9c9'); rc(c, x + 7, y - 13, 1, 1, '#ffd34d');
  const wave = Math.floor(t * 4) % 2;
  for (let i = 0; i < 7; i++) {
    const off = (i + wave) % 3 === 0 ? 1 : 0;
    for (let r = 0; r < 5; r++) rc(c, x + 8 + i, y - 12 + r + off, 1, 1, r % 2 ? '#ffffff' : '#c23b3b');
    if (i < 3) for (let r = 0; r < 3; r++) rc(c, x + 8 + i, y - 12 + r + off, 1, 1, '#2b4a9a');
  }
}
function sock(c, d) {
  const x = d.x * 16, y = d.y * 16;
  rc(c, x + 3, y + 2, 1, 13, '#9aa1ab'); rc(c, x + 2, y + 14, 3, 1, '#555');
  [5, 4, 3, 2].forEach((h, i) => rc(c, x + 4 + i * 3, y + 2 + ((5 - h) >> 1), 3, h, i % 2 ? '#ffffff' : '#ff7a1a'));
}

// ---------- helicopters (32x16, facing right) ----------
function rotor(c, x, y, cx, t, spin) {
  if (spin) {
    const L = Math.round(Math.abs(Math.cos(t * 14)) * 15) + 1;
    rc(c, x + cx - L, y + 2, L * 2, 1, 'rgba(40,40,40,.75)');
  } else {
    rc(c, x + 2, y + 2, 29, 1, '#2a2a2a'); rc(c, x + 1, y + 3, 1, 1, '#2a2a2a'); rc(c, x + 31, y + 3, 1, 1, '#2a2a2a');
  }
}
function blackhawk(c, x, y, t, base, medevac, spin) {
  rotor(c, x, y, 16, t, spin);
  rc(c, x + 15, y + 3, 2, 2, INK);
  rc(c, x + 11, y + 4, 11, 2, shade(base, -.15));
  rc(c, x + 9, y + 6, 20, 6, INK); rc(c, x + 10, y + 6, 18, 5, base); rc(c, x + 10, y + 10, 18, 1, shade(base, -.25));
  rc(c, x + 28, y + 7, 2, 4, INK); rc(c, x + 27, y + 7, 2, 3, base);
  rc(c, x + 23, y + 7, 5, 2, '#7fb3c8'); rc(c, x + 23, y + 7, 1, 1, '#d8f0ff');
  if (medevac) { rc(c, x + 13, y + 6, 6, 5, '#ffffff'); rc(c, x + 15, y + 6, 2, 5, '#d63a3a'); rc(c, x + 13, y + 8, 6, 1, '#d63a3a'); }
  else rc(c, x + 14, y + 7, 4, 2, '#7fb3c8');
  rc(c, x + 1, y + 7, 9, 2, base); rc(c, x + 1, y + 9, 9, 1, INK);
  rc(c, x, y + 3, 3, 5, base); rc(c, x, y + 3, 1, 5, INK); rc(c, x, y + 8, 4, 1, INK);
  rc(c, x + 1, y + 1, 1, 4, spin ? 'rgba(80,80,80,.6)' : '#555');
  rc(c, x + 12, y + 12, 2, 2, INK); rc(c, x + 24, y + 12, 2, 2, INK); rc(c, x + 2, y + 10, 1, 2, INK);
}
function apache(c, x, y, t, spin) {
  const base = '#3f4636';
  rotor(c, x, y, 17, t, spin);
  rc(c, x + 16, y + 3, 2, 2, INK);
  rc(c, x + 12, y + 5, 7, 2, shade(base, -.2));
  rc(c, x + 10, y + 7, 18, 4, INK); rc(c, x + 11, y + 7, 16, 3, base);
  rc(c, x + 19, y + 5, 9, 1, INK); rc(c, x + 19, y + 6, 4, 2, '#7fb3c8'); rc(c, x + 24, y + 6, 4, 2, '#7fb3c8'); rc(c, x + 23, y + 6, 1, 2, INK);
  rc(c, x + 28, y + 8, 3, 3, '#2a2a2a'); rc(c, x + 29, y + 9, 1, 1, '#5a6a7a');
  rc(c, x + 14, y + 10, 7, 1, INK); rc(c, x + 14, y + 11, 3, 2, '#555'); rc(c, x + 18, y + 11, 3, 2, '#555');
  rc(c, x + 1, y + 8, 10, 2, base); rc(c, x + 1, y + 10, 10, 1, INK);
  rc(c, x, y + 4, 3, 5, base); rc(c, x, y + 4, 1, 5, INK);
  rc(c, x + 1, y + 2, 1, 4, spin ? 'rgba(80,80,80,.6)' : '#555');
  rc(c, x + 22, y + 11, 2, 3, INK); rc(c, x + 2, y + 11, 1, 2, INK);
}
// o: { spin, lift (px above the pad), dx (drift) }
function heli(c, h, t, o = {}) {
  const lift = o.lift || 0, x = h.x * 16 + Math.round(o.dx || 0), y = h.y * 16 - Math.round(lift);
  const sw = Math.max(8, 26 - lift / 3);
  rc(c, h.x * 16 + 16 - sw / 2, h.y * 16 + 14, sw, 2, `rgba(0,0,0,${Math.max(.08, .25 - lift / 400)})`);
  const spin = o.spin || h.type === 'hh60';
  if (h.type === 'uh60') blackhawk(c, x, y, t, '#4f5a3a', false, spin);
  else if (h.type === 'hh60') blackhawk(c, x, y, t, '#4f5a3a', true, spin);
  else apache(c, x, y, t, spin);
}

// ---------- characters (12x16, four directions) ----------
const HEAD = {
  down: ['....oooo....', '...ohhhho...', '..ohhhhhho..', '..ohssssho..', '..osesseso..', '..osssssso..', '...ossso....'],
  up:   ['....oooo....', '...ohhhho...', '..ohhhhhho..', '..ohhhhhho..', '..ohhhhhho..', '..ohhhhhho..', '...ossso....'],
  side: ['....oooo....', '...ohhhho...', '..ohhhhhho..', '..ohhhsssso.', '..ohhssseso.', '..ohsssssso.', '...osssso...'],
};
const BODY = {
  down: ['..obbbbbo...', '.obbbbbbbo..', '.osbbbbbso..', '.osbbbbbso..', '..obbbbbo...', '..ollllo....'],
  up:   ['..obbbbbo...', '.obbbbbbbo..', '.osbbbbbso..', '.osbbbbbso..', '..obbbbbo...', '..ollllo....'],
  side: ['...obbbbo...', '...obbbbbo..', '...obbbbso..', '...obbbbso..', '...obbbbo...', '...ollllo...'],
};
const LEGS = {
  down: [['..olo.olo...', '..olo.olo...', '..ofo.ofo...'], ['..olo.olo...', '..olo..olo..', '..ofo..ofo..'], ['..olo.olo...', '.olo...olo..', '.ofo...ofo..']],
  up:   [['..olo.olo...', '..olo.olo...', '..ofo.ofo...'], ['..olo.olo...', '..olo..olo..', '..ofo..ofo..'], ['..olo.olo...', '.olo...olo..', '.ofo...ofo..']],
  side: [['....ollo....', '....ollo....', '....offo....'], ['...ol..lo...', '..ol....lo..', '..of....fo..'], ['....ollo....', '...olo.lo...', '...ofo.fo...']],
};
function drawChar(c, cx, bottom, look, frame, flip, noShadow, dir = 'down') {
  const x0 = cx - 6, y0 = bottom - 16;
  const col = { o: INK, h: look.hair, s: look.skin, e: '#222', b: look.body, l: look.legs, f: '#3a2a1a' };
  if (!noShadow) rc(c, cx - 4, bottom - 1, 8, 2, 'rgba(0,0,0,.25)');
  const rows = HEAD[dir].concat(BODY[dir], LEGS[dir][frame || 0]);
  for (let r = 0; r < 16; r++) for (let q = 0; q < 12; q++) {
    const ch = rows[r][q]; if (ch === '.') continue;
    let color = col[ch];
    if (look.camo && (ch === 'b' || ch === 'l') && hash(q * 3, r * 7) < .3) color = look.camo;
    rc(c, x0 + (flip ? 11 - q : q), y0 + r, 1, 1, color);
  }
  if (dir === 'down') (look.acc || []).forEach(a => rc(c, x0 + (flip ? 11 - a[0] : a[0]), y0 + a[1], 1, 1, a[2]));
}
function portrait(look) {
  const p = document.createElement('canvas'); p.width = 14; p.height = 18; p.className = 'portrait';
  const c = p.getContext('2d'); rc(c, 0, 0, 14, 18, '#d9c9a0'); rc(c, 0, 12, 14, 6, '#c9b88e');
  drawChar(c, 7, 17, look, 0, false, true);
  return p;
}

// ---------- interiors ----------
const FLOORS = {
  lino:   (x, y) => ((x >> 4) + (y >> 4)) % 2 ? '#d6dbe0' : '#cad1d8',
  tile:   (x, y) => (x % 16 === 0 || y % 16 === 0) ? '#b1a993' : '#c9c2ad',
  wood:   (x, y) => (y % 6 === 0) ? '#9a6e43' : ((x + (y / 6 | 0) * 11) % 24 === 0 ? '#9a6e43' : '#b88a5a'),
  carpet: (x, y) => hash(x, y) < .15 ? '#7a3434' : '#8a3b3b',
};
// Wall decor drawn on the top wall (y 0..47). d: { type, x (tile), w }
function wallDecor(c, d, st) {
  const x = d.x * 16, w = (d.w || 1) * 16;
  switch (d.type) {
    case 'window': rc(c, x + 1, 10, 14, 20, INK); rc(c, x + 2, 11, 12, 18, '#9fd3ea'); rc(c, x + 7, 11, 1, 18, INK); rc(c, x + 2, 19, 12, 1, INK); rc(c, x + 3, 12, 3, 2, '#e8f7ff'); rc(c, x, 30, 16, 2, '#8a8478'); break;
    case 'stained': rc(c, x + 2, 6, 12, 28, INK); ['#c0392b', '#2b4a9a', '#f2b13a', '#3b9a5a'].forEach((col, i) => rc(c, x + 3 + (i % 2) * 5, 7 + (i >> 1) * 13, 5, 12, col)); rc(c, x + 7, 7, 2, 26, '#f5d77a'); break;
    case 'cross': rc(c, x + 3, 12, 10, 10, '#ffffff'); rc(c, x + 7, 13, 2, 8, '#d63a3a'); rc(c, x + 4, 16, 8, 2, '#d63a3a'); break;
    case 'clock': rc(c, x + 4, 12, 8, 8, INK); rc(c, x + 5, 13, 6, 6, '#f5f0e0'); rc(c, x + 8, 14, 1, 3, INK); rc(c, x + 8, 16, 2, 1, INK); break;
    case 'eyechart': rc(c, x + 3, 6, 10, 26, '#ffffff'); rc(c, x + 3, 6, 10, 1, INK); rc(c, x + 6, 9, 4, 4, INK); [15, 19, 23, 27].forEach((yy, i) => rc(c, x + 4 + i % 2, yy, 8 - i, 2, INK)); break;
    case 'poster': rc(c, x + 2, 8, 12, 18, d.color || '#3b7bc2'); rc(c, x + 4, 11, 8, 2, '#ffffff'); rc(c, x + 4, 15, 6, 1, '#ffffff'); rc(c, x + 4, 18, 7, 1, '#ffffff'); rc(c, x + 6, 21, 4, 3, '#ffffff'); break;
    case 'board': rc(c, x + 1, 8, w - 2, 22, INK); rc(c, x + 2, 9, w - 4, 20, '#b98d5a');
      for (let i = 0; i < w / 6 - 1; i++) rc(c, x + 4 + i * 6, 11 + (i % 2) * 7, 4, 5, ['#ffffff', '#f5e27a', '#9fd3ea'][i % 3]); break;
    case 'flagwall': rc(c, x + 1, 8, w - 2, 16, '#c23b3b'); for (let i = 0; i < 4; i++) rc(c, x + 1, 10 + i * 4, w - 2, 2, '#ffffff'); rc(c, x + 1, 8, (w - 2) / 2 | 0, 8, '#2b4a9a'); break;
    case 'cert': if (st.upgrades.okafor) { rc(c, x + 3, 10, 10, 8, '#c9a15a'); rc(c, x + 4, 11, 8, 6, '#fff8e1'); rc(c, x + 5, 13, 6, 1, INK); rc(c, x + 7, 15, 2, 2, '#d63a3a'); } break;
    case 'keepsakes': {
      rc(c, x, 26, w, 3, '#6b4a2a'); rc(c, x, 29, w, 1, INK);
      const seen = st.scenes || {}; let ix = x + 2;
      const item = (cond, draw) => { if (cond) { draw(ix); ix += 10; } };
      item(seen.rivera8, i => { rc(c, i, 20, 8, 2, '#d9d9d9'); rc(c, i + 3, 18, 2, 6, '#d9d9d9'); });
      item(seen.bell8, i => { rc(c, i + 1, 19, 5, 7, '#f5f0e0'); rc(c, i + 6, 21, 2, 3, '#f5f0e0'); rc(c, i + 2, 21, 3, 1, '#3b7bc2'); });
      item(seen.brooks6, i => { rc(c, i, 18, 7, 8, '#4f5a3a'); rc(c, i + 2, 19, 3, 6, '#ffffff'); rc(c, i + 3, 19, 1, 6, '#d63a3a'); rc(c, i + 1, 21, 5, 1, '#d63a3a'); });
      item(seen.okafor4, i => { rc(c, i, 18, 8, 8, '#fff8e1'); rc(c, i + 1, 20, 6, 1, INK); rc(c, i + 1, 22, 5, 1, INK); });
      item(seen.park8, i => { rc(c, i + 1, 18, 6, 8, '#c9a15a'); rc(c, i + 3, 20, 2, 4, '#2a2a2a'); });
      item(seen.nguyen8, i => { rc(c, i, 20, 8, 6, '#3a3a3a'); rc(c, i + 1, 21, 6, 3, '#7fb3c8'); });
      break;
    }
  }
}
// Furniture. f: { type, x, y, w, h } in tiles. st: { upgrades, scenes }
function furniture(c, f, st) {
  const x = f.x * 16, y = f.y * 16, w = (f.w || 1) * 16, h = (f.h || 1) * 16;
  const shadow = () => rc(c, x + 2, y + h - 2, w - 2, 3, 'rgba(0,0,0,.18)');
  switch (f.type) {
    case 'counter': shadow(); rc(c, x, y + 2, w, h - 2, INK); rc(c, x + 1, y + 6, w - 2, h - 7, '#a8733a'); rc(c, x + 1, y + 3, w - 2, 3, '#c68f50');
      for (let i = 8; i < w; i += 16) rc(c, x + i, y + 7, 1, h - 9, '#8a5a2b'); break;
    case 'examtable': shadow(); rc(c, x + 2, y + 2, w - 4, h - 4, INK); rc(c, x + 3, y + 3, w - 6, h - 7, '#3b6e9e'); rc(c, x + 3, y + 5, w - 6, 4, '#f4f4f4'); rc(c, x + 3, y + 3, 6, 3, '#d9e6f2'); rc(c, x + 4, y + h - 4, 2, 3, '#555'); rc(c, x + w - 6, y + h - 4, 2, 3, '#555'); break;
    case 'curtain': rc(c, x + 7, y, 2, h, '#9aa1ab'); for (let i = 0; i < h - 2; i += 3) rc(c, x + 4, y + 2 + i, 8, 2, i % 2 ? '#b9d4ea' : '#cfe2f1'); break;
    case 'booth':
      shadow(); rc(c, x, y + 2, w, h - 2, INK); rc(c, x + 1, y + 3, w - 2, h - 4, st.upgrades.booth ? '#c9ccd2' : '#9a9da3');
      rc(c, x + 6, y + 8, w - 12, h - 14, st.upgrades.booth ? '#7fb3c8' : '#6c6f74');
      if (st.upgrades.booth) { rc(c, x + w - 6, y + 5, 2, 2, '#4cd964'); }
      else for (let i = 0; i < w - 4; i++) { rc(c, x + 2 + i, y + 4 + Math.floor(i * (h - 8) / (w - 4)), 2, 2, i % 4 < 2 ? '#f2c12e' : '#222'); }
      break;
    case 'vision': shadow();
      if (st.upgrades.vision) { rc(c, x + 2, y + 2, 12, 12, INK); rc(c, x + 3, y + 3, 10, 7, '#e8f7ff'); rc(c, x + 6, y + 4, 4, 2, INK); rc(c, x + 6, y + 7, 3, 1, INK); rc(c, x + 6, y + 11, 4, 3, '#555'); }
      else { rc(c, x + 2, y + 4, 12, 10, INK); rc(c, x + 3, y + 5, 10, 8, '#d8cfa8'); rc(c, x + 5, y + 7, 3, 3, '#6b5d3d'); rc(c, x + 10, y + 7, 2, 2, '#a03020'); }
      break;
    case 'labbench': shadow(); rc(c, x, y + 4, w, h - 4, INK); rc(c, x + 1, y + 5, w - 2, h - 6, '#9aa1ab'); rc(c, x + 1, y + 5, w - 2, 2, '#c0c4c9');
      if (st.upgrades.lab) { rc(c, x + 3, y, 10, 8, INK); rc(c, x + 4, y + 1, 8, 6, '#f2f2f2'); rc(c, x + 5, y + 2, 4, 3, '#4cd964'); rc(c, x + 18, y + 1, 9, 7, INK); rc(c, x + 19, y + 2, 7, 5, '#f2f2f2'); rc(c, x + 20, y + 3, 2, 2, '#3b7bc2'); rc(c, x + 32, y + 3, 10, 3, '#d63a3a'); }
      else { rc(c, x + 6, y + 3, 6, 3, '#6b6b6b'); rc(c, x + 7, y + 1, 1, 2, '#6b6b6b'); rc(c, x + 10, y + 1, 1, 2, '#6b6b6b'); }
      break;
    case 'coffee': rc(c, x + 1, y + 6, 14, 10, INK); rc(c, x + 2, y + 7, 12, 8, '#8a5a2b');
      if (st.upgrades.espresso) { rc(c, x + 3, y, 10, 8, INK); rc(c, x + 4, y + 1, 8, 6, '#c0c4c9'); rc(c, x + 5, y + 2, 2, 2, '#d63a3a'); rc(c, x + 9, y + 4, 2, 2, '#3a2a1a'); }
      else { rc(c, x + 5, y + 1, 6, 6, INK); rc(c, x + 6, y + 2, 4, 4, '#7a4a2a'); rc(c, x + 6, y + 2, 4, 1, '#c9e0ea'); }
      break;
    case 'desk': shadow(); rc(c, x, y + 4, w, h - 4, INK); rc(c, x + 1, y + 5, w - 2, h - 6, '#8a5a2b'); rc(c, x + 1, y + 5, w - 2, 2, '#a8733a');
      rc(c, x + 4, y - 4, 10, 9, INK); rc(c, x + 5, y - 3, 8, 6, '#3b7bc2'); rc(c, x + 18, y + 2, 8, 3, '#ffffff'); rc(c, x + 19, y + 3, 6, 1, '#d9d9d9'); break;
    case 'bigdesk': shadow(); rc(c, x, y + 2, w, h - 2, INK); rc(c, x + 1, y + 3, w - 2, h - 4, '#5a3a22'); rc(c, x + 1, y + 3, w - 2, 2, '#7a5236');
      rc(c, x + w / 2 - 6, y + 8, 12, 4, '#c9a15a'); rc(c, x + 4, y - 2, 6, 5, '#ffffff'); rc(c, x + w - 12, y - 3, 8, 6, '#2a2a2a'); break;
    case 'chairs': for (let i = 0; i < w; i += 16) { rc(c, x + i + 2, y + 3, 12, 11, INK); rc(c, x + i + 3, y + 4, 10, 4, '#3b6e9e'); rc(c, x + i + 3, y + 9, 10, 4, '#4f86b8'); } break;
    case 'shelf': shadow(); rc(c, x, y, w, h, INK); rc(c, x + 1, y + 1, w - 2, h - 2, '#8a5a2b');
      for (let i = 0; i < (w - 4) / 3; i++) rc(c, x + 2 + i * 3, y + 3 + (i % 2), 2, h - 6, ['#c23b3b', '#3b7bc2', '#e0b83a', '#3b9a5a', '#8a3bc2'][i % 5]); break;
    case 'plant': rc(c, x + 4, y + 9, 8, 6, '#b5651d'); rc(c, x + 4, y + 9, 8, 1, '#8a4a14'); rc(c, x + 3, y + 2, 10, 7, '#3f8f35'); rc(c, x + 5, y, 6, 4, '#63b84e'); rc(c, x + 2, y + 5, 2, 2, '#63b84e'); break;
    case 'filing': shadow(); rc(c, x + 2, y + 1, 12, 14, INK); rc(c, x + 3, y + 2, 10, 12, '#8a9099'); rc(c, x + 3, y + 6, 10, 1, INK); rc(c, x + 3, y + 10, 10, 1, INK); rc(c, x + 7, y + 3, 2, 1, '#ddd'); rc(c, x + 7, y + 7, 2, 1, '#ddd'); rc(c, x + 7, y + 11, 2, 1, '#ddd'); break;
    case 'flagstand': rc(c, x + 7, y - 10, 1, 24, '#c9a15a'); rc(c, x + 5, y + 13, 5, 2, '#6b6b6b');
      rc(c, x + 8, y - 9, 7, 5, f.unit ? '#c9a15a' : '#c23b3b'); if (!f.unit) { rc(c, x + 8, y - 9, 3, 3, '#2b4a9a'); rc(c, x + 8, y - 7, 7, 1, '#ffffff'); } else rc(c, x + 10, y - 8, 3, 3, '#2a2a2a'); break;
    case 'maptable': shadow(); rc(c, x, y + 2, w, h - 2, INK); rc(c, x + 1, y + 3, w - 2, h - 4, '#5d6b44');
      for (let i = 0; i < 14; i++) rc(c, x + 3 + Math.floor(hash(i, 3) * (w - 6)), y + 5 + Math.floor(hash(3, i) * (h - 10)), 2 + (i % 3), 1, ['#c9b88e', '#3b7bc2', '#f2c12e'][i % 3]);
      rc(c, x + w / 2, y + h / 2, 2, 2, '#d63a3a'); break;
    case 'pew': rc(c, x, y + 10, w, 3, 'rgba(0,0,0,.15)'); rc(c, x, y + 2, w, 4, INK); rc(c, x + 1, y + 3, w - 2, 2, '#8a5a2b'); rc(c, x, y + 7, w, 5, INK); rc(c, x + 1, y + 8, w - 2, 3, '#a8733a'); break;
    case 'altar': shadow(); rc(c, x, y + 3, w, h - 3, INK); rc(c, x + 1, y + 4, w - 2, h - 5, '#f5f0e0'); rc(c, x + w / 2 - 6, y + 4, 12, h - 5, '#7a2a6a');
      rc(c, x + 6, y - 3, 2, 6, '#f5f0e0'); rc(c, x + 6, y - 5, 2, 2, '#ffb02e'); rc(c, x + w - 8, y - 3, 2, 6, '#f5f0e0'); rc(c, x + w - 8, y - 5, 2, 2, '#ffb02e'); rc(c, x + w / 2 - 4, y, 8, 3, '#5a3a22'); break;
    case 'bed': shadow(); rc(c, x, y, w, h, INK); rc(c, x + 1, y + 1, w - 2, h - 2, '#6b4a2a'); rc(c, x + 2, y + 2, w - 4, h - 4, '#f2f2f2'); rc(c, x + 4, y + 3, w - 8, 7, '#dfe8f5'); rc(c, x + 2, y + 12, w - 4, h - 14, '#4f5a3a'); rc(c, x + 2, y + 12, w - 4, 2, '#6d7a52'); break;
    case 'wardrobe': shadow(); rc(c, x, y - 6, w, h + 6, INK); rc(c, x + 1, y - 5, w - 2, h + 4, '#7a5236'); rc(c, x + w / 2, y - 5, 1, h + 4, INK); rc(c, x + w / 2 - 3, y + 2, 2, 2, '#c9a15a'); rc(c, x + w / 2 + 2, y + 2, 2, 2, '#c9a15a'); break;
    case 'rug': rc(c, x + 2, y + 2, w - 4, h - 4, '#3b6e9e'); rc(c, x + 4, y + 4, w - 8, h - 8, '#c9a15a'); rc(c, x + 6, y + 6, w - 12, h - 12, '#3b6e9e'); break;
    case 'crates': crate(c, x + 1, y + 7); crate(c, x + 9, y + 7); crate(c, x + 5, y + 1); crate(c, x + 18, y + 7); break;
    case 'room2': if (st.upgrades.room2) furniture(c, { type: 'examtable', x: f.x, y: f.y, w: f.w, h: f.h }, st); else furniture(c, { type: 'crates', x: f.x, y: f.y }, st); break;
    case 'mat': rc(c, x, y, w, h, '#6b4a2a'); rc(c, x + 2, y + 2, w - 4, h - 4, '#8a5a2b'); break;
  }
}
// room: { floor, wall, windows/decor, furniture, door: [x, w] }
function buildInterior(c, room, st) {
  const F = FLOORS[room.floor];
  for (let y = 48; y < 240; y++) for (let x = 0; x < 320; x++) rc(c, x, y, 1, 1, F(x, y));
  rc(c, 0, 0, 320, 48, room.wall);
  for (let y = 6; y < 44; y += 6) rc(c, 0, y, 320, 1, shade(room.wall, -.06));
  rc(c, 0, 0, 320, 4, shade(room.wall, -.3)); rc(c, 0, 42, 320, 6, shade(room.wall, -.35)); rc(c, 0, 47, 320, 1, INK);
  (room.decor || []).forEach(d => wallDecor(c, d, st));
  rc(c, 0, 0, 16, 240, shade(room.wall, -.45)); rc(c, 304, 0, 16, 240, shade(room.wall, -.45));
  rc(c, 15, 0, 1, 240, INK); rc(c, 304, 0, 1, 240, INK);
  rc(c, 0, 224, 320, 16, shade(room.wall, -.45)); rc(c, 0, 224, 320, 1, INK);
  const [dx, dw] = room.door; rc(c, dx * 16, 224, dw * 16, 16, F(0, 0)); rc(c, dx * 16 + 2, 226, dw * 16 - 4, 12, '#6b4a2a'); rc(c, dx * 16 + 3, 227, dw * 16 - 6, 10, '#8a5a2b');
  (room.furniture || []).filter(f => f.type === 'rug').forEach(f => furniture(c, f, st));
  (room.furniture || []).filter(f => f.type !== 'rug').forEach(f => furniture(c, f, st));
}

function corners(c, x, y, w, h, col) {
  rc(c, x, y, 3, 1, col); rc(c, x, y, 1, 3, col);
  rc(c, x + w - 3, y, 3, 1, col); rc(c, x + w - 1, y, 1, 3, col);
  rc(c, x, y + h - 1, 3, 1, col); rc(c, x, y + h - 3, 1, 3, col);
  rc(c, x + w - 3, y + h - 1, 3, 1, col); rc(c, x + w - 1, y + h - 3, 1, 3, col);
}
function arrow(c, cx, y, col) { rc(c, cx - 2, y, 5, 1, col); rc(c, cx - 1, y + 1, 3, 1, col); rc(c, cx, y + 2, 1, 1, col); }

return { rc, hash, buildBG, buildInterior, station, heli, flag, sock, drawChar, portrait, corners, arrow };
})();
