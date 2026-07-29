'use strict';
/* MS PACMANA — an original arcade-style maze chase built for iPhone.
   Original maze layouts, hand-rasterized pixel sprites and synthesized audio. */

// ---------------------------------------------------------------- constants
const T = 8, COLS = 28, ROWS = 31;
const BOARD_Y = 24;                 // board offset (3 HUD rows on top)
const W = COLS * T, H = BOARD_Y + ROWS * T + 16; // 224 x 288
const BASE_SPEED = 60;              // px/s at "100%"
const DIRS = { up: {x:0,y:-1}, down: {x:0,y:1}, left: {x:-1,y:0}, right: {x:1,y:0} };
const OPP = { up:'down', down:'up', left:'right', right:'left' };
const DOOR_X = 14 * T;              // ghost-house door center x (112)
const DOOR_Y = 11 * T + 4;          // just above the door (row 11 center)
const HOUSE_Y = 14 * T + 4;         // inside the house
const START_Y = 23 * T + 4;

// Left halves (14 chars) mirrored to 28 cols. '#'wall '.'pellet 'o'power ' 'open '-'door
const MAZE_HALVES = {
  A: ["##############","#......#......","#.####.#.###.#","#o####.#.###.#","#.####.#......",
      "#......#.#####","#.####.#.#####","#.####.#.#####","#......#......","######.####.##",
      "######.####.##","######        ","######### ###-","######### #   ","          #   ",
      "######### ####","#########     ","######### ####","######### ####","######### ####",
      "#......#......","#.####.#.###.#","#o####.#.###.#","#......#......","#.####.#.#####",
      "#.####.#.#####","#......#......","#.##.#####.###","#.##.#####.###","#.............",
      "##############"],
  B: ["##############","#.............","#.####.#####.#","#o####.#####.#","#.####.#####.#",
      "#.............","#.##.#####.###","#.##.#####.###","#.............","######.####.##",
      "######.####.##","######        ","######### ###-","######### #   ","          #   ",
      "######### ####","#########     ","######### ####","######### ####","######### ####",
      "#.............","#.####.#####.#","#o####.#####.#","#......#......","####.#.#.#####",
      "####.#.#.#####","#......#......","#.##.#####.###","#.##.#####.###","#.............",
      "##############"],
  C: ["##############","#......#......","#o####.#.###.#","#.####.#.###.#","#.####.#.###.#",
      "#.............","#.##.#####.#.#","#.##.#####.#.#","#.............","######.####.##",
      "######.####.##","######        ","######### ###-","######### #   ","          #   ",
      "######### ####","#########     ","######### ####","######### ####","######### ####",
      "#......#......","#.####.#.###.#","#.####.#.###.#","#o.....#......","####.#.#.#####",
      "####.#.#.#####","#......#......","#.##.#####.###","#.##.#####.###","#.............",
      "##############"],
  D: ["##############","#.............","#.##.#####.###","#o##.#####.###","#.##.#####.###",
      "#......#......","#.####.#.###.#","#.####.#.###.#","#......#......","######.####.##",
      "######.####.##","######        ","######### ###-","######### #   ","          #   ",
      "######### ####","#########     ","######### ####","######### ####","######### ####",
      "#.............","#.####.#####.#","#.####.#####.#","#o.....#......","#.####.#.#####",
      "#.####.#.#####","#......#......","#.##.#####.###","#.##.#####.###","#.............",
      "##############"],
};
const MAZE_COLORS = {
  A: { fill:'#d93b6b', edge:'#ffb8de', pellet:'#dedeff' },
  B: { fill:'#2f9fe0', edge:'#defaff', pellet:'#ffd23d' },
  C: { fill:'#c9812e', edge:'#ffe6b0', pellet:'#ff4a4a' },
  D: { fill:'#3c3ccf', edge:'#a0a0ff', pellet:'#dedeff' },
};
function mazeForLevel(lv) {
  if (lv <= 2) return 'A';
  if (lv <= 5) return 'B';
  if (lv <= 9) return 'C';
  if (lv <= 13) return 'D';
  return (Math.floor((lv - 14) / 4) % 2 === 0) ? 'C' : 'D';
}
function buildMaze(key) {
  return MAZE_HALVES[key].map(h => h + h.split('').reverse().join(''));
}

// fruit table: name, points, level it first appears
const FRUITS = [
  { name:'cherry',     pts:100 },
  { name:'strawberry', pts:200 },
  { name:'orange',     pts:500 },
  { name:'pretzel',    pts:700 },
  { name:'apple',      pts:1000 },
  { name:'pear',       pts:2000 },
  { name:'banana',     pts:5000 },
];
function fruitForLevel(lv) {
  return lv <= 7 ? FRUITS[lv - 1] : FRUITS[Math.floor(rand() * 7)];
}
// per-level tuning (percent of BASE_SPEED, fright seconds)
function levelSpec(lv) {
  if (lv === 1) return { pac:.80, ghost:.75, pacFr:.90, ghostFr:.50, tunnel:.40, fright:6 };
  if (lv <= 4)  return { pac:.90, ghost:.85, pacFr:.95, ghostFr:.55, tunnel:.45, fright:5 - (lv - 2) };
  if (lv <= 8)  return { pac:1.0, ghost:.95, pacFr:1.0, ghostFr:.60, tunnel:.50, fright:Math.max(0, 7 - lv) };
  return { pac:1.0, ghost:.95, pacFr:1.0, ghostFr:.60, tunnel:.50, fright:lv % 2 === 0 ? 1 : 0 };
}
function waveSchedule(lv) {
  return lv < 5 ? [7, 20, 7, 20, 5, 20, 5, Infinity] : [5, 20, 5, 20, 5, 20, 3, Infinity];
}
const SCATTER_TARGETS = { blinky:[0,25], pinky:[0,2], inky:[30,27], sue:[30,0] }; // [row,col]
const GHOST_COLORS = { blinky:'#ff0000', pinky:'#ffb8de', inky:'#00ffde', sue:'#ffb847' };

// deterministic-ish rng (plain Math.random is fine for gameplay)
function rand() { return Math.random(); }

