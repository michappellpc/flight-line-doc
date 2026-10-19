// Flight Line Doc: procedural audio. Every sound is synthesized with the Web Audio API; no audio files.
// Master gain -> compressor -> speakers. Buses: sfx, ambience, music.
window.FLD_AUDIO = (() => {
'use strict';

const KEY = 'fld_audio';
const cfg = { volume: 0.6, music: true, muted: false };
try { Object.assign(cfg, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} };

let ac = null, master, sfxBus, ambBus, musBus, noiseBuf;
const amb = {};                       // persistent ambience layers: { gain, filter? }
const scene = { area: 'outside', night: false, season: 'spring', rotor: 0, rain: false };
const midi = n => 440 * Math.pow(2, (n - 69) / 12);
const rand = (a, b) => a + Math.random() * (b - a);

// ---------- setup ----------
function init() {
  if (ac) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try {
    ac = new AC();
    master = ac.createGain();
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ac.destination);
    const bus = v => { const g = ac.createGain(); g.gain.value = v; g.connect(master); return g; };
    sfxBus = bus(1); ambBus = bus(1); musBus = bus(0);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    buildAmbience();
    applyVolume(); applyScene(true);
    setInterval(ambienceTick, 200);
    setInterval(schedule, 100);
  } catch (e) { ac = null; return false; }
  return true;
}
function applyVolume() {
  if (!ac) return;
  master.gain.setTargetAtTime(cfg.muted ? 0 : cfg.volume * 0.8, ac.currentTime, 0.05);
}
function noiseSrc() { const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s; }
function filt(type, freq, q) { const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q; return f; }
function chain(...nodes) { for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]); return nodes[nodes.length - 1]; }

// ---------- ambience layers ----------
function buildAmbience() {
  const layer = (name, ...nodes) => { const g = ac.createGain(); g.gain.value = 0; chain(...nodes, g, ambBus); amb[name] = { gain: g, nodes }; };
  // Wind: band-passed noise, slowly swelling.
  const wind = noiseSrc(), windAmp = ac.createGain(), windLfo = ac.createOscillator(), windDepth = ac.createGain();
  windAmp.gain.value = 0.7; windLfo.frequency.value = 0.09; windDepth.gain.value = 0.3;
  windLfo.connect(windDepth); windDepth.connect(windAmp.gain);
  layer('wind', wind, filt('bandpass', 420, 0.6), filt('lowpass', 900), windAmp);
  // Rain: bright hiss; its lowpass closes indoors to muffle it.
  const rain = noiseSrc(), rainLp = filt('lowpass', 6000);
  layer('rain', rain, filt('highpass', 900), rainLp);
  amb.rain.filter = rainLp;
  // Rotor: low noise pulsed at blade-passing rate.
  const rotor = noiseSrc(), rotorAmp = ac.createGain(), rotorLfo = ac.createOscillator(), rotorDepth = ac.createGain();
  rotorAmp.gain.value = 0.5; rotorLfo.type = 'triangle'; rotorLfo.frequency.value = 4.3; rotorDepth.gain.value = 0.5;
  rotorLfo.connect(rotorDepth); rotorDepth.connect(rotorAmp.gain);
  layer('rotor', rotor, filt('lowpass', 140), rotorAmp);
  // Room tone: soft low air plus a faint mains hum.
  const room = noiseSrc(), hum = ac.createOscillator(), humGain = ac.createGain();
  hum.frequency.value = 60; humGain.gain.value = 0.15;
  layer('room', room, filt('lowpass', 260));
  chain(hum, humGain, amb.room.gain);
  [wind, windLfo, rain, rotor, rotorLfo, room, hum].forEach(n => n.start());
}
const LEVEL = { wind: 0.05, rain: 0.06, rotor: 0.14, room: 0.035 };
function applyScene(now) {
  if (!ac) return;
  const out = scene.area === 'outside', t = ac.currentTime, tau = now ? 0.01 : 0.8;
  const set = (name, v) => amb[name].gain.gain.setTargetAtTime(v, t, tau);
  set('wind', out ? LEVEL.wind * (scene.night && scene.season !== 'winter' ? 0.5 : 1) * (scene.season === 'winter' ? 1.3 : 1) : 0);
  set('rain', scene.rain ? LEVEL.rain * (out ? 1 : 0.4) : 0);
  amb.rain.filter.frequency.setTargetAtTime(out ? 6000 : 700, t, tau);
  set('rotor', out ? LEVEL.rotor * Math.max(0, Math.min(1, scene.rotor)) : 0);
  set('room', out ? 0 : LEVEL.room);
  musBus.gain.setTargetAtTime(cfg.music ? (scene.night ? 0.18 : 0.3) : 0, t, now ? 0.01 : 1.2);
}
// Occasional critters, outside only.
function ambienceTick() {
  if (!ac || ac.state !== 'running' || scene.area !== 'outside') return;
  if (scene.night && scene.season !== 'winter') { if (Math.random() < 0.35) cricket(); }
  else if (!scene.night && scene.season !== 'winter' && !scene.rain && Math.random() < 0.04) bird();
}
function cricket() {
  const t = ac.currentTime + rand(0, 0.1), f = rand(4200, 4700);
  for (let i = 0; i < 3; i++) tone(f, 0.025, 'sine', 0.012, t + i * 0.05, { bus: ambBus, attack: 0.004 });
}
function bird() {
  let t = ac.currentTime + 0.05;
  const base = rand(2400, 3200), n = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) { tone(base, 0.11, 'sine', 0.016, t, { bus: ambBus, slideTo: base * rand(1.2, 1.5), attack: 0.01 }); t += rand(0.12, 0.2); }
}

