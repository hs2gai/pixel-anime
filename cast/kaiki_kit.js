// =====================================================================
//  岡本綺堂「中国怪奇小説集」の RPG 版で共用する人物・物の怪・小道具・背景
//  core.js → rpg.js → songs.js の後に読む。人物は 小（9×13）と C（13×17）の 2 つの絵柄を部品から組む
//  （小は 髪 3 行 ＋ 顔 4 行 ＋ 衣 6 行、C は 髪 4 行 ＋ 顔 6 行 ＋ 衣 7 行）
// =====================================================================
'use strict';

// ---- 人物の部品（c: C の絵柄で 13 幅、mini: 小の絵柄で 9 幅）----
// face(h, o)：h 生え際の色、o.old 年寄り、o.b 髭（'K' 黒 / 'W' 白）、o.w 眉間が広い
// robe(c, b, belt, feet, long)：c 上衣、b 下衣、belt 帯、feet 履物、long で裾の長い衣
const PARTS = {
  c: {
    hair: {
      topknot: ['.....KKK.....', '.....KKK.....', '..KKKKKKKKK..', '.KKKKKKKKKKK.'],
      straw:   ['.....TTT.....', '...TTTTTTT...', 'TTTTTTTTTTTTT', '.KKKKKKKKKKK.'],
      cap:     ['...KKKKKKK...', '...KKKKKKK...', '..KKKKKKKKK..', '.KKKKKKKKKKK.'],
      bun:     ['....KKKKK....', '...KKKKKKK...', '..KKKKKKKKK..', '.KKKKKKKKKKK.'],
      white:   ['....WWWWW....', '...WWWWWWW...', '..WWWWWWWWW..', '.WWWWWWWWWWW.'],
      grey:    ['.....HHH.....', '....HHHHH....', '..HHHHHHHHH..', '.HHHHHHHHHHH.'],
      crown:   ['TTTTTTTTTTTTT', '.T.T.KKK.T.T.', '...KKKKKKK...', '.KKKKKKKKKKK.'],
      helmet:  ['.....AAA.....', '...AAAAAAA...', '..AAAAAAAAA..', '.AAAAAAAAAAA.'],
      band:    ['.............', '...KKKKKKK...', '..KKKKKKKKK..', '.KWWWWWWWWWK.'],
      hat:     ['...KKKKKKK...', '..KKKKKKKKK..', 'KKKKKKKKKKKKK', '.KKKKKKKKKKK.'],
    },
    face(h = 'K', o = {}) {
      const eye = o.w ? '.SESSSSSSSES.' : o.old ? '.SSEESSSEESS.' : '.SSSESSSESSS.';
      return [`.${h}SSSSSSSSS${h}.`, '.SSSSSSSSSSS.', eye, o.old ? '.SSSSSSSSSSS.' : eye,
        o.b ? `.SSSS${o.b}${o.b}${o.b}SSSS.` : '.SccSSSSSccS.', o.b ? `..S${o.b.repeat(7)}S..` : '..SSSSSSSSS..'];
    },
    robe(c, b = c, belt = b, feet = 'KK', long = false) {
      return [`..${c}${c}${c}WWW${c}${c}${c}..`, `.${c.repeat(5)}W${c.repeat(5)}.`, `.S${c.repeat(9)}S.`, `..${belt.repeat(9)}..`, `..${b.repeat(9)}..`,
        long ? `..${b.repeat(9)}..` : `...${b.repeat(3)}.${b.repeat(3)}...`, `...${feet}...${feet}...`];
    },
    shins: ['...SSS.SSS...', '...TT...TT...'],   // 野良着の素足と草鞋
    smith: ['..SSSOOOSSS..', '.SSSOOOOOSSS.', '.SSOOOOOOOSS.', '..OOOOOOOOO..', '..kkkkkkkkk..', '...kkk.kkk...', '...KK...KK...'],
    wings: { 1: 'KK.KKKKKKK.KK' },               // 役人の冠の翅
    oni: { 8: '.GGGGKKKGGGG.', 9: '..GGGGRGGGG..' },   // 鬼の口と舌
    // 子供（13×13。頭が大きい）
    child: ['.....KK......', '...KKKKKKK...', '..KKKKKKKKK..', '..KSSSSSSSK..', '..SSESSSESS..', '..SSESSSESS..', '..SccSSSccS..',
      '...SSSSSSS...', '...QQQWQQQ...', '..SQQQQQQQS..', '...QQQQQQQ...', '...QQ...QQ...', '...KK...KK...'],
    // 産着の赤ん坊（抱かれる高さは oy で胸にそろえる）
    baby: { rows: ['..WWWWW..', '.WSSSSSW.', '.WSsSsSW.', '.WWWWWWW.', '..WWWWW..'], oy: 4 },
  },
  mini: {
    hair: {
      topknot: ['...KKK...', '.KKKKKKK.', '.KKKKKKK.'],
      straw:   ['..TTTTT..', 'TTTTTTTTT', '.KKKKKKK.'],
      cap:     ['..KKKKK..', '..KKKKK..', '.KKKKKKK.'],
      bun:     ['..KKKKK..', '.KKKKKKK.', 'KKKKKKKKK'],
      white:   ['..WWWWW..', '.WWWWWWW.', '.WWWWWWW.'],
      grey:    ['...HHH...', '.HHHHHHH.', '.HHHHHHH.'],
      crown:   ['TTTTTTTTT', '.T.KKK.T.', '.KKKKKKK.'],
      helmet:  ['...AAA...', '.AAAAAAA.', 'AAAAAAAAA'],
      band:    ['.........', '.KKKKKKK.', '.WWWWWWW.'],
      hat:     ['..KKKKK..', '..KKKKK..', 'KKKKKKKKK'],
    },
    face(h = 'K', o = {}) {
      return [`.${h}SSSSS${h}.`, '.SSSSSSS.', o.w ? '.ESSSSSE.' : '.SESSSES.', o.b ? `.S${o.b.repeat(5)}S.` : '.SSSSSSS.'];
    },
    robe(c, b = c, belt = b, feet = 'KK', long = false) {
      return [`.${c.repeat(3)}W${c.repeat(3)}.`, `S${c.repeat(7)}S`, `.${belt.repeat(7)}.`, `.${b.repeat(7)}.`,
        long ? `.${b.repeat(7)}.` : `..${b}${b}.${b}${b}..`, `..${feet}.${feet}..`];
    },
    shins: ['..SS.SS..', '..TT.TT..'],
    smith: ['.SSOOOSS.', 'SSOOOOOSS', '.OOOOOOO.', '.kkkkkkk.', '..kk.kk..', '..KK.KK..'],
    wings: { 1: 'K.KKKKK.K' },
    oni: { 6: '.GGKRKGG.' },
    child: ['...KK....', '..KKKKK..', '.KKKKKKK.', '.KSSSSSK.', '.SESSSES.', '.SSSSSSS.', '..QQWQQ..', '.SQQQQQS.', '..QQ.QQ..', '..KK.KK..'],
    baby: { rows: ['.WWWWW.', 'WSsSsSW', '.WWWWW.'], oy: 4 },
  },
};