// ---------------------------------------------------------------- canvas
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function fitCanvas() {
  const stage = document.getElementById('stage');
  const aw = stage.clientWidth, ah = stage.clientHeight;
  const s = Math.min(aw / W, ah / H);
  canvas.style.width = Math.floor(W * s) + 'px';
  canvas.style.height = Math.floor(H * s) + 'px';
}
addEventListener('resize', fitCanvas);
addEventListener('orientationchange', () => setTimeout(fitCanvas, 200));
fitCanvas();

// ---------------------------------------------------------------- 5x5 pixel font
const FONT = {
  A:["01110","10001","11111","10001","10001"], B:["11110","10001","11110","10001","11110"],
  C:["01111","10000","10000","10000","01111"], D:["11110","10001","10001","10001","11110"],
  E:["11111","10000","11110","10000","11111"], F:["11111","10000","11110","10000","10000"],
  G:["01111","10000","10011","10001","01111"], H:["10001","10001","11111","10001","10001"],
  I:["11111","00100","00100","00100","11111"], J:["00111","00010","00010","10010","01100"],
  K:["10001","10010","11100","10010","10001"], L:["10000","10000","10000","10000","11111"],
  M:["10001","11011","10101","10001","10001"], N:["10001","11001","10101","10011","10001"],
  O:["01110","10001","10001","10001","01110"], P:["11110","10001","11110","10000","10000"],
  Q:["01110","10001","10101","10010","01101"], R:["11110","10001","11110","10010","10001"],
  S:["01111","10000","01110","00001","11110"], T:["11111","00100","00100","00100","00100"],
  U:["10001","10001","10001","10001","01110"], V:["10001","10001","10001","01010","00100"],
  W:["10001","10001","10101","11011","10001"], X:["10001","01010","00100","01010","10001"],
  Y:["10001","01010","00100","00100","00100"], Z:["11111","00010","00100","01000","11111"],
  "0":["01110","10011","10101","11001","01110"], "1":["00100","01100","00100","00100","01110"],
  "2":["11110","00001","01110","10000","11111"], "3":["11110","00001","00110","00001","11110"],
  "4":["10001","10001","11111","00001","00001"], "5":["11111","10000","11110","00001","11110"],
  "6":["01110","10000","11110","10001","01110"], "7":["11111","00010","00100","01000","01000"],
  "8":["01110","10001","01110","10001","01110"], "9":["01110","10001","01111","00001","01110"],
  "!":["00100","00100","00100","00000","00100"], ".":["00000","00000","00000","00000","00100"],
  "-":["00000","00000","01110","00000","00000"], "/":["00001","00010","00100","01000","10000"],
  "'":["00100","00100","00000","00000","00000"], ":":["00000","00100","00000","00100","00000"],
  " ":["00000","00000","00000","00000","00000"],
};
function drawText(str, x, y, color, sc) {
  sc = sc || 1;
  ctx.fillStyle = color;
  for (let i = 0; i < str.length; i++) {
    const g = FONT[str[i].toUpperCase()];
    if (!g) continue;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      if (g[r][c] === '1') ctx.fillRect(x + (i * 6 + c) * sc, y + r * sc, sc, sc);
    }
  }
}
function textW(str, sc) { return (str.length * 6 - 1) * (sc || 1); }
function drawTextC(str, y, color, sc) { drawText(str, Math.round((W - textW(str, sc)) / 2), y, color, sc); }

// ---------------------------------------------------------------- sprites
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function P(g, x, y, col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }

// Ms-style muncher: yellow ball, mouth wedge, red bow, eye
function rasterPac(dir, mouthDeg) {
  const c = mkCanvas(16, 16), g = c.getContext('2d');
  const ang = { right:0, down:Math.PI/2, left:Math.PI, up:-Math.PI/2 }[dir];
  const half = mouthDeg * Math.PI / 360;
  for (let y = 0; y < 15; y++) for (let x = 0; x < 15; x++) {
    const dx = x - 7, dy = y - 7;
    if (dx*dx + dy*dy > 42) continue; // 13px ball fits the 12px visual corridor
    if (half > 0) {
      let a = Math.atan2(dy, dx) - ang;
      while (a > Math.PI) a -= 2*Math.PI; while (a < -Math.PI) a += 2*Math.PI;
      if (Math.abs(a) < half) continue;
    }
    P(g, x + 1, y + 1, '#ffdf00');
  }
  // eye (1px above-forward of center)
  const eye = { right:[9,3], left:[5,3], up:[4,5], down:[9,9] }[dir];
  P(g, eye[0], eye[1], '#000'); P(g, eye[0]+1, eye[1], '#000');
  // bow: sits on top-back of the head
  const bow = { right:[2,0], left:[8,0], up:[9,2], down:[2,10] }[dir];
  const BW = ["1101100","1111110","0110110"];
  for (let r = 0; r < 3; r++) for (let cc = 0; cc < 7; cc++) {
    if (BW[r][cc] === '1') P(g, bow[0]+cc, bow[1]+r, '#ff2222');
  }
  P(g, bow[0]+3, bow[1]+1, '#ff9d9d'); // knot highlight
  return c;
}
function rasterGhost(bodyCol, faceMode, dir, frame) {
  // faceMode: 'normal' | 'fright' | 'flash' | 'eyes'
  const c = mkCanvas(16, 16), g = c.getContext('2d');
  if (faceMode !== 'eyes') {
    const col = faceMode === 'fright' ? '#2121de' : faceMode === 'flash' ? '#dedeff' : bodyCol;
    // 12x13 body so it stays inside the 12px visual corridor
    for (let y = 0; y < 13; y++) for (let x = 0; x < 12; x++) {
      let on = false;
      if (y <= 5) { const dx = x - 5.5, dy = y - 5.5; on = dx*dx + dy*dy <= 31; }
      else if (y <= 11) on = true;
      else { // scalloped skirt, 2 walk frames
        on = frame === 0 ? (x <= 1 || (x >= 4 && x <= 7) || x >= 10)
                         : ((x >= 1 && x <= 2) || x === 5 || x === 6 || (x >= 9 && x <= 10));
      }
      if (on) P(g, x + 2, y + 1, col);
    }
  }
  if (faceMode === 'fright' || faceMode === 'flash') {
    const fc = faceMode === 'flash' ? '#ff2222' : '#f0c8a0';
    P(g,5,5,fc); P(g,6,5,fc); P(g,9,5,fc); P(g,10,5,fc);            // eyes
    for (let i = 0; i < 3; i++) { P(g, 4+i*3, 10, fc); P(g, 5+i*3, 9, fc); P(g, 6+i*3, 10, fc); } // wavy mouth
  } else {
    const d = DIRS[dir] || {x:0,y:0};
    const ex = [4 + d.x, 9 + d.x], ey = 3 + d.y;
    for (const x0 of ex) { // white of the eyes 3x4
      g.fillStyle = '#fff'; g.fillRect(x0, ey, 3, 4);
      g.fillStyle = '#2121de'; g.fillRect(x0 + 1 + d.x, ey + 1 + d.y, 2, 2); // pupil
    }
  }
  return c;
}
// small pixel bitmaps for fruit (12x12), letters map to colors
const FRUIT_COLS = { r:'#ff2222', R:'#c00000', g:'#22cc22', G:'#008800', y:'#ffdf00',
  o:'#ff8c1a', w:'#fff', b:'#8c5a2b', B:'#5a3a1b', p:'#ffb8de', t:'#d8a23a' };
