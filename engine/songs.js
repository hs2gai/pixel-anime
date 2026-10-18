// =====================================================================
//  BGM の曲（チップチューン）。core.js の MUSIC が鳴らす。書き方は core.js の BGM の説明を参照
//  場面の曲はどれも A 4 小節 → B 4 小節の 8 小節で繰り返す（ab() でつなぐ）。
//  同じ曲でも作品ごとに調・速さ・音色が変わり、2 周目からは旋律が少しずつ崩れる（core.js の MUSIC.variant / vary）。
//  作品のテーマ曲（〜Theme）は題名で鳴らし、〜ThemeCalm は最後の題名で鳴らす静かな版
// =====================================================================
'use strict';

// 同じ小節を n 回
const bars = (n, s) => Array(n).fill(s).join(' | ');
// 8 分音符のアルペジオ（和音の 4 音を 2 回）：arp('A3 E4 A4 E4')
const arp = notes => bars(2, notes.split(' ').map(n => n + ':2').join(' '));
// 16 分音符のアルペジオ（4 回）
const arp16 = notes => bars(4, notes.split(' ').join(' '));
// 裏拍の刻み（小節ごとの 1 音）
const offbeat = notes => notes.split(' ').map(n => `.:2 ${n}:2 .:2 ${n}:2 .:2 ${n}:2 .:2 ${n}:2`).join(' | ');
// 8 分音符のオクターブ刻み（小節ごとの根音）：octaves('A2 G2 F2 E2')
const octaves = roots => roots.split(' ').map(r => { const n = r.slice(0, -1), o = +r.slice(-1); return bars(1, Array(4).fill(`${n}${o}:2 ${n}${o + 1}:2`).join(' ')); }).join(' | ');
// A と B をつなぐ
const ab = (a, b) => a + ' | ' + b;
const chords = (...a) => a.map(c => arp(c)).join(' | ');
const chords16 = (...a) => a.map(c => arp16(c)).join(' | ');