// 子ども（PARTS の child）のいか：子どもの体は bunify が扱えないので、ここで描く。体は橙の衣の色（Q・q）。色ちがいは recolor で
const CHILD_IKA = {
  bunMini: ['...KK....', '..KKKKK..', '.QQQQQQQ.', '.QEQQQEQ.', '.QEQQQEQ.', 'QQQQQQQQQ', '.QQQQQQq.', '.QQQQQQq.', '.Q.Q.Q.Q.'],
  bunC: [
    '.....KK......', '...KKKKKKK...', '..QQQQQQQQQ..', '..QQQQQQQQQ..', '..QQEQQQEQQ..', '..QQEQQQEQQ..', '..QQQQQQQQQ..',
    'QQQQQQQQQQQQQ', '..QQQQQQQQq..', '..QQQQQQQQq..', '..QQQQQQQQq..', '..Q.Q...Q.Q..'],
};

// 部品から人物（フチなしの行）を組む
function kitCast({ hair, face, robe, shins, smith, wings, oni, child }) {
  const fig = (h, f, body) => [...hair[h], ...f, ...body];
  const C = {
    farmer:   fig('straw', face(), [...robe('O', 'o', 'o').slice(0, -2), ...shins]),
    youth:    fig('topknot', face(), robe('G', 'G', 'R')),
    oldman:   fig('white', face('W', { old: true, b: 'W' }), robe('M', 'M', 'M', 'KK', true)),
    oldwoman: fig('grey', face('H', { old: true }), robe('n', 'n', 'n', 'KK', true)),
    man:      fig('hat', face(), robe('M', 'k', 'k')),
    scholar:  fig('cap', face(), robe('B', 'B', 'B', 'KK', true)),
    host:     fig('cap', face('K', { b: 'K' }), robe('O', 'O', 'q', 'KK', true)),
    wife:     fig('bun', face(), robe('P', 'P', 'p', 'KK', true)),
    soldier:  fig('helmet', face('A'), robe('N', 'N', 'A')),
    king:     fig('crown', face('K', { b: 'K' }), robe('Y', 'Y', 'T', 'KK', true)),
    smith:    fig('band', face(), smith),
  };
  Object.assign(C, {
    governor: recolor(withRows(C.scholar, wings), { B: 'R' }),
    seer:     recolor(C.oldman, { M: 'U' }),
    mikenjaku: fig('topknot', face('K', { w: true }), robe('N', 'N', 'R')),
    traveler: fig('hat', face('K', { b: 'K' }), robe('k', 'k', 'M')),
    villager: recolor(C.youth, { G: 'U', R: 'U' }),
    villagerB: recolor(C.farmer, { O: 'Q', o: 'q' }),
    hosho:    fig('cap', face('H', { old: true, b: 'H' }), robe('U', 'U', 'K', 'KK', true)),   // 蒲松齢（白髪まじりの髭）
  });
  // 鬼の顔：肌が青ざめ、眼が赤く、舌を吐く
  for (const k of ['youth', 'oldman', 'man']) C[k + 'Oni'] = withRows(recolor(C[k], { S: 'G', s: 'G', c: 'G', E: 'X' }), oni);
  Object.assign(C, { child, blueboy: recolor(child, { Q: 'B' }), childB: recolor(child, { Q: 'P' }), childC: recolor(child, { Q: 'G' }) });
  return C;
}

// 立ち姿・正座・寝姿・馬上・首だけ
function kitSprites(C) {
  const out = Object.fromEntries(Object.entries(C).map(([k, v]) => [k, person(v)]));
  for (const k of ['farmer', 'youth', 'youthOni', 'oldman', 'oldmanOni', 'scholar', 'host', 'wife', 'oldwoman', 'mikenjaku', 'traveler', 'king', 'hosho'])
    out[k + 'Sit'] = person(seiza(C[k]));
  for (const k of ['farmer', 'youth', 'oldman', 'man', 'mikenjaku', 'traveler', 'king', 'smith']) out[k + 'Lie'] = person(lying(C[k]));
  for (const k of ['farmer', 'man', 'villager']) out[k + 'Ride'] = person(riding(C[k]));
  // 首は、首のない胴に載せたときの高さを C（首が足元から 8 ドット上）にそろえる
  for (const k of ['mikenjaku', 'king', 'traveler']) out[k + 'Head'] = { ...person(headOf(C[k])), oy: 8 - (C[k].length - figOf(C[k]).head + 1) };
  for (const k of ['mikenjaku', 'king', 'traveler']) {
    out[k + 'Headless'] = person(headless(C[k]));
    out[k + 'LieHeadless'] = person(lying(headless(C[k])));
  }
  return out;
}
for (const style in PARTS) {
  castWithBuns(style, kitCast(PARTS[style]), kitSprites);
  // 赤ん坊は絵柄の大きさに合わせる（まんじゅうの絵柄にも同じ大きさを使う）
  const { rows, oy } = PARTS[style].baby, baby = { ...person(rows), oy };
  cast(style, { baby }); cast(BUN_OF[style], { baby });
}

