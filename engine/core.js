// =====================================================================
//  ドット紙芝居の共通部（ユーティリティ・スプライト・台本・音・再生UI）
//  描画は描画エンジン（rpg.js：RPG 風タイル）が受け持ち、
//  RENDER のフックを埋める。作品 HTML は core.js → 描画エンジン → 作品データの順に読む。
// =====================================================================
'use strict';

// スプライト共通色（描画エンジン・作品側で Object.assign して上書き・追加してよい）
const PAL = {
  K: '#3b342e', k: '#24201c', E: '#121212', S: '#e2b48c', s: '#bf8c66', c: '#e88f86',
  W: '#ece7da', w: '#bdb6a6', B: '#6b9cc6', b: '#4b7499', N: '#4258a0', n: '#2f3f73',
  P: '#a8648f', p: '#7a476b', G: '#6f9459', O: '#8f6040', o: '#6c4630',
  M: '#5a5550', T: '#c9a865', H: '#d8d4cb', R: '#c4473a', U: '#7f7266',
  Q: '#c0763f', q: '#97582c', Z: '#cdb88a', V: '#d9d3c5', A: '#9ea3a8', L: '#f2f6f8',
  X: '#b3261e', Y: '#dccb9c', y: '#b5a274', x: '#0b0a09',
};

// 作品側で中身を入れる入れ物
const SPR = {}, WPN = {}, MOOD = {}, SCENES = {};
let CHAPTERS = [], NUM = [];

// ---- 言語（日本語 / 英語）----
// ?lang=en で英語。URL で選んだ言語は覚えて、一覧やほかの作品でも使う。どちらも選んでいなければブラウザの言語に従う。
// 作品は <head> の <meta name="langs" content="ja en"> で英語に対応していることを示し、文を L('日本語', 'English') で書く。
// 英語に対応していない作品は、英語を選んでいても日本語で出す（台本を読む前に決めるので、キットの文もそろう）
const LANGS = (document.querySelector('meta[name="langs"]')?.content ?? 'ja').split(/\s+/);
const LANG = (() => {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'ja' || q === 'en') localStorage.setItem('lang', q);
  const want = q ?? localStorage.getItem('lang') ?? (navigator.language.startsWith('ja') ? 'ja' : 'en');
  return LANGS.includes(want) ? want : 'ja';
})();
const L = (ja, en) => LANG === 'en' && en != null ? en : ja;
// かな・漢字・全角の字を含まない文（英語・ドイツ語など）。欧文のドットの文字で描く
const isLatin = t => !/[぀-ヿ㐀-鿿＀-￯]/.test(t);

// =====================================================================
//  ユーティリティ
// =====================================================================
function h2(x, y) {
  let n = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
const h1 = n => h2(n, 9137);
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = h2(xi, yi), b = h2(xi + 1, yi), c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mod = (a, n) => ((a % n) + n) % n;

// キーフレーム値： 数値 / 文字列 / [[f, 値], ...] / 関数(f)
function kv(v, f, lin) {
  if (typeof v === 'function') return v(f);
  if (!Array.isArray(v) || !Array.isArray(v[0])) return v;
  if (f <= v[0][0]) return v[0][1];
  for (let i = 0; i < v.length - 1; i++) {
    const a = v[i], b = v[i + 1];
    if (f >= b[0]) continue;
    if (typeof a[1] !== 'number') return a[1];
    let u = (f - a[0]) / (b[0] - a[0]);
    if (!lin) u = u * u * (3 - 2 * u);
    return a[1] + (b[1] - a[1]) * u;
  }
  return v[v.length - 1][1];
}
// 背景パラメータもキーフレームで動かせる
const evalSp = (sp, f) => Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, kv(v, f)]));
const kanji = n => n < 10 ? '〇一二三四五六七八九'[n] : (n >= 20 ? '〇一二三四五六七八九'[Math.floor(n / 10)] : '') + '十' + (n % 10 ? '〇一二三四五六七八九'[n % 10] : '');

// =====================================================================
//  スプライト（1文字 = 1セル。'.' は透明。足元が最下行）
// =====================================================================
const closed = r => r.map(s => s.replaceAll('E', 's'));
const rotL = r => Array.from({ length: r[0].length }, (_, y) => Array.from({ length: r.length }, (_, x) => r[x][r[0].length - 1 - y]).join(''));
const rotR = r => Array.from({ length: r[0].length }, (_, y) => Array.from({ length: r.length }, (_, x) => r[r.length - 1 - x][y]).join(''));
const flipRows = r => r.map(s => [...s].reverse().join(''));

// 4近傍の黒フチを付ける（1マスずつ大きくなる）
function outline(rows) {
  const h = rows.length + 2, w = rows[0].length + 2;
  const g = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => rows[y - 1]?.[x - 1] ?? '.'));
  const solid = (x, y) => g[y]?.[x] && g[y][x] !== '.' && g[y][x] !== 'x';
  return g.map((r, y) => r.map((c, x) => c === '.' && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) ? 'x' : c).join(''));
}

// ---- 人物（フチなしの行）を組み替える道具 ----
// 絵柄は幅で見分ける。13 は C（13×17：頭 10 行・体 5 行・足 2 行）、9 は小（9×13：頭 7 行・体 4 行・足 2 行）
// head: 頭の行数、hand: 右手の位置（フチ込みの座標）
const FIG = { 13: { head: 10, hand: [12, 13] }, 9: { head: 7, hand: [9, 9] } };
const figOf = r => FIG[r[0].length];
const withRows = (r, map) => r.map((s, i) => map[i] ?? s);                    // 行を差し替える
const recolor = (r, map) => r.map(s => [...s].map(ch => map[ch] ?? ch).join(''));   // 色を差し替える
// 正座：腰から下を膝の 2 行に。馬上：腰から上と鞍に掛かる 1 行（どちらも下から 4 行目が腰）
const seiza = r => { const n = r.length, w = r[0].length, c = w >> 1; return [...r.slice(0, n - 4), r[n - 4][c].repeat(w), r[n - 3][c].repeat(w)]; };
const riding = r => { const n = r.length, w = r[0].length, c = w >> 1; return [...r.slice(0, n - 3), '.' + r[n - 4][c].repeat(w - 2) + '.']; };
const lying = r => rotL(closed(r));                                           // 寝姿（頭が左）
const headOf = r => r.slice(0, figOf(r).head);                                 // 首から上
const headless = r => r.map((s, y) => y < figOf(r).head ? '.'.repeat(s.length) : s);   // 首のない胴
// ---- まんじゅうの絵柄（Clawd 風）----
// 人物と同じ大きさの型を、その人物の衣の色で 1 色に塗り、髪・帽子・髭・襟・帯などを重ねる。
// 型の X は体（人物の肌以外の色があればそれを描く）、E は目。'.' は頭の上の行（top）だけ人物の髪・帽子を描く。
// legs から下（足）は体の色だけ
const BUN = {
  13: { top: 4, legs: 16, rows: [
    '.............', '.............', '.............', '.............',
    '..XXXXXXXXX..', '..XXXXXXXXX..', '..XXEXXXEXX..', '..XXEXXXEXX..', '..XXXXXXXXX..', 'XXXXXXXXXXXXX',
    'XXXXXXXXXXXXX', '..XXXXXXXXX..', '..XXXXXXXXX..', '..XXXXXXXXX..', '..XXXXXXXXX..', '..XXXXXXXXX..', '..X.X...X.X..'] },
  9: { top: 3, legs: 12, rows: [
    '.........', '.........', '.........',
    '.XXXXXXX.', '.XEXXXEX.', '.XEXXXEX.', '.XXXXXXX.',
    'XXXXXXXXX', '.XXXXXXX.', '.XXXXXXX.', '.XXXXXXX.', '.XXXXXXX.', '.X.X.X.X.'] },
};
const SKIN = new Set([...'.SscE']);
const lum = ch => { const n = parseInt((PAL[ch] ?? '#808080').slice(1), 16); return (.3 * (n >> 16) + .59 * (n >> 8 & 255) + .11 * (n & 255)) / 255; };
// 立ち姿（または首から上だけ）の人物をまんじゅうにする。それ以外の形はそのまま返す
function bunify(r) {
  const T = BUN[r[0].length], fig = figOf(r);
  if (!T || (r.length !== T.rows.length && r.length !== fig.head)) return r;
  // 体の色：首から下でいちばん多い肌以外の色（首から上だけのときは頭の色）
  const n = {};
  for (const s of r.slice(r.length > fig.head ? fig.head : 0, -1)) for (const ch of s) if (!SKIN.has(ch)) n[ch] = (n[ch] ?? 0) + 1;
  const body = Object.keys(n).sort((a, b) => n[b] - n[a])[0] ?? 'U', eye = lum(body) < .3 ? 'W' : 'E';
  return T.rows.slice(0, r.length).map((t, y) => [...t].map((ch, x) => {
    const h = r[y][x];
    if (ch === '.') return y < T.top ? h : '.';
    if (ch === 'E') return eye;
    return y < T.legs && !SKIN.has(h) ? h : body;
  }).join(''));
}
const bunAll = raw => Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? bunify(v) : v]));

