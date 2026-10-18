// =====================================================================
//  RPG 風エンジン（タイルの背景・ドット絵の人物・メッセージウィンドウ）
//  core.js の後に読む。作品側で SCENES に背景（build / anim / emit）を登録し、
//  cut() の cap（地の文）と say（セリフ・選択肢・入手）をウィンドウに流す。
//  背景と人物は VW×VH の小さなキャンバスに 1 ドットずつ描いて拡大し、
//  ウィンドウと文字はその上に高解像度で描く。
// =====================================================================
'use strict';

const VW = 384, VH = 216;   // 画面の画素数（16px タイルで 24 × 13.5 枚）
const G = 122;              // 人物の足元の既定値
const CPS = 18;             // 打ち出しの速さ（文字/秒）
const HOLD = 1;             // ページを打ち終えてから次へ進むまでの秒
SFX.ambient = .18;          // 環境音は BGM の下で小さく鳴らす

// RPG 向けに彩度を上げた色（作品側でさらに上書きしてよい）
Object.assign(PAL, {
  K: '#2e2622', k: '#1b1714', E: '#1b1b2f', S: '#f2c29b', s: '#d49a70', c: '#f28a8a',
  W: '#f6f2e8', w: '#cfc6b4', B: '#5d9de0', b: '#3f72b5', N: '#3a4fa8', n: '#283a80',
  P: '#b5609f', p: '#8a4479', G: '#5aa646', O: '#9c6a40', o: '#74492b',
  M: '#5c5866', T: '#e3b54a', H: '#e8e4da', R: '#e2412f', U: '#8a7a6c',
  Q: '#d07a3a', q: '#a0582a', Z: '#dcc48e', V: '#e4ded0', A: '#aab3bd', L: '#ffffff',
  X: '#c8281e', Y: '#f0d580', y: '#c4a860', x: '#1b1b2f',
});

// 話し手の名札（スプライト名 → 表示名）。作品側で埋める
const NAMES = {};

// ウィンドウ（画面の画素単位）
const WIN = { x: 16, y: 140, w: 352, h: 66 };
const UI = {
  font: '"DotGothic16", monospace', size: 11,
  fontEn: '"Pixelify Sans", monospace', wordEn: .12,   // 英語版のドットの文字（欧米のドット絵 RPG の会話の字に近い）と、足す単語の間（本文に対する比）
  lh: 17.5, track: .02, ruby: .48,   // ruby: ルビの大きさ（本文に対する比）
  gothic: '"BIZ UDGothic", "BIZ UDゴシック", sans-serif',   // 「文字」ボタンのゴシック（字形が正確な等幅のフォント。行の折り返しはドットと同じ）
  win: 'rgba(16,24,72,.92)', border: '#ffffff', text: '#ffffff', accent: '#ffd23f',
  voice: '#ff9a8a', weak: '#bcd4f0', dim: '#e8e2d0',
};
const LINE_EM = Math.floor((WIN.w - 36) / (UI.size * (1 + UI.track)));   // 1 行に入る全角文字数

// =====================================================================
//  ドット描画の道具（g に描く。背景の build では g が背景用キャンバスになる）
// =====================================================================
let buf, g;
const newCanvas = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
function paintTo(cx, fn) { const keep = g; g = cx; fn(); g = keep; }

function rect(x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); }
function circle(x, y, r, col, ry = r) { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, r, ry, 0, 0, Math.PI * 2); g.fill(); }
function clip(rects, fn) {
  g.save(); g.beginPath();
  for (const [x, y, w, h] of rects) g.rect(x, y, w, h);
  g.clip(); fn(); g.restore();
}
// 直線を 1 ドットずつ
function line(x0, y0, x1, y1, col) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) rect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1, col);
}

const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const dark = (c, t) => mix(c, '#000000', t), lite = (c, t) => mix(c, '#ffffff', t);

