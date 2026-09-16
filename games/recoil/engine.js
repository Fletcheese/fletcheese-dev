/* Recoil — rules engine. Pure: no DOM, no globals mutated.
   The one verb: PUSH. A pushed box has no friction of its own — it slides
   until it enters a non-ice tile, or until it meets a wall, the edge, or
   another box. Hitting another box does not stop the motion, it HANDS IT ON:
   the box that was hit begins sliding with the same rule, from where it sat. */
(function (root) {
  'use strict';

  var DIRS = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
  var MOVES = ['U', 'D', 'L', 'R'];

  function parse(level) {
    var rows = level.grid, h = rows.length, w = rows[0].length;
    var terrain = [], boxes = {}, goals = [], px = 0, py = 0;
    for (var y = 0; y < h; y++) {
      var out = [];
      for (var x = 0; x < w; x++) {
        var ch = rows[y][x];
        if (ch === 'P') { px = x; py = y; ch = '.'; }
        else if (ch === 'B') { boxes[x + ',' + y] = true; ch = '.'; }
        else if (ch === 'G') { goals.push(x + ',' + y); ch = '.'; }
        else if (ch === 'I') { goals.push(x + ',' + y); ch = '~'; }
        out.push(ch);
      }
      terrain.push(out);
    }
    return { w: w, h: h, terrain: terrain, boxes: boxes, goals: goals, px: px, py: py };
  }

  function clone(s) {
    var t = new Array(s.h);
    for (var y = 0; y < s.h; y++) t[y] = s.terrain[y].slice();
    var b = {};
    for (var k in s.boxes) b[k] = true;
    return { w: s.w, h: s.h, terrain: t, boxes: b, goals: s.goals, px: s.px, py: s.py };
  }

  function inBounds(s, x, y) { return x >= 0 && y >= 0 && x < s.w && y < s.h; }

  /* Slides the box at (x,y) in direction d. The box is assumed to already be
     present at (x,y) in s.boxes; it is removed and re-placed at its rest
     position. Colliding with another box recurses into that box first — the
     chain resolves innermost-out, so every box ends up exactly where the
     transferred momentum actually carries it. */
  function slide(s, x, y, d, trail) {
    delete s.boxes[x + ',' + y];
    if (trail) trail.push(x + ',' + y);
    while (true) {
      var nx = x + d[0], ny = y + d[1];
      if (!inBounds(s, nx, ny)) break;
      var ch = s.terrain[ny][nx];
      if (ch === '#') break;
      if (s.boxes[nx + ',' + ny]) { slide(s, nx, ny, d, trail); break; }
      x = nx; y = ny;
      if (trail) trail.push(x + ',' + y);
      if (ch !== '~') break;
    }
    s.boxes[x + ',' + y] = true;
  }

  /* Returns { state, trail } or { blocked: reason }. Never mutates the input.
     trail lists every tile any box passed through, for the caller to render
     as a momentum streak — it carries no rule weight of its own. */
  function step(s, action) {
    var d = DIRS[action];
    if (!d) return { blocked: 'unknown action' };
    var x = s.px + d[0], y = s.py + d[1];
    if (!inBounds(s, x, y)) return { blocked: null };
    var ch = s.terrain[y][x];
    if (ch === '#') return { blocked: null };

    var n = clone(s);
    if (n.boxes[x + ',' + y]) {
      var before = x + ',' + y, trail = [];
      slide(n, x, y, d, trail);
      if (n.boxes[before]) return { blocked: 'Nothing gives.' };
      n.px = x; n.py = y;
      return { state: n, trail: trail };
    }
    n.px = x; n.py = y;
    return { state: n };
  }

  function isWin(s) {
    for (var i = 0; i < s.goals.length; i++) if (!s.boxes[s.goals[i]]) return false;
    return true;
  }

  var api = { MOVES: MOVES, DIRS: DIRS, parse: parse, clone: clone, step: step, isWin: isWin };
  root.RecoilEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