// 黒フチ付きの人物。hand は右手の位置（省くと絵柄の既定）。
// 目（E の下端。涙の出どころ）と口の高さ（白い息の出どころ）も覚えておく
function person(rows, hand) {
  const sp = parse(outline(rows), hand ?? figOf(rows)?.hand);
  sp.eyes = sp.px.filter(([x, y, c]) => c === 'E' && !sp.px.some(p => p[2] === 'E' && p[1] === y + 1 && p[0] === x)
    && !sp.px.some(p => p[2] === 'E' && p[1] === y && p[0] === x - 1)).map(([x, y]) => [x, y]);
  sp.mouth = sp.eyes.length ? Math.round(sp.eyes[0][1] + sp.h * .1) : Math.round(sp.h * .53);
  return sp;
}

// ---- 人物の絵柄の切り替え ----
// 作品側は cast(絵柄, { 名前: スプライト }) か castWithBuns で人物を登録する。右上の「人物」の選択（C キーで次へ）で切り替え、選んだ絵柄は覚えておく。
// その絵柄にない人物は、ほかの絵柄で描く
const CASTS = { mini: {}, c: {}, bunMini: {}, bunC: {} };
const CAST_LABEL = { mini: ['人物 小', 'Sprite S'], c: ['人物 中', 'Sprite M'], bunMini: ['いか 小', 'Bun S'], bunC: ['いか 中', 'Bun M'] };
const BUN_OF = { mini: 'bunMini', c: 'bunC' };
let castStyle = new URLSearchParams(location.search).get('cast') ?? localStorage.getItem('castStyle') ?? 'mini';
if (!CASTS[castStyle]) castStyle = 'mini';
function cast(style, sprites) {
  Object.assign(CASTS[style], sprites);
  for (const [k, v] of Object.entries(sprites)) if (style === castStyle || !(k in SPR)) SPR[k] = v;
}
// 人物の行（raw）からスプライトを組む build を、そのままの絵柄とまんじゅうの絵柄の両方で登録する
function castWithBuns(style, raw, build) {
  cast(style, build(raw));
  cast(BUN_OF[style], build(bunAll(raw)));
}
function setCast(style) {
  castStyle = style; localStorage.setItem('castStyle', style);
  for (const s in CASTS) if (s !== style) Object.assign(SPR, CASTS[s]);
  Object.assign(SPR, CASTS[style]);
  applyHero();
  RENDER.restyle?.();
  if ($('bCast')) $('bCast').value = style;
}

// ---- 主人公の選択 ----
// 作品側は heroes(名前, [[id, 見出し, 小の行（フチなし）かスプライト], ...], 絵柄ごとの既定の id) で主人公の候補を登録する。
// 右上の「主人公」の選択（H キーで次へ）で、小の絵柄（人物 小・いか 小）のときだけ、その名前の人物を選んだ候補に差し替える。
// 中の絵柄のときと、まだ選んでいないときは、絵柄どおりの絵で描く。選んだ候補は覚えておく
const HERO = { key: null, list: [], follow: {} };
const SMALL_CASTS = new Set(['mini', 'bunMini']);
let heroId = localStorage.getItem('hero') ?? '';
function heroes(key, list, follow) {
  Object.assign(HERO, { key, follow, list: list.map(([id, label, rows]) => ({ id, label, sp: Array.isArray(rows) ? person(rows) : rows })) });
}
function applyHero() {
  if (!HERO.key) return;
  const small = SMALL_CASTS.has(castStyle), h = small && HERO.list.find(o => o.id === heroId);
  if (h) SPR[HERO.key] = h.sp;
  const el = $('bHero');
  if (el) { el.disabled = !small; el.value = h ? heroId : HERO.follow[castStyle]; }
}
function setHero(id) {
  heroId = id; localStorage.setItem('hero', id);
  setCast(castStyle);
}

function parse(rows, hand, over) {
  const w = Math.max(...rows.map(r => r.length)), px = [];
  rows.forEach((r, y) => { if (r.length !== w) console.warn('sprite row width mismatch', r); [...r].forEach((c, x) => c !== '.' && px.push([x, y, c])); });
  if (over) over.forEach((r, y) => [...r].forEach((c, x) => c !== '.' && px.push([x, y, c])));
  return { w, h: rows.length, px, hand: hand ?? [w - 2, Math.floor(rows.length * .68)] };
}

// =====================================================================
//  台本
// =====================================================================
const CUTS = [];
let CH = 0, TOTAL = 0, START = [];
const chapter = (n, card, scene, sp = {}, o = {}) => { CH = n; CUTS.push({ ch: n, card, scene, sp: { ...sp, dim: .28 }, actors: [], fx: [], dur: 3.6, ...o }); };
const cut = o => CUTS.push({ ch: CH, sp: {}, actors: [], fx: [], ...o });