// ---- 物の怪・動物・小道具 ----
const HORSE = [
  '..................yy....', '.................YYYY...', '................YYYYYY..',
  '...............YYYEYYYY.', '..............YYYY..YYYY', '.............YYYY....YY.',
  '.............YYYY.......', '..yYYYYRRRRRYYYYY.......', '.yYYYYYRRRRRYYYYY.......',
  'yyYYYYYYYYYYYYYYY.......', 'y.YYYYYYYYYYYYYYY.......', 'y..YYYYYYYYYYYYY........',
  '...YY.YY....YY.YY.......', '...YY.YY....YY.YY.......', '...yy.yy....yy.yy.......',
  '...kk.kk....kk.kk.......',
];
// 楕円の胴から作る絵（大魚・石の亀・鼎）
function blob(w, h, fn) { return Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => fn(x, y) ?? '.').join('')); }
const inEll = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
const FISH = blob(44, 14, (x, y) => {
  if (x >= 36 && Math.abs(y - 7) <= (x - 34) * .7) return x > 41 ? 'b' : 'B';           // 尾びれ
  if (!inEll(x, y, 19, 7, 17, 6.5)) return;
  if (x === 8 && y === 5) return 'E';
  if (x === 12 && y >= 4 && y <= 10) return 'b';                                        // えら
  return y < 5 ? 'b' : y > 9 ? 'W' : (x + y) % 5 === 0 ? 'B' : 'A';
});
const turtle = eye => blob(22, 10, (x, y) => {
  if (x >= 18 && inEll(x, y, 19, 5, 3, 2.5)) return x === 20 && y === 4 ? eye : 'A';     // 頭（右）
  if (inEll(x, y, 9, 5, 9, 4.5)) return (x + y) % 4 === 0 || y === 5 ? 'M' : 'A';           // 甲羅
  if ((x === 2 || x === 15) && y >= 8) return 'M';                                       // 足
});
const CAULDRON = blob(40, 22, (x, y) => {
  if (y <= 3 && (x <= 4 || x >= 35) && !(y === 0 && (x === 2 || x === 37)) && (x <= 2 || x >= 37 || y <= 1)) return 'q';   // 取っ手
  if (y >= 3 && y <= 4) return x >= 2 && x <= 37 ? 'q' : undefined;
  if (y >= 5 && y <= 15 && inEll(x, y, 19.5, 5, 18, 11)) return y === 8 ? 'T' : (x + y) % 6 === 0 ? 'q' : 'Q';
  if (y > 15 && (x >= 6 && x <= 8 || x >= 31 && x <= 33 || x >= 18 && x <= 21)) return 'q';                             // 脚
});
const RABBIT = [
  '..WW......WW....', '..WWW....WWW....', '..WwW....WwW....', '..WwW....WwW....',
  '...WWWWWWWW.....', '..WWWWWWWWWW....', '.WWAAWWWWAAWW...', '.WALLAWWALLAW...',
  '.WALLAWWALLAW...', '.WWAAWWWWAAWW...', '.WWWWWccWWWWW...', '..WWWWWWWWWW....',
  '.WWWWWWWWWWWWW..', 'WWWWWWWWWWWWWWW.', '.WWWWWWWWWWWWWWW', '..ww..ww..ww..ww',
];
const CART = [
  'O......................O', 'O......................O', 'OOOOOOOOOOOOOOOOOOOOOOOO', 'oooooooooooooooooooooooo',
  '.....KKKK.......oooooooo', '....KAAAAK..............', '...KA.KK.AK.............', '...KAKAAKAK.............',
  '...KA.KK.AK.............', '....KAAAAK..............', '.....KKKK...............',
];
const OX = blob(20, 12, (x, y) => {   // 胴は短め（長いと蛇のように見える）
  if (y <= 1 && (x === 14 || x === 18)) return 'K';                                       // 角
  if (inEll(x, y, 16, 4.5, 3.5, 3)) return x === 17 && y === 4 ? 'E' : x >= 19 && y >= 5 ? 'S' : 'O';   // 頭
  if (inEll(x, y, 8.5, 5, 7.5, 3.6)) return y >= 7 ? 'o' : 'O';                              // 胴
  if (y >= 8 && [3, 5, 11, 13].includes(x)) return y === 11 ? 'k' : 'O';                   // 脚
  if (x === 0 && y >= 3 && y <= 7) return 'o';                                            // 尾
});