const FRUIT_ART = {
  cherry: ["....G.......","...G........","..G.G.......","..G..G......",".rrG..G.....","rrrrGrrr....","rrrrrrrrr...","rrwrrrrrr...","rrrrrrrrr...",".rrrrrrr....","..rr.rrr....","............"],
  strawberry: ["....GG......","..GGGGGG....",".rrrGGrrr...","rrwrrrrwrr..","rrrrrwrrrr..","rrwrrrrwrr..",".rrrrwrrr...",".rrwrrrrr...","..rrrrwr....","...rrrr.....","....rr......","............"],
  orange: ["....GG......","...GG.......","..oooooo....",".oooooooo...","oooooooooo..","oooooooooo..","oooooooooo..","oooooooooo..",".oooooooo...","..oooooo....","............","............"],
  pretzel: ["............",".tttttttt...","tt..tt..tt..","tt..tt..tt..","tt.tttt.tt..","ttttttttttt.","tt.tttt.tt..","tt..tt..tt..","tt..tt..tt..",".tttttttt...","............","............"],
  apple: ["....B.......","...B........","..rrr.rrr...",".rrrrrrrrr..","rrrrrrrrrr..","rrrrrrrrrr..","rrrrrrrrrr..","rrwrrrrrrr..",".rrrrrrrr...","..rrr.rrr...","............","............"],
  pear: ["....B.......","....gg......","...gggg.....","...gggg.....","..gggggg....",".gggggggg...","gggggggggg..","ggggwggggg..",".gggggggg...","..gggggg....","............","............"],
  banana: ["..B.........","..yy........","..yyy.......","...yyy......","...yyyy.....","....yyyy....","....yyyyy...",".....yyyyy..","......yyyy..","........yy..","............","............"],
};
function rasterFruit(name) {
  const c = mkCanvas(12, 12), g = c.getContext('2d');
  const art = FRUIT_ART[name];
  for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) {
    const ch = art[y][x];
    if (ch !== '.') P(g, x, y, FRUIT_COLS[ch]);
  }
  return c;
}

const SPRITES = { pac:{}, pacDeath:[], ghosts:{}, fright:[], flash:[], eyes:{}, fruit:{} };
function buildSprites() {
  for (const d of ['up','down','left','right']) {
    SPRITES.pac[d] = [rasterPac(d, 0), rasterPac(d, 55), rasterPac(d, 100)];
    SPRITES.eyes[d] = rasterGhost('#000', 'eyes', d, 0);
  }
  for (let i = 0; i <= 10; i++) SPRITES.pacDeath.push(rasterPac('up', 60 + i * 30));
  for (const [name, col] of Object.entries(GHOST_COLORS)) {
    SPRITES.ghosts[name] = {};
    for (const d of ['up','down','left','right'])
      SPRITES.ghosts[name][d] = [rasterGhost(col,'normal',d,0), rasterGhost(col,'normal',d,1)];
  }
  SPRITES.fright = [rasterGhost('','fright','left',0), rasterGhost('','fright','left',1)];
  SPRITES.flash = [rasterGhost('','flash','left',0), rasterGhost('','flash','left',1)];
  for (const f of FRUITS) SPRITES.fruit[f.name] = rasterFruit(f.name);
}
buildSprites();

// ---------------------------------------------------------------- maze rendering
let mazeCanvas = mkCanvas(W, ROWS * T);
function renderMaze(grid, colors, whiteFlash) {
  const g = mazeCanvas.getContext('2d');
  g.clearRect(0, 0, W, ROWS * T);
  const isWall = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] === '#';
  const open = (r, c) => !(r >= 0 && r < ROWS && c >= 0 && c < COLS) || ' .o-'.includes(grid[r][c]);
  const fill = whiteFlash ? '#000' : colors.fill;
  const edge = whiteFlash ? '#dedeff' : colors.edge;
  const IN = 2; // walls pull back from corridors so sprites have breathing room
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (grid[r][c] === '-') { g.fillStyle = '#ffb8de'; g.fillRect(c*T, r*T + 3, T, 2); continue; }
    if (grid[r][c] !== '#') continue;
    const x = c*T, y = r*T;
    const oU = open(r-1,c) && r > 0, oD = open(r+1,c) && r < ROWS-1, oL = open(r,c-1) && c > 0, oR = open(r,c+1) && c < COLS-1;
    const x0 = x + (oL ? IN : 0), y0 = y + (oU ? IN : 0);
    const w = T - (oL ? IN : 0) - (oR ? IN : 0), h = T - (oU ? IN : 0) - (oD ? IN : 0);
    g.fillStyle = fill; g.fillRect(x0, y0, w, h);
    g.fillStyle = edge;
    if (oU) g.fillRect(x0, y0, w, 1);
    if (oD) g.fillRect(x0, y0 + h - 1, w, 1);
    if (oL) g.fillRect(x0, y0, 1, h);
    if (oR) g.fillRect(x0 + w - 1, y0, 1, h);
    // rounded outer corners
    g.fillStyle = '#000';
    if (oU && oL) g.fillRect(x0, y0, 1, 1);
    if (oU && oR) g.fillRect(x0 + w - 1, y0, 1, 1);
    if (oD && oL) g.fillRect(x0, y0 + h - 1, 1, 1);
    if (oD && oR) g.fillRect(x0 + w - 1, y0 + h - 1, 1, 1);
  }
}