// =====================================================================
//  音（WebAudio で合成）
//  環境音 mood: wind 風 / drone 持続音 / rain 雨 / clatter 電車の走行音
//  out（効果音・環境音）と bgm（曲）を分けてオン / オフできる。設定は記憶する
// =====================================================================
const SFX = {
  ac: null, out: null, bgm: null, clatter: 0, clatterT: 0,
  on: { se: localStorage.getItem('sndSe') !== 'off', bgm: localStorage.getItem('sndBgm') === 'on' },   // 既定は BGM OFF・SE ON
  ambient: .4,   // 環境音（風・持続音・雨・走行音）全体の音量。効果音には掛けない
  init() {
    if (this.ac) return this.ac.resume();
    const ac = this.ac = new (window.AudioContext || window.webkitAudioContext)();
    const master = this.master = ac.createGain(); master.gain.value = playing ? .8 : 0; master.connect(ac.destination);
    this.out = ac.createGain(); this.bgm = ac.createGain();
    for (const k of ['se', 'bgm']) { this.bus(k).gain.value = this.on[k] ? 1 : 0; this.bus(k).connect(master); }
    const nb = this.noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const loop = (type, fr, q) => {
      const src = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
      src.buffer = nb; src.loop = true; fl.type = type; fl.frequency.value = fr; fl.Q.value = q; g.gain.value = 0;
      src.connect(fl).connect(g).connect(this.out); src.start();
      return [g, fl];
    };
    let bp;
    [this.wind, bp] = loop('bandpass', 520, .8);
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .13; lg.gain.value = 260; lfo.connect(lg).connect(bp.frequency); lfo.start();
    [this.rain] = loop('highpass', 2400, .5);
    this.drone = ac.createGain(); this.drone.gain.value = 0;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320; lp.connect(this.drone).connect(this.out);
    for (const fr of [55, 82.6, 110.4]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = fr > 100 ? 'triangle' : 'sine'; o.frequency.value = fr; g.gain.value = .3; o.connect(g).connect(lp); o.start(); }
  },
  bus(k) { return k === 'se' ? this.out : this.bgm; },
  // 一時停止のあいだは全体の音（BGM・効果音・環境音）を止める
  hold(paused) { if (this.ac) this.master.gain.setTargetAtTime(paused ? 0 : .8, this.ac.currentTime, .05); },
  setOn(k, on) {
    this.on[k] = on; localStorage.setItem(k === 'se' ? 'sndSe' : 'sndBgm', on ? 'on' : 'off');
    if (this.ac) this.bus(k).gain.setTargetAtTime(on ? 1 : 0, this.ac.currentTime, .05);
  },
  mood(m = {}, k = 1) {
    if (!this.ac) return;
    const t = this.ac.currentTime, a = k * this.ambient;
    this.wind.gain.setTargetAtTime((m.wind ?? 0) * .5 * a, t, .8);
    this.drone.gain.setTargetAtTime((m.drone ?? 0) * .25 * a, t, 1.2);
    this.rain.gain.setTargetAtTime((m.rain ?? 0) * .35 * a, t, .8);
    this.clatter = (m.clatter ?? 0) * a;
  },
  // 電車の「ガタン、ゴトン」
  tick(dt) {
    if (!this.ac || !this.clatter || !playing) return;
    this.clatterT -= dt;
    if (this.clatterT > 0) return;
    this.clatterT = 1.1;
    [0, .16].forEach(w => { this.tone(70, 'sine', .25 * this.clatter, .18, w, 45); this.burst(.06, 'lowpass', 600, .12 * this.clatter, w); });
  },
  tone(fr, type, vol, dur, when = 0, fr2) {
    const ac = this.ac, t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(fr, t);
    if (fr2) o.frequency.exponentialRampToValueAtTime(fr2, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(this.out); o.start(t); o.stop(t + dur + .05);
  },
  burst(dur, type, fr, vol, when = 0, q = 1) {
    const ac = this.ac, t = ac.currentTime + when, s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = this.noise; fl.type = type; fl.frequency.value = fr; fl.Q.value = q;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(fl).connect(g).connect(this.out); s.start(t, Math.random()); s.stop(t + dur + .05);
  },
  // ---- 8bit 風の音色 ----
  // ピコ音：三角波に矩形波を少し混ぜ、ローパスを閉じながら減衰
  pluck(fr, vol, dur = .12, when = 0) {
    const ac = this.ac, t = ac.currentTime + when, lp = ac.createBiquadFilter(), g = ac.createGain(), sq = ac.createGain();
    lp.type = 'lowpass'; lp.Q.value = 1; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(700, t + .3);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    sq.gain.value = .25; sq.connect(lp); lp.connect(g).connect(this.out);
    for (const [type, dest] of [['triangle', lp], ['square', sq]]) { const o = ac.createOscillator(); o.type = type; o.frequency.value = fr; o.connect(dest); o.start(t); o.stop(t + dur + .05); }
  },
  // ノイズの短いクリック（足音・カーソル・ページ送り）
  click(fr, vol, when = 0) { this.burst(.018, 'bandpass', fr, vol, when, 2.5); },
  // 下がっていくポップ音
  pop(fr, vol, when = 0) { this.tone(fr, 'sine', vol, .14, when, fr * .55); },
  // FM のベル
  fmBell(fr, vol, dur = 1.2, when = 0) {
    const ac = this.ac, t = ac.currentTime + when, car = ac.createOscillator(), mod = ac.createOscillator(), mg = ac.createGain(), g = ac.createGain();
    car.frequency.value = fr; mod.frequency.value = fr * 3.51;
    mg.gain.setValueAtTime(fr * 2.2, t); mg.gain.exponentialRampToValueAtTime(fr * .05, t + 1.2);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    mod.connect(mg).connect(car.frequency); car.connect(g).connect(this.out);
    for (const o of [car, mod]) { o.start(t); o.stop(t + dur + .05); }
  },
  // k: 音ごとの添え字（打鍵の音程の揺れなど）
  play(n, k = 0) {
    if (!this.ac || !this.on.se) return;
    switch (n) {
      case 'blip': this.tone(1400 + Math.random() * 300, 'sine', .02, .04); break;
      case 'clank': [1250, 1890, 2710, 3600].forEach((fr, i) => this.tone(fr * (1 + Math.random() * .02), 'sine', .12 / (i + 1), .45)); this.burst(.05, 'highpass', 3000, .12); break;
      case 'thud': this.tone(110, 'sine', .5, .3, 0, 38); this.burst(.12, 'lowpass', 400, .3); break;
      case 'stab': this.burst(.2, 'bandpass', 900, .35, 0, 2); this.tone(90, 'sine', .4, .5, 0, 30); break;
      case 'glint': [2637, 3520, 4186].forEach((fr, i) => this.tone(fr, 'sine', .05, .6, i * .06)); break;
      case 'bell': for (let i = 0; i < 7; i++) [3100, 4200, 5300].forEach(fr => this.tone(fr * (1 + Math.random() * .03), 'sine', .025, .25, i * .07 + Math.random() * .03)); break;
      case 'thunder': this.burst(2.8, 'lowpass', 260, .6); this.burst(.3, 'lowpass', 1200, .35); break;
      case 'whoosh': this.burst(.8, 'bandpass', 700, .2, 0, .6); break;
      case 'door': [2093, 2637].forEach((fr, i) => this.tone(fr, 'sine', .07, .9, i * .12)); break;
      case 'whistle': this.tone(740, 'sawtooth', .05, 1.4); this.tone(1110, 'sawtooth', .03, 1.4); break;
      case 'clink': this.tone(3400, 'sine', .08, .35); this.tone(5100, 'sine', .04, .25, .03); this.burst(.08, 'highpass', 4000, .1, .02); break;
      case 'voice': for (let i = 0; i < 5; i++) this.burst(.12, 'bandpass', 500 + Math.random() * 900, .07, i * .11, 6); break;
      case 'sigh': this.burst(1.8, 'bandpass', 900, .12, 0, .7); break;
      // ---- RPG 風 ----
      case 'type': this.pluck(mhz(84 + (k % 4 === 0 ? 2 : 0)), .1, .06); break;   // 1 文字ごとのピコ音
      case 'step': this.click(900 + (k % 2) * 200, .12); break;                    // 足音
      case 'page': this.click(3000, .14); break;                                   // ページ送り
      case 'cursor': this.click(3200, .2); break;
      case 'decide': this.pluck(mhz(88), .26, .2); this.pluck(mhz(93), .22, .2, .02); break;
      case 'emote': this.pop(mhz(84), .25); break;
      case 'buzz': this.tone(180, 'square', .07, .16); this.tone(150, 'square', .07, .24, .17); break;          // クイズのまちがい
      case 'correct': [76, 79, 84, 88].forEach((m, i) => this.pluck(mhz(m), .22, .18, i * .07)); break;   // クイズの正解
      case 'fanfare':   // 入手：矩形波のジングルとベル。BGM はその間だけ止める
        MUSIC.duck(1.8);
        [[72, 0], [76, .12], [79, .24], [84, .36], [79, .56], [84, .68]].forEach(([m, w], i) => {
          const d = i === 5 ? .9 : .14;
          this.tone(mhz(m), 'square', .045, d, w); this.tone(mhz(m - 12), 'triangle', .07, d, w);
        });
        [84, 88, 91].forEach((m, i) => this.fmBell(mhz(m), .12, 1.2, .7 + i * .12));
        break;
    }
  },
};

// =====================================================================
//  BGM（チップチューン）。矩形波 2 つ・三角波・ノイズの 4 音で鳴らす
//  曲は SONGS に { bpm, lead, harm, bass, drum } で書く（songs.js）。
//  各パートは 16 分音符を 1 つと数えるトークンを空白で並べる（'|' は小節の区切りで無視）
//    音名 'A4' 'C#5' 'Bb3' ＝鳴らす / '.' ＝休む / ':n' を付けると n 個分の長さ（'A4:4' '.:8'）
//    drum は k（バスドラ）/ s（スネア）/ h（ハイハット）/ w（拍子木・木魚）/ g（銅鑼・鐘）
//  任意で duty（旋律の矩形波の太さ）、pluck: true（琴・三味線・琵琶のように弾いてすぐ減衰）、fixed: true（作品ごとの変形をしない）
//  作品の region（'jp' / 'cn' / 'west'）を boot に渡すと、場面の曲は地域版（'tale_jp' など）があればそれで鳴る
//  パートごとに長さが違ってよく、それぞれ繰り返す
//  カットの bgm で曲を始め、次に bgm を書いたカットまで同じ曲が続く（bgm: null で止める）。
//  曲の切り替えは半小節の区切りまで待ち、余韻を残して消してから次を始める
// =====================================================================
const SONGS = {};
const mhz = m => 440 * 2 ** ((m - 69) / 12);
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
// 音名 → MIDI 番号（'A4' → 69）
function noteMidi(s) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(s);
  if (!m) { console.warn('bad note', s); return 0; }
  return NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (+m[3] + 1) * 12;
}
const noteHz = s => mhz(noteMidi(s));
// drum 以外は音名を MIDI 番号（m）にしておく
function parsePart(src, drum) {
  const ev = [];
  let at = 0;
  for (const tk of src.split(/\s+/)) {
    if (!tk || tk === '|') continue;
    const [n, len] = tk.split(':'), d = +(len ?? 1);
    if (n !== '.') ev.push({ at, d, n, m: drum ? 0 : noteMidi(n) });
    at += d;
  }
  return { len: at, ev };
}
// 文字列から 0 以上の整数（作品・曲ごとの種）
const strHash = s => [...s].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);