// 点を散らす（seed が同じなら同じ配置）
function speckle(x, y, w, h, col, n, seed = 0) {
  for (let i = 0; i < n; i++) rect(x + Math.floor(h2(i, seed * 7 + 1) * w), y + Math.floor(h2(i, seed * 7 + 2) * h), 1, 1, col);
}
// 煉瓦積み
function bricks(x, y, w, h, base, mortar, bw = 8, bh = 4) {
  rect(x, y, w, h, base);
  for (let r = 0; r * bh < h; r++) {
    rect(x, y + r * bh, w, 1, mortar);
    for (let cx = r % 2 ? bw / 2 : 0; cx < w; cx += bw) {
      rect(x + cx, y + r * bh, 1, bh, mortar);
      if (h2(cx + x, r + y) < .2) rect(x + cx + 1, y + r * bh + 1, bw - 1, bh - 1, dark(base, .12));
    }
  }
}
// 板張り（横板、継ぎ目は互い違い）
function planks(x, y, w, h, base, joint, ph = 6, len = 48) {
  rect(x, y, w, h, base);
  for (let r = 0; r * ph < h; r++) {
    rect(x, y + r * ph, w, 1, joint);
    for (let cx = (h1(r + 3) * len) | 0; cx < w; cx += len) rect(x + cx, y + r * ph, 1, ph, joint);
  }
  speckle(x, y, w, h, dark(base, .1), w * h / 40, 3);
}
// 市松
function checker(x, y, w, h, a, b, s = 12) {
  for (let r = 0; r * s < h; r++) for (let c = 0; c * s < w; c++) rect(x + c * s, y + r * s, s, s, (r + c) % 2 ? b : a);
}
// 石畳（1 枚ずつ明るさを少し変える）
function paving(x, y, w, h, base, joint, s = 12) {
  rect(x, y, w, h, joint);
  for (let r = 0; r * s < h; r++) for (let c = -1; c * s < w; c++) {
    const ox = r % 2 ? s / 2 : 0, k = h2(c + 40, r + 9);
    rect(x + c * s + ox + 1, y + r * s + 1, s - 1, s - 1, k < .3 ? dark(base, .08) : k > .8 ? lite(base, .08) : base);
  }
}
// 畳（縁は濃い緑）
function tatami(x, y, w, h) {
  const base = '#c9c27c', weave = '#b7af68', heri = '#3d5a3a';
  for (let r = 0; r * 32 < h; r++) for (let c = -1; c * 64 < w; c++) {
    const mx = x + c * 64 + (r % 2 ? 32 : 0), my = y + r * 32;
    rect(mx, my, 64, 32, base);
    for (let k = 2; k < 64; k += 2) rect(mx + k, my, 1, 32, weave);
    rect(mx, my, 64, 2, heri); rect(mx, my + 30, 64, 2, heri); rect(mx, my, 1, 32, dark(base, .3));
  }
}
// 吊りランプ（コードと笠）
function hangingLamp(x, len, col) {
  rect(x, 0, 1, len, '#3a2a1a');
  for (let r = 0; r < 5; r++) rect(x - 1 - r, len + r, 3 + r * 2, 1, r === 4 ? dark(col, .3) : col);
}
// 光：加算で輪を 3 段重ねる（ドット絵らしい段々のにじみ）
function glow(x, y, r, col, a = .4, ry = r) {
  g.globalCompositeOperation = 'lighter';
  for (let k = 3; k >= 1; k--) { g.globalAlpha = a / 3; circle(x, y, r * k / 3, col, ry * k / 3); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
// 4 方向のきらめき
function sparkle(x, y, s, col) {
  rect(x, y, 1, 1, '#ffffff');
  for (let k = 1; k <= s; k++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) rect(x + dx * k, y + dy * k, 1, 1, k === s ? col : '#ffffff');
}

// 暗闇。粒がゆっくり昇る
SCENES.void = {
  floor: false,
  build() { rect(0, 0, VW, VH, '#000000'); },
  anim() { for (let i = 0; i < 50; i++) rect(Math.floor(h1(i) * VW), Math.floor(mod(h1(i + 7) * VH - T * (3 + h1(i + 3) * 5), VH)), 1, 1, 'rgba(170,170,190,.45)'); },
};

// 背景の動かない部分は 1 回だけ描いてキャッシュ
const BASE = new Map();
function baseOf(name, p) {
  const sc = SCENES[name], key = name + '|' + (sc.key?.(p) ?? '');
  let cv = BASE.get(key);
  if (!cv) { cv = newCanvas(VW, VH); paintTo(cv.getContext('2d'), () => sc.build(p)); BASE.set(key, cv); }
  return cv;
}

// =====================================================================
//  人物（スプライトは 1 回だけキャンバスに描いてキャッシュ）
//  walk: 足を開いたコマ / shadow: 往来の人影
// =====================================================================
const SPC = new Map();
function sprite(key, variant) {
  const id = key + ':' + variant;
  let cv = SPC.get(id);
  if (cv) return cv;
  const sp = SPR[key];
  cv = newCanvas(sp.w + 2, sp.h);
  paintTo(cv.getContext('2d'), () => {
    for (const [px, py, c] of sp.px) {
      const dx = variant === 'walk' && py >= sp.h - 3 ? (px < sp.w / 2 ? -1 : 1) : 0;
      rect(px + 1 + dx, py, 1, 1, variant === 'shadow' ? '#141826' : PAL[c]);
    }
  });
  SPC.set(id, cv);
  return cv;
}

const ACTPOS = [];
let TALK = -1;          // いまセリフを打ち出している人物（actors の番号）
let WALKING = false;    // このフレームに歩いている人物がいるか（足音用）

function drawActor(a, f, idx, floor) {
  if (a.t && (f < a.t[0] || f > a.t[1])) return;
  const key = kv(a.s, f), sp = SPR[key], sc = kv(a.sc ?? 1, f), mode = a.mode ?? 'solid';   // sc もキーフレーム可
  let alpha = kv(a.a ?? 1, f) * kv(a.lum ?? 1, f);
  if (alpha <= 0) return;
  let x = kv(a.x, f, a.lin), y = kv(a.y ?? G, f, a.lin);
  const foot = y;
  const moving = a.walk && Math.abs(kv(a.x, Math.min(1, f + .01), a.lin) - x) > .01, step = moving && Math.floor(T * 7) % 2 === 1;
  if (moving && mode !== 'shadow') WALKING = true;
  if (step) y -= sc;
  if (a.bob) y -= (Math.floor(T * 1.6 + idx * .5) % 2) * sc;
  if (TALK === idx && Math.floor(T * 8) % 2) y -= sc;
  const sh = kv(a.shake ?? 0, f);
  if (sh) x += Math.round(Math.sin(T * 47 + idx) * sh * 1.6);
  if (mode === 'ghost') { y += Math.round(Math.sin(T * 1.5) * 1.5); alpha *= .55 + .15 * Math.sin(T * 3); }
  if (mode === 'shadow') alpha *= .5;
  const flip = !!kv(a.flip ?? false, f), w = sp.w * sc;
  const left = Math.round(x - w / 2), top = Math.round(y - (sp.h - (sp.oy ?? 0)) * sc);   // oy: 絵柄ごとの上下の補正
  // 演出の目印：mouth 口（白い息）、eye 目の高さ（後光）、tip 持ち物の先（灯り）
  ACTPOS[idx] = { x: Math.round(x), top, flip, sc, mouth: top + (sp.mouth ?? 10) * sc, eye: top + (sp.eyes?.[0]?.[1] ?? sp.h * .4) * sc };

  // 足元の影（黒フチのある人物だけ）
  if (floor && mode === 'solid' && a.shadow !== false && sp.px.some(p => p[2] === 'x')) {
    g.globalAlpha = .25 * alpha; rect(left + 2 * sc, Math.round(foot) - sc, w - 4 * sc, sc, '#000000');
  }
  g.globalAlpha = alpha;
  const img = sprite(key, mode === 'shadow' ? 'shadow' : step ? 'walk' : '');
  g.save();
  g.translate(left - sc + (flip ? w + 2 * sc : 0), top);
  g.scale(flip ? -sc : sc, sc);
  g.drawImage(img, 0, 0);
  g.restore();

  const at = (px, py) => [left + (flip ? sp.w - 1 - px : px) * sc, top + py * sc];
  if (a.w && !(a.w.t && (f < a.w.t[0] || f > a.w.t[1]))) {
    const tip = drawWeapon(kv(a.w.k, f), ...at(...handAt(sp, a.w.hand)), kv(a.w.a ?? 0, f), flip);
    ACTPOS[idx].tip = tip;
    if (a.w.gl && f >= a.w.gl[0] && f <= a.w.gl[1]) twinkle(...tip);
  }
  if (a.gl && f >= a.gl[0] && f <= a.gl[1]) twinkle(Math.round(x + w / 2 - 1), top);
  // 涙：目（tears: true でスプライトの目。[[px, py], ...] で位置の指定も可）から落ちる
  if (a.tears) for (const [ex, ey] of a.tears === true ? sp.eyes : a.tears) {
    const [tx, ty] = at(ex, ey);
    for (let k = 0; k < 2; k++) rect(tx, ty + 1 + Math.floor((T * 9 + k * 4 + ex) % 6), 1, 1, '#9cc3e6');
  }
  g.globalAlpha = 1;
}

// 持ち手の位置：省くと右手、'L' で左手、'out' で右手の高さの体の外側。[px, py] で直接の指定も可
function handAt(sp, hand) {
  if (Array.isArray(hand)) return hand;
  if (hand === 'L') return [sp.w - 1 - sp.hand[0], sp.hand[1]];
  if (hand === 'out') return [sp.w - 1, sp.hand[1]];
  return sp.hand;
}

// 手に持つ物（WPN の文字列を手から伸ばす）。先端の座標を返す
function drawWeapon(kind, ax, ay, deg, flip) {
  const str = WPN[kind];
  if (!str) return [ax, ay];
  const an = (flip ? 180 - deg : deg) * Math.PI / 180, cx = Math.cos(an), cy = Math.sin(an);
  let tx = ax, ty = ay;
  for (let j = 0; j < str.length; j++) { tx = ax + Math.round(cx * j); ty = ay + Math.round(cy * j); rect(tx, ty, 1, 1, PAL[str[j]]); }
  const nx = Math.round(-cy), ny = Math.round(cx), put = (x, y, c) => rect(x, y, 1, 1, PAL[c]);
  if (kind === 'axe') for (let k = -1; k <= 2; k++) { put(tx + nx * k, ty + ny * k, 'A'); put(tx + nx * k - Math.round(cx), ty + ny * k - Math.round(cy), 'A'); }
  if (kind === 'staff') for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) put(tx + dx, ty + dy, 'T');
  if (kind === 'bells') for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [1, 1], [-1, 1]]) put(tx + dx, ty + dy, (dx + dy) % 2 ? 'T' : 'Y');
  return [tx, ty];
}
const twinkle = (x, y) => sparkle(x, y, 1 + Math.floor(2.5 * (.5 + .5 * Math.sin(T * 11))), '#aab3bd');

// =====================================================================
//  演出。描く順に
//   under: 人物の前（足元の血だまりなど） / world: 人物の後（夜なら一緒に暗くなる） / shade: 画面全体の色味・減光
//   over:  暗さの後（光る物・記号） / ui: 高解像度の文字（座標は同じ画素単位）
// =====================================================================
const atSec = fx => (fx.at ?? 0) * CUTS[ci].dur;
const EMOTE = {
  '!': ['.#.', '.#.', '.#.', '.#.', '...', '.#.'],
  '?': ['###', '..#', '.##', '.#.', '...', '.#.'],
  '…': ['...', '...', '...', '#.#', '...', '...'],
};