Object.assign(SPR, {
  horse: person(HORSE), fish: person(FISH), turtle: person(turtle('E')), turtleRed: person(turtle('X')),
  cauldron: person(CAULDRON), rabbit: person(RABBIT), cart: person(CART), ox: person(OX),
  sword: parse(['..T.........', 'KKTALLLLLLLL', '..T.........']),
  chisel: parse(['oooAA']),
  stone: person(blob(30, 12, (x, y) => inEll(x, y, 14.5, 7, 14.5, 6) ? ((x * 3 + y * 5) % 11 === 0 ? 'M' : y < 4 ? 'H' : 'A') : undefined)),
  stoneSplit: person(blob(30, 12, (x, y) => inEll(x, y, 14.5, 7, 14.5, 6) && Math.abs(x - 15 - (y % 2)) > 1 ? (y < 4 ? 'H' : 'A') : undefined)),
});
Object.assign(WPN, {
  biwa: 'oooQQQQ', axe: 'yyyyyyyy', spear: 'oooooooooooooAA', staff: 'oooooooooooo', torch: 'ooooYY',
  sword: 'KKALLLLLLLL', swordB: 'KKALLLLXXXX', brush: 'ooooX', fude: 'TTTTTTTKK',
});

// =====================================================================
//  背景
// =====================================================================
// 田舎道：sky 0 昼 / 1 夕暮れ / 2 夜、run で車や馬の進む速さ（画素/秒。景色が流れる）
const SKY = [['#8cc0e8', '#a8d0ec', '#7a9ab0'], ['#e08a58', '#f0b878', '#8a6070'], ['#141c40', '#1c2650', '#1a2038']];
function willow(x, y, col = '#3a6a40') {
  rect(x, y - 30, 3, 30, '#4a3424');
  circle(x + 1, y - 32, 11, col, 7);
  for (let dx = -10; dx <= 10; dx += 3) for (let t = 0; t < 18 - Math.abs(dx); t++) rect(x + 1 + dx + Math.round(Math.sin(T + t * .2) * t * .06), y - 30 + t, 1, 1, col);
}
// 山の上から見下ろす谷。city で城、water で湖に沈む量（0〜1）
function valleyCity(water) {
  const cy = 74;
  for (let x = 120; x < 270; x += 6) rect(x, cy - 10 - (x % 18 === 0 ? 6 : 0), 5, 10 + (x % 18 === 0 ? 6 : 0), '#8a8478');
  rect(116, cy - 2, 158, 4, '#6a665e'); rect(176, cy - 26, 32, 10, '#5a3a2a'); rect(170, cy - 30, 44, 4, '#3a3a40');
  if (water > 0) { const top = Math.round(cy + 6 - water * 40); g.globalAlpha = .9; rect(60, top, 270, cy + 8 - top, '#3a72b0'); g.globalAlpha = 1;
    for (let i = 0; i < 20; i++) rect(70 + Math.floor(h1(i) * 250), top + 2 + Math.floor(h1(i + 1) * Math.max(1, cy + 6 - top - 2)), 5, 1, '#9cc8ec'); }
}