// ---------------------------------------------------------------- audio
let actx = null, master = null, sirenOsc = null, sirenGain = null, muted = false;
function initAudio() {
  if (actx) { if (actx.state === 'suspended') actx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  actx = new AC();
  master = actx.createGain(); master.gain.value = 0.45; master.connect(actx.destination);
  sirenOsc = actx.createOscillator(); sirenOsc.type = 'sawtooth';
  sirenGain = actx.createGain(); sirenGain.gain.value = 0;
  sirenOsc.connect(sirenGain); sirenGain.connect(master);
  sirenOsc.frequency.value = 200; sirenOsc.start();
}
function blip(freq, dur, type, vol, slideTo, when) {
  if (!actx || muted) return;
  const t0 = actx.currentTime + (when || 0);
  const o = actx.createOscillator(), gn = actx.createGain();
  o.type = type || 'square';
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
  gn.gain.setValueAtTime(vol || 0.15, t0);
  gn.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(gn); gn.connect(master);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
const SFX = {
  waka(alt) { alt ? blip(520, 0.07, 'square', 0.12, 260) : blip(280, 0.07, 'square', 0.12, 540); },
  power() { blip(120, 0.4, 'square', 0.14, 240); },
  eatGhost() { blip(180, 0.28, 'square', 0.2, 1000); },
  eatFruit() { blip(1000, 0.22, 'square', 0.16, 350); },
  death() {
    blip(650, 0.9, 'sawtooth', 0.2, 60);
    blip(320, 0.12, 'square', 0.18, 90, 0.95); blip(320, 0.12, 'square', 0.18, 90, 1.1);
  },
  extraLife() { for (let i = 0; i < 5; i++) blip(1320, 0.09, 'square', 0.14, 0, i * 0.12); },
  ready() { // original little jingle
    const n = [392, 523, 659, 784, 659, 523, 784, 1046];
    n.forEach((f, i) => blip(f, 0.16, 'square', 0.13, 0, i * 0.17));
    blip(196, 1.4, 'triangle', 0.1, 0, 0);
  },
  eyes() { blip(880, 0.08, 'square', 0.07, 660); },
};

// ---------------------------------------------------------------- game state
const game = {
  state: 'boot',            // boot, title, ready, play, dying, over, clear
  stateT: 0,
  level: 1, score: 0, lives: 3, extraGiven: false,
  high: parseInt(localStorage.getItem('mspacmana_high') || '0', 10),
  grid: null, mazeKey: 'A', colors: null,
  eaten: null, pelletsLeft: 0, pelletsEaten: 0,
  wave: 0, waveT: 0, mode: 'scatter',
  frightT: 0, ghostChain: 0,
  freezeT: 0, popups: [], wakaAlt: false,
  fruit: null, fruitSpawns: 0,
  paused: false, flashCount: 0,
};
const player = { x:0, y:0, dir:'left', want:'left', moving:false, animT:0, deathT:0 };
const ghosts = [];

function tileAt(x, y) {
  let c = Math.floor(x / T); c = ((c % COLS) + COLS) % COLS;
  return [Math.floor(y / T), c];
}
function isOpen(r, c, allowDoor) {
  if (r < 0 || r >= ROWS) return false;
  c = ((c % COLS) + COLS) % COLS;
  const ch = game.grid[r][c];
  return ' .o'.includes(ch) || (allowDoor && ch === '-');
}
function centerOf(r, c) { return [c * T + 4, r * T + 4]; }

// BFS distance from every open tile to the ghost-house door (for returning eyes)
function computeDoorDist(grid) {
  const dist = Array.from({ length: ROWS }, () => new Array(COLS).fill(Infinity));
  const q = [[11, 13], [11, 14]];
  dist[11][13] = 0; dist[11][14] = 0;
  let head = 0;
  while (head < q.length) {
    const [r, c] = q[head++];
    for (const d of Object.values(DIRS)) {
      const nr = r + d.y, nc = ((c + d.x) % COLS + COLS) % COLS;
      if (nr < 0 || nr >= ROWS) continue;
      if (!' .o'.includes(grid[nr][nc])) continue;
      if (dist[nr][nc] > dist[r][c] + 1) { dist[nr][nc] = dist[r][c] + 1; q.push([nr, nc]); }
    }
  }
  return dist;
}

function startLevel(resetOnly) {
  if (!resetOnly) {
    game.mazeKey = mazeForLevel(game.level);
    game.colors = MAZE_COLORS[game.mazeKey];
    game.grid = buildMaze(game.mazeKey);
    game.eaten = new Set();
    game.pelletsLeft = 0; game.pelletsEaten = 0;
    for (const row of game.grid) for (const ch of row) if (ch === '.' || ch === 'o') game.pelletsLeft++;
    game.fruitSpawns = 0;
    game.doorDist = computeDoorDist(game.grid);
    renderMaze(game.grid, game.colors, false);
  }
  game.wave = 0; game.waveT = 0; game.mode = 'scatter';
  game.frightT = 0; game.ghostChain = 0; game.fruit = null;
  game.popups = []; game.freezeT = 0;
  player.x = DOOR_X; player.y = START_Y;
  player.dir = 'left'; player.want = 'left'; player.moving = false; player.animT = 0;
  ghosts.length = 0;
  const mk = (name, x, y, house, release, dir) =>
    ghosts.push({ name, x, y, dir, house, releaseT: release, dead: false, frightened: false, animT: rand() });
  mk('blinky', DOOR_X, DOOR_Y, 'out', 0, 'left');
  mk('pinky', DOOR_X, HOUSE_Y, 'in', 1.5, 'up');
  mk('inky', DOOR_X - 16, HOUSE_Y, 'in', 4, 'down');
  mk('sue', DOOR_X + 16, HOUSE_Y, 'in', 6.5, 'up');
}

function newGame() {
  game.level = 1; game.score = 0; game.lives = 3; game.extraGiven = false;
  startLevel(false);
  setState('ready');
  SFX.ready();
}
function setState(s) { game.state = s; game.stateT = 0; }

function addScore(n) {
  game.score += n;
  if (!game.extraGiven && game.score >= 10000) {
    game.extraGiven = true; game.lives++; SFX.extraLife();
    game.popups.push({ x: W/2, y: BOARD_Y + 130, text: 'EXTRA LIFE', t: 2, col: '#ffdf00' });
  }
  if (game.score > game.high) {
    game.high = game.score;
    localStorage.setItem('mspacmana_high', String(game.high));
  }
}

// ---------------------------------------------------------------- movement
function tryMove(a, dir, dist, allowDoor) {
  // move actor `a` up to dist px in dir, respecting walls; returns px actually moved
  const d = DIRS[dir];
  let moved = 0;
  while (moved < dist) {
    const step = Math.min(1, dist - moved);
    const [r, c] = tileAt(a.x, a.y);
    const [cx, cy] = centerOf(r, c);
    // distance to center along axis of travel
    const axisPos = d.x !== 0 ? a.x : a.y;
    const axisCtr = d.x !== 0 ? cx : cy;
    const toward = d.x !== 0 ? d.x : d.y;
    const distToCtr = (axisCtr - axisPos) * toward; // >0: center is ahead
    const nextOpen = isOpen(r + d.y, c + d.x, allowDoor);
    if (!nextOpen && distToCtr <= 0) return moved;      // at/past center, wall ahead
    if (!nextOpen && distToCtr < step) {                 // clamp onto center
      if (d.x !== 0) a.x = cx; else a.y = cy;
      return moved + distToCtr;
    }
    if (d.x !== 0) { a.x += d.x * step; a.y = cy; } else { a.y += d.y * step; a.x = cx; }
    // tunnel wrap
    if (a.x < -8) a.x += W + 16;
    if (a.x > W + 8) a.x -= W + 16;
    moved += step;
  }
  return moved;
}
function atCenter(a) {
  const [r, c] = tileAt(a.x, a.y);
  const [cx, cy] = centerOf(r, c);
  return Math.abs(a.x - cx) < 0.01 && Math.abs(a.y - cy) < 0.01;
}
// Walk `a` along the grid up to dist px, pausing at every tile center so
// `decide(a, r, c)` can pick a new direction. Returns when dist is used up
// or `a` is fully blocked (after decide had a chance to turn it).
function gridWalk(a, dist, decide) {
  let guard = 16;
  while (dist > 0.001 && guard-- > 0) {
    const [r, c] = tileAt(a.x, a.y);
    if (atCenter(a)) decide(a, r, c);
    const d = DIRS[a.dir];
    const [cx, cy] = centerOf(r, c);
    const axisPos = d.x !== 0 ? a.x : a.y;
    const axisCtr = d.x !== 0 ? cx : cy;
    const toward = d.x !== 0 ? d.x : d.y;
    let toCtr = (axisCtr - axisPos) * toward;
    if (toCtr <= 0.001) toCtr += T; // aim for the next tile's center
    const target = axisPos + toward * toCtr;
    const step = Math.min(dist, toCtr);
    const moved = tryMove(a, a.dir, step, false);
    if (moved <= 0.001) {
      if (atCenter(a)) { decide(a, r, c); const m2 = tryMove(a, a.dir, Math.min(dist, 1), false); if (m2 <= 0.001) return; dist -= m2; continue; }
      return;
    }
    // snap exactly onto the center we aimed for (unless a tunnel wrap moved us)
    if (step === toCtr && moved >= step - 0.001) {
      if (d.x !== 0) { if (Math.abs(a.x - target) < 0.5) a.x = target; }
      else if (Math.abs(a.y - target) < 0.5) a.y = target;
    }
    dist -= moved;
  }
}

function updatePlayer(dt) {
  const spec = levelSpec(game.level);
  const speed = BASE_SPEED * (game.frightT > 0 ? spec.pacFr : spec.pac);
  let dist = speed * dt;
  // instant reverse
  if (player.want === OPP[player.dir]) player.dir = player.want;
  while (dist > 0.001) {
    const [r, c] = tileAt(player.x, player.y);
    // cornering: take the wanted turn when it's perpendicular and open, near center
    if (player.want !== player.dir) {
      const wd = DIRS[player.want];
      const [cx, cy] = centerOf(r, c);
      const perp = (DIRS[player.dir].x !== 0) !== (wd.x !== 0);
      if (perp && isOpen(r + wd.y, c + wd.x, false)) {
        const axisDist = DIRS[player.dir].x !== 0 ? Math.abs(player.x - cx) : Math.abs(player.y - cy);
        if (axisDist <= 3.01) {
          player.x = cx; player.y = cy;
          player.dir = player.want;
        }
      }
    }
    const moved = tryMove(player, player.dir, Math.min(dist, 4), false);
    player.moving = moved > 0.001;
    if (moved <= 0.001) break;
    dist -= moved;
    eatAt();
  }
  if (player.moving) player.animT += dt * 14;
}
function eatAt() {
  const [r, c] = tileAt(player.x, player.y);
  const key = r + ',' + c;
  const ch = game.grid[r] && game.grid[r][c];
  if ((ch === '.' || ch === 'o') && !game.eaten.has(key)) {
    game.eaten.add(key);
    game.pelletsLeft--; game.pelletsEaten++;
    if (ch === '.') { addScore(10); game.wakaAlt = !game.wakaAlt; SFX.waka(game.wakaAlt); }
    else {
      addScore(50); SFX.power();
      const fr = levelSpec(game.level).fright;
      if (fr > 0) {
        game.frightT = fr; game.ghostChain = 0;
        for (const gh of ghosts) if (!gh.dead && gh.house === 'out') { gh.frightened = true; gh.dir = OPP[gh.dir]; }
        for (const gh of ghosts) if (!gh.dead && gh.house !== 'out') gh.frightened = true;
      }
    }
    // fruit triggers
    if ((game.pelletsEaten === 70 && game.fruitSpawns === 0) ||
        (game.pelletsEaten === 170 && game.fruitSpawns === 1)) spawnFruit();
    if (game.pelletsLeft <= 0) { setState('clear'); game.flashCount = 0; }
  }
}

function ghostSpeed(gh) {
  const spec = levelSpec(game.level);
  const [r, c] = tileAt(gh.x, gh.y);
  if (gh.dead) return BASE_SPEED * 1.6;
  if (gh.house !== 'out') return BASE_SPEED * 0.45;
  if (r === 14 && (c <= 7 || c >= 20)) return BASE_SPEED * spec.tunnel; // tunnel slow
  if (gh.frightened) return BASE_SPEED * spec.ghostFr;
  if (gh.name === 'blinky' && game.pelletsLeft < 30) return BASE_SPEED * (spec.ghost + 0.05);
  return BASE_SPEED * spec.ghost;
}
function ghostTarget(gh) {
  const [pr, pc] = tileAt(player.x, player.y);
  const pd = DIRS[player.dir];
  if (gh.dead) return [11, 13];
  if (game.mode === 'scatter' && !gh.frightened) return SCATTER_TARGETS[gh.name];
  switch (gh.name) {
    case 'blinky': return [pr, pc];
    case 'pinky': return [pr + pd.y * 4, pc + pd.x * 4];
    case 'inky': {
      const b = ghosts[0];
      const [br, bc] = tileAt(b.x, b.y);
      const mr = pr + pd.y * 2, mc = pc + pd.x * 2;
      return [mr + (mr - br), mc + (mc - bc)];
    }
    case 'sue': {
      const dr = pr - tileAt(gh.x, gh.y)[0], dc = pc - tileAt(gh.x, gh.y)[1];
      return (dr*dr + dc*dc > 64) ? [pr, pc] : SCATTER_TARGETS.sue;
    }
  }
}
function updateGhost(gh, dt) {
  let dist = ghostSpeed(gh) * dt;
  if (gh.house === 'in') {
    gh.releaseT -= dt;
    // bounce vertically
    const d = DIRS[gh.dir];
    gh.y += d.y * dist;
    if (gh.y < HOUSE_Y - 5) { gh.y = HOUSE_Y - 5; gh.dir = 'down'; }
    if (gh.y > HOUSE_Y + 5) { gh.y = HOUSE_Y + 5; gh.dir = 'up'; }
    if (gh.releaseT <= 0) gh.house = 'leave';
    return;
  }
  if (gh.house === 'leave') {
    if (Math.abs(gh.x - DOOR_X) > 0.5) {
      gh.x += Math.sign(DOOR_X - gh.x) * Math.min(dist, Math.abs(gh.x - DOOR_X));
      gh.dir = DOOR_X > gh.x ? 'right' : 'left';
    } else {
      gh.x = DOOR_X; gh.dir = 'up';
      gh.y -= dist;
      if (gh.y <= DOOR_Y) { gh.y = DOOR_Y; gh.house = 'out'; gh.dir = rand() < 0.5 ? 'left' : 'right'; }
    }
    return;
  }
  if (gh.house === 'enter') {
    // descend into house, then revive
    gh.dir = 'down';
    gh.y += dist;
    if (gh.y >= HOUSE_Y) {
      gh.y = HOUSE_Y; gh.dead = false; gh.frightened = false; gh.house = 'leave';
    }
    return;
  }
  // out: grid navigation
  gridWalk(gh, dist, (a, r, c) => {
    if (a.dead && r === 11 && (c === 13 || c === 14)) {
      a.x = DOOR_X; a.house = 'enter';
      return;
    }
    const choices = [];
    for (const d of ['up','left','down','right']) {
      if (d === OPP[a.dir] && !a.dead) continue;
      const v = DIRS[d];
      if (isOpen(r + v.y, c + v.x, false)) choices.push(d);
    }
    if (choices.length === 0) { a.dir = OPP[a.dir]; return; }
    if (a.dead) {
      // descend the BFS gradient straight back to the door
      let best = choices[0], bd = Infinity;
      for (const d of choices) {
        const v = DIRS[d];
        const nc = ((c + v.x) % COLS + COLS) % COLS;
        const dd = game.doorDist[r + v.y] ? game.doorDist[r + v.y][nc] : Infinity;
        if (dd < bd) { bd = dd; best = d; }
      }
      a.dir = best;
    } else if (a.frightened) {
      a.dir = choices[Math.floor(rand() * choices.length)];
    } else {
      const [tr, tc] = ghostTarget(a);
      let best = choices[0], bd = Infinity;
      for (const d of choices) {
        const v = DIRS[d];
        const dr = r + v.y - tr, dc = c + v.x - tc;
        const dist2 = dr*dr + dc*dc;
        if (dist2 < bd) { bd = dist2; best = d; }
      }
      a.dir = best;
    }
  });
  gh.animT += dt * 8;
}

function spawnFruit() {
  game.fruitSpawns++;
  const f = fruitForLevel(game.level);
  const left = rand() < 0.5;
  game.fruit = {
    name: f.name, pts: f.pts,
    x: left ? -4 : W + 4, y: 14 * T + 4,
    dir: left ? 'right' : 'left', t: 11, animT: 0,
  };
}
function updateFruit(dt) {
  const fr = game.fruit;
  if (!fr) return;
  fr.t -= dt; fr.animT += dt;
  if (fr.t <= 0) { game.fruit = null; return; }
  // wanders like a lost tourist: random turns at centers
  gridWalk(fr, BASE_SPEED * 0.4 * dt, (a, r, c) => {
    const choices = [];
    for (const d of ['up','left','down','right']) {
      if (d === OPP[a.dir]) continue;
      const v = DIRS[d];
      if (isOpen(r + v.y, c + v.x, false)) choices.push(d);
    }
    if (choices.length) a.dir = choices[Math.floor(rand() * choices.length)];
    else a.dir = OPP[a.dir];
  });
  // player collision
  const dx = fr.x - player.x, dy = fr.y - player.y;
  if (dx*dx + dy*dy < 36) {
    addScore(fr.pts); SFX.eatFruit();
    game.popups.push({ x: fr.x, y: fr.y + BOARD_Y, text: String(fr.pts), t: 1.5, col: '#ffb8de' });
    game.fruit = null;
  }
}

function checkCollisions() {
  for (const gh of ghosts) {
    if (gh.dead || gh.house === 'in' || gh.house === 'leave' || gh.house === 'enter') continue;
    const dx = gh.x - player.x, dy = gh.y - player.y;
    if (dx*dx + dy*dy < 42) {
      if (gh.frightened) {
        gh.dead = true; gh.frightened = false;
        const pts = 200 * Math.pow(2, game.ghostChain);
        game.ghostChain = Math.min(3, game.ghostChain + 1);
        addScore(pts); SFX.eatGhost();
        game.popups.push({ x: gh.x, y: gh.y + BOARD_Y, text: String(pts), t: 1, col: '#00ffde' });
        game.freezeT = 0.45;
      } else {
        setState('dying');
        player.deathT = 0;
        SFX.death();
        return;
      }
    }
  }
}

// ---------------------------------------------------------------- update
function update(dt) {
  game.stateT += dt;
  switch (game.state) {
    case 'boot':
    case 'title':
      break;
    case 'ready':
      if (game.stateT > 2.2) setState('play');
      break;
    case 'play': {
      if (game.paused) break;
      if (game.freezeT > 0) { game.freezeT -= dt; break; }
      // mode waves
      if (game.frightT > 0) {
        game.frightT -= dt;
        if (game.frightT <= 0) {
          game.frightT = 0;
          for (const gh of ghosts) gh.frightened = false;
        }
      } else {
        game.waveT += dt;
        const sched = waveSchedule(game.level);
        if (game.waveT > sched[Math.min(game.wave, sched.length - 1)]) {
          game.waveT = 0; game.wave++;
          game.mode = game.wave % 2 === 1 ? 'chase' : 'scatter';
          for (const gh of ghosts) if (gh.house === 'out' && !gh.dead) gh.dir = OPP[gh.dir];
        }
      }
      updatePlayer(dt);
      for (const gh of ghosts) updateGhost(gh, dt);
      updateFruit(dt);
      checkCollisions();
      break;
    }
    case 'dying':
      player.deathT += dt;
      if (player.deathT > 2.2) {
        game.lives--;
        if (game.lives < 0) {
          setState('over');
        } else {
          startLevel(true);
          setState('ready');
        }
      }
      break;
    case 'clear':
      if (game.stateT > 0.8) {
        const phase = Math.floor((game.stateT - 0.8) / 0.25);
        if (phase !== game.flashCount) {
          game.flashCount = phase;
          renderMaze(game.grid, game.colors, phase % 2 === 0);
        }
        if (phase >= 8) {
          game.level++;
          startLevel(false);
          setState('ready');
          SFX.ready();
        }
      }
      break;
    case 'over':
      if (game.stateT > 5) setState('title');
      break;
  }
  for (const p of game.popups) p.t -= dt;
  game.popups = game.popups.filter(p => p.t > 0);
  updateSiren();
}
let eyeBeepT = 0;
function updateSiren() {
  if (!actx || !sirenGain) return;
  const playing = game.state === 'play' && !game.paused;
  if (!playing) { sirenGain.gain.value = 0; return; }
  const anyDead = ghosts.some(g => g.dead);
  const t = performance.now() / 1000;
  if (anyDead) {
    sirenGain.gain.value = 0;
    if (t - eyeBeepT > 0.18) { eyeBeepT = t; SFX.eyes(); }
  } else if (game.frightT > 0) {
    sirenGain.gain.value = 0.045;
    sirenOsc.frequency.value = 140 + 60 * Math.sin(t * 24);
  } else {
    const stage = game.pelletsLeft > 180 ? 0 : game.pelletsLeft > 110 ? 1 : game.pelletsLeft > 50 ? 2 : 3;
    sirenGain.gain.value = 0.04;
    sirenOsc.frequency.value = 180 + stage * 55 + 35 * Math.sin(t * 9);
  }
}

// ---------------------------------------------------------------- render
function drawSprite(img, x, y) {
  ctx.drawImage(img, Math.round(x - img.width / 2), Math.round(y - img.height / 2 + BOARD_Y));
}
function render() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  if (game.state === 'boot' || game.state === 'title') { renderTitle(); return; }

  // HUD top
  drawText('1UP', 20, 2, '#fff');
  drawText(String(game.score || '00').padStart(2, '0'), 8, 9, '#fff');
  drawTextC('HIGH SCORE', 2, '#ff2222');
  drawText(String(game.high || '00').padStart(2, '0'), 130, 9, '#fff');

  // maze
  ctx.drawImage(mazeCanvas, 0, BOARD_Y);
  // pellets
  const blink = Math.floor(performance.now() / 160) % 2 === 0;
  ctx.fillStyle = game.colors.pellet;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const ch = game.grid[r][c];
    if (ch !== '.' && ch !== 'o') continue;
    if (game.eaten.has(r + ',' + c)) continue;
    const x = c * T, y = r * T + BOARD_Y;
    if (ch === '.') ctx.fillRect(x + 3, y + 3, 2, 2);
    else if (blink) {
      ctx.beginPath();
      for (let py = 0; py < 8; py++) for (let px = 0; px < 8; px++) {
        const dx = px - 3.5, dy = py - 3.5;
        if (dx*dx + dy*dy <= 12.5) ctx.rect(x + px, y + py, 1, 1);
      }
      ctx.fill();
    }
  }
  // fruit
  if (game.fruit) drawSprite(SPRITES.fruit[game.fruit.name], game.fruit.x, game.fruit.y + Math.sin(game.fruit.animT * 6));

  // player
  if (game.state === 'dying') {
    const t = Math.min(1, Math.max(0, (player.deathT - 0.6) / 1.4));
    const idx = Math.min(SPRITES.pacDeath.length - 1, Math.floor(t * SPRITES.pacDeath.length));
    if (player.deathT < 1.95) drawSprite(SPRITES.pacDeath[idx], player.x, player.y);
    else if (Math.floor(player.deathT * 10) % 2 === 0) {
      ctx.fillStyle = '#ffdf00';
      ctx.fillRect(Math.round(player.x) - 4, Math.round(player.y) + BOARD_Y, 8, 1);
      ctx.fillRect(Math.round(player.x), Math.round(player.y) + BOARD_Y - 4, 1, 8);
    }
  } else {
    const frames = SPRITES.pac[player.dir];
    const f = player.moving ? [0,1,2,1][Math.floor(player.animT) % 4] : 1;
    drawSprite(frames[f], player.x, player.y);
  }

  // ghosts
  if ((game.state !== 'dying' || player.deathT < 0.6) && !(game.state === 'clear' && game.stateT > 0.8)) {
    for (const gh of ghosts) {
      const fr2 = Math.floor(gh.animT * 2) % 2;
      if (gh.dead) drawSprite(SPRITES.eyes[gh.dir], gh.x, gh.y);
      else if (gh.frightened) {
        const flashing = game.frightT < 2 && Math.floor(performance.now() / 180) % 2 === 0;
        drawSprite((flashing ? SPRITES.flash : SPRITES.fright)[fr2], gh.x, gh.y);
      } else drawSprite(SPRITES.ghosts[gh.name][gh.dir][fr2], gh.x, gh.y);
    }
  }

  // popups
  for (const p of game.popups) {
    drawText(p.text, Math.round(p.x - textW(p.text) / 2), Math.round(p.y - 2), p.col);
  }

  // messages
  if (game.state === 'ready') drawTextC('READY!', BOARD_Y + 17 * T + 2, '#ffdf00');
  if (game.state === 'over') {
    drawTextC('GAME OVER', BOARD_Y + 17 * T + 2, '#ff2222');
  }
  if (game.paused && game.state === 'play') drawTextC('PAUSED - TAP', BOARD_Y + 17 * T + 2, '#00ffde');

  // HUD bottom: lives + level fruit
  for (let i = 0; i < Math.min(game.lives, 5); i++) {
    ctx.drawImage(SPRITES.pac.left[2], 4 + i * 14, H - 15);
  }
  let fx = W - 16;
  for (let lv = game.level; lv > Math.max(0, game.level - 5); lv--) {
    const f = lv <= 7 ? FRUITS[lv - 1] : FRUITS[6];
    ctx.drawImage(SPRITES.fruit[f.name], fx, H - 14);
    fx -= 14;
  }
}