const MUSIC = {
  volume: .5,
  seed: strHash(location.pathname.split('/').pop() || 'index'),   // 作品ごとの種（ファイル名から）
  want: null, cur: null,   // 鳴らしたい曲 / 鳴っている曲 { name, song, parts, gain, step, t0, next, endAt? }
  WAVES: {},
  // n：その曲を作品の中で何度目に始めるか（地域版の別の版を順に回す）。鳴らしたい曲は '名前#n' で持つ
  cue(name, n = 0) { this.want = name == null ? null : `${name}#${n}`; },
  // duty 比の矩形波
  pulse(duty) {
    if (this.WAVES[duty]) return this.WAVES[duty];
    const n = 32, re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) re[k] = 2 / (k * Math.PI) * Math.sin(k * Math.PI * duty);
    return (this.WAVES[duty] = SFX.ac.createPeriodicWave(re, im));
  },
  // 作品ごとの変形：同じ曲でも作品によって調・速さ・旋律の音色が変わる（fixed の曲は変えない）
  variant(name, song) {
    if (song.fixed) return { shift: 0, tempo: 1, duty: song.duty ?? .25 };
    const r = k => strHash(`${this.seed}:${name}:${k}`) / 4294967296;
    return { shift: [-3, -2, -1, 0, 0, 1, 2][Math.floor(r(1) * 7)], tempo: .93 + r(2) * .14, duty: song.duty ?? [.125, .25, .25, .5][Math.floor(r(3) * 4)] };
  },
  // 作品の地域（boot の region：'jp' 日本 / 'cn' 中国 / 'west' 欧米）。場面の曲に地域版（'tale_jp' など）があればそちらを鳴らす。
  // 地域版は別の版（'tale_jp2' 'tale_jp3' …）を足せる。最初の版は作品ごとに選び、同じ作品で同じ場面の曲をまた始めるたびに次の版へ回す
  region: null, tune: 0,   // tune：版の回し始めをずらす（作品どうしで出だしの曲が重なるとき）
  songOf(name, n = 0) {
    if (!this.region) return SONGS[name];
    const base = `${name}_${this.region}`, alts = [base, ...[2, 3, 4, 5].map(k => base + k)].filter(k => SONGS[k]);
    return alts.length ? SONGS[alts[(strHash(`${this.seed}:${name}`) + n + this.tune) % alts.length]] : SONGS[name];
  },
  start(key, when, fadeIn) {
    const [name, n] = key.split('#'), song = this.songOf(name, +n);
    if (!song) { console.warn('unknown song', name); return; }
    const gain = SFX.ac.createGain();
    gain.gain.setValueAtTime(0, when); gain.gain.linearRampToValueAtTime(this.volume, when + fadeIn);
    gain.connect(SFX.bgm);
    const parts = ['lead', 'harm', 'bass', 'drum'].filter(k => song[k]).map(k => ({ k, ...parsePart(song[k], k === 'drum') }));
    // 旋律の音階（隣の音へ置き換えるときに使う）
    const scale = [...new Set(parts.filter(p => p.k !== 'drum').flatMap(p => p.ev.map(e => e.m % 12)))].sort((a, b) => a - b);
    const v = this.variant(name, song);
    this.cur = { name: key, song, parts, scale, v, gain, step: 60 / (song.bpm * v.tempo) / 4, t0: when, next: 0, salt: strHash(name) };
  },
  // 音階の上下の隣の音
  neighbor(c, m, dir) {
    for (let k = 1; k < 12; k++) { const x = m + dir * k; if (c.scale.includes(mod(x, 12))) return x; }
    return m;
  },
  // 繰り返しの 2 周目からは、旋律の一部を隣の音に替えたり、長い音を 2 つに割ったりする
  vary(c, e, pass, at) {
    if (pass === 0 || e.at % 16 === 0) return [e];
    const r = k => h2(c.salt + pass * 131 + k, this.seed + e.at * 17);
    if (e.d <= 2 && r(1) < .28) return [{ ...e, m: this.neighbor(c, e.m, r(2) < .5 ? -1 : 1) }];
    if (e.d >= 4 && r(3) < .3) { const h = e.d / 2; return [{ ...e, d: h }, { ...e, at: e.at + h, d: h, m: this.neighbor(c, e.m, r(4) < .5 ? -1 : 1), off: h }]; }
    return [e];
  },
  // 今の曲を次の半小節の区切りまで鳴らし、余韻を残して消す
  release(c, now) {
    const pos = Math.floor((now - c.t0) / c.step) + 1;
    c.endStep = Math.max(c.next, Math.ceil(pos / 8) * 8);
    c.endAt = c.t0 + c.endStep * c.step;
    const g = c.gain.gain;
    g.cancelScheduledValues(now); g.setValueAtTime(g.value, now);
    g.setValueAtTime(g.value, Math.max(now, c.endAt - c.step)); g.linearRampToValueAtTime(0, c.endAt + .8);
    setTimeout(() => c.gain.disconnect(), (c.endAt - now + 1.5) * 1000);
  },
  // 入手のジングルの間だけ BGM を止める
  duck(sec) {
    if (!this.cur || this.cur.endAt) return;
    const g = this.cur.gain.gain, t = SFX.ac.currentTime;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + .05);
    g.setValueAtTime(0, t + sec); g.linearRampToValueAtTime(this.volume, t + sec + .6);
  },
  // 毎フレーム呼ぶ。少し先までの音符を予約する（一時停止中は止めて、再開すると続きから）
  tick() {
    if (!SFX.ac) return;
    const now = SFX.ac.currentTime;
    let c = this.cur;
    if (!playing) {
      if (c?.endAt) { c.gain.gain.cancelScheduledValues(now); c.gain.gain.setTargetAtTime(0, now, .05); this.cur = null; }
      else if (c) { c.paused = true; c.gain.gain.setTargetAtTime(0, now, .08); }
      return;
    }
    // 曲が変わった：鳴っていれば区切りで消してから、鳴っていなければすぐ、次の曲をフェードインで始める
    if ((c?.name ?? null) !== this.want && !c?.endAt) {
      if (c) this.release(c, now);
      else if (this.want) c = this.start(this.want, now + .05, 1.2) ?? this.cur;
    }
    if (c?.endAt && now >= c.endAt) {
      this.cur = null;
      c = this.want ? (this.start(this.want, now + .05, .6) ?? this.cur) : null;
    }
    if (!c) return;
    if (c.paused || now > c.t0 + c.next * c.step + .5) {   // 再開・タブ復帰
      c.paused = false; c.t0 = now + .05 - c.next * c.step; c.gain.gain.setTargetAtTime(this.volume, now, .1);
    }
    // 作品の最後のカットは、終わる 3 秒前からゆっくり消す
    const last = ci === CUTS.length - 1 && CUTS[ci].dur - lt < 3;
    if (!c.endAt && last !== !!c.fading) { c.fading = last; c.gain.gain.setTargetAtTime(last ? 0 : this.volume, now, last ? .9 : .2); }
    while (c.t0 + c.next * c.step < now + .25 && c.next < (c.endStep ?? Infinity)) {
      for (const p of c.parts) for (const e of p.ev) {
        if (e.at !== c.next % p.len) continue;
        const pass = Math.floor(c.next / p.len), t = c.t0 + c.next * c.step;
        for (const x of p.k === 'lead' ? this.vary(c, e, pass) : [e]) this.note(c, p.k, x, t + (x.off ?? 0) * c.step);
      }
      c.next++;
    }
  },
  note(c, part, e, t) {
    const ac = SFX.ac, dur = e.d * c.step, vol = (c.song.vol?.[part] ?? 1) * { lead: .09, harm: .05, bass: .16, drum: .12 }[part];
    const g = ac.createGain();
    g.connect(c.gain);
    if (part === 'drum') {
      const burst = (type, fr, v, d) => {
        const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), eg = ac.createGain();
        s.buffer = SFX.noise; fl.type = type; fl.frequency.value = fr;
        eg.gain.setValueAtTime(v, t); eg.gain.exponentialRampToValueAtTime(.0001, t + d);
        s.connect(fl).connect(eg).connect(g); s.start(t, Math.random()); s.stop(t + d + .05);
      };
      g.gain.value = vol;
      if (e.n === 'k') {
        const o = ac.createOscillator(), eg = ac.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
        eg.gain.setValueAtTime(1.4, t); eg.gain.exponentialRampToValueAtTime(.0001, t + .18);
        o.connect(eg).connect(g); o.start(t); o.stop(t + .25);
      } else if (e.n === 's') burst('highpass', 1800, .9, .12);
      else if (e.n === 'w') {   // 拍子木・木魚のような乾いた音
        const o = ac.createOscillator(), eg = ac.createGain();
        o.type = 'square'; o.frequency.setValueAtTime(1250, t);
        eg.gain.setValueAtTime(.45, t); eg.gain.exponentialRampToValueAtTime(.0001, t + .05);
        o.connect(eg).connect(g); o.start(t); o.stop(t + .08);
      } else if (e.n === 'g') {   // 銅鑼・鐘：低い音と長く尾を引くうなり
        const o = ac.createOscillator(), eg = ac.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(96, t + 1.4);
        eg.gain.setValueAtTime(.9, t); eg.gain.exponentialRampToValueAtTime(.0001, t + 1.6);
        o.connect(eg).connect(g); o.start(t); o.stop(t + 1.7);
        burst('bandpass', 420, .35, 1.2);
      } else burst('highpass', 7000, .5, .035);
      return;
    }
    const o = ac.createOscillator();
    if (part === 'bass') o.type = 'triangle'; else o.setPeriodicWave(this.pulse(part === 'lead' ? c.v.duty : .125));
    o.frequency.value = mhz(e.m + c.v.shift);
    // のばした音には少しビブラート
    if (part === 'lead' && dur > .4) {
      const lfo = ac.createOscillator(), lg = ac.createGain();
      lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(o.frequency.value * .012, t + dur);
      lfo.connect(lg).connect(o.frequency); lfo.start(t); lfo.stop(t + dur + .05);
    }
    const rel = Math.min(.04, dur * .3);
    // pluck の曲は、旋律と和音を琴・三味線・琵琶のように弾いてすぐ減衰させる
    if (c.song.pluck && part !== 'bass') {
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * 1.2, t + .004);
      g.gain.exponentialRampToValueAtTime(vol * .12, t + Math.min(dur, .45)); g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(g); o.start(t); o.stop(t + dur + .02);
      return;
    }
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .005);
    g.gain.setValueAtTime(vol * (part === 'lead' ? .8 : 1), t + Math.min(.06, dur * .5));
    g.gain.setValueAtTime(vol * (part === 'lead' ? .8 : 1), t + dur - rel); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); o.start(t); o.stop(t + dur + .02);
  },
};