Object.assign(SCENES, {
  fields: {
    key: p => 'sky' + (p.sky ?? 0),
    dark: p => [[0, '#000000'], [.15, '#3a1a2a'], [.5, '#0a1030']][p.sky ?? 0],
    build(p) {
      const [a, b, hill] = SKY[p.sky ?? 0];
      rect(0, 0, VW, 40, a); rect(0, 28, VW, 36, b);   // 下の帯は丘の稜線の一番低い所（y 56）より下まで塗る
      if (p.sky === 2) speckle(0, 0, VW, 40, '#c8d0ff', 40, 2);
      for (let x = 0; x < VW; x++) { const y = Math.round(44 + 8 * Math.sin(x * .02 + 1) + 4 * Math.sin(x * .06)); rect(x, y, 1, 64 - y, hill); }
      rect(0, 60, VW, 156, '#6a9a4a');
      for (let y = 64; y < 100; y += 5) rect(0, y, VW, 1, '#5a8a3e');
      rect(0, 100, VW, 36, '#b89a6a'); rect(0, 100, VW, 2, '#9a7c50'); rect(0, 134, VW, 2, '#9a7c50');
      speckle(0, 102, VW, 32, '#a88a5a', 220, 3);
      rect(0, 136, VW, 80, '#5e8e44'); speckle(0, 136, VW, 80, '#4e7e38', 400, 4);
    },
    anim(p) {
      const off = (p.run ?? 0) * T;
      for (let k = 0; k < 6; k++) willow(Math.round(mod(k * 80 - off * .6, VW + 80) - 40), 98, p.sky === 2 ? '#2a4a30' : '#3a6a40');
      for (let k = 0; k < 18; k++) rect(Math.round(mod(k * 24 - off, VW + 24) - 12), 117 + (k % 2) * 6, 10, 1, '#a88a5a');
      for (let k = 0; k < 14; k++) { const x = Math.round(mod(k * 31 - off * 1.3, VW + 31) - 15); rect(x, 137, 1, 4, '#4e7e38'); rect(x + 2, 138, 1, 3, '#4e7e38'); }
    },
    emit(p) {
      if (p.sky === 1) { circle(330, 46, 11, '#ffd090'); glow(330, 46, 40, '#ff9050', .25); }
      if (p.sky === 2) { circle(322, 18, 6, '#f4f0d8'); glow(322, 18, 18, '#c8d8ff', .25); }
    },
  },

  // 屋敷の部屋：格子窓、棚（鑿を置く）、卓、燭台。night で夜
  house: {
    key: p => p.night ? 'n' : '',
    dark: p => p.night ? [.5, '#0a1030'] : [.05, '#000000'],
    build(p) {
      rect(0, 0, VW, 12, '#3a2618'); rect(0, 12, VW, 4, '#5a3a22');
      rect(0, 16, VW, 70, '#cdbf9e'); speckle(0, 16, VW, 70, '#bfb08e', 500, 6);
      rect(0, 12, 8, 76, '#5a3a22'); rect(376, 12, 8, 76, '#5a3a22');
      rect(40, 26, 60, 40, '#5a3a22'); rect(43, 29, 54, 34, p.night ? '#1c2850' : '#e8f0f4');
      for (let x = 43; x < 97; x += 6) rect(x, 29, 1, 34, '#5a3a22'); for (let y = 29; y < 63; y += 6) rect(43, y, 54, 1, '#5a3a22');
      rect(270, 34, 70, 3, '#5a3a22'); rect(272, 37, 2, 6, '#3a2618'); rect(336, 37, 2, 6, '#3a2618');
      rect(280, 28, 8, 6, '#c8b078'); rect(296, 30, 12, 4, '#8a6a46'); rect(318, 27, 6, 7, '#6a7a8a');
      rect(0, 84, VW, 4, '#4a3020'); planks(0, 88, VW, 128, '#6a5038', '#54402c', 8, 64);
      rect(160, 98, 64, 4, '#7a4a2a'); rect(162, 102, 3, 14, '#5a3018'); rect(219, 102, 3, 14, '#5a3018');
      rect(130, 92, 2, 24, '#3a2a1a'); rect(126, 116, 10, 2, '#3a2a1a');
    },
    emit(p) { if (p.night) { flame(131, 92); glow(131, 92, 34, '#ffb050', .28); } },
  },

  // 屋敷の門：門扉と瓦屋根、灯籠。pine で松の大樹と大きな石。night で夜
  frontgate: {
    key: p => (p.night ? 'n' : '') + (p.pine ? 'p' : ''),
    dark: p => p.night ? [.5, '#0a1030'] : [0, '#000000'],
    build(p) {
      rect(0, 0, VW, 30, p.night ? '#141c40' : '#9cc8ec');
      rect(0, 30, VW, 60, '#cdbf9e'); rect(0, 30, VW, 4, '#4a5058'); rect(0, 26, VW, 4, '#3a4048');
      rect(150, 14, 84, 6, '#3a4048'); rect(156, 20, 72, 10, '#4a5058'); for (let x = 158; x < 226; x += 4) rect(x, 20, 1, 10, '#3a4048');
      rect(160, 30, 64, 60, '#7a2a1e'); rect(191, 30, 2, 60, '#4a1a12');
      for (const x of [166, 174, 210, 218]) for (const y of [44, 58, 72]) rect(x, y, 2, 2, '#e3b54a');
      rect(156, 30, 4, 60, '#5a3a22'); rect(224, 30, 4, 60, '#5a3a22');
      rect(0, 88, VW, 128, '#a8a298'); speckle(0, 88, VW, 128, '#8a8478', 500, 5);
      for (const x of [136, 248]) { rect(x - 3, 70, 7, 10, '#3a3a40'); rect(x - 1, 80, 3, 12, '#3a3a40'); }
      if (p.pine) {
        rect(52, 20, 8, 86, '#5a3a22'); rect(54, 20, 2, 86, '#7a5236');
        for (const [cx, cy, r] of [[56, 22, 26], [30, 40, 18], [82, 36, 20], [56, 48, 16]]) circle(cx, cy, r, '#2e5a34', r * .45);
      }
    },
    emit(p) { if (p.night) for (const x of [136, 248]) { rect(x - 2, 72, 5, 6, '#ffd890'); glow(x, 75, 24, '#ffc060', .3); } },
  },

  // 城門：城壁と門楼。blood（0〜1）で門扉に犬の血。dusk で夕暮れ
  citygate: {
    key: p => p.dusk ? 'd' : '',
    dark: p => p.dusk ? [.25, '#3a1a2a'] : [0, '#000000'],
    build(p) {
      rect(0, 0, VW, 40, p.dusk ? '#e08a58' : '#9cc8ec'); rect(0, 26, VW, 14, p.dusk ? '#f0b878' : '#b8d8f0');
      bricks(0, 34, VW, 62, '#8a8478', '#6a665e', 12, 6);
      for (let x = 0; x < VW; x += 16) rect(x, 30, 10, 6, '#8a8478');
      rect(150, 8, 84, 4, '#3a4048'); rect(140, 12, 104, 8, '#4a5058'); rect(158, 20, 68, 16, '#8a3a2a');
      for (let x = 162; x < 224; x += 10) rect(x, 22, 6, 12, '#5a2a1e');
      rect(168, 52, 48, 44, '#2a2020'); circle(192, 52, 24, '#2a2020', 10);
      rect(170, 56, 21, 40, '#6a3a24'); rect(193, 56, 21, 40, '#6a3a24');
      rect(0, 96, VW, 120, '#b8a07a'); speckle(0, 96, VW, 120, '#a08a64', 600, 3);
    },
    anim(p) { if (p.blood) { g.globalAlpha = .85 * p.blood; for (const [x, y, w, h] of [[176, 62, 10, 22], [196, 66, 12, 18], [184, 84, 16, 8], [200, 60, 4, 10]]) rect(x, y, w, h, '#8a1010'); g.globalAlpha = 1; } },
  },

  // 河岸の町：瓦屋根の家並み、石の岸、流れる江水。flood（0〜1）で水嵩が増す
  riverside: {
    build() {
      rect(0, 0, VW, 30, '#9cc8ec');
      for (let k = 0; k < 9; k++) { const x = k * 46 - 10; rect(x, 18, 42, 26, '#cdbf9e'); rect(x - 2, 14, 46, 6, '#4a5058'); rect(x + 14, 30, 10, 14, '#3a2a1a'); }
      rect(0, 44, VW, 4, '#6a665e');
      rect(0, 98, VW, 118, '#c8b890'); speckle(0, 98, VW, 118, '#b0a07a', 500, 4);
      rect(0, 96, VW, 3, '#8a8478');
    },
    anim(p) {
      const top = Math.round(48 - (p.flood ?? 0) * 18), bot = Math.round(96 + (p.flood ?? 0) * 14);
      rect(0, top, VW, bot - top, '#3a72b0');
      for (let i = 0; i < 60; i++) rect(Math.round(mod(h1(i) * VW + T * (18 + h1(i + 1) * 20), VW)), top + 2 + Math.floor(h1(i + 2) * (bot - top - 4)), 6, 1, '#9cc8ec');
    },
  },

  // 山の上：岩場と松。city で谷の城が見え、water で湖に沈む
  heights: {
    key: p => p.city ? 'c' : '',
    build(p) {
      rect(0, 0, VW, 40, '#9cc8ec'); rect(0, 30, VW, 70, '#b8d8f0');   // 空は山の稜線（y 25〜55）の下まで塗る
      for (let x = 0; x < VW; x++) { const y = Math.round(40 + 10 * Math.sin(x * .015) + 5 * Math.sin(x * .05)); rect(x, y, 1, 100 - y, '#8aa0b0'); }
      rect(0, 70, VW, 40, '#7a9a6a');   // 岩場の上端（y 91〜109）の下まで
      if (!p.city) for (let x = 0; x < VW; x++) { const y = Math.round(58 + 6 * Math.sin(x * .03 + 2)); rect(x, y, 1, 100 - y, '#6a8a5a'); }
      for (let x = 0; x < VW; x++) { const y = Math.round(100 + 6 * Math.sin(x * .02 + 1) + 3 * Math.sin(x * .09)); rect(x, y, 1, VH - y, '#8a8070'); }
      speckle(0, 100, VW, 116, '#7a7060', 500, 6); speckle(0, 100, VW, 116, '#a09888', 300, 7);
      for (const [x, s] of [[34, 1], [346, .8]]) { rect(x, 70, 4, 40 * s, '#4a3424'); circle(x + 2, 66, 18 * s, '#2e5a34', 7 * s); circle(x - 8, 78, 12 * s, '#2e5a34', 5 * s); }
    },
    anim(p) { if (p.city) valleyCity(p.water ?? 0); },
  },

  // 楚王の宮殿：朱の柱、玉座、幡。cauldron で大きな鼎の下に火
  palace: {
    dark: [.12, '#20100a'],
    build() {
      rect(0, 0, VW, 14, '#3a2018'); for (let x = 0; x < VW; x += 12) rect(x, 10, 6, 4, '#e3b54a');
      rect(0, 14, VW, 74, '#7a3a2a');
      for (let x = 20; x < VW; x += 72) { rect(x, 14, 10, 74, '#b03a2a'); rect(x + 2, 14, 2, 74, '#d05a40'); rect(x - 2, 14, 14, 4, '#e3b54a'); }
      rect(150, 20, 84, 50, '#3a2a20'); for (let y = 24; y < 68; y += 6) rect(154, y, 76, 1, '#e3b54a');
      rect(172, 56, 40, 16, '#e3b54a'); rect(176, 52, 32, 4, '#c8963a');
      for (const x of [110, 262]) { rect(x, 18, 14, 50, '#e0b040'); rect(x + 2, 22, 10, 40, '#b03a2a'); }
      rect(0, 84, VW, 4, '#3a2018'); rect(0, 88, VW, 12, '#6a5a4a');
      for (let y = 88; y < 100; y += 4) rect(130 - (y - 88), y, 124 + (y - 88) * 2, 4, y % 8 ? '#9a8a7a' : '#8a7a6a');
      checker(0, 100, VW, 116, '#8a7a6a', '#7a6a5a', 16);
    },
    emit(p) { if (p.cauldron) { flame(192, 134); flame(180, 134); flame(204, 134); glow(192, 128, 46, '#ff9040', .32); } },
  },

  // 鍛冶場：炉と金床、壁に剣
  forge: {
    dark: [.35, '#1a0a08'],
    build() {
      rect(0, 0, VW, 88, '#5a4a40'); bricks(0, 0, VW, 88, '#5a4a40', '#4a3a32', 12, 6);
      rect(30, 30, 70, 60, '#7a3a28'); bricks(30, 30, 70, 60, '#7a3a28', '#5a2a1e', 8, 4); rect(46, 54, 38, 30, '#1a0a08');
      for (const x of [270, 290, 310, 330]) { line(x, 24, x, 64, '#aab3bd'); rect(x - 2, 60, 5, 2, '#3a2a1a'); }
      rect(0, 88, VW, 128, '#4a3a30'); speckle(0, 88, VW, 128, '#3a2a22', 600, 8);
      rect(186, 104, 26, 6, '#3a3a40'); rect(192, 110, 14, 12, '#3a3a40'); rect(188, 122, 22, 4, '#2a2a30');
      rect(140, 112, 18, 10, '#6a4a2e'); rect(142, 110, 14, 2, '#3a72b0');
    },
    emit() { flame(65, 82); flame(57, 82); flame(73, 82); glow(65, 72, 54, '#ff8030', .38); },
  },

  // 三王の墓：草原の塚と石碑
  tomb: {
    build() {
      rect(0, 0, VW, 40, '#9cc8ec'); rect(0, 30, VW, 30, '#b8d8f0');   // 空は稜線の一番低い所（y 52）の下まで
      for (let x = 0; x < VW; x++) { const y = Math.round(46 + 6 * Math.sin(x * .02)); rect(x, y, 1, 70 - y, '#8aa0b0'); }
      rect(0, 66, VW, 150, '#6a9a4a'); speckle(0, 66, VW, 150, '#5a8a3e', 600, 3); speckle(0, 66, VW, 150, '#86b866', 300, 4);
      circle(192, 104, 62, '#5a8a3e', 30); circle(192, 102, 56, '#6a9a4a', 26);
      rect(184, 92, 16, 30, '#9a948a'); rect(182, 90, 20, 3, '#7a746a'); rect(186, 98, 12, 18, '#8a8478');
      for (const x of [60, 320]) { rect(x, 72, 4, 28, '#4a3424'); circle(x + 2, 66, 14, '#2e5a34', 10); }
    },
  },

  // 県の役所（聊斎志異の促織・書痴など）：朱の柱、「明鏡高懸」の額、海と朝日の衝立。手前に赤い布をかけた机（後ろに立つ役人の足元を隠す）
  gaya: {
    build() {
      rect(0, 0, VW, 88, '#6a2a1e'); rect(0, 0, VW, 8, '#3a2018');
      for (const x of [24, 346]) { rect(x, 8, 14, 80, '#9a3a2a'); rect(x + 2, 8, 2, 80, '#c05a40'); }
      rect(150, 8, 84, 14, '#2a2018'); for (let i = 0; i < 4; i++) rect(160 + i * 18, 11, 10, 7, '#e3b54a');
      rect(116, 26, 152, 62, '#5a3a22'); rect(120, 30, 144, 56, '#3a6a9a'); circle(192, 50, 12, '#e84a2a');
      for (let y = 60; y < 86; y += 5) for (let x = 122; x < 260; x += 10) rect(x + (y % 10 ? 5 : 0), y, 6, 1, '#9cc8ec');
      checker(0, 88, VW, 128, '#8a8478', '#7a746a', 16);
      rect(110, 86, 164, 14, '#6a5a4a'); rect(110, 86, 164, 2, '#8a7a6a');
    },
    emit() {
      rect(146, 94, 92, 4, '#5a3a22'); rect(150, 98, 84, 20, '#a83a2a'); rect(150, 98, 84, 2, '#c85a40');
      rect(160, 90, 9, 4, '#3a2a1a'); rect(210, 86, 4, 8, '#3a2a1a'); rect(215, 88, 1, 6, '#e8e0d0');
    },
  },
  // 蒲松齢の書斎（聊斎）：夜。丸窓に月、本棚の線装本、「聊斎」の額、文机と灯火。机の紙に字が 1 つずつ書き足されていく
  shosai: {
    dark: [.35, '#0a1030'],
    build() {
      rect(0, 0, VW, 12, '#2e2014'); rect(0, 12, VW, 4, '#4a3020');
      rect(0, 16, VW, 70, '#bfae8c'); speckle(0, 16, VW, 70, '#ae9e7c', 500, 6);
      rect(0, 12, 8, 76, '#4a3020'); rect(376, 12, 8, 76, '#4a3020');
      circle(70, 50, 27, '#4a3020'); circle(70, 50, 24, '#1c2850');   // 丸窓と夜空
      for (let x = 49; x <= 91; x += 7) rect(x, 27, 1, 46, '#4a3020');
      rect(46, 50, 48, 1, '#4a3020');
      rect(166, 20, 52, 16, '#3a2618'); rect(168, 22, 48, 12, '#e8dcc0');   // 「聊斎」の額
      for (let i = 0; i < 14; i++) rect(176 + (i % 2) * 24 + Math.floor(h1(i) * 6), 24 + Math.floor(h1(i + 9) * 8), 1 + Math.floor(h1(i + 4) * 4), 1 + Math.floor(h1(i + 6) * 2), '#2a2018');   // 筆の字
      rect(268, 26, 84, 60, '#4a3020');   // 本棚：線装本を横に積む
      for (let r = 0; r < 3; r++) {
        rect(270, 28 + r * 19, 80, 17, '#2e2014');
        for (let i = 0; i < 7; i++) {
          const h = 2 + Math.floor(h1(r * 7 + i) * 3);
          for (let k = 0; k < h; k++) rect(272 + i * 11, 43 + r * 19 - k * 3, 10, 2, ['#c8b890', '#3a5a8a', '#8a4a3a', '#e8dcc0'][(r + i + k) % 4]);
        }
      }
      rect(0, 84, VW, 4, '#3a2618'); planks(0, 88, VW, 128, '#5a4430', '#463424', 8, 64);
      rect(180, 125, 56, 2, '#6a3a1e'); rect(182, 127, 2, 3, '#4a2410'); rect(232, 127, 2, 3, '#4a2410');   // 文机
      rect(226, 120, 4, 5, '#3a3530'); rect(224, 124, 8, 1, '#5a5550');   // 灯火の皿
      rect(210, 123, 7, 2, '#2a2420'); rect(211, 123, 5, 1, '#4a4440');   // 硯
    },
    // 紙（書いた字が少しずつ増える）
    anim(p, lt) {
      rect(180, 123, 24, 2, '#f2ead8');
      const n = Math.min(6, Math.floor(lt * .5));
      for (let i = 0; i < n; i++) rect(201 - i * 3, 123, 1, 2, '#2a2018');
    },
    emit() { flame(228, 120); glow(228, 116, 34, '#ffb050', .3); circle(62, 40, 5, '#f4f0d8'); glow(62, 40, 14, '#c8d8ff', .2); },
  },
});