function renderTitle() {
  const t = performance.now() / 1000;
  drawTextC('HIGH SCORE', 2, '#ff2222');
  drawText(String(game.high || '00').padStart(2, '0'), 130, 9, '#fff');
  drawTextC('MS', 38, '#ffdf00', 2);
  drawTextC('PACMANA', 52, '#ffdf00', 2);
  ctx.fillStyle = '#d93b6b';
  ctx.fillRect(52, 70, 120, 1);
  const names = [['blinky','SPEEDY'],['pinky','SNEAKY'],['inky','MOODY'],['sue','POKEY']];
  names.forEach(([g, label], i) => {
    const y = 92 + i * 22;
    const gs = SPRITES.ghosts[g].right[Math.floor(t * 4) % 2];
    ctx.drawImage(gs, 58, y - 6);
    drawText(label, 82, y - 2, GHOST_COLORS[g]);
  });
  // bouncing muncher
  const px = 112 + Math.sin(t * 1.2) * 70;
  const facing = Math.cos(t * 1.2) > 0 ? 'right' : 'left';
  const f = [0,1,2,1][Math.floor(t * 12) % 4];
  ctx.drawImage(SPRITES.pac[facing][f], Math.round(px) - 8, 178);
  if (Math.floor(t * 1.6) % 2 === 0) drawTextC('TAP TO PLAY', 210, '#ffdf00');
  drawTextC('SWIPE ANYWHERE TO STEER', 226, '#00ffde');
  drawTextC('ADD TO HOME SCREEN', 250, '#666');
  drawTextC('FOR TRUE FULL SCREEN', 258, '#666');
  drawTextC('AN ORIGINAL ARCADE HOMAGE', 274, '#444');
}

