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
  return 'rgb(' + r + ',' + g + ',' + b + ')';
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

// ---------- terrain ----------
function ground(c, world) {
  const GRASS = ['#6dae46', '#68a842', '#72b54a'];
  for (let ty = 0; ty < 15; ty++) for (let tx = 0; tx < 20; tx++) {
    const px = tx * 16, py = ty * 16;
    rc(c, px, py, 16, 16, GRASS[Math.floor(hash(tx, ty) * 3)]);
    for (let k = 0; k < 4; k++) {
      const gx = px + Math.floor(hash(tx * 5 + k, ty + 7) * 14), gy = py + Math.floor(hash(tx + 3, ty * 5 + k) * 13);
      rc(c, gx, gy, 1, 2, '#5b9838'); rc(c, gx + 1, gy, 1, 1, '#86c85b');
    }
    if (hash(tx + 11, ty + 5) > 0.93) {
      const fx = px + 4 + Math.floor(hash(tx, ty) * 8), fy = py + 4 + Math.floor(hash(ty, tx) * 8);
      const col = ['#f06292', '#ffd54f', '#ffffff', '#ba68c8'][Math.floor(hash(tx * 2, ty * 3) * 4)];
      rc(c, fx - 1, fy, 3, 1, col); rc(c, fx, fy - 1, 1, 3, col); rc(c, fx, fy, 1, 1, '#fff3a0');
    }
  }
  const dirt = (y0, y1) => {
    for (let y = y0; y < y1; y++) for (let x = 0; x < 320; x++) {
      const h = hash(x, y);
      rc(c, x, y, 1, 1, h < .08 ? '#b48a4f' : h > .94 ? '#dcc08a' : '#c9a66b');
    }
    for (let x = 0; x < 320; x++) {
      if (hash(x, y0) < .75) rc(c, x, y0, 1, 1, '#a47c45');
      if (hash(x, y1) < .75) rc(c, x, y1 - 1, 1, 1, '#a47c45');
    }
  };
  dirt(80, 112); dirt(176, 192);
  for (let y = 192; y < 240; y++) for (let x = 0; x < 320; x++) {
    const h = hash(x + 99, y);
    rc(c, x, y, 1, 1, h < .1 ? '#444a52' : h > .93 ? '#5a606a' : '#4d535c');
  }
  for (let x = 0; x < 320; x++) if (x % 8 < 5) rc(c, x, 192, 1, 1, '#d8d8d8');
  // helipads
  world.helis.forEach(hl => {
    const x = hl.x * 16 - 3, y = hl.y * 16 - 4;
    rc(c, x, y, 38, 22, '#575d67');
    const m = '#e5c84a';
    rc(c, x, y, 5, 1, m); rc(c, x, y, 1, 4, m); rc(c, x + 33, y, 5, 1, m); rc(c, x + 37, y, 1, 4, m);
    rc(c, x, y + 21, 5, 1, m); rc(c, x, y + 18, 1, 4, m); rc(c, x + 33, y + 21, 5, 1, m); rc(c, x + 37, y + 18, 1, 4, m);
  });
}

function building(c, b, door) {
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
  rc(c, x, y, w, 1, INK); rc(c, x, y + h - 1, w, 1, INK); rc(c, x, y, 1, h, INK); rc(c, x + w - 1, y, 1, h, INK);
  if (b.steeple) {
    const sx = x + Math.floor(w / 2) - 3;
    rc(c, sx, y - 8, 7, 9, INK); rc(c, sx + 1, y - 7, 5, 8, b.body);
    rc(c, sx + 1, y - 7, 5, 2, b.roof); rc(c, sx + 2, y - 4, 3, 3, '#f5d77a');
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
    rc(c, wx - 1, y + 28, 10, 1, shade(b.body, -.25));
  }
  if (door) {
    rc(c, dx, y + h - 12, 8, 12, INK); rc(c, dx + 1, y + h - 11, 6, 11, '#8a5a2b');
    rc(c, dx + 1, y + h - 11, 6, 1, '#a8733a'); rc(c, dx + 5, y + h - 6, 1, 1, '#ffd34d');
    rc(c, dx + 3, y + h - 11, 1, 11, '#6b4a2a');
  }
}

function tree(c, tx, ty) {
  const px = tx * 16, py = ty * 16;
  rc(c, px + 3, py + 14, 10, 2, 'rgba(0,0,0,.22)');
  rc(c, px + 6, py + 10, 4, 6, '#5a3d20'); rc(c, px + 6, py + 10, 1, 6, '#7a5530');
  const rows = [[1, 5, 11], [2, 3, 13], [3, 2, 14], [4, 1, 15], [5, 1, 15], [6, 1, 15], [7, 2, 14], [8, 3, 13], [9, 4, 12], [10, 6, 10]];
  rows.forEach(([r, a, b]) => rc(c, px + a - 1, py + r, b - a + 2, 1, '#2f6b2a'));
  rows.forEach(([r, a, b]) => rc(c, px + a, py + r, b - a, 1, '#3f8f35'));
  rows.slice(0, 6).forEach(([r, a]) => rc(c, px + a + 1, py + r + 1, 3, 1, '#63b84e'));
  rc(c, px + 5, py + 3, 2, 1, '#86d36a'); rc(c, px + 9, py + 6, 2, 1, '#2f6b2a'); rc(c, px + 4, py + 7, 3, 1, '#2f6b2a');
}