// =====================================================================
//  描画エンジンが埋めるフック
// =====================================================================
const RENDER = {
  html: '',                // 再生 UI に足す DOM
  init() {},               // DOM を作った直後
  prepare() {},            // 台本を積み終えた後（各カットの dur を決める）
  resize() {},             // キャンバスの大きさが変わった時
  enter(c, prev, at) {},   // カットに入った時
  draw(f, lt) {},          // 1フレーム描画（f: カット内の 0〜1、lt: カット内の秒）
  // ruby: 描画エンジンがルビを描けるなら true（showRuby を見て描く）
  // holds: 描画エンジンが各カットに c.holds（マニュアル時に止まる秒の昇順）を付けるなら true
  // thumb(i): シークバーの見本 { canvas, text }（カット i の絵と最初の文）。ない描画エンジンでは見本を出さない
};

// =====================================================================
//  再生制御・UI
// =====================================================================
// 言語が決まってから（boot の中で）作る
const uiHtml = () => `
<canvas id="cv"></canvas>
%RENDER%
<div id="chap" class="hud"></div>
<div id="btns" class="hud">
  <a class="b" href="../index.html" title="${L('作品の一覧', 'All works')}">${L('一覧', 'Index')}</a>
  <button class="b" id="bLang" title="${L('言語 (L)', 'Language (L)')}">${L('English', '日本語')}</button>
  <select class="b" id="bCast" title="${L('人物の絵柄 (C)', 'Sprite style (C)')}"></select>
  <select class="b" id="bHero" title="${L('主人公（人物 小・いか 小のとき） (H)', 'Hero (small sprites only) (H)')}"></select>
  <button class="b" id="bPlay" title="${L('再生 / 一時停止', 'Play / Pause')}">▶</button>
  <button class="b" id="bMode" title="${L('オート / マニュアル (A)', 'Auto / Manual (A)')}">AUTO</button>
  <button class="b" id="bSpd" title="${L('速度', 'Speed')}">1x</button>
  <button class="b" id="bRuby" title="ルビ (R)"></button>
  <button class="b" id="bFont" title="${L('文字：ドット / ゴシック (G)', 'Text: pixel / plain (G)')}"></button>
  <button class="b" id="bOrig" title="${L('原文 / 訳文 (O)', 'Original / Translation (O)')}"></button>
  <div class="drop" id="dSnd">
    <button class="b" id="bSnd" title="${L('音（M：BGM / S：効果音）', 'Sound (M: BGM / S: effects)')}">♪</button>
    <div class="menu" id="mSnd">
      <label><input type="checkbox" id="cBgm">BGM</label>
      <label><input type="checkbox" id="cSe">${L('効果音・環境音', 'Sound effects')}</label>
    </div>
  </div>
  <button class="b" id="bHelp" title="${L('操作のしかた', 'Controls')}">?</button>
  <button class="b" id="bFs" title="${L('全画面 (F)', 'Fullscreen (F)')}">⛶</button>
</div>
<div id="help" class="hud">
  <div><kbd>Space</kbd>${L('再生 / 一時停止（マニュアルでは次へ）', 'Play / Pause (next in manual mode)')}</div>
  <div><kbd>← →</kbd>${L('前 / 次のカット', 'Previous / Next cut')}</div>
  <div><kbd>A</kbd>${L('オート / マニュアル', 'Auto / Manual')}</div>
  <div><kbd>Enter</kbd>${L('次へ（マニュアル時。画面クリックも可）', 'Next (manual mode; or click the screen)')}</div>
  <div><kbd>M</kbd>${L('BGM のオン / オフ', 'Music on / off')}</div>
  <div><kbd>S</kbd>${L('効果音のオン / オフ', 'Sound effects on / off')}</div>
  <div id="hRuby"><kbd>R</kbd>ルビのオン / オフ</div>
  <div><kbd>G</kbd>${L('文字：ドット / ゴシック（字形が正確）', 'Text: pixel / plain (easier to read)')}</div>
  <div id="hOrig"><kbd>O</kbd>${L('原文 / 訳文（原文のある作品）', 'Original / Translation (where available)')}</div>
  <div><kbd>C</kbd>${L('人物の絵柄', 'Sprite style')}</div>
  <div><kbd>H</kbd>${L('主人公（人物 小・いか 小のとき）', 'Hero (small sprites only)')}</div>
  <div id="hLang"><kbd>L</kbd>${L('言語（日本語 / English）', 'Language (日本語 / English)')}</div>
  <div><kbd>F</kbd>${L('全画面', 'Fullscreen')}</div>
  <div><kbd>Click</kbd>${L('バーで任意の位置へ', 'Click the bar to jump')}</div>
  <div><kbd>1〜9</kbd>${L('問いに答える（← → で選んで Enter も可）', 'Answer a quiz (or pick with ← → and Enter)')}</div>
</div>
<div id="bar" class="hud"><div class="track"></div><div class="fill"></div></div>
<div id="peek" class="hide"><div class="pic"></div><div class="txt"></div></div>
<div id="start"><button id="bStart"><span class="cur">▶</span> ${L('はじめる', 'START')}</button></div>
<div id="end" class="hide"></div>`;