// ---------- one-shot helpers ----------
// tone(freq, dur, type, vol, time, { slideTo, attack, bus, lp })
function tone(f, dur, type, vol, t, o = {}) {
  const osc = ac.createOscillator(), g = ac.createGain();
  osc.type = type; osc.frequency.setValueAtTime(f, t);
  if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + dur);
  const a = o.attack || 0.008;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let out = g;
  if (o.lp) { const f2 = filt('lowpass', o.lp); g.connect(f2); out = f2; }
  osc.connect(g); out.connect(o.bus || sfxBus);
  osc.start(t); osc.stop(t + dur + 0.05);
  osc.onended = () => { osc.disconnect(); g.disconnect(); if (out !== g) out.disconnect(); };
}
function noiseHit(dur, type, freq, vol, t, q) {
  const s = ac.createBufferSource(), f = filt(type, freq, q), g = ac.createGain();
  s.buffer = noiseBuf;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  chain(s, f, g, sfxBus);
  s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.02);
  s.onended = () => { s.disconnect(); f.disconnect(); g.disconnect(); };
}
const SFX = {
  click: t => tone(880, 0.05, 'square', 0.035, t, { lp: 2500 }),
  page: t => { tone(660, 0.07, 'triangle', 0.05, t); tone(990, 0.08, 'triangle', 0.04, t + 0.05); },
  good: t => { tone(523.25, 0.4, 'triangle', 0.1, t); tone(523.25, 0.4, 'sine', 0.05, t); tone(783.99, 0.55, 'triangle', 0.1, t + 0.13); tone(783.99, 0.55, 'sine', 0.05, t + 0.13); },
  bad: t => { tone(116, 0.32, 'square', 0.05, t, { slideTo: 98, lp: 420, attack: 0.02 }); tone(110, 0.32, 'square', 0.04, t, { slideTo: 92, lp: 420, attack: 0.02 }); },
  levelup: t => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.22, 'triangle', 0.08, t + i * 0.07)),
  heart: t => [1318.5, 1568, 2093, 2637].forEach((f, i) => tone(f * rand(0.99, 1.01), 0.3, 'sine', 0.045, t + i * 0.06)),
  step: t => noiseHit(rand(0.025, 0.045), 'bandpass', rand(280, 560), rand(0.03, 0.05), t, 1.2),
  door: t => { noiseHit(0.14, 'lowpass', 220, 0.18, t); tone(90, 0.12, 'sine', 0.08, t); noiseHit(0.03, 'highpass', 2500, 0.03, t + 0.1); },
  cash: t => { tone(987.77, 0.08, 'square', 0.035, t, { lp: 3000 }); tone(1318.5, 0.22, 'square', 0.035, t + 0.07, { lp: 3000 }); },
  alarm: t => { for (let i = 0; i < 4; i++) { tone(950, 0.11, 'square', 0.05, t + i * 0.17, { lp: 3000 }); tone(1200, 0.11, 'square', 0.03, t + i * 0.17 + 0.055, { lp: 3000 }); } },
  sleep: t => [783.99, 659.25, 523.25, 392].forEach((f, i) => tone(f, 0.6, 'triangle', 0.06, t + i * 0.28, { attack: 0.05 })),
};