// ---------------------------------------------------------------- input
let touchStart = null;
function steer(dir) {
  player.want = dir;
}
function pointerDown(x, y) {
  initAudio();
  touchStart = { x, y };
  if (game.state === 'boot' || game.state === 'title') { newGame(); return; }
  if (game.state === 'over' && game.stateT > 1) { setState('title'); return; }
  if (game.paused) { game.paused = false; return; }
}
function pointerMove(x, y) {
  if (!touchStart) return;
  const dx = x - touchStart.x, dy = y - touchStart.y;
  const adx = Math.abs(dx), ady = Math.abs(dy);
  const TH = 14;
  if (Math.max(adx, ady) < TH) return;
  steer(adx > ady ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  // reset origin so the player can chain swipes without lifting the finger
  touchStart = { x, y };
}
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const t = e.changedTouches[0];
  pointerDown(t.clientX, t.clientY);
}, { passive: false });
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const t = e.changedTouches[0];
  pointerMove(t.clientX, t.clientY);
}, { passive: false });
canvas.addEventListener('touchend', e => { e.preventDefault(); touchStart = null; }, { passive: false });
document.body.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

canvas.addEventListener('mousedown', e => pointerDown(e.clientX, e.clientY));
canvas.addEventListener('mousemove', e => { if (e.buttons) pointerMove(e.clientX, e.clientY); });
canvas.addEventListener('mouseup', () => { touchStart = null; });

addEventListener('keydown', e => {
  const map = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right',
                w:'up', s:'down', a:'left', d:'right' };
  if (map[e.key]) {
    e.preventDefault();
    initAudio();
    if (game.state === 'boot' || game.state === 'title') { newGame(); return; }
    steer(map[e.key]);
  }
  if (e.key === ' ' || e.key === 'Enter') {
    initAudio();
    if (game.state === 'boot' || game.state === 'title') newGame();
    else if (game.state === 'play') game.paused = !game.paused;
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.state === 'play') game.paused = true;
});

// ---------------------------------------------------------------- main loop
let last = performance.now(), acc = 0;
const STEP = 1 / 120;
function frame(now) {
  requestAnimationFrame(frame);
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.25) dt = 0.25;
  acc += dt;
  while (acc >= STEP) { update(STEP); acc -= STEP; }
  render();
}
setState('title');
requestAnimationFrame(frame);