const $ = id => document.getElementById(id);
let cv, ctx, chapEl, fillEl, DPR = 1, W = 0, H = 0;
// age: カットに入ってから再生した秒（場面転換の演出用）
let ci = 0, lt = 0, T = 0, age = 0, playing = false, speed = 1, cs = { fired: new Set() };
// マニュアル：c.holds の秒で止まり、クリック / Enter で進む（記憶する）。passed: このカットで通過済みの秒
let manual = localStorage.getItem('mode') !== 'auto', waiting = false, passed = -1;   // 既定はマニュアル
let showRuby = localStorage.getItem('ruby') !== 'off';   // ルビを出すか（記憶する）
// 文字をゴシックで描くか（記憶する。選んでいなければ作品の boot の font: 'gothic' に従う。既定はドット）
let gothic = null;
// 原文を出すか（記憶する）。台本は cap に orig、say の各項目に orig を書くと原文になる
let showOrig = localStorage.getItem('orig') === 'on';
// 英語版で原文（orig）をそのまま本文にするか（原文が英語の作品。boot の origText: true）
let origText = false;

// ---- クイズ（学習用の教材）----
// say の kind: 'quiz' は、学習者が正解を選ぶまで先へ進まない（オートでも止まる）。描画エンジンが各カットに
// c.quiz（[{ at: 止まる秒, m: メッセージ }]）と c.stops（その秒の一覧）を付ける。quiz のない作品では何も変わらない
// at: いま答えを待っている問い { id, m }、cur: カーソル、wrong: まちがえた選択肢（-1 はまだ）、miss: この問いでまちがえた回数
// score: 1 回で正解した数、done: 答え終えた問いの id（戻って解き直しても数え直さない）
const QUIZ = { at: null, cur: 0, wrong: -1, wrongT: 0, miss: 0, score: 0, total: 0, done: new Set() };

function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);   // 高解像度画面でも描く画素数は2倍まで
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  RENDER.resize();
  fitChap();
}
// 左上の章の札は、右上のボタンにかからない幅までに切りつめる（入りきらない分は … にする）
function fitChap() {
  const room = $('btns').getBoundingClientRect().left - chapEl.getBoundingClientRect().left - 8;
  chapEl.style.maxWidth = Math.max(0, room) + 'px';
  chapEl.style.visibility = room < 60 ? 'hidden' : '';
}

function enterCut(i, at = 0) {
  const prev = CUTS[ci];
  ci = clamp(i, 0, CUTS.length - 1); lt = at * CUTS[ci].dur; age = 0;
  waiting = false; passed = lt - 1e-6; QUIZ.at = null;
  const c = CUTS[ci];
  cs = { fired: new Set() };
  c.fx.forEach((fx, k) => { if ((fx.at ?? 0) < at) cs.fired.add(k); });
  chapEl.textContent = (NUM[c.ch] ? NUM[c.ch] + L('　', '. ') : '') + CHAPTERS[c.ch];
  SFX.mood({ ...MOOD[c.scene], ...c.mood }, c.card ? .6 : 1);
  MUSIC.cue(c.music, c.musicN);
  RENDER.enter(c, prev, at);
}

function fireSounds(c, f) {
  c.fx.forEach((fx, k) => {
    if (!fx.snd && fx.k !== 'snd') return;
    if (cs.fired.has(k) || f < (fx.at ?? 0)) return;
    cs.fired.add(k); SFX.play(fx.snd ?? fx.s);
  });
}

function setPlaying(p) {
  playing = p;
  SFX.hold(!p);
  $('bPlay').textContent = p ? '❚❚' : '▶';
  if (p && ci === CUTS.length - 1 && lt >= CUTS[ci].dur) enterCut(0);
}

// ドット絵なので再生中は 30fps、一時停止中は 10fps に間引いて GPU 負荷を下げる
const FPS_PLAY = 30, FPS_IDLE = 10;
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  if (now - last < 1000 / (playing ? FPS_PLAY : FPS_IDLE) - 2) return;
  const dt = Math.min(.12, (now - last) / 1000); last = now; T += dt;
  if (playing) {
    lt += dt * speed; age += dt * speed;
    const h = nextHold();
    if (h != null && lt >= h) holdAt(h);
    if (lt >= CUTS[ci].dur) {
      if (ci < CUTS.length - 1) enterCut(ci + 1);
      else { lt = CUTS[ci].dur; setPlaying(false); }
    }
  }
  const c = CUTS[ci], f = clamp(lt / c.dur, 0, 1);
  if (playing) fireSounds(c, f);
  // 最後のカット（エンドクレジット）に入ったら、クレジットの文字と同じく 0.5 秒後から 1 秒かけて浮かび上がらせる
  showEnd(ci === CUTS.length - 1 && $('start').classList.contains('hide') ? clamp((lt - .5) / 1, 0, 1) : 0);
  SFX.tick(dt * speed);
  MUSIC.tick();
  RENDER.draw(f, lt);
  fillEl.style.width = ((START[ci] + lt) / TOTAL * 100).toFixed(2) + '%';
}

// マニュアルは holds（ページの区切りと問い）、オートは stops（問いだけ）で止まる
const nextHold = () => (manual ? CUTS[ci].holds : CUTS[ci].stops)?.find(h => h > passed);
// 止まる所で待つ。問いなら答えを待つ
function holdAt(h) {
  lt = h; waiting = true;
  const k = CUTS[ci].quiz?.findIndex(q => q.at === h) ?? -1, id = `${ci}:${k}`;
  if (k < 0 || QUIZ.at?.id === id) return;   // 待っている間は毎フレーム呼ばれるので、答えの途中を消さない
  QUIZ.at = { id, m: CUTS[ci].quiz[k].m };
  Object.assign(QUIZ, { cur: 0, wrong: -1, miss: 0 });
}
// 答える（i: 0 始まり）。正解なら先へ、まちがいならヒントを出してもう一度
function answer(i) {
  const q = QUIZ.at;
  SFX.init();
  if (i !== q.m.ans - 1) { Object.assign(QUIZ, { cur: i, wrong: i, wrongT: T }); QUIZ.miss++; SFX.play('buzz'); return; }
  if (!QUIZ.done.has(q.id)) { QUIZ.done.add(q.id); if (!QUIZ.miss) QUIZ.score++; }
  SFX.play('correct');
  QUIZ.at = null; waiting = false; passed = lt;
  if (!playing) setPlaying(true);
}
function moveQuiz(d) {
  const n = QUIZ.at.m.items.length;
  QUIZ.cur = (QUIZ.cur + d + n) % n; SFX.init(); SFX.play('cursor');
}