// ---------- music ----------
// 16-bar loops. Chords are scale degrees (0 = I). One song per season, generated once with a fixed seed.
const SONGS = {
  spring: { key: 60, minor: false, bpm: 90, chords: [0, 4, 5, 3, 0, 3, 4, 4, 5, 3, 0, 4, 3, 0, 1, 4] },
  summer: { key: 62, minor: false, bpm: 94, chords: [0, 3, 0, 4, 5, 3, 1, 4, 0, 3, 5, 4, 3, 4, 0, 0] },
  fall:   { key: 57, minor: true,  bpm: 86, chords: [0, 5, 2, 6, 0, 3, 6, 2, 5, 6, 0, 0, 3, 5, 4, 0] },
  winter: { key: 65, minor: false, bpm: 80, chords: [0, 5, 3, 4, 0, 2, 3, 4, 5, 3, 0, 4, 3, 3, 4, 0] },
};
const SCALE = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10] };
const RHYTHMS = [[1, 0, 1, 0, 1, 0, 1, 0], [1, 0, 0, 1, 1, 0, 1, 0], [1, 1, 1, 0, 1, 0, 0, 0], [1, 0, 1, 1, 1, 0, 0, 0], [1, 0, 0, 0, 1, 0, 1, 1]];
function seeded(seed) { return () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }; }
const compiled = {};
function compile(name) {
  if (compiled[name]) return compiled[name];
  const s = SONGS[name], sc = s.minor ? SCALE.min : SCALE.maj, r = seeded(name.length * 977 + s.key);
  const note = deg => s.key + sc[((deg % 7) + 7) % 7] + 12 * Math.floor(deg / 7);
  const steps = [];                    // 128 eighth notes: { mel, bass, arp }
  let deg = 7 + s.chords[0];
  s.chords.forEach((c, bar) => {
    const tones = [c, c + 2, c + 4], rhythm = bar === 15 ? [1, 0, 0, 0, 0, 0, 0, 0] : RHYTHMS[Math.floor(r() * RHYTHMS.length)];
    for (let i = 0; i < 8; i++) {
      const st = { arp: note(tones[[0, 1, 2, 1][i % 4]]) };
      if (i === 0) st.bass = note(c) - 12; else if (i === 4) st.bass = note(c + 4) - 12;
      if (rhythm[i]) {
        if (i % 4 === 0 || bar === 15) {        // strong beats land on a chord tone near the last note
          const opts = tones.map(t => t + 7).concat(tones.map(t => t + 14)).filter(t => t >= 5 && t <= 15);
          deg = opts.reduce((a, b) => Math.abs(b - deg) < Math.abs(a - deg) ? b : a, opts[0]);
        } else deg = Math.max(5, Math.min(15, deg + [-2, -1, 1, 2][Math.floor(r() * 4)]));
        let len = 1; while (i + len < 8 && !rhythm[i + len]) len++;
        st.mel = note(deg); st.len = bar === 15 ? 6 : Math.min(len, 3);
      }
      steps.push(st);
    }
  });
  return (compiled[name] = { steps, bpm: s.bpm });
}
const seq = { step: 0, next: 0, running: false };
function schedule() {
  if (!ac || !seq.running) return;
  if (ac.state !== 'running') { seq.next = ac.currentTime + 0.1; return; }
  const song = compile(scene.season in SONGS ? scene.season : 'spring'), eighth = 30 / song.bpm;
  if (seq.next < ac.currentTime) seq.next = ac.currentTime + 0.05;
  while (seq.next < ac.currentTime + 0.5) {
    const st = song.steps[seq.step % song.steps.length], t = seq.next;
    if (st.mel) { tone(midi(st.mel), st.len * eighth * 0.95, 'triangle', 0.09, t, { bus: musBus, attack: 0.02 }); tone(midi(st.mel), st.len * eighth * 0.9, 'square', 0.015, t, { bus: musBus, lp: 1600, attack: 0.02 }); }
    if (st.bass) tone(midi(st.bass), eighth * 3.5, 'triangle', 0.1, t, { bus: musBus, attack: 0.01 });
    tone(midi(st.arp), eighth * 0.8, 'square', 0.012, t, { bus: musBus, lp: 1400 });
    seq.next += eighth; seq.step = (seq.step + 1) % song.steps.length;
  }
}
function startMusic() { if (!ac || seq.running) return; seq.running = true; seq.step = 0; seq.next = ac.currentTime + 0.1; }

// ---------- public API ----------
return {
  unlock() {
    try {
      if (!init()) return;
      if (ac.state === 'suspended') ac.resume();
      if (cfg.music) startMusic();
    } catch (e) {}
  },
  play(name) {
    try { if (ac && ac.state === 'running' && !cfg.muted && SFX[name]) SFX[name](ac.currentTime + 0.01); } catch (e) {}
  },
  setScene(o) {
    try {
      if (!o) return;
      let changed = false;
      ['area', 'night', 'season', 'rain'].forEach(k => { if (k in o && o[k] !== scene[k]) { scene[k] = o[k]; changed = true; } });
      if ('rotor' in o && Math.abs((+o.rotor || 0) - scene.rotor) > 0.02) { scene.rotor = +o.rotor || 0; changed = true; }
      if (changed) applyScene(false);
    } catch (e) {}
  },
  setMusic(on) {
    try {
      cfg.music = !!on; persist();
      if (!ac) return;
      if (cfg.music) startMusic(); else seq.running = false;
      applyScene(false);
    } catch (e) {}
  },
  setVolume(v) { try { cfg.volume = Math.max(0, Math.min(1, +v || 0)); persist(); applyVolume(); } catch (e) {} },
  setMuted(m) { try { cfg.muted = !!m; persist(); applyVolume(); } catch (e) {} },
  get muted() { return cfg.muted; },
  get volume() { return cfg.volume; },
  get musicOn() { return cfg.music; },
};
})();