function buildBG(c, world) {
  ground(c, world);
  world.buildings.forEach(b => building(c, b, world.stations.find(s => s.x >= b.x && s.x < b.x + b.w && s.y === b.y + b.h)));
  world.trees.forEach(t => tree(c, t[0], t[1]));
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
function station(c, s, t) {
  c.save(); c.translate(s.x * 16, s.y * 16);
  rc(c, 0, 0, 16, 16, '#cdbd94'); rc(c, 0, 0, 16, 1, '#a8946a'); rc(c, 0, 15, 16, 1, '#a8946a'); rc(c, 0, 0, 1, 16, '#a8946a'); rc(c, 15, 0, 1, 16, '#a8946a');
  STATION_ART[s.id](c, t); c.restore();
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
  rc(c, x + 3, y + 14, 26, 2, 'rgba(0,0,0,.25)');
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
function apache(c, x, y, t) {
  const base = '#3f4636';
  rc(c, x + 3, y + 14, 26, 2, 'rgba(0,0,0,.25)');
  rotor(c, x, y, 17, t, false);
  rc(c, x + 16, y + 3, 2, 2, INK);
  rc(c, x + 12, y + 5, 7, 2, shade(base, -.2));
  rc(c, x + 10, y + 7, 18, 4, INK); rc(c, x + 11, y + 7, 16, 3, base);
  rc(c, x + 19, y + 5, 9, 1, INK); rc(c, x + 19, y + 6, 4, 2, '#7fb3c8'); rc(c, x + 24, y + 6, 4, 2, '#7fb3c8'); rc(c, x + 23, y + 6, 1, 2, INK);
  rc(c, x + 28, y + 8, 3, 3, '#2a2a2a'); rc(c, x + 29, y + 9, 1, 1, '#5a6a7a');
  rc(c, x + 14, y + 10, 7, 1, INK); rc(c, x + 14, y + 11, 3, 2, '#555'); rc(c, x + 18, y + 11, 3, 2, '#555');
  rc(c, x + 1, y + 8, 10, 2, base); rc(c, x + 1, y + 10, 10, 1, INK);
  rc(c, x, y + 4, 3, 5, base); rc(c, x, y + 4, 1, 5, INK);
  rc(c, x + 1, y + 2, 1, 4, '#555');
  rc(c, x + 22, y + 11, 2, 3, INK); rc(c, x + 2, y + 11, 1, 2, INK);
}
function heli(c, h, t) {
  const x = h.x * 16, y = h.y * 16;
  if (h.type === 'uh60') blackhawk(c, x, y, t, '#4f5a3a', false, false);
  else if (h.type === 'hh60') blackhawk(c, x, y, t, '#4f5a3a', true, true);
  else apache(c, x, y, t);
}

// ---------- characters (12x16) ----------
const CHAR_TOP = [
  '....oooo....', '...ohhhho...', '..ohhhhhho..', '..ohssssho..', '..osesseso..', '..osssssso..', '...ossso....',
  '..obbbbbo...', '.obbbbbbbo..', '.osbbbbbso..', '.osbbbbbso..', '..obbbbbo...', '..ollllo....',
];
const CHAR_LEGS = [
  ['..olo.olo...', '..olo.olo...', '..ofo.ofo...'],
  ['..olo.olo...', '..olo..olo..', '..ofo..ofo..'],
  ['..olo.olo...', '.olo...olo..', '.ofo...ofo..'],
];
function drawChar(c, cx, bottom, look, frame, flip, noShadow) {
  const x0 = cx - 6, y0 = bottom - 16;
  const col = { o: INK, h: look.hair, s: look.skin, e: '#222', b: look.body, l: look.legs, f: '#3a2a1a' };
  if (!noShadow) rc(c, cx - 4, bottom - 1, 8, 2, 'rgba(0,0,0,.25)');
  const rows = CHAR_TOP.concat(CHAR_LEGS[frame || 0]);
  for (let r = 0; r < 16; r++) for (let q = 0; q < 12; q++) {
    const ch = rows[r][q]; if (ch === '.') continue;
    let color = col[ch];
    if (look.camo && (ch === 'b' || ch === 'l') && hash(q * 3, r * 7) < .3) color = look.camo;
    rc(c, x0 + (flip ? 11 - q : q), y0 + r, 1, 1, color);
  }
  (look.acc || []).forEach(a => rc(c, x0 + (flip ? 11 - a[0] : a[0]), y0 + a[1], 1, 1, a[2]));
}
function portrait(look) {
  const p = document.createElement('canvas'); p.width = 14; p.height = 18; p.className = 'portrait';
  const c = p.getContext('2d'); rc(c, 0, 0, 14, 18, '#d9c9a0'); rc(c, 0, 12, 14, 6, '#c9b88e');
  drawChar(c, 7, 17, look, 0, false, true);
  return p;
}

function corners(c, x, y, w, h, col) {
  rc(c, x, y, 3, 1, col); rc(c, x, y, 1, 3, col);
  rc(c, x + w - 3, y, 3, 1, col); rc(c, x + w - 1, y, 1, 3, col);
  rc(c, x, y + h - 1, 3, 1, col); rc(c, x, y + h - 3, 1, 3, col);
  rc(c, x + w - 3, y + h - 1, 3, 1, col); rc(c, x + w - 1, y + h - 3, 1, 3, col);
}
function arrow(c, cx, y, col) { rc(c, cx - 2, y, 5, 1, col); rc(c, cx - 1, y + 1, 3, 1, col); rc(c, cx, y + 2, 1, 1, col); }

return { rc, hash, buildBG, station, heli, flag, sock, drawChar, portrait, corners, arrow };
})();