// マニュアル時のクリック / Enter：待っていれば先へ、打ち出し中なら次の止まる所まで飛ばす（なければ次のカット）
function advance() {
  SFX.init();
  if (!playing) setPlaying(true);
  if (QUIZ.at) return answer(QUIZ.cur);
  if (waiting) { waiting = false; passed = lt; return; }
  const h = nextHold();
  if (h == null) return enterCut(ci + 1);
  holdAt(h);
}

function setManual(m) {
  manual = m;
  if (!QUIZ.at) { waiting = false; passed = lt; }   // 問いの前では切り替えても待ったまま
  localStorage.setItem('mode', m ? 'manual' : 'auto');
  $('bMode').textContent = m ? 'MANUAL' : 'AUTO';
}

// はじめる：題名のカットなら、出ている題名をそのままフェードアウトさせて本編へ
function start() {
  $('start').classList.add('hide'); SFX.init();
  if (CUTS[0].title) { enterCut(0, Math.max(0, 1 - 2.1 / CUTS[0].dur)); age = 9; } else enterCut(0);
  setPlaying(true);
}

// シリーズの作品は、最後のカットで「前の話・もう一度・次の話」を出す（boot の series がないときは出さない）
let hasEnd = false, endAlpha = 0;
const esc = s => s.replace(/[&<>"]/g, ch => `&#${ch.charCodeAt(0)};`);
// 公開する作品のファイル名。手元では null（すべて出す）。公開用の書き出し（build.py）がこの行を作品の配列に置き換え、非公開の話へのリンクを出さない
const PUBLIC_WORKS = null;
const isPublic = p => p && (!PUBLIC_WORKS || PUBLIC_WORKS.includes(p.href.split('/').pop()));
function buildEnd(series) {
  const [prev, next] = [series.prev, series.next].map(p => isPublic(p) ? p : null);
  const link = (p, label) => `<a class="eb" href="${esc(p.href)}"><span class="lbl">${label}</span>${esc(p.title)}</a>`;
  $('end').innerHTML = [
    prev ? link(prev, L('◀ 前の話', '◀ Previous')) : '',
    `<button class="eb" id="bAgain"><span class="lbl">↺</span>${L('もう一度', 'Replay')}</button>`,
    next ? link(next, L('次の話 ▶', 'Next ▶')) : `<a class="eb" href="../index.html"><span class="lbl">≡</span>${L('作品の一覧', 'All works')}</a>`,
  ].join('');
  $('bAgain').onclick = () => { SFX.init(); enterCut(0); setPlaying(true); };
  hasEnd = true;
}
// a：見えぐあい（0 で隠す）。まだ薄いうちは押せないようにする
function showEnd(a) {
  if (!hasEnd || a === endAlpha) return;
  endAlpha = a;
  const el = $('end');
  el.classList.toggle('hide', !a); el.style.opacity = a; el.classList.toggle('faint', a < .5);
}

// 各カットの尺を決め、通しの時間とチャプターの区切り線を作り直す
function retime() {
  RENDER.prepare();
  TOTAL = CUTS.reduce((s, c) => s + c.dur, 0);
  START = CUTS.map((_, i) => CUTS.slice(0, i).reduce((s, c) => s + c.dur, 0));
  document.querySelectorAll('#bar .tick').forEach(t => t.remove());
  CUTS.forEach((c, i) => {
    if (!c.card || i === 0) return;
    const t = document.createElement('div'); t.className = 'tick'; t.style.left = (START[i] / TOTAL * 100) + '%'; $('bar').appendChild(t);
  });
}

// 文の長さや字の幅が変わったとき：尺を測り直し、いまのカットの同じ位置から続ける
function relayout() {
  const f = lt / CUTS[ci].dur;
  retime(); enterCut(ci, f); age = 9;
}

// 作品側の台本を積み終えたら呼ぶ。series：{ prev, next }（どちらも { href, title }。ない側は省く）
// origText：英語版では原文（orig）を本文にする。title：ページの題（英語版の <title> など）
function boot({ chapters, nums, region = null, tune = 0, font = 'dot', series = null, origText: useOrig = false, title = null }) {
  document.documentElement.lang = LANG;
  if (title) document.title = title;
  origText = LANG === 'en' && useOrig;
  gothic = (localStorage.getItem('font') ?? font) === 'gothic';
  CHAPTERS = chapters; NUM = nums; MUSIC.region = region; MUSIC.tune = tune;
  document.body.insertAdjacentHTML('afterbegin', uiHtml().replace('%RENDER%', RENDER.html));
  cv = $('cv'); ctx = cv.getContext('2d');
  chapEl = $('chap'); fillEl = document.querySelector('#bar .fill');
  RENDER.init();

  CUTS.forEach((c, i) => {
    c.say = c.say ? [].concat(c.say) : [];
    c.music = c.bgm !== undefined ? c.bgm : CUTS[i - 1]?.music ?? null;   // bgm は次に書くまで続く
  });
  // 題名のカット（と続く章扉）では第一場面の曲を先に流し、そのまま第一場面へつなぐ（はじめるで題名がすぐ消えても曲が途切れない）
  if (CUTS[0]?.title) {
    const j = CUTS.findIndex((c, i) => i > 0 && !(c.card && c.music == null));
    if (j > 0 && CUTS[j].music) for (let i = 0; i < j; i++) CUTS[i].music = CUTS[j].music;
  }
  // 同じ場面の曲を何度目に始めるか（続けて鳴っている間は同じ回）
  const times = {};
  CUTS.forEach((c, i) => { if (c.music != null && c.music !== CUTS[i - 1]?.music) times[c.music] = (times[c.music] ?? -1) + 1; c.musicN = times[c.music] ?? 0; });
  retime();
  QUIZ.total = CUTS.reduce((n, c) => n + (c.quiz?.length ?? 0), 0);

  $('bStart').onclick = start;
  if (series) buildEnd(series);
  // はじめる画面のままでも操作ボタンは使える（▶ ははじめると同じ）
  const started = () => $('start').classList.contains('hide');
  $('bPlay').onclick = () => { if (!started()) return start(); SFX.init(); setPlaying(!playing); };
  // 言語：URL の lang を差し替えて開き直す（台本の文は読み込んだときに決まるため）
  if (LANGS.length < 2) { $('bLang').remove(); $('hLang').remove(); }
  else $('bLang').onclick = () => {
    const u = new URL(location.href);
    u.searchParams.set('lang', LANG === 'en' ? 'ja' : 'en');
    location.href = u;
  };
  // ルビは日本語の文にだけある
  const showRubyBtn = () => $('bRuby').textContent = `ルビ ${showRuby ? 'ON' : 'OFF'}`;
  if (!RENDER.ruby || LANG !== 'ja') { $('bRuby').remove(); $('hRuby').remove(); }
  else { $('bRuby').onclick = () => { showRuby = !showRuby; localStorage.setItem('ruby', showRuby ? 'on' : 'off'); showRubyBtn(); }; showRubyBtn(); }
  // 英語は字ごとに幅がちがい、フォントを替えると折り返しが変わるので測り直す
  const showFontBtn = () => $('bFont').textContent = `${L('文字', 'Text')} ${gothic ? L('ゴシック', 'Plain') : L('ドット', 'Pixel')}`;
  if (!RENDER.gothic) $('bFont').remove();
  else {
    $('bFont').onclick = () => {
      gothic = !gothic; localStorage.setItem('font', gothic ? 'gothic' : 'dot'); showFontBtn();
      if (LANG === 'en') relayout();
    };
    showFontBtn();
  }
  // 原文 / 訳文：文の長さが変わるので測り直す。原文を本文にしている英語版では出さない
  const showOrigBtn = () => $('bOrig').textContent = `${L('原文', 'Original')} ${showOrig ? 'ON' : 'OFF'}`;
  if (origText || !CUTS.some(c => c.orig != null || c.say.some(s => s.orig != null))) { $('bOrig').remove(); $('hOrig').remove(); }
  else {
    $('bOrig').onclick = () => {
      showOrig = !showOrig; localStorage.setItem('orig', showOrig ? 'on' : 'off'); showOrigBtn();
      relayout();
    };
    showOrigBtn();
  }
  if (!RENDER.holds) $('bMode').remove();
  else { $('bMode').onclick = () => setManual(!manual); setManual(manual); }
  // 問いを待っているときは、選択肢のクリックで答える（選択肢の外は何もしない）
  $('cv').onclick = e => {
    if (!started()) return;
    if (QUIZ.at) { const i = RENDER.pick?.(e.clientX, e.clientY) ?? -1; if (i >= 0) answer(i); return; }
    if (manual) advance();
  };
  $('cv').onpointermove = e => {
    if (!QUIZ.at) return;
    const i = RENDER.pick?.(e.clientX, e.clientY) ?? -1;
    if (i >= 0 && i !== QUIZ.cur) { QUIZ.cur = i; SFX.init(); SFX.play('cursor'); }
  };
  $('bSpd').onclick = () => { speed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1; $('bSpd').textContent = speed + 'x'; };
  // 音：♪ のメニューで BGM と効果音をそれぞれ切りかえる。両方とも切ると ♪ をうすくする
  const showSnd = () => {
    $('cBgm').checked = SFX.on.bgm; $('cSe').checked = SFX.on.se;
    $('bSnd').classList.toggle('mute', !SFX.on.bgm && !SFX.on.se);
  };
  const toggleSnd = k => { SFX.setOn(k, !SFX.on[k]); showSnd(); };
  for (const [id, k] of [['cBgm', 'bgm'], ['cSe', 'se']]) $(id).onchange = e => { SFX.setOn(k, e.target.checked); showSnd(); e.target.blur(); };
  $('bSnd').onclick = () => $('mSnd').classList.toggle('show');
  addEventListener('pointerdown', e => { if (!$('dSnd').contains(e.target)) $('mSnd').classList.remove('show'); });
  showSnd();
  $('bFs').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  $('bHelp').onclick = () => $('help').classList.toggle('show');
  // 人物の絵柄：登録のある絵柄が 2 つ以上あるときだけ選択を出す（選んだらフォーカスを外し、矢印キーをカット送りに戻す）
  const styles = Object.keys(CASTS).filter(s => Object.keys(CASTS[s]).length);
  if (styles.length < 2) $('bCast').remove();
  else {
    $('bCast').innerHTML = styles.map(s => `<option value="${s}">${L(...CAST_LABEL[s])}</option>`).join('');
    $('bCast').onchange = e => { setCast(e.target.value); e.target.blur(); };
  }
  // 主人公：候補を登録した作品だけ選択を出す
  if (!HERO.key) $('bHero').remove();
  else {
    $('bHero').innerHTML = HERO.list.map(o => `<option value="${o.id}">${L('主人公', 'Hero:')} ${o.label}</option>`).join('');
    $('bHero').onchange = e => { setHero(e.target.value); e.target.blur(); };
  }
  if ($('bCast') || $('bHero')) setCast(castStyle);
  fitChap();
  const nextCast = () => setCast(styles[(styles.indexOf(castStyle) + 1) % styles.length]);
  const nextHero = () => {
    if (!SMALL_CASTS.has(castStyle)) return;
    const ids = HERO.list.map(o => o.id), cur = ids.indexOf($('bHero').value);
    setHero(ids[(cur + 1) % ids.length]);
  };
  // シークバーの x 座標 → 通しの秒とカット
  const barAt = e => {
    const r = $('bar').getBoundingClientRect(), t = clamp((e.clientX - r.left) / r.width, 0, .9999) * TOTAL;
    return { t, i: START.findLastIndex(s => s <= t) };
  };
  $('bar').onclick = e => {
    const { t, i } = barAt(e);
    $('start').classList.add('hide'); SFX.init();
    enterCut(i, (t - START[i]) / CUTS[i].dur);
  };
  // マウスを乗せると、その位置のカットの見本（絵と最初の文）を上に出す
  if (RENDER.thumb) {
    const peek = $('peek');
    let shownI = -1;
    $('bar').onpointermove = e => {
      if (e.pointerType !== 'mouse') return;   // 指で触れたときは、見本を出さずにそのまま移動する
      const { i } = barAt(e);
      if (i !== shownI) {
        const { canvas, text } = RENDER.thumb(i);
        peek.querySelector('.pic').replaceChildren(canvas);
        peek.querySelector('.txt').textContent = text;
        shownI = i;
      }
      peek.classList.remove('hide'); peek.classList.toggle('gothic', !!gothic); peek.classList.toggle('latin', isLatin(peek.querySelector('.txt').textContent));   // 文の字形は本編の文字の設定に合わせる
      const w = peek.offsetWidth;
      peek.style.left = clamp(e.clientX - w / 2, 8, innerWidth - w - 8) + 'px';
    };
    $('bar').onpointerleave = () => peek.classList.add('hide');
  }
  addEventListener('keydown', e => {
    if (e.target.tagName === 'SELECT') return;   // 選択を開いている間の矢印キーは選択に任せる
    if (!started()) { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); start(); } return; }
    // 問いを待っているとき：矢印キーで選び（← → はカットを送らない）、Space / Enter で答える。数字キーでじかに答える
    if (QUIZ.at) {
      const n = QUIZ.at.m.items.length, d = /^Digit([1-9])$/.exec(e.code), dir = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.code];
      if (dir) { e.preventDefault(); return moveQuiz(dir); }
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); return answer(QUIZ.cur); }
      if (d && +d[1] <= n) return answer(+d[1] - 1);
    }
    // Space：オートでは再生 / 一時停止、マニュアルでは Enter と同じく次へ
    if (e.code === 'Space') { e.preventDefault(); if (manual) advance(); else { SFX.init(); setPlaying(!playing); } }
    else if (e.code === 'Enter') { if (manual) { e.preventDefault(); advance(); } }
    else if (e.code === 'KeyA') $('bMode')?.click();
    else if (e.code === 'ArrowRight') enterCut(ci + 1);
    else if (e.code === 'ArrowLeft') enterCut(lt > 1.2 ? ci : ci - 1);
    else if (e.code === 'KeyM') toggleSnd('bgm');
    else if (e.code === 'KeyS') toggleSnd('se');
    else if (e.code === 'KeyR') $('bRuby')?.click();
    else if (e.code === 'KeyG') $('bFont')?.click();
    else if (e.code === 'KeyO') $('bOrig')?.click();
    else if (e.code === 'KeyL') $('bLang')?.click();
    else if (e.code === 'KeyC' && $('bCast')) nextCast();
    else if (e.code === 'KeyH' && $('bHero')) nextHero();
    else if (e.code === 'KeyF') $('bFs').click();
  });
  let idleTimer = 0;
  addEventListener('pointermove', () => {
    document.body.classList.remove('idle'); clearTimeout(idleTimer);
    idleTimer = setTimeout(() => playing && document.body.classList.add('idle'), 2500);
  });
  addEventListener('resize', resize);


  // 確認用： ?c=カット番号&f=0..1 で途中から一時停止状態で開く
  resize();
  const q = new URLSearchParams(location.search);
  if (q.has('c')) { $('start').classList.add('hide'); enterCut(+q.get('c'), +(q.get('f') ?? 0)); age = 9; }
  else { enterCut(0, .5); age = 9; }   // はじめる画面の背後に出す絵（暗転は済ませておく）
  requestAnimationFrame(frame);
}