Object.assign(SONGS, {
  // 題名：静かで謎めいた序曲（イ短調）
  title: { bpm: 84,
    lead: ab('A4:4 C5:4 E5:6 D5:2 | C5:4 B4:4 A4:8 | F4:4 A4:4 C5:6 B4:2 | G#4:4 B4:4 E5:8',
             'D5:4 F5:4 A5:6 G5:2 | E5:4 C5:4 A4:8 | F5:4 E5:2 D5:2 C5:4 B4:4 | B4:4 C5:2 D5:2 E5:8'),
    harm: ab(chords('A3 E4 A4 E4', 'A3 E4 A4 E4', 'F3 C4 F4 C4', 'E3 B3 E4 G#4'), chords('D3 A3 D4 A3', 'A3 E4 A4 E4', 'F3 C4 F4 C4', 'E3 B3 E4 G#4')),
    bass: ab('A2:8 A2:8 | A2:8 G2:8 | F2:8 F2:8 | E2:8 E2:8', 'D2:8 D2:8 | A2:8 E2:8 | F2:8 F2:8 | E2:8 E2:8'),
    drum: bars(4, 'k:8 h:8') },

  // 夜の街：もの寂しいニ短調
  night: { bpm: 92,
    lead: ab('D5:3 E5:1 F5:4 E5:2 D5:2 A4:4 | Bb4:3 C5:1 D5:4 C5:2 Bb4:2 F4:4 | G4:3 A4:1 Bb4:4 A4:2 G4:2 E4:4 | A4:6 C#5:2 E5:4 .:4',
             'G4:3 A4:1 Bb4:4 D5:4 C5:4 | A4:3 Bb4:1 A4:4 F4:4 D4:4 | Bb4:3 C5:1 D5:4 F5:4 E5:4 | E5:6 D5:2 C#5:8'),
    harm: ab(chords('D4 F4 A4 F4', 'Bb3 D4 F4 D4', 'C4 E4 G4 E4', 'A3 C#4 E4 C#4'), chords('G3 Bb3 D4 Bb3', 'D4 F4 A4 F4', 'Bb3 D4 F4 D4', 'A3 C#4 E4 C#4')),
    bass: ab('D3:4 .:2 D3:2 A2:4 .:4 | Bb2:4 .:2 Bb2:2 F2:4 .:4 | C3:4 .:2 C3:2 G2:4 .:4 | A2:4 .:2 A2:2 E2:4 A2:4',
             'G2:4 .:2 G2:2 D2:4 .:4 | D3:4 .:2 D3:2 A2:4 .:4 | Bb2:4 .:2 Bb2:2 F2:4 .:4 | A2:4 .:2 A2:2 E2:4 A2:4'),
    drum: bars(4, 'k:4 h:4 .:4 h:4'), vol: { lead: .9 } },

  // 喫茶店：あたたかいヘ長調、歩くベース
  cafe: { bpm: 100,
    lead: ab('A4:2 C5:2 F5:4 E5:2 D5:2 C5:4 | D5:2 F5:2 A5:4 G5:2 F5:2 D5:4 | Bb4:2 D5:2 G5:4 F5:2 E5:2 D5:4 | C5:4 E5:4 G5:6 .:2',
             'D5:2 F5:2 Bb5:4 A5:2 G5:2 F5:4 | E5:2 C5:2 A4:4 C5:2 E5:2 A5:4 | G5:2 F5:2 D5:4 Bb4:2 D5:2 G5:4 | E5:4 G5:4 C5:8'),
    harm: ab(chords('F4 A4 C5 A4', 'D4 F4 A4 F4', 'G4 Bb4 D5 Bb4', 'C4 E4 G4 E4'), chords('Bb3 D4 F4 D4', 'A3 C4 E4 C4', 'G3 Bb3 D4 Bb3', 'C4 E4 Bb4 E4')),
    bass: ab('F2:4 A2:4 C3:4 A2:4 | D2:4 F2:4 A2:4 F2:4 | G2:4 Bb2:4 D3:4 Bb2:4 | C2:4 E2:4 G2:4 E2:4',
             'Bb1:4 D2:4 F2:4 D2:4 | A1:4 C2:4 E2:4 C2:4 | G1:4 Bb1:4 D2:4 Bb1:4 | C2:4 E2:4 G2:4 Bb2:4'),
    drum: bars(4, 'k:4 h:4 h:4 h:4'), vol: { lead: .8, drum: .7 } },

  // 怪異：半音でにじり寄る。ベースは三全音へ落ちる
  mystery: { bpm: 72,
    lead: ab('E5:2 .:2 F5:2 .:2 E5:2 .:6 | Bb4:4 A4:4 .:8 | E5:2 .:2 F5:2 .:2 G5:2 .:2 F5:4 | E5:8 .:8',
             'B5:2 .:2 Bb5:2 .:2 A5:2 .:6 | E5:4 F5:4 .:8 | G5:2 .:2 F#5:2 .:2 F5:2 .:2 E5:4 | Bb4:8 .:8'),
    harm: ['E4', 'F4', 'E4', 'D#4', 'G4', 'F#4', 'F4', 'E4'].map(n => `${n}:2 .:2 ${n}:2 .:2 ${n}:2 .:2 ${n}:2 .:2`).join(' | '),
    bass: ab('E2:16 | F2:16 | E2:16 | Bb1:16', 'C2:16 | B1:16 | Bb1:16 | E2:16'),
    drum: bars(4, 'k:2 k:2 .:12') },

  // 悲しみ（雨・病）：ホ短調、打楽器なし
  sad: { bpm: 76,
    lead: ab('B4:4 G4:2 A4:2 B4:4 E5:4 | E5:4 D5:2 C5:2 B4:4 G4:4 | A4:4 C5:2 B4:2 A4:4 E4:4 | F#4:4 A4:2 G4:2 F#4:4 D#4:4',
             'C5:4 B4:2 A4:2 E5:4 C5:4 | B4:4 A4:2 G4:2 E4:8 | G4:4 A4:2 B4:2 C5:4 E5:4 | D#5:4 C5:2 B4:2 A4:4 F#4:4'),
    harm: ab(chords('E4 G4 B4 G4', 'C4 E4 G4 E4', 'A3 C4 E4 C4', 'B3 D#4 F#4 D#4'), chords('A3 C4 E4 C4', 'E3 G3 B3 G3', 'C4 E4 G4 E4', 'B3 D#4 A4 D#4')),
    bass: ab('E2:8 B2:8 | C2:8 G2:8 | A2:8 E2:8 | B1:8 F#2:8', 'A1:8 E2:8 | E2:8 B1:8 | C2:8 G2:8 | B1:8 B1:8') },

  // 道中（電車・汽車・船）：刻むベースのイ短調
  travel: { bpm: 120,
    lead: ab('E5:4 A5:4 G5:2 E5:2 D5:4 | E5:4 D5:2 C5:2 B4:4 G4:4 | A4:4 C5:4 B4:2 A4:2 F4:4 | G#4:4 B4:4 E5:8',
             'F5:4 A5:4 G5:2 F5:2 E5:4 | E5:4 G5:4 F5:2 E5:2 C5:4 | D5:4 F5:4 E5:2 D5:2 Bb4:4 | B4:4 D5:4 E5:8'),
    harm: ab(offbeat('C5 B4 A4 G#4'), offbeat('A4 G4 F4 G#4')),
    bass: ab(octaves('A2 G2 F2 E2'), octaves('D2 C2 Bb1 E2')),
    drum: bars(4, 'k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2'), vol: { drum: .6 } },

  // 藪：張りつめた低い反復（ニ音のフリギア）
  grove: { bpm: 80,
    lead: ab('.:8 D5:4 F5:4 | Eb5:8 D5:4 .:4 | .:8 A4:4 C5:4 | Bb4:6 A4:2 .:8',
             '.:8 A5:4 G5:4 | F5:8 Eb5:4 .:4 | .:8 D5:4 F5:4 | Eb5:6 D5:2 .:8'),
    harm: ab('A4:2 .:6 Bb4:2 .:6 | A4:2 .:6 Bb4:2 .:6 | A4:2 .:6 G4:2 .:6 | F4:2 .:6 E4:2 .:6',
             'D5:2 .:6 Eb5:2 .:6 | D5:2 .:6 C5:2 .:6 | Bb4:2 .:6 A4:2 .:6 | G4:2 .:6 A4:2 .:6'),
    bass: ab(bars(3, 'D2:2 .:2 D2:2 Eb2:2 D2:2 .:6') + ' | C2:2 .:2 C2:2 Db2:2 C2:2 .:6',
             bars(2, 'Bb1:2 .:2 Bb1:2 C2:2 Bb1:2 .:6') + ' | ' + bars(2, 'A1:2 .:2 A1:2 Bb1:2 A1:2 .:6')),
    drum: bars(4, 'k:4 .:4 .:4 h:4') },

  // 戦闘：速いホ短調
  battle: { bpm: 150,
    lead: ab('E5:2 E5:2 G5:2 E5:2 B5:4 A5:2 G5:2 | E5:2 E5:2 G5:2 E5:2 C6:4 B5:2 A5:2 | D5:2 F#5:2 A5:2 D6:2 C6:2 B5:2 A5:2 F#5:2 | B4:2 D#5:2 F#5:2 B5:2 A5:4 F#5:4',
             'A5:2 A5:2 C6:2 A5:2 E6:4 D6:2 C6:2 | B5:2 B5:2 G5:2 E5:2 B5:4 A5:2 G5:2 | C6:2 B5:2 A5:2 G5:2 E5:4 G5:4 | F#5:4 A5:4 B5:8'),
    harm: ab(chords16('E4 G4 B4 G4', 'C4 E4 G4 E4', 'D4 F#4 A4 F#4', 'B3 D#4 F#4 D#4'), chords16('A3 C4 E4 C4', 'E4 G4 B4 G4', 'C4 E4 G4 E4', 'D4 F#4 B4 F#4')),
    bass: ab(octaves('E2 C2 D2 B1'), octaves('A1 E2 C2 D2')),
    drum: bars(4, 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2'), vol: { harm: .8 } },

  // 口寄せ：都節（ミ ファ ラ シ ド）の旋律と鈴、太鼓
  ritual: { bpm: 66,
    lead: ab('E5:4 F5:4 A5:8 | B5:4 A5:2 F5:2 E5:8 | C5:4 B4:4 A4:8 | B4:4 F4:4 E4:8',
             'A4:4 B4:4 C5:8 | B4:4 A4:2 F4:2 E4:8 | F4:4 A4:4 B4:8 | C5:4 B4:4 E5:8'),
    harm: ab(bars(4, 'E5:1 .:7 B5:1 .:7'), bars(4, 'A4:1 .:7 E5:1 .:7')),
    bass: ab('E2:12 B1:4 | E2:16 | A1:12 B1:4 | E2:16', 'A1:16 | E2:16 | F2:12 E2:4 | E2:16'),
    drum: bars(4, 'k:8 h:4 h:4') },

  // 白洲：おごそかな都節（ラ シ♭ レ ミ ファ）
  court: { bpm: 70,
    lead: ab('A4:4 Bb4:4 D5:8 | E5:4 D5:4 Bb4:4 A4:4 | F4:4 E4:4 D4:8 | E4:6 Bb4:2 A4:8',
             'D5:4 E5:4 F5:8 | E5:4 D5:4 Bb4:8 | A4:4 Bb4:4 D5:4 E5:4 | D5:6 Bb4:2 A4:8'),
    harm: ab('A3:8 E4:8 | D4:8 A3:8 | Bb3:8 F4:8 | E4:8 A3:8', 'D4:8 A3:8 | Bb3:8 F4:8 | A3:8 D4:8 | E4:8 A3:8'),
    bass: ab('A2:16 | D2:16 | Bb1:16 | E2:8 A1:8', 'D2:16 | Bb1:16 | A1:16 | E2:8 A1:8'),
    drum: bars(4, 'k:16'), vol: { harm: .8 } },

  // 昼の山道：陽音階（レ ミ ソ ラ シ）の旅の歌
  road: { bpm: 104,
    lead: ab('D5:2 E5:2 G5:4 E5:2 D5:2 B4:4 | A4:2 B4:2 D5:4 B4:2 A4:2 G4:4 | E4:2 G4:2 A4:4 B4:2 D5:2 E5:4 | D5:6 B4:2 A4:8',
             'E5:2 G5:2 A5:4 G5:2 E5:2 D5:4 | B4:2 D5:2 E5:4 D5:2 B4:2 A4:4 | G4:2 A4:2 B4:4 D5:2 E5:2 G5:4 | E5:6 D5:2 B4:8'),
    harm: ab(chords('G3 D4 G4 D4', 'E3 B3 E4 B3', 'C4 G4 C5 G4', 'D4 A4 D5 A4'), chords('C4 G4 C5 G4', 'G3 D4 G4 D4', 'E3 B3 E4 B3', 'D4 A4 D5 A4')),
    bass: ab('G2:4 .:4 D2:4 .:4 | E2:4 .:4 B1:4 .:4 | C2:4 .:4 G2:4 .:4 | D2:4 .:4 A1:4 .:4', 'C2:4 .:4 G2:4 .:4 | G2:4 .:4 D2:4 .:4 | E2:4 .:4 B1:4 .:4 | D2:4 .:4 A1:4 .:4'),
    drum: bars(4, 'k:4 h:4 s:4 h:4'), vol: { drum: .7 } },

  // 語りの座敷：琴のように爪弾くニ短調の五音
  tale: { bpm: 80,
    lead: ab('A4:4 C5:2 D5:2 C5:4 A4:4 | G4:4 A4:2 C5:2 A4:8 | F4:4 G4:2 A4:2 C5:4 D5:4 | C5:4 A4:4 D4:8',
             'D5:4 F5:2 G5:2 F5:4 D5:4 | C5:4 D5:2 F5:2 C5:8 | Bb4:4 C5:2 D5:2 F5:4 G5:4 | E5:4 C#5:4 A4:8'),
    harm: ab(chords('D4 A4 D5 A4', 'C4 G4 C5 G4', 'Bb3 F4 Bb4 F4', 'A3 E4 A4 E4'), chords('G3 D4 G4 D4', 'F3 C4 F4 C4', 'Bb3 F4 Bb4 F4', 'A3 E4 A4 E4')),
    bass: ab('D2:8 A2:8 | C2:8 G2:8 | Bb1:8 F2:8 | A1:8 A2:8', 'G1:8 D2:8 | F1:8 C2:8 | Bb1:8 F2:8 | A1:8 A2:8'), vol: { lead: .85 } },

  // 中国の夜：羽調（ミ ソ ラ シ レ）の旋律と、箏のような分散和音
  chinese: { bpm: 76,
    lead: ab('E5:6 D5:2 B4:4 A4:4 | G4:4 A4:2 B4:2 E4:8 | A4:4 B4:2 D5:2 E5:4 G5:4 | E5:12 .:4',
             'A5:6 G5:2 E5:4 D5:4 | B4:4 D5:2 E5:2 A4:8 | G4:4 A4:2 B4:2 D5:4 E5:4 | B4:12 .:4'),
    harm: ab(chords('E4 B4 E5 B4', 'A3 E4 A4 E4', 'D4 A4 D5 A4', 'E4 B4 E5 B4'), chords('A3 E4 A4 E4', 'G3 D4 G4 D4', 'E3 B3 E4 B3', 'B3 E4 B4 E4')),
    bass: ab('E2:16 | A1:16 | D2:16 | E2:16', 'A1:16 | G1:16 | E2:16 | B1:16'),
    drum: bars(4, 'h:4 .:4 h:2 h:2 .:4'), vol: { drum: .6 } },

  // 南方の夜祭り：太鼓の刻みとイ短調の五音
  festival: { bpm: 116,
    lead: ab('A4:2 C5:2 D5:2 E5:2 G5:4 E5:4 | D5:2 E5:2 D5:2 C5:2 A4:8 | C5:2 D5:2 E5:2 G5:2 A5:4 G5:4 | E5:2 D5:2 C5:2 D5:2 A4:8',
             'E5:2 G5:2 A5:2 G5:2 E5:4 D5:4 | C5:2 D5:2 E5:2 G5:2 E5:8 | A5:2 G5:2 E5:2 D5:2 C5:4 D5:4 | E5:2 G5:2 E5:2 D5:2 A4:8'),
    harm: ab(offbeat('A4 G4 C5 E4'), offbeat('C5 D5 A4 G4')),
    bass: ab(bars(4, 'A2:4 A2:2 E2:2 A2:4 G2:4'), bars(2, 'C2:4 C2:2 G1:2 C2:4 D2:4') + ' | ' + bars(2, 'A1:4 A1:2 E2:2 A1:4 G1:4')),
    drum: bars(4, 'k:2 h:2 k:2 s:2 k:2 h:2 s:2 s:2'), vol: { drum: .8 } },

  // 琵琶の調べ：哀しいホ短調の五音を爪弾く（打楽器なし）
  biwa: { bpm: 72,
    lead: ab('B4:2 B4:1 A4:1 G4:4 E4:4 G4:2 A4:2 | B4:2 D5:2 E5:4 D5:2 B4:2 A4:4 | G4:2 G4:1 A4:1 B4:4 A4:2 G4:2 E4:4 | D4:2 E4:2 G4:4 E4:8',
             'E5:2 E5:1 D5:1 B4:4 A4:4 B4:2 D5:2 | E5:2 G5:2 A5:4 G5:2 E5:2 D5:4 | B4:2 B4:1 A4:1 G4:4 A4:2 B4:2 D5:4 | B4:2 A4:2 G4:4 E4:8'),
    harm: ab(chords('E3 B3 E4 B3', 'G3 D4 G4 D4', 'A3 E4 A4 E4', 'E3 B3 E4 B3'), chords('A3 E4 A4 E4', 'C4 G4 C5 G4', 'G3 D4 G4 D4', 'E3 B3 E4 B3')),
    bass: ab('E2:16 | G2:16 | A2:16 | E2:16', 'A2:16 | C2:16 | G2:16 | E2:16'), vol: { bass: .7 } },

  // 天変地異（大水・城の陥没）：速い半音の揺れ
  disaster: { bpm: 132,
    lead: ab('E5:2 F5:2 E5:2 D5:2 E5:4 B4:4 | E5:2 F5:2 G5:2 F5:2 E5:8 | C5:2 D5:2 E5:2 F5:2 G5:4 F5:4 | E5:4 D5:4 B4:8',
             'B5:2 C6:2 B5:2 A5:2 B5:4 F5:4 | E5:2 F5:2 E5:2 D5:2 C5:8 | A4:2 B4:2 C5:2 D5:2 E5:4 F5:4 | E5:4 B4:4 E4:8'),
    harm: ab(chords16('E4 F4 B4 F4', 'E4 G4 B4 G4', 'C4 E4 G4 E4', 'B3 D4 F4 D4'), chords16('B3 F4 B4 F4', 'C4 E4 A4 E4', 'A3 C4 F4 C4', 'E4 G4 B4 G4')),
    bass: ab(bars(4, 'E2:2 E2:2 E3:2 E2:2 F2:2 E2:2 E3:2 E2:2'), bars(4, 'B1:2 B1:2 B2:2 B1:2 C2:2 B1:2 B2:2 B1:2')),
    drum: bars(4, 'k:2 k:2 s:2 h:2 k:2 k:2 s:2 s:2'), vol: { harm: .8 } },

  // 宮廷：おごそかなハ音の五音（ド レ ファ ソ シ♭）
  palace: { bpm: 84,
    lead: ab('C5:4 D5:4 F5:6 D5:2 | G5:4 F5:2 D5:2 C5:8 | Bb4:4 C5:4 D5:4 F5:4 | D5:6 C5:2 C5:8',
             'F5:4 G5:4 Bb5:6 G5:2 | F5:4 D5:2 C5:2 Bb4:8 | C5:4 D5:4 F5:4 G5:4 | F5:6 D5:2 C5:8'),
    harm: ab('C4:8 G4:8 | F3:8 C4:8 | Bb3:8 F4:8 | G3:8 C4:8', 'F3:8 C4:8 | Bb3:8 F4:8 | C4:8 G4:8 | F3:8 C4:8'),
    bass: ab('C2:8 C2:8 | F1:8 F2:8 | Bb1:8 Bb1:8 | G1:8 C2:8', 'F1:8 F2:8 | Bb1:8 Bb1:8 | C2:8 C2:8 | C2:8 C2:8'),
    drum: bars(4, 'k:8 s:4 h:4'), vol: { drum: .7 } },

  // 結び：ゆっくり沈んでいく
  ending: { bpm: 70,
    lead: ab('E5:4 D5:4 C5:4 B4:4 | A4:4 B4:4 C5:8 | D5:4 C5:4 B4:4 G#4:4 | A4:16',
             'F5:4 E5:4 D5:4 C5:4 | C5:4 B4:4 A4:8 | A4:4 C5:4 D5:4 F5:4 | E5:16'),
    harm: ab(chords('A3 C4 E4 C4', 'F3 A3 C4 A3', 'E3 G#3 B3 G#3', 'A3 C4 E4 C4'), chords('D3 F3 A3 F3', 'A3 C4 E4 C4', 'F3 A3 C4 A3', 'E3 G#3 B3 G#3')),
    bass: ab('A2:8 E2:8 | F2:8 C3:8 | E2:8 B1:8 | A1:16', 'D2:8 A2:8 | A1:8 E2:8 | F2:8 C2:8 | E2:16') },
});

// =====================================================================
//  作品のテーマ曲（8 小節）。題名で鳴らす。作品ごとの変形はかけない（fixed）
// =====================================================================
Object.assign(SONGS, {
  // 妙な話：大正の夜のもの哀しさ（ニ短調）
  myouTheme: { bpm: 88, fixed: true,
    lead: 'A4:4 D5:4 F5:3 E5:1 D5:4 | C5:4 A4:4 Bb4:8 | G4:4 Bb4:4 D5:3 C5:1 Bb4:4 | A4:12 .:4 | F5:4 E5:2 D5:2 C5:4 A4:4 | Bb4:4 D5:4 G5:8 | F5:4 E5:4 D5:4 C#5:4 | D5:12 .:4',
    harm: chords('D4 F4 A4 F4', 'F3 A3 C4 A3', 'G3 Bb3 D4 Bb3', 'A3 C#4 E4 C#4', 'D4 F4 A4 F4', 'G3 Bb3 D4 Bb3', 'A3 C#4 E4 C#4', 'D4 F4 A4 F4'),
    bass: 'D2:8 A2:8 | F2:8 C2:8 | G2:8 D2:8 | A1:8 A2:8 | D2:8 A2:8 | G2:8 D2:8 | A1:8 E2:8 | D2:16',
    drum: bars(8, 'k:4 h:4 .:4 h:4') },
  // 藪の中：ミのフリギア、まばらな太鼓
  yabuTheme: { bpm: 78, fixed: true,
    lead: 'E5:4 F5:4 E5:8 | .:4 B4:4 C5:4 B4:4 | A4:4 B4:2 C5:2 B4:4 F4:4 | E4:12 .:4 | G5:4 F5:4 E5:4 C5:4 | D5:4 C5:4 B4:8 | C5:4 B4:4 A4:4 F4:4 | E4:16',
    harm: bars(8, 'E4:1 .:7 B4:1 .:7'),
    bass: 'E2:16 | E2:16 | F2:16 | E2:16 | C2:16 | D2:16 | F2:16 | E2:16',
    drum: bars(8, 'k:8 .:4 k:4') },
  // 首の飛ぶ女：羽調（ラ ド レ ミ ソ）の、どこかとぼけた怪しさ
  kubiTheme: { bpm: 96, fixed: true,
    lead: 'A4:2 C5:2 E5:2 D5:2 C5:4 A4:4 | G4:2 A4:2 C5:4 A4:8 | E5:2 G5:2 A5:2 G5:2 E5:4 D5:4 | C5:4 D5:4 E5:8 | A5:2 G5:2 E5:2 D5:2 C5:4 D5:4 | E5:2 D5:2 C5:2 A4:2 G4:8 | A4:2 C5:2 D5:2 E5:2 G5:4 E5:4 | A4:12 .:4',
    harm: chords('A3 E4 A4 E4', 'G3 D4 G4 D4', 'C4 G4 C5 G4', 'A3 E4 A4 E4', 'F3 C4 F4 C4', 'G3 D4 G4 D4', 'D4 A4 D5 A4', 'A3 E4 A4 E4'),
    bass: 'A1:16 | G1:16 | C2:16 | A1:16 | F1:16 | G1:16 | D2:16 | A1:16',
    drum: bars(8, 'h:4 .:2 h:2 .:4 h:4') },
  // 琵琶鬼：琵琶のトレモロ（同じ音を刻む）
  biwaTheme: { bpm: 80, fixed: true,
    lead: 'E5:1 E5:1 E5:1 E5:1 D5:4 B4:4 A4:4 | B4:1 B4:1 B4:1 B4:1 G4:4 E4:8 | G4:2 A4:2 B4:4 D5:4 E5:4 | D5:1 D5:1 D5:1 D5:1 B4:12 | A4:2 B4:2 D5:4 E5:4 G5:4 | E5:1 E5:1 E5:1 E5:1 D5:4 B4:8 | A4:4 G4:4 E4:4 D4:4 | E4:16',
    harm: chords('E3 B3 E4 B3', 'E3 B3 E4 B3', 'G3 D4 G4 D4', 'B3 D4 F#4 D4', 'A3 E4 A4 E4', 'E3 B3 E4 B3', 'D4 A4 D5 A4', 'E3 B3 E4 B3'),
    bass: 'E2:16 | E2:16 | G2:16 | B1:16 | A1:16 | E2:16 | D2:16 | E2:16' },
  // 兎怪：夜道を駆ける馬（3・3・2 の跳ねるリズム）
  usagiTheme: { bpm: 132, fixed: true,
    lead: 'E5:3 E5:3 D5:2 C5:4 A4:4 | B4:3 C5:3 D5:2 E5:8 | A5:3 G5:3 E5:2 D5:4 C5:4 | B4:3 A4:3 G#4:2 A4:8 | C5:3 D5:3 E5:2 G5:4 E5:4 | D5:3 E5:3 C5:2 A4:8 | F5:3 E5:3 D5:2 C5:4 B4:4 | A4:12 .:4',
    harm: offbeat('C5 B4 A4 G#4 C5 B4 A4 C5'),
    bass: ['A', 'E', 'F', 'E', 'A', 'G', 'F', 'A'].map(n => `${n}2:3 ${n}2:3 ${n}3:2 ${n}2:3 ${n}2:3 ${n}3:2`).join(' | '),
    drum: bars(8, 'k:3 h:3 s:2 k:3 h:3 s:2'), vol: { drum: .7 } },
  // 宿命：下りつづけるベース（ハ短調）
  shukumeiTheme: { bpm: 70, fixed: true,
    lead: 'G5:8 Eb5:4 D5:4 | C5:8 G4:8 | Ab4:4 C5:4 Eb5:4 D5:4 | B4:12 .:4 | Eb5:8 D5:4 C5:4 | Bb4:8 Ab4:8 | G4:4 Ab4:4 B4:4 D5:4 | C5:16',
    harm: chords('C4 Eb4 G4 Eb4', 'B3 D4 G4 D4', 'Bb3 Eb4 G4 Eb4', 'G3 B3 D4 B3', 'Ab3 C4 Eb4 C4', 'G3 C4 Eb4 C4', 'F3 Ab3 D4 Ab3', 'C4 Eb4 G4 Eb4'),
    bass: 'C2:16 | B1:16 | Bb1:16 | G1:16 | Ab1:16 | G1:16 | F1:8 G1:8 | C2:16',
    drum: bars(8, 'k:16') },
  // 亀の眼：水の流れのような五音（ニ長調）
  kameTheme: { bpm: 92, fixed: true,
    lead: 'D5:2 E5:2 F#5:4 A5:4 F#5:4 | E5:2 D5:2 B4:4 A4:8 | B4:2 D5:2 E5:4 F#5:2 E5:2 D5:4 | E5:12 .:4 | A5:2 B5:2 A5:4 F#5:4 E5:4 | D5:2 E5:2 F#5:4 B4:8 | A4:2 B4:2 D5:4 E5:4 F#5:4 | D5:12 .:4',
    harm: chords16('D4 F#4 A4 F#4', 'B3 D4 F#4 D4', 'G3 B3 D4 B3', 'A3 E4 A4 E4', 'D4 F#4 A4 F#4', 'G3 B3 D4 B3', 'E4 G4 B4 G4', 'D4 F#4 A4 F#4'),
    bass: 'D2:8 A2:8 | B1:8 F#2:8 | G1:8 D2:8 | A1:8 E2:8 | D2:8 A2:8 | G1:8 D2:8 | E2:8 A1:8 | D2:16',
    drum: bars(8, 'h:2 .:2 h:2 h:2 .:2 h:2 .:2 h:2'), vol: { harm: .7, drum: .6 } },
  // 眉間尺：仇討ちの悲壮な行進（ト短調）
  mikenjakuTheme: { bpm: 104, fixed: true,
    lead: 'G4:4 Bb4:2 D5:2 G5:4 F5:2 Eb5:2 | D5:4 C5:2 Bb4:2 A4:8 | Bb4:4 C5:2 D5:2 Eb5:4 G5:4 | F#5:12 .:4 | G5:4 F5:2 Eb5:2 D5:4 C5:4 | Bb4:4 A4:2 G4:2 D5:8 | Eb5:4 D5:2 C5:2 Bb4:4 A4:4 | G4:12 .:4',
    harm: chords('G3 Bb3 D4 Bb3', 'D4 F#4 A4 F#4', 'Eb4 G4 Bb4 G4', 'D4 F#4 A4 F#4', 'C4 Eb4 G4 Eb4', 'G3 Bb3 D4 Bb3', 'C4 Eb4 G4 Eb4', 'G3 Bb3 D4 Bb3'),
    bass: 'G1:8 D2:8 | D2:8 A1:8 | Eb2:8 Bb1:8 | D2:8 D2:8 | C2:8 G1:8 | G1:8 D2:8 | C2:8 D2:8 | G1:16',
    drum: bars(8, 'k:4 s:2 s:2 k:4 s:4'), vol: { drum: .8 } },
  // 蜘蛛の糸：極楽の朝の、澄んだ鐘のような五音（ニ長調）
  kumoTheme: { bpm: 66, fixed: true,
    lead: 'A4:4 B4:4 D5:8 | E5:4 D5:4 B4:8 | A4:4 B4:2 A4:2 F#4:4 E4:4 | D4:12 .:4 | F#5:4 E5:4 D5:8 | B4:4 D5:4 E5:8 | D5:4 B4:2 A4:2 F#4:4 E4:4 | D4:12 .:4',
    harm: chords('D4 F#4 A4 F#4', 'G3 B3 D4 B3', 'D4 F#4 A4 F#4', 'A3 D4 F#4 D4', 'B3 D4 F#4 D4', 'G3 B3 E4 B3', 'A3 D4 E4 D4', 'D4 F#4 A4 F#4'),
    bass: 'D2:16 | G1:16 | D2:16 | A1:16 | B1:16 | G1:16 | A1:16 | D2:16', vol: { harm: .6 } },
  // 宋家の母：水に去った母を想う、ゆっくりした嘆き（ホ短調）
  soukeTheme: { bpm: 72, fixed: true,
    lead: 'B4:4 E5:4 D5:4 B4:4 | A4:4 G4:4 E4:8 | G4:4 A4:4 B4:4 D5:4 | B4:12 .:4 | E5:4 G5:4 F#5:4 E5:4 | D5:4 B4:4 A4:8 | G4:4 F#4:4 E4:4 D4:4 | E4:12 .:4',
    harm: chords('E3 B3 E4 B3', 'C4 E4 G4 E4', 'G3 B3 D4 B3', 'B3 D#4 F#4 D#4', 'C4 E4 G4 E4', 'G3 B3 D4 B3', 'A3 C4 E4 C4', 'E3 B3 E4 B3'),
    bass: 'E2:16 | C2:16 | G1:16 | B1:16 | C2:16 | G1:16 | A1:8 B1:8 | E2:16', vol: { harm: .7 } },
  // 青牛：大樹を打つ斧と太鼓（ニのドリア）
  seigyuTheme: { bpm: 96, fixed: true,
    lead: 'D5:4 .:2 D5:2 F5:4 E5:4 | D5:4 C5:4 A4:8 | C5:4 .:2 C5:2 E5:4 D5:4 | C5:4 A4:4 B4:8 | D5:2 E5:2 F5:4 G5:4 A5:4 | G5:4 F5:4 E5:8 | D5:4 C5:4 A4:4 B4:4 | D5:12 .:4',
    harm: offbeat('A4 A4 G4 G4 A4 A4 G4 A4'),
    bass: 'D2:4 D2:4 D2:4 D2:4 | D2:4 D2:4 A1:8 | C2:4 C2:4 C2:4 C2:4 | C2:4 C2:4 G1:8 | D2:4 D2:4 D2:4 D2:4 | C2:4 C2:4 C2:8 | G1:4 G1:4 A1:4 A1:4 | D2:16',
    drum: bars(8, 'k:4 k:2 s:2 k:4 s:4'), vol: { drum: .9 } },
  // 青い女：雨の夕暮れの坡、追って来る足音（イ短調）
  aoiTheme: { bpm: 84, fixed: true,
    lead: 'E5:6 D5:2 C5:4 A4:4 | B4:4 C5:4 A4:8 | E5:6 F5:2 E5:4 C5:4 | D5:12 .:4 | A5:6 G5:2 E5:4 C5:4 | D5:4 E5:4 B4:8 | C5:4 B4:4 A4:4 G#4:4 | A4:12 .:4',
    harm: chords16('A3 C4 E4 C4', 'F3 A3 C4 A3', 'A3 C4 E4 C4', 'G3 B3 D4 B3', 'F3 A3 C4 A3', 'G3 B3 E4 B3', 'D4 F4 A4 F4', 'A3 C4 E4 C4'),
    bass: 'A1:16 | F1:16 | A1:16 | G1:16 | F1:16 | E1:16 | D2:8 E2:8 | A1:16',
    drum: bars(8, 'h:2 h:2 .:2 h:2 h:2 h:2 .:2 h:2'), vol: { harm: .6, drum: .5 } },
  // 祭蛇記：少女が大蛇に立ち向かう勇ましい行進（ト短調から変ロ長調へ）
  saijaTheme: { bpm: 120, fixed: true,
    lead: 'G4:2 Bb4:2 D5:4 G5:4 F5:4 | Eb5:4 D5:4 C5:8 | Bb4:2 C5:2 D5:4 F5:4 Eb5:4 | D5:12 .:4 | Bb4:2 D5:2 F5:4 Bb5:4 A5:4 | G5:4 F5:4 D5:8 | Eb5:4 F5:4 D5:4 A4:4 | G4:12 .:4',
    harm: chords('G3 Bb3 D4 Bb3', 'Eb4 G4 Bb4 G4', 'Bb3 D4 F4 D4', 'D4 F#4 A4 F#4', 'Bb3 D4 F4 D4', 'Eb4 G4 Bb4 G4', 'C4 Eb4 G4 Eb4', 'G3 Bb3 D4 Bb3'),
    bass: octaves('G1 Eb2 Bb1 D2 Bb1 Eb2 C2 G1'),
    drum: bars(8, 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2'), vol: { drum: .8, bass: .8 } },
  // 鹿の足：空き家の夜、窓の外の気配（ロ短調、まばら）
  shikaTheme: { bpm: 76, fixed: true,
    lead: 'F#5:4 .:4 E5:4 D5:4 | B4:12 .:4 | D5:4 .:4 C#5:4 B4:4 | A#4:12 .:4 | B4:4 D5:4 F#5:4 E5:4 | D5:4 C#5:4 B4:8 | G4:4 A#4:4 C#5:4 E5:4 | F#5:4 C#5:4 B4:8',
    harm: bars(8, 'B3:1 .:7 F#4:1 .:7'),
    bass: 'B1:16 | G1:16 | E2:16 | F#1:16 | B1:16 | G1:16 | E2:16 | F#1:8 B1:8',
    drum: bars(8, 'k:8 .:6 h:2') },
  // 玃猿：蜀の山中の猿に似た妖物（ホ短調の不穏な五音）
  kakuenTheme: { bpm: 88, fixed: true, duty: .25,
    lead: 'E5:4 .:2 G5:2 A5:4 G5:4 | E5:4 D5:4 B4:8 | A4:2 B4:2 D5:4 E5:4 G5:4 | F#5:12 .:4 | B5:4 A5:2 G5:2 E5:4 D5:4 | E5:4 G5:4 A5:8 | G5:4 E5:4 D5:4 B4:4 | E5:12 .:4',
    harm: bars(8, 'E4:1 .:3 B4:1 .:3 E4:1 .:3 C5:1 .:3'),
    bass: ['E2 B1', 'C2 G1', 'A1 E2', 'B1 F#1', 'E2 B1', 'C2 G1', 'D2 A1', 'E2 B1'].map(p => { const [a, b] = p.split(' '); return `${a}:4 .:4 ${a}:2 .:2 ${b}:4`; }).join(' | '),
    drum: bars(8, 'k:2 .:2 k:2 .:6 s:2 .:2'), vol: { harm: .7, drum: .6 } },
  // 羽衣：田に降りた鳥の女たち。澄んだニ長調の五音、ふわりと舞う
  hagoromoTheme: { bpm: 84, fixed: true, duty: .125,
    lead: 'A5:4 F#5:2 E5:2 D5:4 B4:4 | D5:4 E5:4 A4:8 | B4:4 D5:4 E5:4 F#5:4 | E5:12 .:4 | A5:4 B5:2 A5:2 F#5:4 E5:4 | D5:4 E5:4 B4:8 | A4:4 B4:4 D5:4 E5:4 | D5:12 .:4',
    harm: chords16('D4 F#4 A4 F#4', 'G3 B3 D4 B3', 'B3 D4 F#4 D4', 'A3 C#4 E4 C#4', 'D4 F#4 A4 F#4', 'G3 B3 D4 B3', 'E4 G4 B4 G4', 'D4 F#4 A4 F#4'),
    bass: 'D2:16 | G1:16 | B1:16 | A1:16 | D2:16 | G1:16 | E2:8 A1:8 | D2:16',
    drum: bars(8, 'h:4 .:4 h:4 .:4'), vol: { harm: .5, drum: .4 } },
  // 狸老爺：父に化けた古狸と、取り返しのつかない過ち（ハ短調）
  tanukiTheme: { bpm: 88, fixed: true, duty: .25,
    lead: 'C5:4 Eb5:4 D5:2 C5:2 G4:4 | Ab4:4 G4:4 F4:8 | Eb4:4 F4:4 G4:4 C5:4 | B4:12 .:4 | C5:4 D5:4 Eb5:4 G5:4 | F5:4 Eb5:4 D5:8 | Ab5:4 G5:4 F5:2 Eb5:2 D5:4 | C5:12 .:4',
    harm: chords('C4 Eb4 G4 Eb4', 'F3 Ab3 C4 Ab3', 'Ab3 C4 Eb4 C4', 'G3 B3 D4 B3', 'C4 Eb4 G4 Eb4', 'Ab3 C4 F4 C4', 'G3 B3 D4 F4', 'C4 Eb4 G4 Eb4'),
    bass: octaves('C2 F1 Ab1 G1 C2 Ab1 G1 C2'),
    drum: bars(8, 'k:4 .:4 s:4 .:2 h:2'), vol: { drum: .6 } },
  // 虎の難産：取り上げ婆と虎の母子。あたたかいヘ長調
  toraTheme: { bpm: 96, fixed: true,
    lead: 'F4:2 A4:2 C5:4 A4:4 F4:4 | G4:4 Bb4:4 A4:8 | C5:2 D5:2 F5:4 E5:4 C5:4 | D5:12 .:4 | F5:4 E5:2 D5:2 C5:4 A4:4 | Bb4:4 D5:4 C5:8 | A4:4 Bb4:4 G4:4 E4:4 | F4:12 .:4',
    harm: chords('F3 A3 C4 A3', 'C4 E4 G4 E4', 'F3 A3 C4 A3', 'Bb3 D4 F4 D4', 'F3 A3 C4 A3', 'Bb3 D4 F4 D4', 'C4 E4 G4 Bb4', 'F3 A3 C4 A3'),
    bass: 'F2:8 C2:8 | C2:8 G1:8 | F2:8 C2:8 | Bb1:8 F1:8 | F2:8 C2:8 | Bb1:8 D2:8 | C2:8 C2:8 | F1:16',
    drum: bars(8, 'k:4 h:4 k:2 k:2 h:4'), vol: { drum: .5 } },
  // 寿光侯：鬼を祈り伏せる法。ニ音のフリギアと木魚・銅鑼
  jukokoTheme: { bpm: 100, fixed: true, duty: .25,
    lead: 'D5:4 Eb5:4 D5:4 A4:4 | Bb4:4 A4:4 G4:8 | A4:4 Bb4:4 D5:4 F5:4 | Eb5:12 .:4 | G5:4 F5:4 Eb5:4 D5:4 | C5:4 Bb4:4 A4:8 | Bb4:2 A4:2 G4:4 A4:4 Eb4:4 | D4:12 .:4',
    harm: bars(8, 'D4:1 .:3 A4:1 .:3 D4:1 .:3 Eb4:1 .:3'),
    bass: 'D2:16 | G1:16 | F1:16 | Eb2:16 | C2:16 | F1:16 | G1:8 Eb2:8 | D2:16',
    drum: bars(4, 'g:16 | w:4 w:4 w:4 w:4'), vol: { harm: .7 } },
  // 天使：日中に火が起る。家へ急ぐ車（速いイ短調）
  tenshiTheme: { bpm: 126, fixed: true, duty: .25,
    lead: 'A4:2 C5:2 E5:4 D5:2 C5:2 B4:4 | C5:2 D5:2 E5:4 A5:8 | G5:2 F5:2 E5:4 D5:4 C5:4 | B4:12 .:4 | F5:2 E5:2 D5:4 F5:4 A5:4 | G#5:4 E5:4 B4:8 | C5:4 D5:4 E5:2 D5:2 B4:4 | A4:12 .:4',
    harm: offbeat('C5 E5 C5 B4 A4 G#4 E5 C5'),
    bass: octaves('A1 A1 F1 E1 D2 E1 F1 A1'),
    drum: bars(8, 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2'), vol: { drum: .7 } },
  // 蛇蠱：瓶の底にわだかまるもの（ホ短調、半音でにじる）
  jakoTheme: { bpm: 66, fixed: true, duty: .5,
    lead: 'E5:6 F5:2 E5:8 | .:4 B4:4 C5:8 | G5:6 F#5:2 F5:8 | E5:12 .:4 | B5:4 Bb5:4 A5:8 | G5:4 F5:4 E5:8 | F5:4 E5:4 D#5:4 C5:4 | B4:12 .:4',
    harm: ['E4', 'F4', 'E4', 'C4', 'Bb3', 'A3', 'C4', 'B3'].map(n => `${n}:2 .:6 ${n}:2 .:6`).join(' | '),
    bass: 'E2:16 | F2:16 | E2:16 | C2:16 | Bb1:16 | A1:16 | C2:16 | B1:16',
    drum: bars(8, 'k:2 k:2 .:12'), vol: { harm: .6 } },
  // 螻蛄：獄屋の小さな虫と、生きのびる望み（ト短調から変ロ長調へ）
  keraTheme: { bpm: 80, fixed: true, pluck: true, duty: .25,
    lead: 'G4:4 Bb4:4 A4:4 G4:4 | D5:8 C5:4 Bb4:4 | A4:4 G4:4 F#4:4 A4:4 | G4:12 .:4 | Bb4:4 C5:4 D5:4 F5:4 | Eb5:4 D5:4 C5:8 | D5:4 Eb5:4 F5:4 A5:4 | Bb5:12 .:4',
    harm: chords('G3 Bb3 D4 Bb3', 'Eb3 G3 Bb3 G3', 'D4 F#4 A4 F#4', 'G3 Bb3 D4 Bb3', 'Bb3 D4 F4 D4', 'C4 Eb4 G4 Eb4', 'F3 A3 C4 F4', 'Bb3 D4 F4 D4'),
    bass: 'G1:16 | Eb2:16 | D2:16 | G1:16 | Bb1:16 | C2:16 | F1:16 | Bb1:16',
    drum: bars(8, 'k:4 .:4 h:4 .:4'), vol: { drum: .4 } },
  // 父母の霊：鬼に縛られて来た父と母の叱責（ロ短調、いかめしく）
  fuboTheme: { bpm: 92, fixed: true, duty: .25,
    lead: 'B4:4 D5:4 F#5:8 | E5:4 D5:2 C#5:2 B4:8 | G5:4 F#5:4 E5:4 D5:4 | C#5:12 .:4 | D5:2 E5:2 F#5:4 B5:4 A5:4 | G5:4 F#5:4 E5:8 | F#5:4 E5:4 D5:4 C#5:4 | B4:12 .:4',
    harm: chords('B3 D4 F#4 D4', 'E4 G4 B4 G4', 'G3 B3 E4 B3', 'F#3 A#3 C#4 A#3', 'B3 D4 F#4 D4', 'E4 G4 B4 G4', 'F#3 A#3 C#4 E4', 'B3 D4 F#4 D4'),
    bass: octaves('B1 E2 G1 F#1 B1 E2 F#1 B1'),
    drum: bars(8, 'k:4 s:4 k:4 s:2 s:2'), vol: { drum: .55 } },
  // 無鬼論：才弁の客と阮瞻の論争。爪弾くイ短調、属音で終わる
  mukironTheme: { bpm: 108, fixed: true, pluck: true, duty: .25,
    lead: 'A4:2 B4:2 C5:2 E5:2 D5:4 C5:4 | B4:2 C5:2 D5:4 E5:8 | F5:2 E5:2 D5:2 C5:2 B4:4 G#4:4 | A4:12 .:4 | E5:2 F5:2 G5:4 F5:2 E5:2 D5:4 | C5:2 D5:2 E5:4 A4:8 | F5:4 E5:4 D5:4 B4:4 | E5:8 .:8',
    harm: chords('A3 C4 E4 C4', 'G3 B3 D4 B3', 'D4 F4 A4 F4', 'E3 G#3 B3 E4', 'C4 E4 G4 E4', 'A3 C4 E4 C4', 'D4 F4 A4 F4', 'E3 G#3 B3 D4'),
    bass: ['A1 E2', 'G1 D2', 'D2 A1', 'E1 B1', 'C2 G1', 'A1 E2', 'D2 A1', 'E1 B1'].map(p => { const [a, b] = p.split(' '); return `${a}:4 ${b}:4 ${a}:4 ${b}:4`; }).join(' | '),
    drum: bars(8, 'h:2 .:2 h:2 .:2 s:2 .:2 h:2 .:2'), vol: { drum: .5 } },
  // 盤瓠：五色の犬と王の少女、南山の伝説（ニ短調の五音、雄大に）
  bankoTheme: { bpm: 104, fixed: true, duty: .25,
    lead: 'D5:4 F5:4 G5:4 A5:4 | C6:4 A5:4 G5:8 | F5:4 G5:4 A5:4 D5:4 | C5:12 .:4 | D5:4 C5:4 A4:4 C5:4 | D5:4 F5:4 G5:8 | A5:4 G5:4 F5:4 C5:4 | D5:12 .:4',
    harm: chords('D4 F4 A4 F4', 'C4 E4 G4 E4', 'Bb3 D4 F4 D4', 'C4 E4 G4 E4', 'D4 F4 A4 F4', 'G3 Bb3 D4 Bb3', 'A3 C4 E4 C4', 'D4 F4 A4 F4'),
    bass: octaves('D2 C2 Bb1 C2 D2 G1 A1 D2'),
    drum: bars(8, 'k:4 .:2 k:2 s:4 .:4'), vol: { drum: .6 } },
  // 金龍池：卵から生まれた児が蛇になって城の縄張りを這う（ホ短調の五音、流れるように）
  kinryuTheme: { bpm: 92, fixed: true, pluck: true, duty: .125,
    lead: 'E5:2 G5:2 A5:4 B5:4 A5:4 | G5:4 E5:4 D5:8 | E5:2 D5:2 B4:4 A4:4 B4:4 | E5:12 .:4 | G5:2 A5:2 B5:4 D6:4 B5:4 | A5:4 G5:4 E5:8 | D5:4 E5:4 G5:4 A5:4 | E5:12 .:4',
    harm: chords16('E4 G4 B4 G4', 'C4 E4 G4 E4', 'G3 B3 D4 B3', 'E4 G4 B4 G4', 'C4 E4 G4 E4', 'A3 C4 E4 C4', 'D4 G4 B4 G4', 'E4 G4 B4 G4'),
    bass: 'E2:16 | C2:16 | G1:16 | E2:16 | C2:16 | A1:16 | D2:16 | E2:16',
    drum: bars(8, 'h:4 h:4 k:4 h:4'), vol: { harm: .5, drum: .4 } },
  // 発塚異事：あばかれた古い塚の暗がり（嬰ハ短調、低く鐘が鳴る）
  hatsuchoTheme: { bpm: 70, fixed: true, duty: .5,
    lead: 'C#5:8 E5:4 D#5:4 | C#5:12 .:4 | G#4:8 A4:4 G#4:4 | F#4:12 .:4 | E5:8 F#5:4 E5:4 | D5:12 .:4 | C#5:4 D5:4 C#5:4 B#4:4 | C#5:12 .:4',
    harm: bars(8, 'C#4:1 .:7 G#4:1 .:7'),
    bass: 'C#2:16 | A1:16 | F#1:16 | G#1:16 | A1:16 | D2:16 | G#1:16 | C#2:16',
    drum: bars(4, 'g:16 | k:8 .:8'), vol: { lead: .85 } },
  // 徐光の瓜：杖から蔓が伸びて瓜が実る術者（軽く弾むト長調）
  jokouTheme: { bpm: 116, fixed: true, pluck: true, duty: .25,
    lead: 'G4:2 B4:2 D5:2 G5:2 E5:2 D5:2 B4:4 | C5:2 E5:2 D5:4 G4:8 | A4:2 B4:2 C5:2 E5:2 D5:4 B4:4 | A4:12 .:4 | G5:2 F#5:2 E5:2 D5:2 E5:4 G5:4 | D5:2 B4:2 G4:4 B4:8 | C5:4 A4:4 D5:4 F#4:4 | G4:12 .:4',
    harm: offbeat('B4 C5 A4 F#4 B4 G4 A4 B4'),
    bass: 'G1:4 D2:4 G1:4 D2:4 | C2:4 G1:4 G1:4 D2:4 | A1:4 E2:4 A1:4 E2:4 | D2:4 A1:4 D2:4 F#1:4 | E2:4 B1:4 E2:4 B1:4 | G1:4 D2:4 G1:4 D2:4 | C2:4 A1:4 D2:4 D2:4 | G1:4 D2:4 G1:8',
    drum: bars(8, 'k:2 h:2 w:2 h:2 k:2 h:2 w:2 h:2'), vol: { drum: .55 } },
  // 耳無芳一：琵琶の撥と都節（ミ ファ ラ シ ド）の哀しい語り
  hoichiTheme: { bpm: 66, fixed: true,
    lead: 'E5:1 E5:1 E5:2 F5:4 E5:4 C5:4 | B4:4 A4:4 B4:8 | E5:4 F5:4 A5:4 F5:2 E5:2 | F5:12 .:4 | A5:4 B5:2 A5:2 F5:4 E5:4 | C5:4 B4:4 A4:8 | B4:4 C5:4 B4:2 A4:2 F4:4 | E4:12 .:4',
    harm: bars(8, 'E4:1 .:7 B4:1 .:7'),
    bass: 'E2:16 | A1:16 | E2:16 | F2:16 | D2:16 | A1:16 | B1:16 | E2:16', vol: { harm: .8 } },
  // 雪女：吹雪の夜の、冷たく澄んだ高い音（ロ短調）
  yukiTheme: { bpm: 60, fixed: true,
    lead: 'F#5:6 E5:2 D5:4 B4:4 | C#5:6 D5:2 F#4:8 | B4:6 C#5:2 D5:4 F#5:4 | E5:12 .:4 | B5:6 A5:2 F#5:4 D5:4 | E5:4 F#5:4 C#5:8 | D5:4 C#5:4 B4:4 A#4:4 | B4:12 .:4',
    harm: chords16('B4 D5 F#5 D5', 'G4 B4 D5 B4', 'B4 D5 F#5 D5', 'A4 C#5 E5 C#5', 'G4 B4 D5 B4', 'A4 C#5 E5 C#5', 'E4 G4 B4 G4', 'B4 D5 F#5 D5'),
    bass: 'B1:16 | G1:16 | B1:16 | A1:16 | G1:16 | F#1:16 | E2:8 F#1:8 | B1:16', vol: { harm: .45 } },
  // 黒猫：酒と罪の、ゆがんだ三拍子風のワルツ（ハ短調）
  kuronekoTheme: { bpm: 100, fixed: true,
    lead: 'G4:4 C5:2 Eb5:2 G5:4 F5:2 Eb5:2 | D5:4 B4:4 G4:8 | Ab4:4 C5:2 Eb5:2 Ab5:4 G5:2 F5:2 | G5:12 .:4 | C6:4 B5:2 Ab5:2 G5:4 F5:4 | Eb5:4 D5:4 C5:4 B4:4 | Ab4:4 G4:4 F#4:4 G4:4 | C5:12 .:4',
    harm: offbeat('Eb4 D4 Eb4 D4 Eb4 Eb4 C4 Eb4'),
    bass: 'C2:4 G2:4 G2:4 G2:4 | G1:4 D2:4 D2:4 D2:4 | Ab1:4 Eb2:4 Eb2:4 Eb2:4 | G1:4 D2:4 D2:4 D2:4 | Ab1:4 Eb2:4 Eb2:4 Eb2:4 | G1:4 D2:4 D2:4 D2:4 | F1:4 C2:4 D2:4 D2:4 | C2:16',
    drum: bars(8, 'k:4 h:4 h:4 h:4'), vol: { drum: .6 } },
  // ---- 『聊斎志異』の話ごとのテーマ曲 ----
  // 偸桃：大道芸の笛と鼓のような、軽やかな五音（ト長調）
  toutoTheme: { bpm: 108, fixed: true,
    lead: 'D5:2 E5:2 G5:4 E5:2 D5:2 B4:4 | A4:2 B4:2 D5:4 B4:8 | G4:2 A4:2 B4:2 D5:2 E5:4 D5:4 | B4:12 .:4 | G5:2 A5:2 G5:2 E5:2 D5:4 E5:4 | G5:4 E5:2 D5:2 B4:8 | A4:2 B4:2 D5:2 E5:2 D5:4 A4:4 | G4:12 .:4',
    harm: offbeat('B4 A4 B4 D5 B4 B4 A4 B4'),
    bass: 'G2:8 D2:8 | E2:8 B1:8 | C2:8 D2:8 | G1:8 D2:8 | E2:8 C2:8 | G2:8 E2:8 | C2:8 D2:8 | G1:16',
    drum: bars(8, 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2'), vol: { drum: .6 } },
  // 種梨：道士のいたずらのような、笛子の跳ねる節（ヘ）
  shuriTheme: { bpm: 100, fixed: true, duty: .125,
    lead: 'C5:2 .:2 D5:2 .:2 F5:4 G5:4 | A5:2 G5:2 F5:2 D5:2 C5:8 | D5:2 F5:2 G5:2 A5:2 C6:4 A5:4 | G5:12 .:4 | A5:4 G5:2 F5:2 D5:4 F5:4 | G5:2 A5:2 G5:2 F5:2 D5:8 | C5:2 D5:2 F5:2 D5:2 C5:2 A4:2 G4:4 | F4:12 .:4',
    harm: bars(8, '.:2 A4:2 .:2 C5:2 .:2 A4:2 .:2 C5:2'),
    bass: 'F2:8 C2:8 | F2:8 C2:8 | D2:8 A1:8 | C2:16 | D2:8 F2:8 | C2:8 D2:8 | Bb1:8 C2:8 | F2:16',
    drum: bars(8, 'w:4 h:4 w:2 w:2 h:4'), vol: { harm: .5 } },
  // 瞳人語：瞳の中の小人のささやきのような、高く細い鈴の音（イ）
  dojingoTheme: { bpm: 84, fixed: true, pluck: true, duty: .125,
    lead: 'E6:2 C6:2 A5:4 G5:2 A5:2 C6:4 | D6:4 C6:2 A5:2 G5:8 | E5:2 G5:2 A5:2 C6:2 D6:4 E6:4 | A5:12 .:4 | G5:2 A5:2 C6:2 A5:2 G5:4 E5:4 | D5:4 E5:2 G5:2 A5:8 | C6:2 A5:2 G5:2 E5:2 D5:4 E5:4 | A4:12 .:4',
    harm: chords('A3 E4 A4 E4', 'D4 A4 D5 A4', 'C4 G4 C5 G4', 'A3 E4 A4 E4', 'G3 D4 G4 D4', 'D4 A4 D5 A4', 'E4 A4 C5 A4', 'A3 E4 A4 E4'),
    bass: 'A1:16 | D2:16 | C2:16 | A1:16 | G1:16 | D2:16 | E2:16 | A1:16', vol: { harm: .4 } },
  // 考城隍：冥府の試験場の、おごそかな二胡と銅鑼（ハ）
  kojokoTheme: { bpm: 66, fixed: true, duty: .25,
    lead: 'G4:8 A4:4 C5:4 | D5:12 .:4 | E5:4 D5:4 C5:4 A4:4 | G4:16 | C5:8 D5:4 E5:4 | G5:8 E5:8 | D5:4 C5:4 A4:4 D5:4 | C5:16',
    harm: 'E4:16 | F4:16 | G4:16 | D4:16 | E4:16 | G4:16 | F4:16 | E4:16',
    bass: 'C2:16 | F1:16 | A1:16 | G1:16 | A1:16 | C2:16 | D2:8 G1:8 | C2:16',
    drum: bars(4, 'g:16 | k:8 w:8'), vol: { harm: .6 } },
  // 酒友：ほろ酔いで揺れる、琵琶の三拍子（ニ、1 小節 12 拍）
  shuyuTheme: { bpm: 96, fixed: true, pluck: true,
    lead: 'D5:4 E5:2 F#5:2 A5:4 | B5:6 A5:2 F#5:4 | E5:4 D5:4 B4:4 | A4:12 | B4:4 D5:2 E5:2 F#5:4 | A5:4 F#5:4 E5:4 | D5:2 E5:2 F#5:4 E5:4 | D5:12',
    harm: 'F#4:4 A4:4 A4:4 | G4:4 B4:4 B4:4 | F#4:4 A4:4 A4:4 | E4:4 A4:4 A4:4 | G4:4 B4:4 B4:4 | F#4:4 A4:4 A4:4 | E4:4 G4:4 G4:4 | F#4:4 A4:4 A4:4',
    bass: 'D2:12 | G1:12 | D2:12 | A1:12 | G1:12 | D2:12 | A1:12 | D2:12',
    drum: bars(8, 'k:4 w:4 w:4'), vol: { harm: .5, drum: .6 } },
  // 耳中人：耳の奥で羽音のように鳴りつづける低い唸りと、静かな導引の節（ホ）
  jichujinTheme: { bpm: 72, fixed: true, duty: .5,
    lead: 'E5:8 G5:4 E5:4 | D5:16 | B4:4 D5:4 E5:4 G5:4 | A5:12 .:4 | G5:4 E5:4 D5:8 | B4:4 A4:4 G4:8 | A4:4 B4:4 D5:4 B4:4 | E4:16',
    harm: bars(8, 'B3:1 B3:1 .:2 B3:1 B3:1 .:2 B3:1 B3:1 .:2 B3:1 B3:1 .:2'),
    bass: 'E2:16 | D2:16 | G1:16 | A1:16 | E2:16 | G1:16 | A1:8 B1:8 | E2:16',
    drum: bars(4, '.:16 | w:2 .:14'), vol: { harm: .45 } },
  // 小猟犬：二寸の武士たちの、高く細い狩りの角笛（イ）
  shoryokenTheme: { bpm: 138, fixed: true, duty: .125,
    lead: 'A5:1 .:1 A5:1 .:1 C#6:2 E6:2 F#6:4 E6:4 | C#6:2 B5:2 A5:2 B5:2 C#6:8 | E6:1 .:1 E6:1 .:1 F#6:2 E6:2 C#6:4 B5:4 | A5:12 .:4 | F#5:2 A5:2 B5:2 C#6:2 E6:4 C#6:4 | B5:2 A5:2 F#5:2 E5:2 F#5:8 | A5:2 B5:2 C#6:2 B5:2 A5:2 F#5:2 E5:4 | A5:12 .:4',
    harm: offbeat('E5 E5 E5 E5 C#5 B4 C#5 E5'),
    bass: octaves('A1 E2 A1 A1 F#1 B1 E2 A1'),
    drum: bars(8, 'k:2 h:1 h:1 s:2 h:2 k:2 h:2 s:2 h:2'), vol: { drum: .6 } },
  // 小官人：指ほどの役人の行列の、ちょこちょこ進む小さな行進曲（ハ）
  shokanjinTheme: { bpm: 96, fixed: true, pluck: true, duty: .125,
    lead: 'C6:4 D6:4 E6:4 G6:4 | E6:4 D6:4 C6:8 | A5:4 C6:4 D6:2 C6:2 A5:4 | G5:12 .:4 | E6:4 G6:4 A6:4 G6:4 | E6:2 D6:2 C6:4 D6:8 | E6:2 D6:2 C6:2 A5:2 G5:4 A5:4 | C6:12 .:4',
    harm: offbeat('G5 G5 E5 E5 G5 G5 E5 E5'),
    bass: 'C3:4 G2:4 C3:4 G2:4 | C3:4 G2:4 C3:4 G2:4 | F2:4 C3:4 F2:4 C3:4 | G2:4 D3:4 G2:4 D3:4 | C3:4 G2:4 C3:4 G2:4 | A2:4 E3:4 A2:4 E3:4 | F2:4 C3:4 G2:4 D3:4 | C3:4 G2:4 C3:8',
    drum: bars(8, 'k:4 w:4 s:4 w:4'), vol: { harm: .5 } },
  // 画皮：前半は美しい娘の甘い節、後半は半音でくずれて鬼の顔が出る（ホ短調）
  gahiTheme: { bpm: 76, fixed: true, duty: .25,
    lead: 'E5:4 G5:2 A5:2 B5:8 | A5:2 G5:2 E5:2 D5:2 E5:8 | G5:4 A5:2 B5:2 D6:4 B5:4 | A5:12 .:4 | Bb5:4 A5:2 G5:2 E5:4 Bb4:4 | B4:2 C5:2 B4:2 Bb4:2 A4:8 | E5:2 F5:2 E5:2 D5:2 Bb4:4 B4:4 | E4:12 .:4',
    harm: chords('E4 G4 B4 G4', 'C4 E4 G4 E4', 'G4 B4 D5 B4', 'A3 C4 E4 C4', 'Bb3 D4 E4 D4', 'F4 A4 C5 A4', 'Bb3 D4 F4 D4', 'E4 G4 B4 G4'),
    bass: 'E2:16 | C2:16 | G1:16 | A1:16 | Bb1:16 | F1:16 | Bb1:8 B1:8 | E2:16',
    drum: bars(4, 'w:4 .:12 | w:2 w:2 .:8 g:4'), vol: { harm: .4, drum: .5 } },
  // 嶗山道士：山の道観の月見の宴。笙のような分散和音の上を、月へ昇っていく笛の節（ト）
  rozanTheme: { bpm: 76, fixed: true, duty: .25,
    lead: 'D5:4 G5:4 A5:2 B5:2 D6:4 | B5:2 A5:2 G5:4 E5:8 | D5:2 E5:2 G5:4 A5:4 G5:2 E5:2 | D5:12 .:4 | E5:4 G5:2 A5:2 B5:4 D6:4 | E6:4 D6:2 B5:2 A5:8 | G5:2 A5:2 B5:2 A5:2 G5:2 E5:2 D5:4 | G5:12 .:4',
    harm: chords('G3 D4 G4 D4', 'E3 B3 E4 B3', 'C4 G4 C5 G4', 'D4 A4 D5 A4', 'C4 G4 C5 G4', 'A3 E4 A4 E4', 'C4 G4 D5 G4', 'G3 D4 G4 D4'),
    bass: 'G1:16 | E2:16 | C2:16 | D2:16 | C2:16 | A1:16 | C2:8 D2:8 | G1:16',
    drum: bars(4, 'g:16 | .:8 w:4 w:4'), vol: { harm: .4, drum: .5 } },
  // 画壁：壁画の天女に誘われて絵の中へ漂っていく、夢うつつの竪琴と高い笛（変ホ、五音）
  gahekiTheme: { bpm: 76, fixed: true, duty: .25,
    lead: 'G5:4 Bb5:4 C6:6 Bb5:2 | G5:4 F5:4 Eb5:8 | F5:2 G5:2 Bb5:4 C6:4 Eb6:4 | C6:12 .:4 | Eb6:4 C6:4 Bb5:4 G5:4 | F5:6 G5:2 Bb5:8 | C6:2 Bb5:2 G5:2 F5:2 Eb5:4 F5:4 | Eb5:12 .:4',
    harm: chords('Eb4 G4 Bb4 G4', 'Ab3 C4 Eb4 C4', 'Eb4 G4 Bb4 G4', 'C4 Eb4 G4 Eb4', 'Ab3 C4 Eb4 C4', 'Bb3 D4 F4 D4', 'Ab3 C4 Eb4 C4', 'Eb4 G4 Bb4 G4'),
    bass: 'Eb2:16 | Ab1:16 | Eb2:16 | C2:16 | Ab1:16 | Bb1:16 | Ab1:8 Bb1:8 | Eb2:16',
    drum: bars(4, 'g:16 | .:8 h:2 .:6'), vol: { harm: .45, drum: .35 } },
  // 尸変：こわばった死体がぎくしゃく迫るような、拍子木の跳ねと増四度の脈打つ音（ロのフリギア）
  shihenTheme: { bpm: 76, fixed: true, duty: .25,
    lead: 'B4:2 .:2 C5:2 .:2 B4:4 F5:4 | E5:2 D5:2 C5:2 B4:2 A4:8 | B4:2 .:2 C5:2 .:2 D5:4 F5:4 | E5:12 .:4 | G5:4 F5:2 E5:2 F5:4 C5:4 | D5:2 C5:2 B4:2 A4:2 B4:8 | C5:2 .:2 B4:2 .:2 G4:2 A4:2 C5:4 | B4:12 .:4',
    harm: bars(8, '.:4 F4:1 .:7 F4:1 .:3'),
    bass: 'B1:16 | A1:16 | B1:16 | C2:16 | E2:16 | B1:8 A1:8 | C2:8 F#1:8 | B1:16',
    drum: bars(4, 'w:2 .:6 w:2 .:6 | w:2 .:6 w:2 .:2 w:2 .:2'), vol: { harm: .4, drum: .7 } },
  // 狼：夕暮れの道をつけてくる足音のような低い刻みと、遠吠えのように長く伸びる節（ロ短調の五音）
  okamiTheme: { bpm: 112, fixed: true, duty: .25,
    lead: 'B4:2 .:2 B4:2 D5:2 E5:4 F#5:4 | A5:8 F#5:4 E5:4 | D5:2 E5:2 D5:2 B4:2 A4:4 B4:4 | F#4:12 .:4 | B5:12 A5:2 F#5:2 | E5:4 F#5:2 E5:2 D5:4 B4:4 | A4:2 B4:2 D5:2 E5:2 D5:2 B4:2 A4:4 | B4:12 .:4',
    harm: bars(8, '.:4 F#4:2 .:2 .:4 D4:2 .:2'),
    bass: 'B1:2 .:2 B1:2 .:2 F#1:2 .:2 B1:2 .:2 | B1:2 .:2 B1:2 .:2 F#1:2 .:2 B1:2 .:2 | G1:2 .:2 G1:2 .:2 D2:2 .:2 G1:2 .:2 | A1:2 .:2 A1:2 .:2 E2:2 .:2 A1:2 .:2 | B1:2 .:2 B1:2 .:2 F#1:2 .:2 B1:2 .:2 | E2:2 .:2 E2:2 .:2 B1:2 .:2 E2:2 .:2 | F#1:2 .:2 F#1:2 .:2 C#2:2 .:2 F#1:2 .:2 | B1:2 .:2 F#1:2 .:2 B1:8',
    drum: bars(8, 'k:4 w:2 .:2 k:2 k:2 w:4'), vol: { harm: .4, drum: .55 } },
  // 酒虫：大酒のみの千鳥足のような、しゃっくりで途切れる節と、ずんちゃっの低音（ト短調）
  shuchuTheme: { bpm: 112, fixed: true, duty: .25,
    lead: 'G4:2 Bb4:2 C5:2 .:2 D5:4 C5:2 Bb4:2 | C5:2 D5:2 F5:4 D5:8 | G5:2 F5:2 D5:2 .:2 C5:2 D5:2 Bb4:4 | G4:12 .:4 | D5:2 .:2 D5:2 F5:2 G5:4 F5:2 D5:2 | F5:2 G5:2 Bb5:4 G5:8 | F5:2 D5:2 C5:2 Bb4:2 C5:2 .:2 D5:4 | G4:12 .:4',
    harm: offbeat('Bb4 A4 Bb4 Bb4 D5 D5 A4 Bb4'),
    bass: 'G2:4 D2:4 G2:4 D2:4 | Bb1:4 F2:4 Bb1:4 F2:4 | Eb2:4 Bb1:4 F2:4 C2:4 | G2:4 D2:4 G1:8 | G2:4 D2:4 G2:4 D2:4 | Eb2:4 Bb1:4 Eb2:4 Bb1:4 | C2:4 G1:4 D2:4 A1:4 | G1:16',
    drum: bars(8, 'k:4 w:2 w:2 s:4 w:4'), vol: { harm: .5, drum: .6 } },
  // 口技：閉め切った部屋から漏れる、さざめくおしゃべりのような細かい刻み（ホ）
  kogiTheme: { bpm: 116, fixed: true, pluck: true, duty: .25,
    lead: 'E5:2 G5:2 A5:2 G5:2 E5:4 D5:4 | B4:1 B4:1 D5:1 B4:1 A4:2 B4:2 E5:8 | G5:2 A5:2 B5:2 A5:2 G5:2 E5:2 D5:4 | E5:12 .:4 | B5:1 A5:1 G5:1 A5:1 B5:4 A5:1 G5:1 E5:1 G5:1 A5:4 | D6:2 B5:2 A5:2 G5:2 A5:8 | G5:1 G5:1 E5:1 D5:1 E5:2 G5:2 D5:2 B4:2 A4:4 | E5:12 .:4',
    harm: offbeat('B4 B4 D5 B4 G4 A4 G4 B4'),
    bass: 'E2:8 B1:8 | G1:8 D2:8 | C2:8 D2:8 | E2:16 | E2:8 G1:8 | D2:8 A1:8 | C2:8 D2:8 | E2:16',
    drum: bars(8, 'w:2 w:2 h:4 w:2 .:2 h:4'), vol: { harm: .45, drum: .55 } },
  // 家長の心配：転がる糸巻のように、つまずきながら跳ねるピチカート（ト長調と短調のあいだ）
  odradekTheme: { bpm: 108, fixed: true, pluck: true, duty: .125,
    lead: 'G4:1 .:1 B4:1 .:1 D5:2 C#5:2 C5:4 B4:4 | A4:1 .:1 C5:1 .:1 Eb5:2 D5:2 G4:8 | E5:1 .:1 D5:1 .:1 C5:2 B4:2 Bb4:4 A4:4 | G4:4 .:4 D4:4 .:4 | G5:2 F#5:2 F5:2 E5:2 Eb5:4 D5:4 | C5:1 .:1 E5:1 .:1 G5:2 F#5:2 A4:8 | B4:2 D5:2 C5:2 A4:2 F#4:4 A4:4 | G4:12 .:4',
    harm: bars(8, '.:2 B3:2 .:2 D4:2 .:2 B3:2 .:2 D4:2'),
    bass: 'G2:4 .:4 D2:4 .:4 | F2:4 .:4 C2:4 .:4 | E2:4 .:4 Eb2:4 .:4 | D2:4 .:4 D2:4 .:4 | G2:4 .:4 C2:4 .:4 | A1:4 .:4 D2:4 .:4 | G1:4 .:4 D2:4 .:4 | G1:16',
    drum: bars(8, 'w:2 .:6 h:2 .:2 w:2 .:2'), vol: { harm: .5 } },
  // 皇帝の使者：駆けても駆けても抜けられない、上へずれていく 16 分音符の刻み（ニ短調）
  shishaTheme: { bpm: 132, fixed: true, duty: .25,
    lead: 'D5:2 F5:2 A5:2 F5:2 E5:2 G5:2 Bb5:2 G5:2 | F5:2 A5:2 C6:2 A5:2 G5:2 Bb5:2 D6:2 Bb5:2 | A5:4 G5:4 F5:4 E5:4 | F5:12 .:4 | Bb4:2 D5:2 F5:2 D5:2 C5:2 E5:2 G5:2 E5:2 | D5:2 F5:2 A5:2 F5:2 E5:2 G5:2 Bb5:2 G5:2 | A5:4 Bb5:4 C#6:4 E6:4 | D6:12 .:4',
    harm: bars(8, 'A4:1 .:1 A4:1 .:1 A4:1 .:1 A4:1 .:1 A4:1 .:1 A4:1 .:1 A4:1 .:1 A4:1 .:1'),
    bass: octaves('D2 F2 A1 D2 Bb1 D2 A1 D2'),
    drum: bars(8, 'k:2 h:2 h:2 h:2 s:2 h:2 h:2 h:2'), vol: { harm: .4, drum: .6 } },
  // 掟の前で：同じ音型が少しずつずれていく、出口のない旋律（ニ短調）
  okiteTheme: { bpm: 84, fixed: true,
    lead: 'D5:4 F5:4 E5:4 C#5:4 | D5:4 A4:4 Bb4:8 | D5:4 F5:4 E5:4 C5:4 | B4:12 .:4 | D5:4 G5:4 F5:4 E5:4 | Eb5:4 D5:4 C#5:8 | D5:4 E5:4 F5:4 G#4:4 | A4:12 .:4',
    harm: bars(8, 'D4:2 .:2 F4:2 .:2 A4:2 .:2 F4:2 .:2'),
    bass: 'D2:16 | Bb1:16 | G1:16 | G#1:16 | Bb1:16 | A1:16 | B1:8 E2:8 | A1:16',
    drum: bars(8, 'k:8 h:4 .:4'), vol: { harm: .5, drum: .5 } },

  // ---- 『列国怪談聞書帖』の話ごとのテーマ曲 ----
  // 夜這蜘蛛：都節の短い刻みが這いよる、張りつめた曲（ニ）
  yobaigumoTheme: { bpm: 92, fixed: true, pluck: true,
    lead: 'D5:1 .:1 Eb5:1 .:1 D5:2 A4:2 Bb4:4 A4:4 | G4:2 A4:2 Bb4:2 A4:2 Eb4:8 | D4:1 .:1 Eb4:1 .:1 G4:2 A4:2 Bb4:4 D5:4 | Eb5:12 .:4 | D5:2 Bb4:2 A4:2 G4:2 A4:4 Bb4:4 | A4:4 G4:4 Eb4:8 | D4:2 Eb4:2 G4:2 A4:2 Bb4:2 A4:2 G4:2 Eb4:2 | D4:12 .:4',
    harm: bars(8, 'A3:1 .:1 A3:1 .:1 .:4 A3:1 .:1 A3:1 .:1 .:4'),
    bass: 'D2:4 .:4 D2:4 .:4 | G1:4 .:4 G1:4 .:4 | D2:4 .:4 D2:4 .:4 | Eb2:4 .:4 Eb2:4 .:4 | Bb1:4 .:4 Bb1:4 .:4 | A1:4 .:4 A1:4 .:4 | G1:4 .:4 A1:4 .:4 | D2:16',
    drum: bars(8, 'w:2 .:2 w:2 .:2 .:4 k:4'), vol: { harm: .6 } },
  // 黒河怪異：尺八のように長く息を引く、都節の夜（イ）
  kurokawaTheme: { bpm: 54, fixed: true, duty: .5,
    lead: 'E5:8 F5:4 E5:4 | D5:6 E5:2 A4:8 | Bb4:4 A4:4 F4:8 | E4:16 | A4:4 D5:4 E5:8 | F5:6 E5:2 D5:8 | Bb4:4 A4:4 E4:4 F4:4 | E4:12 .:4',
    harm: bars(8, '.:8 A3:8'),
    bass: 'A1:16 | D2:16 | Bb1:16 | A1:16 | D2:16 | Bb1:16 | F1:8 E2:8 | A1:16',
    drum: bars(4, 'w:16 | .:16'), vol: { harm: .5 } },
  // 風の浦の鬼女：平調子の琴をつまびく（ニ）
  kazauraTheme: { bpm: 80, fixed: true, pluck: true, duty: .125,
    lead: 'D5:2 F5:2 A5:2 Bb5:2 A5:4 F5:4 | E5:2 F5:2 E5:2 D5:2 A4:8 | Bb4:2 D5:2 E5:2 F5:2 A5:4 Bb5:4 | A5:12 .:4 | D6:4 Bb5:2 A5:2 F5:4 E5:4 | F5:2 E5:2 D5:4 A4:8 | Bb4:2 A4:2 F4:2 E4:2 F4:4 A4:4 | D4:12 .:4',
    harm: chords('D4 A4 D5 A4', 'A3 E4 A4 E4', 'Bb3 F4 Bb4 F4', 'A3 E4 A4 E4', 'D4 A4 D5 A4', 'A3 E4 A4 E4', 'Bb3 F4 Bb4 F4', 'D4 A4 D5 A4'),
    bass: 'D2:16 | A1:16 | Bb1:16 | A1:16 | D2:16 | A1:16 | Bb1:8 A1:8 | D2:16', vol: { harm: .45 } },
  // 王六郎：夜の川面のさざ波のような琴の分散和音に、酒を酌み交わす二人の、温かくも少しさびしい節（ホ、五音）
  rokuroTheme: { bpm: 80, fixed: true, pluck: true, duty: .25,
    lead: 'B4:4 D5:4 E5:6 D5:2 | B4:4 A4:4 G4:8 | A4:4 B4:2 D5:2 E5:4 G5:4 | E5:12 .:4 | G5:4 E5:4 D5:4 B4:4 | A4:6 B4:2 D5:8 | E5:2 D5:2 B4:2 A4:2 G4:4 A4:4 | E4:12 .:4',
    harm: chords('E3 B3 E4 B3', 'C4 G4 C5 G4', 'D4 A4 D5 A4', 'E3 B3 E4 B3', 'G3 D4 G4 D4', 'D4 A4 D5 A4', 'C4 G4 C5 G4', 'E3 B3 E4 B3'),
    bass: 'E2:16 | C2:16 | D2:16 | E2:16 | G1:16 | D2:16 | C2:8 D2:8 | E2:16',
    drum: bars(4, '.:16 | w:2 .:6 w:2 .:6'), vol: { harm: .4, drum: .4 } },
  // 雷曹：雲の上を龍の車が駆ける、遠雷の太鼓と堂々とした節（ト、五音）
  raisoTheme: { bpm: 92, fixed: true, duty: .5,
    lead: 'G4:4 B4:2 D5:2 E5:6 D5:2 | B4:4 G4:4 A4:8 | D5:2 E5:2 G5:4 A5:4 G5:4 | E5:12 .:4 | G5:4 E5:2 D5:2 B4:4 D5:4 | E5:6 G5:2 E5:8 | D5:2 B4:2 A4:2 G4:2 A4:4 B4:4 | G4:12 .:4',
    harm: chords('G3 D4 G4 D4', 'E3 B3 E4 B3', 'C4 G4 C5 G4', 'E3 B3 E4 B3', 'G3 D4 G4 D4', 'C4 G4 C5 G4', 'D4 A4 D5 A4', 'G3 D4 G4 D4'),
    bass: octaves('G1 E1 C2 E1 G1 C2 D2 G1'),
    drum: bars(4, 'k:4 .:4 k:2 k:2 .:4 | k:4 .:4 s:4 g:4'), vol: { harm: .35, drum: .55 } },
  // 促織：コオロギの鳴き声のように跳ねる短い音と、貧しい村の哀しみがまじる琴（イ短調）
  sokushokuTheme: { bpm: 104, fixed: true, pluck: true, duty: .125,
    lead: 'A5:2 .:2 A5:1 .:1 C6:2 B5:4 A5:4 | E5:2 G5:2 A5:2 G5:2 E5:8 | D5:2 E5:2 G5:2 A5:2 C6:4 B5:4 | A5:12 .:4 | E6:2 .:2 D6:2 C6:2 A5:4 G5:4 | A5:2 C6:2 A5:2 G5:2 E5:8 | D5:2 C5:2 D5:2 E5:2 G5:4 E5:4 | A4:12 .:4',
    harm: chords('A3 E4 A4 E4', 'E3 B3 E4 B3', 'D4 A4 D5 A4', 'A3 E4 A4 E4', 'C4 G4 C5 G4', 'A3 E4 A4 E4', 'D4 A4 D5 A4', 'A3 E4 A4 E4'),
    bass: 'A1:8 E2:8 | E1:8 B1:8 | D2:8 A1:8 | A1:16 | C2:8 G1:8 | A1:8 E2:8 | D2:8 E2:8 | A1:16',
    drum: bars(4, 'h:2 .:2 h:1 h:1 .:2 w:2 .:2 h:2 .:2'), vol: { harm: .35, drum: .35 } },
  // 竹青：湖の上を舞うカラスの羽ばたきのような分散和音と、別れと再会を繰り返す二人の、のびやかで少し切ない節（ニ、五音）
  chikuseiTheme: { bpm: 88, fixed: true, pluck: true, duty: .25,
    lead: 'F#5:4 A5:4 B5:6 A5:2 | F#5:4 E5:4 D5:8 | E5:4 F#5:2 A5:2 B5:4 D6:4 | B5:12 .:4 | D6:4 B5:2 A5:2 F#5:4 A5:4 | B5:6 A5:2 F#5:8 | E5:2 F#5:2 E5:2 D5:2 B4:4 D5:4 | D5:12 .:4',
    harm: chords16('D4 A4 D5 F#5', 'B3 F#4 B4 D5', 'G3 D4 G4 B4', 'B3 F#4 B4 D5', 'G3 D4 G4 B4', 'D4 A4 D5 F#5', 'A3 E4 A4 C#5', 'D4 A4 D5 F#5'),
    bass: 'D2:16 | B1:16 | G1:16 | B1:16 | G1:16 | D2:16 | A1:16 | D2:16',
    drum: bars(4, '.:16 | .:8 w:2 .:6'), vol: { harm: .3, drum: .4 } },
  // 書痴：本を読み上げる声のように同じ音型をくりかえす、生まじめでどこかおかしな琴の節（ヘ、五音）
  shochiTheme: { bpm: 96, fixed: true, pluck: true, duty: .25,
    lead: 'C5:2 D5:2 F5:2 D5:2 C5:2 D5:2 F5:4 | G5:2 A5:2 G5:2 F5:2 D5:8 | C5:2 D5:2 F5:2 D5:2 C5:2 D5:2 F5:4 | A5:2 G5:2 F5:2 D5:2 F5:8 | A5:4 C6:2 A5:2 G5:4 F5:4 | G5:2 A5:2 G5:2 F5:2 D5:8 | F5:2 G5:2 A5:2 G5:2 F5:2 D5:2 C5:4 | F5:12 .:4',
    harm: chords('F3 C4 F4 C4', 'D3 A3 D4 A3', 'F3 C4 F4 C4', 'Bb3 F4 Bb4 F4', 'F3 C4 F4 C4', 'D3 A3 D4 A3', 'C4 G4 C5 G4', 'F3 C4 F4 C4'),
    bass: 'F1:8 C2:8 | D2:8 A1:8 | F1:8 C2:8 | Bb1:8 F2:8 | F1:8 C2:8 | D2:8 A1:8 | C2:8 C2:8 | F1:16',
    drum: bars(4, 'w:4 .:4 w:2 w:2 .:4'), vol: { harm: .35, drum: .35 } },
  // 夢狼：夢の役所にうずくまる狼の群れのように、低く重く迫ってくる節（ホ、フリギア）
  murouTheme: { bpm: 76, fixed: true, duty: .5,
    lead: 'E4:4 F4:4 G4:6 F4:2 | E4:4 D4:4 E4:8 | B4:4 C5:2 B4:2 A4:4 G4:4 | F4:12 .:4 | E5:4 D5:2 C5:2 B4:4 A4:4 | G4:6 A4:2 B4:8 | C5:2 B4:2 A4:2 G4:2 F4:4 G4:4 | E4:12 .:4',
    harm: chords('E3 B3 E4 B3', 'D3 A3 D4 A3', 'C3 G3 C4 G3', 'F3 C4 F4 C4', 'C3 G3 C4 G3', 'G3 D4 G4 D4', 'F3 C4 F4 C4', 'E3 B3 E4 B3'),
    bass: 'E1:16 | D1:16 | C1:16 | F1:16 | C1:16 | G1:16 | F1:8 F1:8 | E1:16',
    drum: bars(4, 'k:4 .:8 k:2 k:2 | k:4 .:4 g:8'), vol: { harm: .35, drum: .5 } },
  // 黄英：秋の菊畑に酒の香りがただよう、ゆったりとして少しおどけた琴の節（ト、五音）
  koueiTheme: { bpm: 84, fixed: true, pluck: true, duty: .25,
    lead: 'D5:2 E5:2 G5:4 A5:4 G5:4 | E5:2 D5:2 B4:4 D5:8 | G5:2 A5:2 B5:4 D6:4 B5:4 | A5:12 .:4 | B5:4 A5:2 G5:2 E5:4 G5:4 | A5:2 G5:2 E5:4 D5:8 | E5:2 G5:2 E5:2 D5:2 B4:4 A4:4 | G4:12 .:4',
    harm: chords('G3 D4 G4 D4', 'E3 B3 E4 B3', 'C4 G4 C5 G4', 'D4 A4 D5 A4', 'G3 D4 G4 D4', 'C4 G4 C5 G4', 'A3 E4 A4 E4', 'G3 D4 G4 D4'),
    bass: 'G1:8 D2:8 | E2:8 B1:8 | C2:8 G1:8 | D2:8 A1:8 | G1:8 D2:8 | C2:8 G1:8 | A1:8 D2:8 | G1:16',
    drum: bars(4, 'w:2 .:6 w:2 .:2 w:2 .:2'), vol: { harm: .35, drum: .3 } },
  // 香玉：山の道観の庭に白い牡丹がこぼれるような、やさしく切ない琴の節（イ、五音）
  kougyokuTheme: { bpm: 72, fixed: true, pluck: true, duty: .25,
    lead: 'E5:4 C#5:2 B4:2 A4:4 B4:4 | C#5:4 E5:4 F#5:8 | E5:2 F#5:2 A5:4 F#5:4 E5:4 | C#5:12 .:4 | A5:4 F#5:2 E5:2 C#5:4 E5:4 | F#5:6 E5:2 C#5:8 | B4:2 C#5:2 B4:2 A4:2 F#4:4 B4:4 | A4:12 .:4',
    harm: chords16('A3 E4 A4 C#5', 'F#3 C#4 F#4 A4', 'D4 A4 D5 F#5', 'A3 E4 A4 C#5', 'D4 A4 D5 F#5', 'F#3 C#4 F#4 A4', 'E3 B3 E4 G#4', 'A3 E4 A4 C#5'),
    bass: 'A1:16 | F#1:16 | D2:16 | A1:16 | D2:16 | F#1:16 | E1:16 | A1:16', vol: { harm: .3 } },
  // 席方平：冥府の役所から役所へ、父の無実を訴えて歩きつづける、くじけない足どりの節（ニ短調）
  sekiTheme: { bpm: 100, fixed: true, duty: .5,
    lead: 'D5:2 D5:2 F5:2 A5:2 G5:4 F5:4 | E5:2 F5:2 E5:2 D5:2 A4:8 | Bb4:2 C5:2 D5:2 F5:2 E5:4 D5:4 | C#5:12 .:4 | D5:2 F5:2 A5:4 D6:4 C6:4 | Bb5:2 A5:2 G5:2 F5:2 E5:8 | F5:2 E5:2 D5:2 C#5:2 D5:4 E5:4 | D5:12 .:4',
    harm: chords('D4 A4 D5 A4', 'A3 E4 A4 E4', 'Bb3 F4 Bb4 F4', 'A3 E4 A4 C#5', 'D4 A4 D5 A4', 'G3 D4 G4 D4', 'A3 E4 A4 C#5', 'D4 A4 D5 A4'),
    bass: octaves('D2 A1 Bb1 A1 D2 G1 A1 D2'),
    drum: bars(4, 'k:2 .:2 s:2 .:2 k:2 k:2 s:2 .:2'), vol: { harm: .3, drum: .5 } },
  // 陸判：緑の顔に赤い髭の判官が、酒を酌みかわしにやって来る。おどろおどろしくも、どこか愉快な節（ハ短調）
  rikuhanTheme: { bpm: 92, fixed: true, duty: .25,
    lead: 'C5:2 .:2 Eb5:2 G5:2 F5:4 Eb5:4 | D5:2 Eb5:2 D5:2 C5:2 G4:8 | Ab4:2 Bb4:2 C5:2 Eb5:2 D5:4 C5:4 | B4:12 .:4 | C5:2 Eb5:2 G5:4 C6:4 Bb5:4 | Ab5:2 G5:2 F5:2 Eb5:2 D5:8 | Eb5:2 D5:2 C5:2 B4:2 C5:4 D5:4 | C5:12 .:4',
    harm: chords('C4 G4 C5 G4', 'G3 D4 G4 D4', 'Ab3 Eb4 Ab4 Eb4', 'G3 D4 G4 B4', 'C4 G4 C5 G4', 'F3 C4 F4 C4', 'G3 D4 G4 B4', 'C4 G4 C5 G4'),
    bass: 'C2:8 G1:8 | G1:16 | Ab1:16 | G1:16 | C2:8 G1:8 | F1:16 | G1:16 | C2:16',
    drum: bars(4, 'k:4 w:2 w:2 k:4 .:4'), vol: { harm: .3, drum: .45 } },
  // 佐伯友尾：水面のさざなみのような和音と、雅楽風のゆるやかな旋律（ト）
  tomooTheme: { bpm: 66, fixed: true,
    lead: 'D5:6 E5:2 G5:8 | E5:4 D5:4 C5:8 | A4:4 C5:4 D5:4 E5:4 | D5:16 | G5:6 A5:2 G5:4 E5:4 | D5:4 E5:4 C5:8 | A4:4 G4:4 A4:4 C5:4 | G4:16',
    harm: chords16('G4 D5 G5 D5', 'C5 E5 G5 E5', 'A4 D5 E5 D5', 'G4 D5 G5 D5', 'E4 G4 C5 G4', 'C5 E5 G5 E5', 'A4 C5 E5 C5', 'G4 D5 G5 D5'),
    bass: 'G1:16 | C2:16 | A1:16 | D2:16 | E2:16 | C2:16 | A1:8 D2:8 | G1:16',
    drum: bars(4, 'k:16 | .:8 w:8'), vol: { harm: .35 } },
  // ずばい坊の火：木魚と念仏のような、くり返す低い節（ホ）
  zubaiboTheme: { bpm: 96, fixed: true, duty: .5,
    lead: 'E4:4 E4:4 F4:4 E4:4 | A4:4 A4:4 B4:4 A4:4 | C5:4 B4:4 A4:4 F4:4 | E4:12 .:4 | B4:4 C5:4 E5:4 C5:4 | B4:4 A4:4 F4:8 | A4:4 F4:4 E4:4 F4:4 | E4:12 .:4',
    harm: bars(8, 'B3:8 E4:8'),
    bass: 'E2:16 | A1:16 | F2:16 | E2:16 | E2:16 | A1:16 | F2:8 B1:8 | E2:16',
    drum: bars(4, 'g:4 w:4 w:4 w:4 | w:4 w:4 w:4 w:4'), vol: { harm: .5 } },

  // ---- 学習教材のテーマ曲 ----
  // ことばを紡ぐ機械 第1話：古い図書館のチェンバロ。ペンを走らせるように 8 分音符で上り下りする（イ短調）
  llm1Theme: { bpm: 100, fixed: true, pluck: true, duty: .25,
    lead: 'E5:2 A5:2 C6:2 B5:2 A5:4 E5:4 | F5:2 E5:2 D5:2 C5:2 B4:8 | C5:2 E5:2 A5:2 G5:2 F5:4 D5:4 | E5:12 .:4 | A5:2 B5:2 C6:2 D6:2 E6:4 C6:4 | D6:2 C6:2 B5:2 A5:2 G#5:8 | F5:2 A5:2 D6:2 C6:2 B5:2 A5:2 G#5:2 B5:2 | A5:12 .:4',
    harm: chords('A3 C4 E4 C4', 'E3 G#3 B3 G#3', 'F3 A3 C4 A3', 'E3 G#3 B3 E4', 'A3 C4 E4 C4', 'E3 G#3 B3 G#3', 'D4 F4 A4 F4', 'A3 C4 E4 C4'),
    bass: 'A2:8 E2:8 | E2:8 B1:8 | F2:8 C2:8 | E2:8 E1:8 | A1:8 E2:8 | E2:8 G#1:8 | D2:8 F2:8 | A1:16',
    drum: bars(8, 'k:4 h:4 s:4 h:4'), vol: { harm: .45, drum: .4 } },
  // 第2話：意味の地図を歩く。ベルのような音色で、ゆっくり見わたす（ニ長調）
  llm2Theme: { bpm: 92, fixed: true, duty: .125,
    lead: 'D5:4 F#5:4 A5:4 F#5:4 | G5:4 B5:4 A5:8 | E5:2 F#5:2 G5:4 F#5:4 E5:4 | D5:12 .:4 | B5:4 A5:4 G5:4 F#5:4 | E5:4 G5:4 F#5:8 | G5:2 A5:2 B5:4 C#6:4 E6:4 | D6:12 .:4',
    harm: chords('D4 F#4 A4 F#4', 'G3 B3 D4 B3', 'E3 G3 B3 G3', 'D4 F#4 A4 F#4', 'G3 B3 D4 B3', 'A3 C#4 E4 C#4', 'A3 C#4 E4 G4', 'D4 F#4 A4 F#4'),
    bass: 'D2:8 A1:8 | G1:8 D2:8 | E2:8 B1:8 | D2:8 A1:8 | G1:8 B1:8 | A1:8 E2:8 | A1:8 C#2:8 | D2:16',
    drum: bars(8, 'k:6 h:2 .:4 h:4'), vol: { harm: .4, drum: .35 } },
  // 第3話：注目のしくみ。光を当てるように同じ音をたたいてから跳ねる、張りつめた刻み（ホ短調）
  llm3Theme: { bpm: 112, fixed: true, duty: .5,
    lead: 'E5:2 .:2 E5:2 G5:2 B5:4 A5:4 | G5:2 F#5:2 E5:2 D5:2 E5:8 | C5:2 .:2 C5:2 E5:2 G5:4 F#5:4 | D#5:12 .:4 | E5:2 G5:2 B5:2 E6:2 D6:4 B5:4 | C6:2 B5:2 A5:2 G5:2 F#5:8 | A5:2 G5:2 F#5:2 E5:2 D#5:4 F#5:4 | E5:12 .:4',
    harm: offbeat('B4 B4 G4 B4 B4 A4 A4 G4'),
    bass: octaves('E2 E2 C2 B1 E2 A1 B1 E2'),
    drum: bars(8, 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2'), vol: { harm: .45, drum: .5 } },
  // 第4話：積み木の塔を登る。1 段ずつ上がる行進（ハ長調）
  llm4Theme: { bpm: 120, fixed: true, duty: .25,
    lead: 'C5:2 E5:2 G5:2 C6:2 G5:4 E5:4 | F5:2 A5:2 C6:2 A5:2 G5:8 | E5:2 G5:2 C6:2 E6:2 D6:4 B5:4 | C6:12 .:4 | A5:4 G5:4 F5:4 E5:4 | D5:2 E5:2 F5:2 G5:2 A5:8 | B5:4 C6:4 D6:4 B5:4 | C6:12 .:4',
    harm: chords('C4 E4 G4 E4', 'F4 A4 C5 A4', 'C4 E4 G4 E4', 'C4 E4 G4 C5', 'F4 A4 C5 A4', 'D4 F4 A4 F4', 'G3 B3 D4 G4', 'C4 E4 G4 E4'),
    bass: octaves('C2 F2 C2 C2 F2 D2 G1 C2'),
    drum: bars(8, 'k:4 s:4 k:2 k:2 s:4'), vol: { harm: .4, drum: .5 } },
  // 第5話：学び方と限界。ふり返るように長く歌う、おだやかな結び（ヘ長調）
  llm5Theme: { bpm: 76, fixed: true, duty: .5,
    lead: 'A4:4 C5:4 F5:6 E5:2 | D5:4 C5:4 A4:8 | Bb4:4 D5:4 G5:6 F5:2 | E5:12 .:4 | F5:4 A5:4 C6:6 Bb5:2 | A5:4 G5:4 F5:8 | D5:4 E5:4 F5:4 G5:4 | F5:12 .:4',
    harm: chords('F3 A3 C4 A3', 'D3 F3 A3 F3', 'G3 Bb3 D4 Bb3', 'C4 E4 G4 E4', 'F3 A3 C4 A3', 'C4 E4 G4 E4', 'Bb3 D4 F4 D4', 'F3 A3 C4 A3'),
    bass: 'F2:16 | D2:16 | G1:16 | C2:16 | F2:16 | C2:16 | Bb1:8 C2:8 | F2:16',
    drum: bars(4, 'k:8 h:8 | .:16'), vol: { harm: .4, drum: .3 } },
  // 時をめぐる巻物 第1話：むらからくにへ。土笛のような長い音と、ゆっくりした太鼓（ニの陽音階）
  rekishi1Theme: { bpm: 80, fixed: true, duty: .5,
    lead: 'D5:4 E5:4 G5:8 | A5:4 G5:4 E5:8 | D5:4 E5:2 G5:2 A5:4 B5:4 | A5:12 .:4 | B5:4 A5:4 G5:4 E5:4 | D5:4 E5:4 G5:8 | E5:4 D5:4 B4:4 A4:4 | D5:12 .:4',
    harm: bars(8, 'D4:8 A4:8'),
    bass: 'D2:16 | G1:16 | D2:16 | A1:16 | G1:16 | D2:16 | G1:8 A1:8 | D2:16',
    drum: bars(8, 'k:4 .:4 w:2 w:2 k:4'), vol: { harm: .35, drum: .45 } },

  // 第2話：天皇中心の国づくり。笙の和音にのせた、雅楽風のゆるやかな節（イの陽音階）
  rekishi2Theme: { bpm: 72, fixed: true, duty: .5,
    lead: 'A4:8 B4:4 D5:4 | E5:8 D5:8 | B4:4 D5:4 E5:4 G5:4 | E5:12 .:4 | G5:8 E5:4 D5:4 | B4:8 A4:8 | B4:4 A4:4 G4:4 E4:4 | A4:12 .:4',
    harm: bars(4, 'E4:8 A4:8 | D4:8 G4:8'),
    bass: 'A1:16 | E2:16 | G1:16 | A1:16 | E2:16 | D2:16 | G1:16 | A1:16',
    drum: bars(4, 'k:16 | .:12 w:4'), vol: { harm: .4, drum: .35 } },
  // 第3話：貴族の世と武士のおこり。琴をつま弾く都節の調べ（ホの都節）
  rekishi3Theme: { bpm: 84, fixed: true, pluck: true, duty: .125,
    lead: 'E5:4 F5:4 A5:8 | B5:4 A5:4 F5:8 | E5:2 F5:2 A5:4 C6:4 B5:4 | A5:12 .:4 | C6:4 B5:4 A5:4 F5:4 | E5:4 F5:4 A5:8 | F5:4 E5:4 C5:4 B4:4 | E5:12 .:4',
    harm: offbeat('A4 F4 A4 E4 A4 F4 C5 B4'),
    bass: 'A1:16 | F2:16 | A1:16 | E2:16 | A1:16 | F2:16 | C2:8 B1:8 | E2:16',
    drum: bars(8, 'w:4 .:4 w:2 .:2 k:4'), vol: { harm: .5, drum: .35 } },
  // 第4話：武士の政治。陣太鼓にあわせて進む、きりっとした節（ニの短調の五音）
  rekishi4Theme: { bpm: 104, fixed: true, duty: .25,
    lead: 'D5:2 D5:2 F5:4 G5:4 A5:4 | C6:4 A5:4 G5:8 | F5:2 G5:2 A5:4 G5:4 F5:4 | D5:12 .:4 | A5:2 A5:2 C6:4 D6:4 C6:4 | A5:4 G5:4 F5:8 | G5:4 F5:4 D5:4 C5:4 | D5:12 .:4',
    harm: bars(8, 'A4:8 D5:8'),
    bass: octaves('D2 F2 D2 D2 F2 C2 G1 D2'),
    drum: bars(8, 'k:4 k:2 s:2 k:4 s:4'), vol: { harm: .4, drum: .55 } },
  // 第5話：天下統一。馬を走らせるような、勇ましい長調（ト長調）
  rekishi5Theme: { bpm: 126, fixed: true, duty: .25,
    lead: 'G5:2 A5:2 B5:4 D6:4 B5:4 | A5:4 G5:4 E5:8 | G5:2 A5:2 B5:4 A5:4 G5:4 | E5:12 .:4 | D6:4 B5:4 A5:4 G5:4 | E5:4 G5:4 A5:8 | B5:4 A5:4 G5:4 E5:4 | G5:12 .:4',
    harm: offbeat('D5 C5 D5 B4 D5 C5 D5 B4'),
    bass: octaves('G2 C2 G2 E2 G1 C2 D2 G1'),
    drum: bars(8, 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2'), vol: { harm: .4, drum: .5 } },
  // 第6話：鎖国から開国へ。和の節から、西洋の行進曲へと開けていく（ヘ長調）
  rekishi6Theme: { bpm: 112, fixed: true, duty: .25,
    lead: 'C5:4 F5:4 A5:4 C6:4 | Bb5:4 A5:4 G5:8 | A5:2 Bb5:2 C6:4 A5:4 F5:4 | G5:12 .:4 | C6:4 A5:4 F5:4 A5:4 | G5:4 E5:4 C5:8 | D5:4 E5:4 F5:4 G5:4 | F5:12 .:4',
    harm: chords('F4 A4 C5 A4', 'C4 E4 G4 E4', 'F4 A4 C5 A4', 'C4 E4 G4 Bb4', 'F4 A4 C5 A4', 'C4 E4 G4 E4', 'Bb3 D4 F4 D4', 'F4 A4 C5 A4'),
    bass: 'F2:8 C2:8 | C2:8 G1:8 | F2:8 C2:8 | C2:16 | F2:8 A1:8 | C2:8 E2:8 | Bb1:8 C2:8 | F2:16',
    drum: bars(8, 'k:4 s:4 k:4 s:2 s:2'), vol: { harm: .4, drum: .45 } },

  // ---- 地域版の場面の曲（boot の region で、同じ名前の場面の曲と差し替わる） ----
  // 日本（jp）：都節（ミ ファ ラ シ ド）・陽音階、三味線・琴の撥、拍子木
  tale_jp: { bpm: 84, pluck: true, duty: .125,
    lead: ab('D5:2 E5:2 G5:4 E5:2 D5:2 B4:4 | A4:4 B4:2 D5:2 E5:8 | G5:2 A5:2 G5:2 E5:2 D5:4 E5:4 | D5:12 .:4',
             'B4:2 D5:2 E5:4 G5:4 E5:4 | D5:4 B4:4 A4:8 | B4:2 A4:2 G4:4 A4:4 B4:4 | A4:12 .:4'),
    harm: offbeat('A4 G4 B4 A4 G4 E4 D4 E4'),
    bass: 'D2:8 A1:8 | G1:8 D2:8 | E2:8 A1:8 | D2:16 | G1:8 E2:8 | B1:8 E2:8 | G1:8 A1:8 | D2:16',
    drum: bars(8, 'w:4 .:2 w:2 .:4 k:4'), vol: { harm: .7 } },
  mystery_jp: { bpm: 66, duty: .5,
    lead: ab('E5:8 F5:4 E5:4 | B4:12 .:4 | C5:6 B4:2 A4:4 F4:4 | E4:12 .:4', 'A4:6 B4:2 C5:8 | E5:4 F5:4 E5:8 | C5:4 B4:4 A4:4 F4:4 | E4:16'),
    harm: bars(8, 'E4:1 .:7 B4:1 .:7'),
    bass: 'E2:16 | E2:16 | F2:16 | E2:16 | A1:16 | F2:16 | F2:8 B1:8 | E2:16',
    drum: bars(4, 'k:16 | .:8 w:8') },
  sad_jp: { bpm: 60, pluck: true,
    lead: ab('A4:4 Bb4:4 A4:4 F4:4 | E4:8 D4:8 | F4:4 E4:2 D4:2 E4:4 A4:4 | A4:12 .:4', 'D5:4 E5:4 F5:6 E5:2 | D5:4 Bb4:4 A4:8 | Bb4:4 A4:4 F4:4 E4:4 | A3:12 .:4'),
    harm: chords('A3 E4 A4 E4', 'D4 F4 A4 F4', 'E4 Bb4 D5 Bb4', 'A3 E4 A4 E4', 'D4 F4 A4 F4', 'Bb3 D4 F4 D4', 'E4 Bb4 D5 Bb4', 'A3 E4 A4 E4'),
    bass: 'A1:16 | D2:16 | Bb1:16 | A1:16 | D2:16 | Bb1:16 | E2:16 | A1:16', vol: { harm: .5 } },
  battle_jp: { bpm: 140,
    lead: ab('E5:2 E5:2 F5:2 E5:2 B4:4 C5:4 | A4:2 B4:2 C5:2 B4:2 F4:8 | E4:2 F4:2 A4:2 B4:2 C5:4 E5:4 | F5:4 E5:4 B4:8',
             'E5:4 F5:2 E5:2 C5:4 B4:4 | A4:4 B4:2 A4:2 F4:8 | F4:2 A4:2 B4:2 C5:2 E5:2 F5:2 E5:4 | E5:12 .:4'),
    harm: offbeat('B4 A4 B4 B4 B4 A4 B4 B4'),
    bass: octaves('E2 F2 E2 E2 A1 F2 F2 E2'),
    drum: bars(8, 'k:2 w:2 k:2 .:2 k:2 w:2 s:4') },
  court_jp: { bpm: 56, duty: .5,
    lead: ab('D5:8 E5:8 | A4:12 .:4 | G4:4 A4:4 B4:8 | A4:16', 'B4:8 D5:4 E5:4 | D5:8 B4:8 | A4:4 G4:4 E4:8 | D4:16'),
    harm: 'E5:16 | E5:16 | D5:16 | E5:16 | D5:16 | E5:16 | B4:16 | A4:16',
    bass: 'D2:16 | A1:16 | G1:16 | D2:16 | G1:16 | B1:16 | A1:16 | D2:16',
    drum: bars(4, 'k:8 .:8 | .:8 w:4 w:4'), vol: { harm: .6 } },
  road_jp: { bpm: 108, pluck: true,
    lead: ab('G4:2 A4:2 B4:2 D5:2 E5:4 D5:4 | B4:2 A4:2 G4:4 A4:8 | B4:2 D5:2 E5:2 G5:2 A5:4 G5:4 | E5:12 .:4',
             'D5:2 E5:2 D5:2 B4:2 A4:4 G4:4 | A4:2 B4:2 D5:4 E5:8 | D5:2 B4:2 A4:2 G4:2 E4:4 A4:4 | G4:12 .:4'),
    harm: offbeat('D5 D5 E5 E5 D5 D5 B4 B4'),
    bass: octaves('G2 E2 G2 E2 D2 E2 D2 G2'),
    drum: bars(8, 'k:4 w:4 k:2 k:2 w:4') },

  // 中国（cn）：五声音階、二胡のような長い音・琵琶の撥、銅鑼
  tale_cn: { bpm: 88, pluck: true, duty: .25,
    lead: ab('D5:2 E5:2 D5:2 B4:2 A4:4 G4:4 | A4:2 B4:2 D5:4 E5:8 | G5:4 E5:2 D5:2 B4:4 D5:4 | A4:12 .:4',
             'E5:4 G5:4 A5:4 G5:2 E5:2 | D5:4 E5:2 D5:2 B4:8 | A4:2 B4:2 D5:2 E5:2 D5:4 B4:4 | G4:12 .:4'),
    harm: offbeat('B4 D5 B4 A4 B4 B4 D5 B4'),
    bass: 'G2:8 D2:8 | E2:8 A1:8 | G2:8 B1:8 | D2:16 | C2:8 E2:8 | G2:8 B1:8 | A1:8 D2:8 | G1:16',
    drum: bars(8, 'k:4 h:2 h:2 w:4 h:4'), vol: { harm: .7 } },
  mystery_cn: { bpm: 70, duty: .25,
    lead: ab('A4:6 C5:2 D5:8 | E5:4 D5:4 C5:8 | D5:4 C5:2 A4:2 G4:4 E4:4 | A4:16', 'C5:4 D5:4 E5:4 G5:4 | E5:12 D5:4 | C5:4 A4:4 G4:4 C5:4 | A4:12 .:4'),
    harm: bars(8, '.:4 E4:2 .:2 .:4 A4:2 .:2'),
    bass: 'A1:16 | D2:16 | G1:16 | A1:16 | C2:16 | E2:16 | G1:8 E2:8 | A1:16',
    drum: bars(4, 'g:16 | .:16') },
  sad_cn: { bpm: 62, duty: .25,
    lead: ab('E5:6 D5:2 C5:4 A4:4 | G4:4 A4:4 C5:8 | D5:4 E5:2 D5:2 C5:4 A4:4 | A4:12 .:4', 'G4:4 A4:2 C5:2 D5:4 E5:4 | G5:6 E5:2 D5:8 | C5:4 D5:2 C5:2 A4:4 G4:4 | A4:16'),
    harm: chords('A3 E4 A4 E4', 'C4 G4 C5 G4', 'D4 A4 D5 A4', 'A3 E4 A4 E4', 'G3 D4 G4 D4', 'E4 A4 C5 A4', 'D4 A4 D5 A4', 'A3 E4 A4 E4'),
    bass: 'A1:16 | C2:16 | D2:16 | A1:16 | G1:16 | E2:16 | D2:16 | A1:16', vol: { harm: .5 } },
  battle_cn: { bpm: 144,
    lead: ab('D5:2 D5:2 E5:2 F#5:2 A5:4 F#5:4 | E5:2 D5:2 B4:2 A4:2 D5:8 | A4:2 B4:2 D5:2 E5:2 F#5:2 E5:2 D5:4 | B4:4 A4:4 D5:8',
             'F#5:4 A5:4 B5:4 A5:4 | F#5:2 E5:2 D5:2 E5:2 F#5:8 | E5:2 D5:2 B4:2 A4:2 B4:2 D5:2 E5:4 | D5:12 .:4'),
    harm: offbeat('A4 B4 A4 A4 D5 A4 B4 A4'),
    bass: octaves('D2 B1 D2 D2 D2 A1 B1 D2'),
    drum: bars(4, 'g:4 k:2 k:2 s:2 k:2 s:4 | k:2 k:2 s:4 k:2 k:2 s:4') },
  court_cn: { bpm: 72,
    lead: ab('F5:4 G5:4 A5:8 | C6:4 A5:4 G5:8 | F5:4 D5:4 C5:4 D5:4 | F5:16', 'A5:4 C6:4 D6:4 C6:4 | A5:8 G5:8 | F5:4 G5:2 F5:2 D5:4 C5:4 | F5:16'),
    harm: chords('F4 A4 C5 A4', 'F4 A4 C5 A4', 'D4 F4 A4 F4', 'C4 F4 A4 F4', 'F4 A4 D5 A4', 'D4 G4 C5 G4', 'Bb3 D4 F4 D4', 'C4 F4 A4 F4'),
    bass: 'F2:16 | F2:16 | D2:16 | C2:16 | D2:16 | G1:16 | Bb1:16 | F2:16',
    drum: bars(4, 'g:8 k:8 | k:8 w:4 w:4'), vol: { harm: .5 } },
  festival_cn: { bpm: 120, pluck: true,
    lead: ab('E5:2 G5:2 A5:2 G5:2 E5:2 D5:2 C5:4 | D5:2 E5:2 G5:4 E5:8 | A5:2 G5:2 E5:2 D5:2 E5:2 G5:2 A5:4 | G5:12 .:4',
             'C6:4 A5:4 G5:2 A5:2 G5:4 | E5:2 D5:2 C5:4 D5:8 | E5:2 D5:2 C5:2 A4:2 G4:4 A4:4 | C5:12 .:4'),
    harm: offbeat('G4 G4 C5 G4 E4 G4 E4 G4'),
    bass: octaves('C2 G1 A1 C2 A1 G1 A1 C2'),
    drum: bars(8, 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 w:2') },

  // 欧米（west）：和声的短音階、オルゴール・チェンバロ・オルガン風
  tale_west: { bpm: 100, pluck: true, duty: .125,   // オルゴールのワルツ（1 小節 12 拍）
    lead: 'G5:4 D5:4 Bb4:4 | A4:6 Bb4:2 C5:4 | D5:4 G5:4 F5:4 | D5:12 | Eb5:4 D5:4 C5:4 | Bb4:6 A4:2 G4:4 | A4:4 Bb4:4 F#4:4 | G4:12',
    harm: 'G4:4 Bb4:4 Bb4:4 | F#4:4 A4:4 A4:4 | G4:4 Bb4:4 Bb4:4 | G4:4 Bb4:4 Bb4:4 | G4:4 C5:4 C5:4 | G4:4 D5:4 D5:4 | F#4:4 C5:4 C5:4 | G4:4 Bb4:4 Bb4:4',
    bass: 'G2:12 | D2:12 | G2:12 | G2:12 | C2:12 | G2:12 | D2:12 | G2:12',
    drum: bars(8, 'k:4 h:4 h:4'), vol: { harm: .6, drum: .5 } },
  mystery_west: { bpm: 76, duty: .125,
    lead: ab('D5:2 F5:2 Ab5:2 B5:2 D6:8 | C#6:4 Bb5:4 A5:8 | G5:2 Bb5:2 Db6:2 E6:2 G5:8 | A5:12 .:4', 'F5:4 E5:4 D5:4 C#5:4 | D5:8 A4:8 | Bb4:4 A4:4 G#4:4 A4:4 | D4:12 .:4'),
    harm: chords16('D4 F4 Ab4 B4', 'A3 C#4 E4 G4', 'E4 G4 Bb4 Db5', 'A3 C#4 E4 A4', 'D4 F4 A4 F4', 'A3 C#4 E4 C#4', 'Bb3 D4 E4 G4', 'D4 F4 A4 D5'),
    bass: 'D2:16 | A1:16 | E2:16 | A1:16 | D2:16 | A1:16 | Bb1:8 E2:8 | D2:16',
    drum: bars(8, 'h:4 .:4 h:4 .:4'), vol: { harm: .45, drum: .5 } },
  sad_west: { bpm: 58, duty: .5,   // オルガンのコラール
    lead: ab('G4:8 Ab4:4 G4:4 | F4:8 Eb4:8 | D4:4 Eb4:4 F4:4 G4:4 | G4:16', 'C5:8 Bb4:4 Ab4:4 | G4:8 F4:8 | Eb4:4 D4:4 C4:4 D4:4 | C4:16'),
    harm: 'Eb4:16 | C4:16 | B3:16 | B3:16 | Eb4:16 | Eb4:8 D4:8 | C4:8 B3:8 | G3:16',
    bass: 'C2:16 | Ab1:16 | G1:16 | G1:16 | Ab1:16 | Eb2:8 Bb1:8 | Ab1:8 G1:8 | C2:16', vol: { harm: .9 } },
  battle_west: { bpm: 152,
    lead: ab('E5:2 B4:2 E5:2 G5:2 F#5:2 E5:2 D#5:4 | E5:2 B4:2 C5:2 A4:2 B4:8 | G4:2 A4:2 B4:2 C5:2 D5:2 E5:2 F#5:4 | G5:4 F#5:4 E5:8',
             'C5:2 E5:2 A5:2 E5:2 C5:2 E5:2 A5:4 | B4:2 D#5:2 F#5:2 D#5:2 B5:8 | A5:2 G5:2 F#5:2 E5:2 D#5:2 C5:2 B4:4 | E5:12 .:4'),
    harm: offbeat('G4 A4 G4 F#4 A4 F#4 A4 G4'),
    bass: octaves('E2 A1 E2 B1 A1 B1 B1 E2'),
    drum: bars(8, 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2') },

  // ---- 地域版の別の版（作品ごとにどれか 1 つ） ----
  // 日本
  tale_jp2: { bpm: 76, duty: .25,   // 律の笛
    lead: ab('G4:4 A4:4 C5:4 D5:4 | E5:8 D5:4 C5:4 | A4:4 C5:2 A4:2 G4:8 | A4:12 .:4', 'C5:4 D5:4 E5:4 G5:4 | E5:6 D5:2 C5:8 | D5:4 C5:2 A4:2 G4:4 E4:4 | G4:12 .:4'),
    harm: offbeat('D5 E5 C5 D5 E5 C5 A4 D5'),
    bass: 'G1:16 | C2:16 | E2:8 D2:8 | A1:16 | C2:16 | A1:16 | D2:16 | G1:16',
    drum: bars(4, 'w:4 .:12 | .:8 w:4 .:4'), vol: { harm: .6 } },
  tale_jp3: { bpm: 72, pluck: true,   // 都節の琴の語り
    lead: ab('A4:2 Bb4:2 D5:4 E5:4 D5:4 | F5:4 E5:4 D5:8 | Bb4:2 A4:2 F4:4 E4:4 F4:4 | A4:12 .:4', 'E5:4 F5:2 E5:2 D5:4 Bb4:4 | A4:4 Bb4:4 D5:8 | E5:2 D5:2 Bb4:2 A4:2 F4:4 E4:4 | A4:12 .:4'),
    harm: chords('A3 E4 A4 E4', 'D4 A4 D5 A4', 'Bb3 F4 Bb4 F4', 'A3 E4 A4 E4', 'D4 A4 D5 A4', 'Bb3 F4 Bb4 F4', 'E4 Bb4 E5 Bb4', 'A3 E4 A4 E4'),
    bass: 'A1:16 | D2:16 | Bb1:16 | A1:16 | D2:16 | Bb1:16 | E2:16 | A1:16', vol: { harm: .45 } },
  tale_jp4: { bpm: 96, pluck: true, duty: .125,   // 陽音階の三味線の民謡
    lead: ab('C5:2 D5:2 F5:2 G5:2 A5:4 G5:4 | F5:2 D5:2 C5:4 D5:8 | F5:2 G5:2 A5:2 C6:2 A5:4 G5:4 | F5:12 .:4', 'A5:4 G5:2 F5:2 D5:4 C5:4 | D5:2 F5:2 G5:4 A5:8 | G5:2 F5:2 D5:2 C5:2 A4:4 D5:4 | C5:12 .:4'),
    harm: offbeat('A4 A4 C5 A4 C5 C5 A4 G4'),
    bass: octaves('C2 D2 F2 F2 D2 G1 D2 C2'),
    drum: bars(8, 'k:4 w:2 w:2 .:4 w:4') },
  mystery_jp2: { bpm: 60, pluck: true,   // 琵琶の低い撥
    lead: ab('B3:4 C4:4 B3:8 | E4:4 F#4:4 G4:8 | F#4:4 E4:4 C4:4 B3:4 | B3:16', 'E4:4 G4:4 B4:8 | C5:6 B4:2 G4:8 | F#4:4 G4:4 E4:4 C4:4 | B3:12 .:4'),
    harm: bars(8, '.:12 F#4:4'),
    bass: 'B1:16 | E2:16 | C2:16 | B1:16 | E2:16 | C2:16 | C2:8 F#1:8 | B1:16',
    drum: bars(4, 'w:2 w:2 .:12 | .:16') },
  mystery_jp3: { bpm: 64, duty: .125,   // 能管の鋭い高音
    lead: ab('A5:12 Bb5:4 | A5:8 .:8 | E5:4 F5:4 A5:4 Bb5:4 | E6:12 .:4', 'D6:8 Bb5:8 | A5:8 F5:8 | E5:4 F5:2 E5:2 D5:4 Bb4:4 | A4:12 .:4'),
    harm: bars(8, 'A3:2 .:14'),
    bass: 'A1:16 | A1:16 | Bb1:16 | A1:16 | D2:16 | F1:16 | E2:16 | A1:16',
    drum: bars(4, 'k:4 .:12 | k:2 k:2 .:12') },
  sad_jp2: { bpm: 64, duty: .5,   // 民謡の哀調の笛
    lead: ab('A4:6 G4:2 F4:8 | G4:4 A4:4 C5:8 | D5:4 C5:2 A4:2 G4:4 F4:4 | D4:16', 'F4:4 G4:4 A4:4 C5:4 | D5:8 C5:8 | A4:4 G4:4 F4:4 G4:4 | D4:12 .:4'),
    harm: 'F4:16 | C4:16 | F4:16 | A3:16 | A3:16 | F4:16 | C4:16 | A3:16',
    bass: 'D2:16 | C2:16 | Bb1:16 | D2:16 | F1:16 | Bb1:16 | C2:16 | D2:16', vol: { harm: .6 } },
  sad_jp3: { bpm: 56, pluck: true,   // 都節の琴の哀しみ
    lead: ab('B4:4 C5:4 B4:8 | A4:4 F4:4 E4:8 | F4:2 A4:2 B4:4 C5:4 E5:4 | B4:12 .:4', 'E5:4 F5:4 E5:4 C5:4 | B4:8 A4:8 | C5:4 B4:4 A4:4 F4:4 | E4:12 .:4'),
    harm: chords('E4 B4 E5 B4', 'A3 E4 A4 E4', 'F4 C5 F5 C5', 'E4 B4 E5 B4', 'A3 E4 A4 E4', 'F4 C5 F5 C5', 'A3 E4 A4 E4', 'E4 B4 E5 B4'),
    bass: 'E2:16 | A1:16 | F2:16 | E2:16 | A1:16 | F2:16 | A1:8 B1:8 | E2:16', vol: { harm: .45 } },
  battle_jp2: { bpm: 150,   // 陽音階の太鼓
    lead: ab('A4:2 B4:2 D5:2 E5:2 F#5:4 E5:4 | D5:2 B4:2 A4:2 B4:2 D5:8 | E5:2 F#5:2 A5:2 F#5:2 E5:2 D5:2 B4:4 | A4:12 .:4', 'F#5:4 E5:2 D5:2 E5:4 F#5:4 | A5:4 F#5:4 E5:8 | D5:2 E5:2 D5:2 B4:2 A4:2 B4:2 D5:4 | A4:12 .:4'),
    harm: offbeat('E5 D5 E5 E5 F#5 E5 D5 E5'),
    bass: octaves('A1 D2 A1 A1 D2 A1 D2 A1'),
    drum: bars(8, 'k:2 k:2 w:2 k:2 k:2 w:2 s:2 w:2') },
  court_jp2: { bpm: 52, duty: .5,   // 雅楽の笙と篳篥
    lead: ab('E5:8 F#5:4 E5:4 | B4:8 C#5:8 | A4:4 B4:4 E5:8 | B4:16', 'C#5:8 E5:8 | F#5:4 E5:4 C#5:8 | B4:4 A4:4 F#4:8 | E4:16'),
    harm: 'B4:16 | B4:16 | C#5:16 | B4:16 | A4:16 | B4:16 | A4:16 | B4:16',
    bass: 'E2:16 | E2:16 | A1:16 | E2:16 | A1:16 | F#1:16 | B1:16 | E2:16',
    drum: bars(4, 'k:4 .:12 | w:2 .:6 k:8'), vol: { harm: .6 } },
  road_jp2: { bpm: 100, duty: .25,   // 馬子唄と鈴
    lead: ab('A4:4 B4:2 D5:2 E5:4 D5:4 | B4:4 A4:4 D4:8 | E4:2 G4:2 A4:2 B4:2 D5:4 B4:4 | A4:12 .:4', 'D5:4 E5:4 G5:4 E5:4 | D5:4 B4:2 A4:2 B4:8 | A4:2 B4:2 A4:2 G4:2 E4:4 G4:4 | D4:12 .:4'),
    harm: offbeat('D5 D5 B4 D5 B4 D5 B4 A4'),
    bass: 'D2:8 A1:8 | G1:8 D2:8 | E2:8 B1:8 | A1:8 D2:8 | G1:8 E2:8 | G1:8 B1:8 | A1:8 E2:8 | D2:16',
    drum: bars(8, 'k:4 h:2 h:2 k:4 h:2 h:2') },
  // 中国
  tale_cn2: { bpm: 80, duty: .25,   // 宮調の二胡
    lead: ab('C5:4 D5:4 F5:6 G5:2 | A5:4 G5:4 F5:8 | D5:4 F5:2 D5:2 C5:4 A4:4 | C5:12 .:4', 'F5:4 G5:4 A5:4 C6:4 | A5:6 G5:2 F5:8 | G5:4 F5:2 D5:2 C5:4 D5:4 | F5:12 .:4'),
    harm: chords('F4 A4 C5 A4', 'F4 A4 C5 A4', 'D4 F4 A4 F4', 'C4 G4 C5 G4', 'F4 A4 C5 A4', 'D4 F4 A4 F4', 'C4 G4 C5 G4', 'F4 A4 C5 A4'),
    bass: 'F2:16 | F2:16 | D2:16 | C2:16 | F2:16 | D2:16 | C2:16 | F2:16',
    drum: bars(8, 'w:4 .:4 w:2 w:2 .:4'), vol: { harm: .45 } },
  tale_cn3: { bpm: 92, pluck: true,   // 商調の琵琶のトレモロ
    lead: ab('D5:1 D5:1 D5:1 D5:1 E5:4 G5:4 E5:4 | D5:4 C5:4 A4:8 | C5:2 D5:2 E5:2 G5:2 A5:4 G5:4 | E5:12 .:4', 'A5:1 A5:1 A5:1 A5:1 G5:4 E5:4 D5:4 | E5:4 G5:4 A5:8 | G5:2 E5:2 D5:2 C5:2 A4:4 C5:4 | D5:12 .:4'),
    harm: offbeat('A4 E4 A4 G4 A4 C5 A4 A4'),
    bass: 'D2:8 A1:8 | C2:8 A1:8 | C2:8 G1:8 | A1:16 | D2:8 C2:8 | C2:8 A1:8 | G1:8 A1:8 | D2:16',
    drum: bars(8, 'k:4 w:4 h:4 w:4') },
  tale_cn4: { bpm: 70, pluck: true,   // 古琴の低い語り
    lead: ab('D4:4 G4:4 A4:6 B4:2 | D5:4 B4:4 A4:8 | G4:2 A4:2 B4:4 D5:4 E5:4 | D5:12 .:4', 'E5:4 D5:2 B4:2 A4:4 G4:4 | A4:4 B4:4 E4:8 | G4:4 A4:2 G4:2 E4:4 D4:4 | G4:12 .:4'),
    harm: chords('G3 D4 G4 D4', 'B3 D4 G4 D4', 'E3 B3 E4 B3', 'D3 A3 D4 A3', 'C4 E4 G4 E4', 'E3 A3 E4 A3', 'C4 E4 A4 E4', 'G3 D4 G4 D4'),
    bass: 'G1:16 | B1:16 | E2:16 | D2:16 | C2:16 | A1:16 | C2:8 D2:8 | G1:16', vol: { harm: .4 } },
  tale_cn5: { bpm: 104, pluck: true, duty: .25,   // 揚琴の細かい打弦
    lead: ab('E5:1 F#5:1 E5:1 C#5:1 B4:4 A4:4 C#5:4 | E5:2 F#5:2 A5:4 F#5:8 | E5:1 F#5:1 E5:1 C#5:1 B4:2 C#5:2 E5:4 B4:4 | A4:12 .:4', 'F#5:1 A5:1 F#5:1 E5:1 C#5:4 E5:4 F#5:4 | A5:2 B5:2 A5:4 E5:8 | F#5:2 E5:2 C#5:2 B4:2 A4:2 B4:2 C#5:4 | A4:12 .:4'),
    harm: offbeat('C#5 C#5 B4 C#5 C#5 C#5 B4 C#5'),
    bass: 'A1:8 E2:8 | F#1:8 C#2:8 | E2:8 B1:8 | A1:16 | F#1:8 C#2:8 | A1:8 E2:8 | B1:8 E2:8 | A1:16',
    drum: bars(8, 'k:4 h:2 h:2 w:4 h:4') },
  mystery_cn2: { bpm: 66, pluck: true,   // 角調の低い琵琶と銅鑼
    lead: ab('E4:2 E4:2 G4:4 A4:8 | B4:4 A4:4 G4:8 | D5:4 B4:2 A4:2 G4:4 E4:4 | E4:16', 'B4:4 D5:4 E5:8 | D5:4 B4:4 A4:8 | G4:4 A4:2 G4:2 E4:4 D4:4 | E4:12 .:4'),
    harm: bars(8, 'B3:2 .:6 E4:2 .:6'),
    bass: 'E2:16 | A1:16 | G1:16 | E2:16 | E2:16 | B1:16 | D2:8 B1:8 | E2:16',
    drum: bars(4, '.:16 | g:16') },
  mystery_cn3: { bpm: 72, duty: .125,   // 笛子の高い音
    lead: ab('E6:8 D6:4 C6:4 | A5:12 .:4 | G5:4 A5:4 C6:4 D6:4 | E6:16', 'D6:4 C6:4 A5:8 | G5:8 E5:8 | D5:4 E5:4 G5:4 A5:4 | A5:12 .:4'),
    harm: bars(8, 'A3:4 .:4 E4:4 .:4'),
    bass: 'A1:16 | F1:16 | C2:16 | A1:16 | D2:16 | C2:16 | G1:16 | A1:16',
    drum: bars(8, 'w:2 .:14'), vol: { harm: .5 } },
  sad_cn2: { bpm: 58, duty: .25,   // 羽調の二胡
    lead: ab('A4:6 C5:2 D5:8 | C5:4 A4:4 G4:8 | F4:4 G4:2 A4:2 C5:4 A4:4 | D4:16', 'F4:4 G4:4 A4:4 C5:4 | D5:6 F5:2 D5:8 | C5:4 A4:2 G4:2 F4:4 G4:4 | D4:12 .:4'),
    harm: chords('D4 A4 D5 A4', 'F4 A4 C5 A4', 'Bb3 F4 Bb4 F4', 'D4 A4 D5 A4', 'F4 C5 F5 C5', 'D4 A4 D5 A4', 'C4 G4 C5 G4', 'D4 A4 D5 A4'),
    bass: 'D2:16 | F2:16 | Bb1:16 | D2:16 | F1:16 | D2:16 | C2:16 | D2:16', vol: { harm: .45 } },
  sad_cn3: { bpm: 54, pluck: true,   // 古箏の哀しみ
    lead: ab('E5:2 D5:2 C5:4 A4:8 | G4:2 A4:2 C5:4 D5:8 | E5:4 G5:4 E5:2 D5:2 C5:4 | A4:12 .:4', 'C5:2 D5:2 E5:4 G5:8 | A5:4 G5:4 E5:8 | D5:2 E5:2 D5:2 C5:2 A4:4 G4:4 | A4:12 .:4'),
    harm: chords('A3 E4 A4 E4', 'C4 G4 C5 G4', 'A3 E4 A4 E4', 'A3 E4 A4 E4', 'C4 G4 C5 G4', 'E4 A4 C5 A4', 'D4 A4 D5 A4', 'A3 E4 A4 E4'),
    bass: 'A1:16 | C2:16 | A1:16 | A1:16 | C2:16 | E2:16 | D2:16 | A1:16', vol: { harm: .4 } },
  battle_cn2: { bpm: 150,   // 徴調の銅鑼と太鼓
    lead: ab('G5:2 E5:2 D5:2 E5:2 G5:4 A5:4 | B5:2 A5:2 G5:2 E5:2 D5:8 | E5:2 G5:2 A5:2 B5:2 D6:4 B5:4 | A5:12 .:4', 'D6:4 B5:2 A5:2 G5:4 E5:4 | D5:2 E5:2 G5:2 A5:2 B5:8 | A5:2 G5:2 E5:2 D5:2 E5:2 G5:2 A5:4 | G5:12 .:4'),
    harm: offbeat('D5 D5 E5 D5 D5 D5 E5 D5'),
    bass: octaves('G1 E2 G1 D2 G1 G1 D2 G1'),
    drum: bars(4, 'g:2 k:2 s:2 k:2 k:2 s:2 k:2 s:2 | k:2 s:2 k:2 s:2 k:2 k:2 s:4') },
  court_cn2: { bpm: 64, pluck: true, duty: .125,   // 編鐘
    lead: ab('C5:4 E5:4 G5:8 | A5:4 G5:4 E5:8 | D5:4 E5:4 G5:4 E5:4 | C5:16', 'G5:4 A5:4 C6:8 | A5:4 G5:4 E5:8 | D5:4 C5:4 A4:4 D5:4 | C5:16'),
    harm: chords('C4 G4 C5 G4', 'A3 E4 A4 E4', 'G3 D4 G4 D4', 'C4 G4 C5 G4', 'E4 G4 C5 G4', 'A3 E4 A4 E4', 'D4 A4 D5 A4', 'C4 G4 C5 G4'),
    bass: 'C2:16 | A1:16 | G1:16 | C2:16 | E2:16 | A1:16 | D2:16 | C2:16',
    drum: bars(4, 'g:16 | w:4 .:12'), vol: { harm: .45 } },
  festival_cn2: { bpm: 128, duty: .5,   // 嗩吶のにぎやかな吹奏
    lead: ab('A5:2 B5:2 A5:2 F#5:2 E5:2 F#5:2 A5:4 | B5:2 A5:2 F#5:2 E5:2 D5:8 | E5:2 F#5:2 A5:2 B5:2 D6:2 B5:2 A5:4 | F#5:12 .:4', 'D6:4 B5:4 A5:2 B5:2 A5:4 | F#5:2 E5:2 D5:4 E5:8 | F#5:2 A5:2 F#5:2 E5:2 D5:2 E5:2 F#5:4 | D5:12 .:4'),
    harm: offbeat('F#4 F#4 A4 F#4 F#4 E4 F#4 F#4'),
    bass: octaves('D2 B1 D2 D2 B1 A1 A1 D2'),
    drum: bars(8, 'k:2 s:2 h:2 s:2 k:2 h:2 s:2 w:2') },
  // 欧米
  tale_west2: { bpm: 92, pluck: true, duty: .25,   // チェンバロのメヌエット
    lead: ab('A4:2 C5:2 E5:2 A5:2 G#5:4 E5:4 | F5:2 E5:2 D5:2 C5:2 B4:8 | C5:2 E5:2 A5:2 C6:2 B5:4 A5:4 | G#5:12 .:4', 'A5:4 F5:4 D5:4 F5:4 | E5:4 C5:4 A4:8 | D5:2 C5:2 B4:2 A4:2 G#4:4 B4:4 | A4:12 .:4'),
    harm: chords('A3 C4 E4 C4', 'D4 F4 A4 F4', 'A3 C4 E4 C4', 'E3 G#3 B3 G#3', 'D4 F4 A4 F4', 'A3 C4 E4 C4', 'E3 G#3 B3 E4', 'A3 C4 E4 C4'),
    bass: 'A2:4 E2:4 A2:4 E2:4 | D2:4 A1:4 E2:4 E1:4 | A2:4 E2:4 A1:4 C2:4 | E2:4 B1:4 E2:4 E1:4 | D2:4 A1:4 D2:4 F2:4 | A1:4 C2:4 E2:4 A1:4 | D2:4 F2:4 E2:4 E1:4 | A1:16', vol: { harm: .5 } },
  mystery_west2: { bpm: 70, duty: .5,   // 時計の音と半音で下る低い旋律
    lead: ab('E4:8 D#4:8 | D4:8 C#4:8 | C4:4 B3:4 C4:4 E4:4 | B3:16', 'G4:8 F#4:8 | F4:8 E4:8 | D#4:4 E4:4 F#4:4 A4:4 | B4:12 .:4'),
    harm: bars(8, 'B4:1 .:3 B4:1 .:3 B4:1 .:3 B4:1 .:3'),
    bass: 'E2:16 | B1:16 | A1:16 | B1:16 | C2:16 | A1:16 | F#1:16 | B1:16',
    drum: bars(8, 'h:4 h:4 h:4 h:4'), vol: { harm: .5, drum: .4 } },
  sad_west2: { bpm: 66, pluck: true, duty: .125,   // オルゴールの子守歌
    lead: ab('C6:4 Ab5:4 F5:8 | G5:4 Ab5:4 Bb5:8 | Ab5:4 G5:4 F5:4 E5:4 | F5:16', 'Db6:4 C6:4 Bb5:8 | Ab5:4 G5:4 F5:8 | Bb5:4 Ab5:4 G5:4 E5:4 | F5:12 .:4'),
    harm: chords('F4 Ab4 C5 Ab4', 'Eb4 G4 Bb4 G4', 'F4 Ab4 C5 Ab4', 'F4 Ab4 C5 Ab4', 'Db4 F4 Ab4 F4', 'F4 Ab4 C5 Ab4', 'Bb3 Db4 F4 Db4', 'F4 Ab4 C5 Ab4'),
    bass: 'F2:16 | Eb2:16 | C2:16 | F2:16 | Db2:16 | F2:16 | C2:16 | F2:16', vol: { harm: .4 } },
  sad_west3: { bpm: 60, duty: .25,   // チェロのような低い哀歌
    lead: ab('A4:8 G4:4 F4:4 | E4:8 D4:8 | F4:4 G4:4 A4:4 C5:4 | Bb4:12 .:4', 'D5:8 C5:4 Bb4:4 | A4:8 G4:4 F4:4 | E4:4 F4:4 G4:4 E4:4 | D4:16'),
    harm: chords('D4 F4 A4 F4', 'A3 C#4 E4 C#4', 'D4 F4 A4 F4', 'G3 Bb3 D4 Bb3', 'Bb3 D4 F4 D4', 'D4 F4 A4 F4', 'A3 C#4 E4 C#4', 'D4 F4 A4 F4'),
    bass: 'D2:16 | A1:16 | F2:16 | G1:16 | Bb1:16 | D2:16 | A1:16 | D2:16', vol: { harm: .45 } },
  battle_west2: { bpm: 160,   // 駆ける馬のような 3 連の刻み
    lead: ab('D5:2 D5:1 D5:1 F5:2 F5:1 F5:1 A5:4 G5:4 | F5:2 E5:2 D5:2 C#5:2 D5:8 | Bb4:2 Bb4:1 Bb4:1 D5:2 D5:1 D5:1 G5:4 F5:4 | E5:12 .:4', 'A5:2 A5:1 A5:1 Bb5:2 A5:2 G5:4 F5:4 | E5:2 F5:2 G5:2 E5:2 C#5:8 | D5:2 E5:2 F5:2 G5:2 A5:2 G5:2 F5:2 E5:2 | D5:12 .:4'),
    harm: offbeat('A4 A4 G4 A4 A4 G4 A4 A4'),
    bass: octaves('D2 A1 G1 A1 F1 A1 Bb1 D2'),
    drum: bars(8, 'k:2 h:1 h:1 s:2 h:2 k:2 k:1 k:1 s:4') },
});
// 最後の題名で鳴らす静かな版（遅く、打楽器なし）
for (const k of Object.keys(SONGS).filter(k => k.endsWith('Theme'))) {
  const { drum, ...rest } = SONGS[k];
  SONGS[k + 'Calm'] = { ...rest, bpm: Math.round(SONGS[k].bpm * .78), vol: { ...SONGS[k].vol, lead: .8 } };
}