// 小人（聊斎志異の小猟犬・小官人）：数ドットの人と馬。kind は rider 騎馬 / foot 徒歩 / king 冠の王 / koshi 輿。col は衣の色
function tinyFolk(x, y, kind, col = '#c84a3a') {
  x = Math.round(x); y = Math.round(y);
  if (kind === 'rider') { rect(x - 2, y - 2, 5, 2, '#8a6a40'); rect(x - 2, y, 1, 1, '#5a4028'); rect(x + 2, y, 1, 1, '#5a4028'); rect(x, y - 4, 1, 2, col); rect(x, y - 5, 1, 1, '#f2c29b'); rect(x - 1, y - 6, 1, 1, '#d8b84a'); return; }
  if (kind === 'king') { rect(x, y - 3, 2, 3, '#e3b54a'); rect(x, y - 4, 2, 1, '#f2c29b'); rect(x - 1, y - 5, 4, 1, '#1b1b2f'); return; }
  if (kind === 'koshi') { rect(x - 3, y - 4, 7, 3, '#c84a3a'); rect(x - 3, y - 5, 7, 1, '#e3b54a'); rect(x - 5, y - 1, 11, 1, '#5a4028'); return; }
  rect(x, y - 2, 1, 2, col); rect(x, y - 3, 1, 1, '#f2c29b');
}
// 小人の猟犬（2 ドット）と鷹（1 ドット）
const tinyDog = (x, y) => { rect(Math.round(x), Math.round(y) - 1, 2, 1, '#8a6a40'); };
const tinyHawk = (x, y) => rect(Math.round(x), Math.round(y), 1, 1, '#3a2a1c');