const FX = {
  // 白い息：口元から上へ流れて消える（who: 人物の番号）
  breath: { world(fx, f, lt) {
    const p = ACTPOS[fx.who], t0 = atSec(fx), n = fx.n ?? 14;
    if (!p || lt < t0) return;
    for (let i = 0; i < n; i++) {
      const age = lt - t0 - i * .07;
      if (age < 0 || age > 2.2) continue;
      g.globalAlpha = .8 * (1 - age / 2.2);
      const dir = p.flip ? -1 : 1, x = p.x + dir * (3 + age * 7) + Math.sin(age * 4 + i) * 1.2, y = p.mouth - age * 6 + (h1(i) - .5) * 2;
      rect(Math.round(x), Math.round(y), age < .8 ? 2 : 1, 1, '#ffffff');
    }
    g.globalAlpha = 1;
  } },
  // 雨：斜めの筋と、地面のはね。s で量
  rain: { world(fx, f) {
    const n = Math.round(110 * kv(fx.s ?? 1, f));
    g.globalAlpha = .55;
    for (let i = 0; i < n; i++) {
      const sp = 170 + h1(i + 5) * 90, y = mod(h1(i + 9) * VH + T * sp, VH + 12) - 6, x = mod(h1(i) * VW * 1.4 - y * .3, VW);
      for (let k = 0; k < 5; k++) rect(Math.round(x - k * .3), Math.round(y - k), 1, 1, '#c8d8f0');
    }
    for (let i = 0; i < n / 4; i++) {
      const ph = mod(T * 2 + h1(i + 40), 1);
      if (ph > .25) continue;
      const x = Math.floor(h1(i + 50 + Math.floor(T * 2 + h1(i + 40))) * VW), y = 96 + Math.floor(h1(i + 60) * 40);
      rect(x - 1, y, 1, 1, '#c8d8f0'); rect(x + 1, y, 1, 1, '#c8d8f0');
    }
    g.globalAlpha = 1;
  } },
  // 風：横に流れる筋と木の葉
  wind: { world(fx) {
    const s = fx.s ?? 1;
    g.globalAlpha = .45;
    for (let i = 0; i < 14; i++) {
      const y = 8 + Math.floor(h1(i) * 120), x = mod(h1(i + 3) * 600 + T * 160 * s, 600) - 100;
      rect(Math.round(x), y, 10 + Math.floor(h1(i + 6) * 18), 1, '#ffffff');
    }
    g.globalAlpha = 1;
    for (let i = 0; i < 8; i++) {
      const x = mod(h1(i + 20) * 500 + T * 110 * s, 500) - 60, y = 30 + h1(i + 22) * 90 + Math.sin(T * 5 + i) * 6;
      rect(Math.round(x), Math.round(y), 2, 1, i % 2 ? '#a0703a' : '#c8a050');
    }
  } },
  // 舞い落ちる手紙
  papers: { world(fx, f, lt) {
    const n = fx.n ?? 8, until = (fx.until ?? 1) * CUTS[ci].dur;
    for (let i = 0; i < n; i++) {
      const age = lt - h1(i + 40) * until * .8;
      if (age < 0) continue;
      const x = Math.round((fx.x ?? VW / 2) + (h1(i + 3) - .5) * (fx.w ?? 200) + Math.sin(age * 2 + i) * 8);
      const y = Math.round(Math.min(-8 + age * (24 + h1(i) * 14), G - 2));
      const flat = y >= G - 2 || Math.floor(age * 4 + i) % 2;
      rect(x, y, flat ? 5 : 3, 3, '#f6f2e8'); rect(x, y + 3, flat ? 5 : 3, 1, '#a8a090');
    }
  } },
  // 色紙の風車：ps = [[x, y, 色], ...]。2コマで回る
  pinwheel: { world(fx) {
    const BL = [[[0, -1], [0, -2], [1, -2]], [[1, 0], [2, 0], [2, 1]], [[0, 1], [0, 2], [-1, 2]], [[-1, 0], [-2, 0], [-2, -1]]];
    fx.ps.forEach(([x, y, col], i) => {
      const fr = Math.floor(T * (fx.sp ?? 9) + i) % 2;
      rect(x, y + 1, 1, 6, PAL.T);
      rect(x, y, 1, 1, PAL.W);
      BL.forEach((bl, b) => bl.forEach(([dx, dy]) => {
        const [rx, ry] = fr ? [dx - dy, dx + dy].map(v => Math.sign(v) * Math.min(2, Math.abs(v))) : [dx, dy];
        rect(x + rx, y + ry, 1, 1, b % 2 ? col : PAL.W);
      }));
    });
  } },
  flash: { over(fx, f, lt) {
    const t0 = atSec(fx);
    if (lt < t0) return;
    g.globalAlpha = (fx.a ?? .8) * Math.max(0, 1 - (lt - t0) / (fx.d ?? .4));
    rect(0, 0, VW, VH, fx.c ?? '#ffffff'); g.globalAlpha = 1;
  } },
  glint: { over(fx) { twinkle(fx.x, fx.y); } },
  // 大水：下から h（キーフレーム可）の高さまで水が満ちる。人物も呑み込む
  flood: { world(fx, f) {
    const h = kv(fx.h, f);
    if (h <= 0) return;
    const y = Math.round(VH - h);
    g.globalAlpha = .88; rect(0, y, VW, h, '#2a5a94'); g.globalAlpha = 1;
    for (let x = -8; x < VW; x += 10) rect(Math.round(x + mod(T * 24, 10)), y + Math.round(Math.sin(x * .2 + T * 4)), 6, 1, '#9cc8ec');
    for (let i = 0; i < 30; i++) rect(Math.floor(mod(h1(i) * VW + T * 18, VW)), y + 4 + Math.floor(h1(i + 1) * Math.max(1, h - 6)), 4, 1, '#4a7ab4');
  } },
  // 湯気：x, y のあたり（w 幅）から立ちのぼる
  steam: { world(fx) {
    for (let i = 0; i < (fx.n ?? 16); i++) {
      const age = mod(T * .6 + h1(i), 1), x = fx.x + (h1(i + 3) - .5) * (fx.w ?? 30) + Math.sin(age * 6 + i) * 3, y = fx.y - age * (fx.rise ?? 40);
      g.globalAlpha = .45 * (1 - age); circle(x, y, 2 + age * 5, '#e8e8f0'); g.globalAlpha = 1;
    }
  } },
  // 音符：who の頭の横から ♪ が昇る（歌・楽器）
  notes: { over(fx, f, lt) {
    const p = ACTPOS[fx.who];
    if (!p) return;
    const NOTE = ['..##', '..#.', '..#.', '###.', '##..'];
    for (let i = 0; i < 3; i++) {
      const age = mod(lt * .5 + i / 3, 1), x = p.x + 8 + age * 14 + Math.sin(age * 9 + i) * 2, y = p.top - age * 22;
      g.globalAlpha = 1 - age;
      NOTE.forEach((row, ry) => [...row].forEach((ch, rx) => ch === '#' && rect(Math.round(x) + rx, Math.round(y) + ry, 1, 1, fx.c ?? '#ffe08a')));
    }
    g.globalAlpha = 1;
  } },
  // 灯り：who を書くとその人物について動く（dx, dy は頭の上端からのずれ）
  light: { over(fx) {
    const p = fx.who != null ? ACTPOS[fx.who] : null;
    if (fx.who != null && !p) return;
    if (fx.on === 'w' && !p.tip) return;
    const [x, y] = fx.on === 'w' ? p.tip : p ? [p.x + (fx.dx ?? 0), p.top + (fx.dy ?? 10)] : [fx.x, fx.y];   // on: 'w' で持ち物の先（松明・行灯）
    glow(x, y, fx.r ?? 30, fx.c ?? '#ffcf6a', fx.a ?? .35);
  } },
  // 画面の色味（c: 1 赤 / 2 夕日 / 3 冷たい月光、または色）を乗算で掛ける
  tint: { shade(fx) {
    g.globalCompositeOperation = 'multiply';
    rect(0, 0, VW, VH, { 1: '#d08080', 2: '#e0b080', 3: '#7088c0' }[fx.c] ?? fx.c);
    g.globalCompositeOperation = 'source-over';
  } },
  // 暗くしていく：v は明るさ（1 → 0）
  dim: { shade(fx, f) { g.globalAlpha = 1 - kv(fx.v, f); rect(0, 0, VW, VH, '#000000'); g.globalAlpha = 1; } },
  // 蠅
  fly: { over(fx) { rect(Math.round(fx.x + Math.cos(T * 7) * 6 + Math.sin(T * 17) * 2), Math.round(fx.y + Math.sin(T * 9) * 3), 1, 1, '#141414'); } },
  // 血だまり：r（キーフレーム可）まで広がる
  blood: { under(fx, f) {
    const r = kv(fx.r, f);
    g.globalAlpha = .85; circle(fx.x, fx.y, r, '#6a1010', r * .3); circle(fx.x - r * .1, fx.y - r * .04, r * .7, '#8a1a14', r * .2);
    for (let i = 0; i < 18; i++) { const an = h1(i) * Math.PI * 2, d = r * (.9 + h1(i + 5) * .3); rect(Math.round(fx.x + Math.cos(an) * d), Math.round(fx.y + Math.sin(an) * d * .3), 2, 1, '#6a1010'); }
    g.globalAlpha = 1;
  } },
  // 四隅のかぎ括弧が点滅して物を指す
  mark: { over(fx) {
    if ((T * 3) % 1 > .62) return;
    const c = '#ffffff', { x, y, w, h } = fx;
    for (const [cx, cy, sx, sy] of [[x - 1, y - 1, 1, 1], [x + w, y - 1, -1, 1], [x - 1, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
      rect(cx, cy, 1, 1, c); rect(cx + sx, cy, 1, 1, c); rect(cx, cy + sy, 1, 1, c);
    }
  } },
  // 木の間から斜めに差す光（x: 地面に落ちる位置、a: 強さ）
  ray: { over(fx, f) {
    const a = kv(fx.a ?? 1, f), x = fx.x ?? 150, y = fx.y ?? G;
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = .22 * a; g.fillStyle = '#ffd890';
    g.beginPath(); g.moveTo(x - 70, 0); g.lineTo(x - 40, 0); g.lineTo(x + 14, y); g.lineTo(x - 14, y); g.fill();
    g.globalAlpha = .3 * a; circle(x, y, 22, '#ffd890', 5);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  } },
  // 後光：点の輪が回る。who を書くとその人物の頭のまわり
  halo: { over(fx) {
    const p = fx.who != null && ACTPOS[fx.who];
    if (p) fx = { ...fx, x: p.x, y: p.eye - 2 * p.sc };
    const n = Math.round(fx.r * 2.2);
    for (let k = 0; k < n; k++) {
      const an = k / n * Math.PI * 2 + T * .25;
      rect(Math.round(fx.x + Math.cos(an) * fx.r), Math.round(fx.y + Math.sin(an) * fx.r), 1, 1, k % 3 ? '#c8a050' : '#fff0b0');
    }
    for (let k = 0; k < 30; k++) {
      const an = h1(k) * Math.PI * 2 + T * .1, rr = fx.r * (.4 + h1(k + 50) * .5);
      if (Math.sin(T * 2 + k) > .2) rect(Math.round(fx.x + Math.cos(an) * rr), Math.round(fx.y + Math.sin(an) * rr), 1, 1, '#e8d090');
    }
  } },
  // 露のしずく（如露亦如電）
  dew: { over(fx, f, lt) {
    for (let i = 0; i < 50; i++) rect(Math.floor(h1(i) * VW), Math.floor(mod(lt * (14 + h1(i + 9) * 20) + h1(i + 3) * VH, VH + 10) - 6), 1, 2, '#bcd8f4');
  } },
  // 稲妻
  bolt: { over(fx, f, lt) {
    const t0 = atSec(fx);
    if (lt < t0 || lt > t0 + .45 || ((lt - t0) * 14) % 2 > 1.3) return;
    let x = fx.x ?? 250;
    for (let y = 0; y < (fx.y ?? 110); y++) { x += Math.round((h1(y + 300) - .5) * 4); rect(x, y, 2, 1, '#ffffff'); if (y % 14 === 6) line(x, y, x + 6, y + 8, '#ffffff'); }
  } },
  // 浮かぶ文字（c: 1 赤 / 2 金 / 色）
  text: { ui(fx, f) {
    const a = kv(fx.a ?? 1, f);
    if (a <= 0) return;
    ctx.globalAlpha = a; ctx.textAlign = 'center'; setFont(fx.size ?? 14);
    if (fx.shadow !== false) { ctx.fillStyle = '#000000'; ctx.fillText(fx.s, kv(fx.x, f) + 1, kv(fx.y, f) + 1); }   // shadow: false で影なし（碑に彫った字など）
    ctx.fillStyle = { 1: '#e8402e', 2: UI.accent }[fx.c] ?? fx.c ?? '#ffffff'; ctx.fillText(fx.s, kv(fx.x, f), kv(fx.y, f));
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  } },
  // 同じ言葉が何行も横に流れる（耳から離れない声）
  echo: { ui(fx, f, lt) {
    setFont(fx.size ?? 12); ctx.fillStyle = { 1: '#e8402e', 2: UI.accent }[fx.c ?? 1] ?? fx.c;
    for (let i = 0; i < (fx.n ?? 6); i++) {
      const sp = 40 + h1(i) * 50, x = mod(lt * sp * (fx.dir ?? 1) + h1(i + 4) * 700, 700) - 200;
      ctx.globalAlpha = (.3 + h1(i + 8) * .5) * clamp(f * 3, 0, 1);
      ctx.fillText(fx.s, x, (fx.y0 ?? 20) + i * (fx.gap ?? 18));
    }
    ctx.globalAlpha = 1;
  } },
  // 頭上の記号（! ? …）。msg: n でそのメッセージの出だしに合わせられる
  emote: { over(fx, f, lt) {
    const p = ACTPOS[fx.who], age = lt - atSec(fx);
    if (!p || age < 0 || age > (fx.d ?? 1.1)) return;
    const gl = EMOTE[fx.s ?? '!'], pop = Math.round((1 - clamp(age / .12, 0, 1)) * 3);
    const bx = p.x - 4, by = p.top - 13 - pop;
    rect(bx, by, 9, 10, '#1b1b2f'); rect(bx + 1, by + 1, 7, 8, '#ffffff');
    rect(bx + 3, by + 10, 3, 1, '#1b1b2f'); rect(bx + 4, by + 9, 1, 2, '#1b1b2f'); rect(bx + 4, by + 9, 1, 1, '#ffffff');
    gl.forEach((row, ry) => [...row].forEach((ch, rx) => ch === '#' && rect(bx + 3 + rx, by + 2 + ry, 1, 1, '#1b1b2f')));
  } },
};

// =====================================================================
//  メッセージ（cap は名札なしの地の文、say はセリフ・選択肢・入手）
//  say: { who, text, name?, style?: 'voice' | 'weak', c?: 名札の縁の色キー, start? }
//       { kind: 'choice', text?: 問い, items: [...], sel: 選ぶ番号（1〜） }
//       { kind: 'get', text: '〇〇を手に入れた！', who: きらめく人物 }
//  who を省いたセリフは地の文と同じ（style: 'voice' なら名札は「？？？」）
//  cut の by を書くと cap に名札が付く（証言者の語りなど）
//  choice の sel: 0 は決まらない（カーソルが迷ったまま閉じる）。text を省くと前の文を残したまま開く
//  学習用の問い（学習者が答えるまで止まる。core.js の QUIZ）：
//       { kind: 'quiz', text: 問い, items: [...], ans: 正解の番号（1〜）, hint?: まちがえたときの文, ok?: 正解のあとの文, name?: 名札（既定は「もんだい」） }
//  正解数は画面の上に出し、cut の result: true で結果の札を出す
//  ルビは青空文庫と同じ書き方：｜干将莫邪《かんしょうばくや》、漢字だけなら ｜ を省いて 斧《おの》
// =====================================================================
const NO_START = /[、。，．,.)\]）」』】〕〉》！？!?:：;；ー〜・…‥ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ]/;
const NO_END = /[(\[（「『【〔〈《]/;
const LATIN = /[\x21-\x7e -ɏ]/;   // 欧文（原文の英語・ドイツ語）。単語の途中では折り返さない
// 1 字の幅（全角を 1 とする）。日本語の文は全角 1・欧文 0.5 で数える。
// 欧文だけの文（英語版の文・英語やドイツ語の原文）は欧文のドットの文字（字ごとに幅がちがう）で描くので、
// いまの文字（ドット / ゴシック）で測る（フォントの読み込み後に測り直す）
const WIDTHS = new Map();
const cw = (ch, latin) => {
  if (!latin) return ch === ' ' || LATIN.test(ch) ? .5 : 1;
  const k = (gothic ? 'g' : 'd') + ch;
  if (!WIDTHS.has(k)) { setFont(UI.size, 'a'); WIDTHS.set(k, charW(ch) / (UI.size * (1 + UI.track))); }
  return WIDTHS.get(k);
};

// 欧文のダッシュ（—）は前後を空ける。ドットの文字ではハイフンと幅が近く、Pluto—this が 1 語に見えるため
// ASCII の " ' は “ ” ‘ ’ にする（字形が 1 つで、開きと閉じが同じ形に見えるため）。文頭・空白・開きの記号のあとと、
// ダッシュのあとで字が続くときは開き、ほかは閉じ（アポストロフィも ’。"Go—" の " は閉じで、ダッシュとのあいだは空けない）
const curly = (t, q, open, close) => t.replace(new RegExp(String.raw`(^|[\s(\[{“‘])${q}|([—-])${q}(?=\w)`, 'g'), (m, a, d) => (a ?? d) + open).replaceAll(q, close);
const enDash = t => isLatin(t) ? curly(curly(t, '"', '“', '”'), "'", '‘', '’').replace(/\s*—+\s*/g, ' — ').replace(/ — ([”’])/g, ' —$1').trim() : t;

const RUBY = /｜([^｜《]+)《([^》]+)》|([々〆ヶ㐀-鿿]+)《([^》]+)》/g;

// ルビの記法を外した本文と、ルビ（本文の何文字目から何文字目に振るか）
function parseRuby(text) {
  const rubies = [];
  let plain = '', last = 0;
  for (const m of text.matchAll(RUBY)) {
    plain += text.slice(last, m.index);
    const base = m[1] ?? m[3], s = [...plain].length;
    plain += base; rubies.push({ s, e: s + [...base].length, r: m[2] ?? m[4] });
    last = m.index + m[0].length;
  }
  return { plain: plain + text.slice(last), rubies };
}

// 全角 1・半角 0.5 で数えて折り返す（行頭・行末の禁則つき。行頭禁則の文字はぶら下げる）
// glued: その文字の前では折り返さない位置（ルビの親文字の途中）。欧文は単語の切れ目（空白）で折り返す
function wrap(text, max, glued = new Set()) {
  const out = [], latin = isLatin(text), cw1 = ch => cw(ch, latin);
  let cur = [], w = 0, i = 0;
  for (const ch of text) {
    if (w + cw1(ch) > max && cur.length && !NO_START.test(ch)) {
      let carry = [];
      const sp = cur.lastIndexOf(' ');
      if (LATIN.test(ch) && LATIN.test(cur.at(-1)) && sp > 0) carry = cur.splice(sp + 1);
      else for (let k = i; cur.length > 1 && (NO_END.test(cur.at(-1)) || glued.has(k)); k--) carry.unshift(cur.pop());
      out.push(cur.join('').trimEnd()); cur = carry; w = carry.reduce((s, c) => s + cw1(c), 0);
    }
    i++;
    if (ch === ' ' && !cur.length) continue;   // 行頭の空白は詰める
    cur.push(ch); w += cw1(ch);
  }
  if (cur.length) out.push(cur.join(''));
  return out;
}

// 句読点のあとは少し間を空けて 1 文字ずつ（「ポポポ」のリズム）
function charTimes(text, cps) {
  const times = [], latin = isLatin(text);
  let t = .1;
  for (const ch of text) {
    t += cw(ch, latin) / cps; times.push(t);   // 欧文は半角なので倍の速さで打つ
    if (/[、,，]/.test(ch)) t += .12;
    else if (/[。.!?！？]/.test(ch)) t += .22;
  }
  return { times, end: t };
}

function nameOf(c, s) {
  if (s.name != null) return s.name;
  if (s.kind === 'quiz') return L('もんだい', 'QUIZ');
  if (s.kind === 'get' || s.kind === 'choice') return '';
  if (s.who == null) return s.style === 'voice' ? L('？？？', '???') : '';
  return NAMES[kv(c.actors[s.who].s, 0)] ?? '';
}

// =====================================================================
//  場面転換（舞台の上手・下手）
//  場面が変わるカットの間は、ウィンドウを閉じて暗転し、次の場面で明ける（FADE 秒ずつ）。
//  人物に enter: 'left' | 'right' を書くとその側の外から歩いて入り、
//  exit: 'left' | 'right' を書くとメッセージを読み終えてからその側へ歩いてはける（x は止まる位置）。
//  つなぎは映画と同じく、右へはけたら次は左から入る。
// =====================================================================
const FADE = .5, WALK = 70;              // 暗転の秒、出入りの歩く速さ（画素/秒）
const offstage = side => side === 'left' ? -20 : VW + 20;

function prepareCut(c, prev, next) {
  c.winCont = !!(prev && !c.fadeIn && prev.msgs.length);   // 前のカットからウィンドウを出したまま
  c.fadeOut = !!next?.fadeIn;
  // 入ってくる人物が立ち位置に着くまでの秒
  for (const a of c.actors) if (a.enter || a.exit) a.x0 ??= a.x;   // 立ち位置（a.x は下で関数に置き換えるので、測り直しに備えて残す）
  const walkSec = (a, side) => Math.abs(a.x0 - offstage(side)) / WALK;
  const enterEnd = Math.max(0, ...c.actors.filter(a => a.enter).map(a => walkSec(a, a.enter)));
  let t = c.winCont ? .25 : c.fadeIn ? .7 : .4;
  // 問いの ok（正解のあとの文）は、問いのすぐ後のメッセージにする
  const says = c.say.flatMap(s => s.kind === 'quiz' && s.ok ? [s, { text: s.ok, praise: true }] : [s]);
  c.msgs = [...(c.cap ? [{ text: c.cap, orig: c.orig, name: c.by }] : []), ...says].map(s => {
    if ((showOrig || origText) && s.orig != null) s = { ...s, text: s.orig };
    const { plain, rubies } = parseRuby(enDash(s.text ?? ''));
    const m = { ...s, text: s.text == null ? s.text : plain, kind: s.kind ?? 'say', name: nameOf(c, s), pages: [] };
    const em = m.kind === 'quiz' ? quizEm(m) : LINE_EM;
    m.t0 = s.start ?? t;
    let cur = m.t0;
    const ls = wrap(plain, em, new Set(rubies.flatMap(r => Array.from({ length: r.e - r.s - 1 }, (_, k) => r.s + 1 + k))));
    // 各行が本文の何文字目から始まるか
    const from = ls.map((_, i) => ls.slice(0, i).reduce((n, l) => n + [...l].length, 0));
    for (let k = 0; k < ls.length; k += 3) {
      const lines = ls.slice(k, k + 3), { times, end } = charTimes(lines.join(''), m.kind === 'say' || m.kind === 'quiz' ? CPS : CPS * 1.4);
      // ルビは行ごとに、その行の何文字目からかで持つ
      const ruby = lines.map((l, i) => rubies.filter(r => r.s >= from[k + i] && r.s < from[k + i] + [...l].length).map(r => ({ ...r, s: r.s - from[k + i], e: r.e - from[k + i] })));
      m.pages.push({ lines, ruby, t0: cur, times, end: cur + end });
      cur += end + HOLD;
    }
    if (!m.pages.length) m.pages.push({ lines: [], t0: cur, times: [], end: cur });
    const end = m.pages.at(-1).end;
    if (m.kind === 'choice') { m.open = end + .15; m.out = m.open + 2.4; }
    else if (m.kind === 'quiz') { m.open = end + .15; m.stop = m.open + .2; m.out = m.stop + .3; m.hintLines = wrap(s.hint ?? L('ちがうみたい。もう一度考えてみよう。', "That's not it. Think again."), em, new Set()).slice(0, 3); }
    else m.out = m.kind === 'get' ? end + 1.8 : cur;
    t = m.out;
    return m;
  });
  // マニュアル時に止まる秒：各ページを打ち終えた所。選択肢は選ぶところまで見せたら止めずに次へ
  c.holds = c.msgs.flatMap(m => m.kind === 'choice' ? [] : m.kind === 'quiz' ? [m.stop] : m.pages.map(pg => pg.end + .2));
  // 問い：答えるまで止まる秒（オートでも止まる）
  c.quiz = c.msgs.filter(m => m.kind === 'quiz').map(m => ({ at: m.stop, m }));
  c.stops = c.quiz.map(q => q.at);
  // 読み終えたらウィンドウを閉じる（次のカットへ出したまま続くときを除く）
  const lastOut = c.msgs.length ? t : 0;
  c.winClose = next && !next.fadeIn && (next.cap || next.say.length) ? null : lastOut;
  // はける人物は、読み終えて（入ってくる人物が着いてから）歩き出す
  const exitLen = Math.max(0, ...c.actors.filter(a => a.exit).map(a => walkSec(a, a.exit)));
  c.exitAt = Math.max(lastOut, enterEnd) + .3;
  let need = c.msgs.length ? t + .5 : 0;
  if (exitLen) need = c.exitAt + exitLen + .2;
  if (c.fadeOut) need += FADE;
  if (!('dur0' in c)) c.dur0 = c.dur;   // 台本に書いた尺（原文 / 訳文を切り替えたら測り直す）
  c.dur = Math.max(c.dur0 ?? (c.msgs.length ? 0 : 4), need);
  for (const a of c.actors) {
    if (!a.enter && !a.exit) continue;
    const x0 = a.x0, inSec = a.enter ? walkSec(a, a.enter) : 0, outSec = a.exit ? walkSec(a, a.exit) : 0, dur = c.dur;
    a.walk = true;
    a.x = f => {
      const s = f * dur;
      if (a.enter && s < inSec) return offstage(a.enter) + (x0 - offstage(a.enter)) * s / inSec;
      if (a.exit && s > c.exitAt) return x0 + (offstage(a.exit) - x0) * Math.min(1, (s - c.exitAt) / outSec);
      return x0;
    };
  }
  for (const fx of c.fx) {
    if (fx.msg != null) fx.at = c.msgs[fx.msg].t0 / c.dur;
    if (fx.k === 'emote') fx.snd ??= 'emote';
  }
}

// 時刻 t の直前に始まった要素
const latest = (list, t) => list.reduce((a, x) => (t >= x.t0 ? x : a), list[0]);
const shownAt = (pg, t) => { let n = 0; while (n < pg.times.length && pg.times[n] <= t - pg.t0) n++; return n; };
const backOut = u => 1 + 2.70158 * (u - 1) ** 3 + 1.70158 * (u - 1) ** 2;

// 一度だけ鳴らす（シークで飛び越えた音は鳴らさない）
function cue(key, at, lt, snd) {
  if (!playing || cs.fired.has(key) || lt < at) return;
  cs.fired.add(key);
  if (lt - at < .3) SFX.play(snd);
}

// =====================================================================
//  高解像度の UI（ウィンドウ・文字）。座標は画面の画素単位
// =====================================================================
let K = 1, X0 = 0, Y0 = 0, typedKey = '', typedN = 0, stepFr = 0, stepN = 0;
const SILENT = /[\s、。，．,.!?！？…‥・「」『』（）()―]/;   // 打鍵音を鳴らさない文字
// text：描く文。欧文だけの文は欧文のドットの文字（省くと英語版かどうかで決める）。
// 欧文のドットの文字は単語の間が詰まって見えるので、少し空ける（measureText は wordSpacing を数えないので、1 字の幅は charW で測る）
const setFont = (s, text) => {
  const latin = !gothic && (text != null ? isLatin(text) : LANG === 'en');
  ctx.font = `${s}px ${gothic ? UI.gothic : latin ? UI.fontEn : UI.font}`;
  ctx.letterSpacing = `${UI.track * s}px`; ctx.wordSpacing = `${latin ? UI.wordEn * s : 0}px`;
};
const charW = ch => ctx.measureText(ch).width + (ch === ' ' ? parseFloat(ctx.wordSpacing) : 0);

// 二重線の枠（外側太線・内側細線）
function frameBox(x, y, w, h, border = UI.border) {
  ctx.fillStyle = UI.win; ctx.beginPath(); ctx.roundRect(x, y, w, h, 2.4); ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.2; ctx.beginPath(); ctx.roundRect(x + 1, y + 1, w - 2, h - 2, 1.8); ctx.stroke();
  ctx.lineWidth = .5; ctx.beginPath(); ctx.roundRect(x + 3.2, y + 3.2, w - 6.4, h - 6.4, 1); ctx.stroke();
}
// 中心から縦に開く
function popY(cy, k, fn) {
  if (k <= .01) return;
  ctx.save(); ctx.translate(0, cy); ctx.scale(1, k); ctx.translate(0, -cy); fn(); ctx.restore();
}
function triangle(x0, y0, x1, y1, x2, y2, col) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath(); ctx.fill();
}

// 打ち出し途中の行。voice は文字が震え、weak は波打つ。ルビは親文字の 1 字目が出たら付ける
function drawLines(lines, shown, x, y, style, ruby = []) {
  let left = shown;
  lines.forEach((l, i) => {
    if (left <= 0) return;
    const all = [...l], chars = all.slice(0, left), by = y + i * UI.lh;
    left -= all.length;
    for (const r of showRuby ? ruby[i] ?? [] : []) {
      if (r.s >= chars.length) continue;
      const cx = x + ctx.measureText(all.slice(0, r.s).join('')).width + ctx.measureText(all.slice(r.s, r.e).join('')).width / 2;
      setFont(UI.size * UI.ruby);
      ctx.fillText(r.r, cx - ctx.measureText(r.r).width / 2, by - UI.size * .95);
      setFont(UI.size);
    }
    if (!style) { ctx.fillText(chars.join(''), x, by); return; }
    let cx = x;
    chars.forEach((ch, k) => {
      const n = i * 40 + k;
      const dx = style === 'voice' ? (h2(n, Math.floor(T * 12)) - .5) * .8 : 0;
      const dy = style === 'voice' ? (h2(n + 7, Math.floor(T * 12)) - .5) * .8 : Math.sin(T * 3 + n * .5) * .9;
      ctx.fillText(ch, cx + dx, by + dy);
      cx += charW(ch);
    });
  });
}

// 選択肢メニュー（cp: 開いてからの 0〜1）
function drawChoice(m, cp) {
  const size = UI.size * .92, ih = size * 1.5;
  setFont(size, m.items.join(''));
  const w = clamp(Math.max(...m.items.map(it => ctx.measureText(it).width)) + 30, 76, 220), h = m.items.length * ih + 14;   // 英語の項目は長いので 220 まで
  const mx = WIN.x + WIN.w - w, my = WIN.y - h - 6;
  const open = backOut(clamp(cp / .12, 0, 1)) * (1 - clamp((cp - .9) / .1, 0, 1));
  const sel = m.sel === 0 ? -1 : clamp(m.sel ?? 1, 1, m.items.length) - 1;
  const u = clamp((cp - .3) / .22, 0, 1), cur = sel < 0
    ? (m.items.length - 1) * (.5 - .5 * Math.cos(clamp((cp - .15) / .75, 0, 1) * Math.PI * 5))
    : sel * (u < .5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2);
  const flash = sel >= 0 && cp > .58 && cp < .88 && Math.floor(cp * 30) % 2 === 0;
  popY(my + h, open, () => {
    frameBox(mx, my, w, h);
    m.items.forEach((it, i) => {
      ctx.fillStyle = i === sel && flash ? UI.accent : UI.text;
      ctx.fillText(it, mx + 20, my + 7 + (i + .72) * ih);
    });
    const cy = my + 7 + (cur + .5) * ih;
    triangle(mx + 10, cy - 3.2, mx + 15.2, cy, mx + 10, cy + 3.2, UI.accent);
  });
}

// 問いの選択肢：メッセージウィンドウの右下に、縦に並べた小さな窓で出す（問いとヒントはその窓にかからない幅で折り返す）。
// 答えを待つ間はカーソルを学習者が動かし、まちがえた選択肢には × を付ける。正解したら光って閉じる
const QUIZ_SIZE = UI.size * .92, QUIZ_IH = 16;
let QBOX = null;   // 選択肢の当たり判定（画面の画素単位）[{ x, y, w, h }]
// 窓の幅（いちばん長い選択肢＋カーソル・× の余白）と、そのときの問いの 1 行の全角文字数
function quizEm(m) {
  const longest = Math.max(...m.items.map(it => [...it].reduce((n, ch) => n + cw(ch, isLatin(it)), 0)));
  m.menuW = Math.ceil(longest * QUIZ_SIZE * (1 + UI.track)) + 40;
  return Math.floor((WIN.w - 36 - m.menuW) / (UI.size * (1 + UI.track)));
}
function drawQuiz(m, lt) {
  const asking = QUIZ.at?.m === m, w = m.menuW, h = m.items.length * QUIZ_IH + 12;
  const x = WIN.x + WIN.w - w - 6, y = WIN.y + WIN.h - h - 6;
  const open = backOut(clamp((lt - m.open) / .18, 0, 1)) * (asking ? 1 : 1 - clamp((lt - m.stop - .1) / .2, 0, 1));
  const cur = asking ? QUIZ.cur : m.ans - 1, done = !asking && lt > m.stop;
  const rows = m.items.map((_, i) => ({ x, y: y + 6 + i * QUIZ_IH, w, h: QUIZ_IH }));
  QBOX = asking ? rows : null;
  setFont(QUIZ_SIZE, m.items.join(''));
  popY(y + h / 2, open, () => {
    frameBox(x, y, w, h, UI.accent);
    rows.forEach((r, i) => {
      const miss = asking && i === QUIZ.wrong, by = r.y + QUIZ_IH * .72;
      ctx.fillStyle = done && i === cur ? UI.accent : miss ? '#7a7f9a' : UI.text;
      ctx.fillText(m.items[i], x + 20, by);
      if (miss) { ctx.fillStyle = UI.voice; ctx.fillText('×', x + w - 15, by); }
    });
    // カーソルは問いを待つ間ゆっくり揺れる
    const cy = rows[cur].y + QUIZ_IH / 2, bob = asking ? Math.round(Math.sin(T * 6)) : 0;
    triangle(x + 9 + bob, cy - 3.2, x + 14.2 + bob, cy, x + 9 + bob, cy + 3.2, UI.accent);
  });
}

function drawDialog(c, lt) {
  const ms = c.msgs;
  if (!ms.length) return;
  const from = c.winCont ? 0 : ms[0].t0 - .18;
  if (lt < from) return;
  const close = c.winClose != null && lt > c.winClose ? 1 - clamp((lt - c.winClose) / .15, 0, 1) : 1;
  const pop = (c.winCont ? 1 : backOut(clamp((lt - from) / .18, 0, 1))) * close;
  popY(WIN.y + WIN.h / 2, pop, () => frameBox(WIN.x, WIN.y, WIN.w, WIN.h));
  if (pop < 1 || lt < ms[0].t0) return;

  const m = latest(ms, lt), mi = ms.indexOf(m);
  const keep = m.kind === 'choice' && !m.text && mi > 0 ? ms[mi - 1] : null;   // 問いのない選択肢
  const pg = keep ? keep.pages.at(-1) : latest(m.pages, lt), n = keep ? pg.times.length : shownAt(pg, lt);
  // 問いでまちがえたら、問いの代わりにヒントを打ち出す
  const hint = m.kind === 'quiz' && QUIZ.at?.m === m && QUIZ.wrong >= 0;
  const name = hint ? L('ヒント', 'HINT') : keep ? keep.name : m.name, style = keep ? keep.style : m.style;
  if (name) {
    setFont(UI.size * .8, name);
    const edge = PAL[m.c] ?? UI.border;
    frameBox(WIN.x + 6, WIN.y - 17, ctx.measureText(name).width + 16, 19, edge);
    ctx.fillStyle = UI.accent; ctx.fillText(name, WIN.x + 14, WIN.y - 4.4);
  }
  setFont(UI.size, (hint ? m.hintLines : pg.lines).join(''));
  ctx.fillStyle = m.kind === 'get' || m.praise ? UI.accent : hint ? UI.weak : style === 'voice' ? UI.voice : style === 'weak' ? UI.weak : UI.text;
  if (hint) drawLines(m.hintLines, Math.floor((T - QUIZ.wrongT) * CPS * 1.4), WIN.x + 14, WIN.y + 22);
  else drawLines(pg.lines, n, WIN.x + 14, WIN.y + 22, style, pg.ruby);

  // 打ち出しの音
  const key = `${ci}:${mi}:${m.pages.indexOf(pg)}`;
  if (key !== typedKey) { if (typedKey && playing) SFX.play('page'); typedKey = key; typedN = 0; }
  if (n > typedN) {
    if (playing && n % 2 === 0 && !SILENT.test([...pg.lines.join('')][n - 1])) SFX.play('type', n);
    typedN = n;
  }

  // ▼（続きがあるとき）
  const more = pg !== m.pages.at(-1) || m !== ms.at(-1) || CUTS[ci + 1]?.winCont;
  if (m.kind === 'say' && n >= pg.times.length && (more || waiting) && Math.floor(T * 3) % 2 === 0) {
    const ax = WIN.x + WIN.w - 14, ay = WIN.y + WIN.h - 12;
    triangle(ax - 3.2, ay, ax + 3.2, ay, ax, ay + 3.6, UI.accent);
  }
  if (m.kind === 'choice' && lt >= m.open) {
    const cp = (lt - m.open) / (m.out - m.open);
    drawChoice(m, cp);
    const sel = m.sel === 0 ? -1 : clamp(m.sel ?? 1, 1, m.items.length) - 1, len = m.out - m.open;
    if (sel < 0) for (let s = 1; s < 10; s++) cue(`c${mi}:${s}`, m.open + (.15 + .075 * s) * len, lt, 'cursor');
    else {
      for (let s = 1; s <= sel; s++) cue(`c${mi}:${s}`, m.open + (.3 + .22 * s / (sel + 1)) * len, lt, 'cursor');
      cue(`d${mi}`, m.open + .58 * len, lt, 'decide');
    }
  }
  if (m.kind === 'get') cue(`g${mi}`, m.t0, lt, 'fanfare');
  if (m.kind === 'quiz' && lt >= m.open) drawQuiz(m, lt);
}

// 入手したときのきらめき（人物のまわりを回る）
function drawGet(c, lt) {
  const m = c.msgs.find(m => m.kind === 'get' && lt >= m.t0 && lt < m.out);
  const p = m && ACTPOS[m.who];
  if (!p) return;
  const age = lt - m.t0;
  for (let i = 0; i < 6; i++) {
    const an = i / 6 * Math.PI * 2 + age * 1.6, r = 15 + 2 * Math.sin(T * 5 + i);
    sparkle(Math.round(p.x + Math.cos(an) * r), Math.round(p.top + 9 + Math.sin(an) * r * .8), 1 + Math.floor(2 * (.5 + .5 * Math.sin(T * 9 + i * 2.1))), UI.accent);
  }
}

// 題名・章題・注記
function drawTitles(c, lt) {
  ctx.textAlign = 'center';
  const out = c.title ? clamp((c.dur - 1 - lt) / .8, 0, 1) : 1;   // 題名と注記はいっしょに消え、1 秒の余韻を残す
  if (c.title) {
    ctx.globalAlpha = clamp(lt / 1.5, 0, 1) * out;
    setFont(30, c.title);
    const tw = ctx.measureText(c.title).width;
    if (tw > VW - 32) setFont(30 * (VW - 32) / tw, c.title);   // 長い題名（英語版など）は画面の幅に収まるまで小さくする
    ctx.fillStyle = '#1b1b2f'; ctx.fillText(c.title, VW / 2 + 1.5, 88 + 1.5);
    ctx.fillStyle = '#ffffff'; ctx.fillText(c.title, VW / 2, 88);
  }
  if (c.card) {
    // 複数行なら前の行は小さな添え書き、最後の行に章の番号を付ける
    const ls = c.card.split('\n'), main = (NUM[c.ch] && c.num !== false ? NUM[c.ch] + L('　', '. ') : '') + ls.pop();
    setFont(13, main); let w = ctx.measureText(main).width;
    for (const l of ls) { setFont(9, l); w = Math.max(w, ctx.measureText(l).width); }
    w += 44;
    const h = 32 + ls.length * 13, top = VH / 2 - h / 2;
    popY(VH / 2, backOut(clamp((lt - .2) / .2, 0, 1)), () => {
      frameBox(VW / 2 - w / 2, top, w, h);
      ctx.fillStyle = UI.dim; ls.forEach((l, i) => { setFont(9, l); ctx.fillText(l, VW / 2, top + 17 + i * 13); });
      setFont(13, main); ctx.fillStyle = UI.text; ctx.fillText(main, VW / 2, top + h - 11.4);
    });
  }
  if (c.note) {
    ctx.globalAlpha = clamp((lt - .5) / 1, 0, 1) * out;
    // 画面に収まらない注記は、全角空白（出典の区切り）で分け、1 行目に作品名、2 行目以降に原文・訳の表記を詰める
    setFont(8, c.note); ctx.fillStyle = UI.dim;
    const fits = s => ctx.measureText(s).width <= VW - 24, [head, ...rest] = c.note.split('　'), lines = [head];
    if (fits(c.note)) lines[0] = c.note;
    else for (const part of rest) {
      const joined = lines.length > 1 ? lines.at(-1) + '　' + part : part;
      if (lines.length > 1 && fits(joined)) lines[lines.length - 1] = joined; else lines.push(part);
    }
    const y0 = c.title ? 112 : c.msgs.length ? 12 : 196 - (lines.length - 1) * 11;
    lines.forEach((l, i) => ctx.fillText(l, VW / 2, y0 + i * 11));
  }
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

// 問いのある作品：左上（章の名前の下）に正解数（★ 1 回で正解した数 / 問いの数）
function drawScore(c) {
  if (!QUIZ.total || c.title || c.result) return;
  const label = `★ ${QUIZ.score} / ${QUIZ.total}`;
  setFont(UI.size * .85);
  frameBox(5, 18, ctx.measureText(label).width + 18, 18);
  ctx.fillStyle = UI.accent; ctx.fillText(label, 14, 30.6);
}
// 結果の札（cut の result: true）。1 回で正解した数で ★：全問 3 つ・6 割以上 2 つ・1 問以上 1 つ
function drawResult(c, lt) {
  if (!c.result) return;
  const { score, total } = QUIZ, stars = score === total ? 3 : score >= total * .6 ? 2 : score > 0 ? 1 : 0, w = 200, h = 82, top = 30;
  popY(top + h / 2, backOut(clamp((lt - .3) / .25, 0, 1)), () => {
    frameBox(VW / 2 - w / 2, top, w, h, UI.accent);
    ctx.textAlign = 'center';
    setFont(12); ctx.fillStyle = UI.text; ctx.fillText(L('けっか', 'RESULT'), VW / 2, top + 20);
    setFont(20);
    [0, 1, 2].forEach(i => { ctx.fillStyle = i < stars && lt > .7 + i * .25 ? UI.accent : '#3a4270'; ctx.fillText('★', VW / 2 + (i - 1) * 26, top + 48); });
    setFont(10); ctx.fillStyle = UI.dim; ctx.fillText(L(`${QUIZ.total} もん中 ${QUIZ.score} もん 1 回で正解`, `${QUIZ.score} of ${QUIZ.total} right on the first try`), VW / 2, top + 70);
    ctx.textAlign = 'left';
  });
  for (let i = 0; i < stars; i++) cue(`r${i}`, .7 + i * .25, lt, 'decide');
}

// ---- 1フレーム描画 ----
const activeAt = f => fx => !fx.t || (f >= fx.t[0] && f <= fx.t[1]);
function render(f, lt) {
  const c = CUTS[ci];

  // いま打ち出している話し手は小さく跳ねる
  const m = c.msgs.length && lt >= c.msgs[0].t0 ? latest(c.msgs, lt) : null, pg = m && latest(m.pages, lt);
  TALK = m && m.kind === 'say' && m.who != null && shownAt(pg, lt) < pg.times.length ? m.who : -1;

  drawWorld(c, f, lt, true);
  drawGet(c, lt);
  const stage = k => { for (const fx of c.fx) if (FX[fx.k]?.[k] && activeAt(f)(fx)) FX[fx.k][k](fx, f, lt); };

  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(buf, X0, Y0, VW * K, VH * K);
  ctx.setTransform(DPR * K, 0, 0, DPR * K, DPR * X0, DPR * Y0);
  ctx.textBaseline = 'alphabetic';
  drawTitles(c, lt);
  drawResult(c, lt);
  stage('ui');
  QBOX = null;
  drawDialog(c, lt);
  drawScore(c);
  // 暗転：場面が変わる前に暗くなり、変わった後で明ける（文字やウィンドウも一緒に）
  const dark = Math.max(c.fadeIn ? 1 - age / FADE : 0, c.fadeOut ? (lt - (c.dur - FADE)) / FADE : 0);
  if (dark > 0) { ctx.globalAlpha = Math.min(1, dark); ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, VW, VH); ctx.globalAlpha = 1; }
}

// 背景・人物・光など、buf に描く絵の部分（文字やウィンドウは含まない）。live でないとき（サムネイル）は足音を鳴らさない
function drawWorld(c, f, lt, live) {
  const sc = SCENES[c.scene], p = evalSp(c.sp, f), floor = sc.floor !== false, active = activeAt(f);
  g.drawImage(baseOf(c.scene, p), 0, 0);
  sc.anim?.(p, lt);
  const stage = k => { for (const fx of c.fx) if (FX[fx.k]?.[k] && active(fx)) FX[fx.k][k](fx, f, lt); };
  stage('under');
  WALKING = false;
  c.actors.map((a, i) => [kv(a.z ?? a.y ?? G, f), i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).forEach(([, i]) => drawActor(c.actors[i], f, i, floor));
  stage('world');
  // 歩きのコマが足を開いたコマに変わるたびに足音
  if (live) {
    const fr = Math.floor(T * 7) % 2;
    if (WALKING && fr && !stepFr && playing) SFX.play('step', stepN++);
    stepFr = fr;
  }
  stage('shade');

  // 暗さ（場面の夜・雨）→ 章扉などの減光 → 光る物
  const [da, dc] = (typeof sc.dark === 'function' ? sc.dark(p) : sc.dark) ?? [0, '#000000'], dim = p.dim ?? 1;
  if (da > 0) { g.globalAlpha = da; rect(0, 0, VW, VH, dc); }
  if (dim < 1) { g.globalAlpha = 1 - dim; rect(0, 0, VW, VH, '#000000'); }
  g.globalAlpha = 1;
  if (sc.emit) { g.globalAlpha = dim; sc.emit(p, lt); g.globalAlpha = 1; }
  stage('over');
}

// シークバーの見本：カット i の絵（人物が立ち位置に着いたころ）と、最初の文の頭。カットごとに覚えておく
const THUMBS = new Map();
function thumb(i) {
  if (THUMBS.has(i)) return THUMBS.get(i);
  const c = CUTS[i], f = .6, keep = [ci, lt, TALK];
  ci = i; lt = f * c.dur; TALK = -1;   // 図や人物はいまのカット（ci）を見て描くので、いっとき切り替える
  drawWorld(c, f, lt, false);
  [ci, lt, TALK] = keep;
  const cv = newCanvas(VW, VH);
  cv.getContext('2d').drawImage(buf, 0, 0);   // buf は次のフレームで描き直されるので、そのまま使ってよい
  const m = c.msgs.find(m => m.text);
  const t = { canvas: cv, text: c.title ?? (m?.kind === 'quiz' ? L('もんだい：', 'QUIZ: ') : '') + (m?.text ?? '') };
  THUMBS.set(i, t);
  return t;
}

Object.assign(RENDER, {
  init() {
    buf = newCanvas(VW, VH); g = buf.getContext('2d'); g.imageSmoothingEnabled = false;
    // 欧文だけの文（英語版・英語やドイツ語の原文）は字の幅を測って折り返すので、フォントが届いたら測り直す
    Promise.all([UI.fontEn, UI.gothic].map(f => document.fonts.load(`${UI.size}px ${f}`, 'Ag'))).then(() => {
      WIDTHS.clear();
      if (CUTS.some(c => c.msgs.some(m => isLatin(m.text ?? '')))) relayout();
    });
  },
  prepare() {
    // 場面（または章扉）が変わるカットは暗転から明ける
    CUTS.forEach((c, i) => { const p = CUTS[i - 1]; c.fadeIn = !p || p.scene !== c.scene || !!p.card || !!c.card; });
    CUTS.forEach((c, i) => prepareCut(c, CUTS[i - 1], CUTS[i + 1]));
    THUMBS.clear();   // 原文 / 訳文の切りかえで文が変わるので、見本も作り直す
    const text = CUTS.flatMap(c => c.msgs.map(m => m.text ?? '')).join('').slice(0, 2000);
    for (const f of [UI.font, UI.gothic]) document.fonts.load(`16px ${f}`, text);
  },
  resize() {
    K = Math.min(W / VW, H / VH);
    X0 = (W - VW * K) / 2; Y0 = (H - VH * K) / 2;
    // はじめるボタンは扉の作者名のすぐ下に、画面の大きさに合わせて置く
    const st = document.documentElement.style;
    st.setProperty('--start-top', (Y0 + 124 * K).toFixed(1) + 'px'); st.setProperty('--start-k', (K / 3.33).toFixed(3));
  },
  holds: true, ruby: true, gothic: true,
  enter() { typedKey = ''; },
  restyle() { SPC.clear(); THUMBS.clear(); },   // 人物の絵柄を替えたらスプライトと見本を描き直す
  thumb,
  // 画面の座標にある問いの選択肢（0 始まり。なければ -1）
  pick(px, py) {
    const x = (px - X0) / K, y = (py - Y0) / K;
    return QBOX?.findIndex(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) ?? -1;
  },
  draw: render,
});