// 小さな炎（燭台・篝火・炉）
function flame(x, y) {
  for (let dx = -2; dx <= 2; dx++) {
    const h = Math.round(5 * (1 - Math.abs(dx) / 3) * (.6 + .4 * Math.sin(T * 13 + dx * 2 + x)));
    rect(x + dx, y - h, 1, h, '#c04020'); rect(x + dx, y - h + 1, 1, Math.max(0, h - 2), '#ff8030'); if (h > 2) rect(x + dx, y - Math.floor(h / 2), 1, 1, '#ffd070');
  }
}

Object.assign(MOOD, {
  fields: { wind: .3 }, house: { drone: .12 }, frontgate: { wind: .15 }, citygate: { wind: .2 }, riverside: { wind: .3, rain: .1 },
  heights: { wind: .5 }, palace: { drone: .2 }, forge: { drone: .15 }, tomb: { wind: .35 }, void: { drone: .4 }, shosai: { drone: .08 }, gaya: { drone: .12 },
});

// ---- 台本の道具 ----
// x（数値・キーフレーム・関数）を d だけずらす
const shiftX = (x, d) => Array.isArray(x) ? x.map(([f, v]) => [f, v + d]) : typeof x === 'function' ? f => x(f) + d : x + d;
// 車（牛と車と乗り手）を x ごと動かす。riders = [[スプライト, 車の上の位置, 追加の指定], ...]。sc で大きさ
// flip で左向き（牛が左、車が右）。a は全体の見え方
function oxcart(x, riders = [], o = {}) {
  const sc = o.sc ?? 1, y = o.y ?? G, d = o.flip ? -1 : 1, base = { sc, lin: true, walk: o.walk, ...(o.flip && { flip: true }), ...(o.a && { a: o.a }) };
  return [
    { s: 'cart', x: shiftX(x, 0), y, ...base },
    { s: 'ox', x: shiftX(x, 28 * sc * d), y: y + sc, ...base, bob: o.bob },
    ...riders.map(([s, dx, extra]) => ({ s, x: shiftX(x, dx * sc * d), y: y - 6 * sc, z: y + 2, ...base, ...extra })),
  ];
}
// 馬に乗った人：rider は 'xxxRide'。sc で大きさ
const mounted = (rider, x, o = {}) => {
  const sc = o.sc ?? 1, y = o.y ?? G;
  return [
    { s: rider, x: shiftX(x, (o.flip ? 3 : -3) * sc), y: y - 9 * sc, z: y + 1, sc, lin: true, walk: o.walk, flip: o.flip, ...o.rider },
    { s: 'horse', x, y, sc, lin: true, walk: o.walk, flip: o.flip, ...o.horse },
  ];
};
// 題名と、最後の題名・出典。theme は作品のテーマ曲（songs.js）。最後は同じテーマの静かな版
// note / source を渡すと、綺堂以外の作品（聊斎志異など）の出典に差し替えられる
const opening = (scene, title, sp = {}, theme = 'title', note = L('岡本綺堂「中国怪奇小説集」より', 'from Kido Okamoto, Chinese Tales of the Strange')) => cut({ bgm: theme, scene, sp: { dim: .55, ...sp }, dur: 7, title, note });
// tail は出典のあとに付ける文（青空文庫以外の本文なら '' にする）
const credits = (scene, title, sp = {}, theme,
  source = L(`岡本綺堂「中国怪奇小説集」より「${title}」`, `"${title}"　from Kido Okamoto, Chinese Tales of the Strange`),
  tail = L('　本文：青空文庫', '　English translation: Claude　Source: Aozora Bunko')) => cut({ bgm: theme ? theme + 'Calm' : 'ending', scene, sp: { dim: .5, ...sp }, dur: 9, title, note: source + tail });
// 聊斎志異の「異史氏曰」：蒲松齢が書斎で筆をとり、話のあとに感想を語る。lines は [{ text, orig }]。
// 音楽は作品のテーマの静かな版（そのまま最後の題名へつながる）。o で cap などを差し替える（本文の結びの感想なら cap: null）
NAMES.hoshoSit = L('蒲松齢', 'Pu Songling');
const ishishi = (theme, lines, o = {}) => cut({
  bgm: theme + 'Calm', scene: 'shosai', cap: L('｜異史氏《いしし》（蒲松齢）は言う。', 'The Historian of the Strange (Pu Songling) says:'), orig: '異史氏曰：',
  say: lines.map(l => ({ who: 0, ...l })),
  actors: [{ s: 'hoshoSit', x: 166, y: G + 8, sc: 2, w: { k: 'fude', a: () => 6 + Math.round(6 * Math.sin(T * 5)) } }],
  ...o,
});
