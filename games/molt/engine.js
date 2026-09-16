/* Molt — rules engine. Pure: no DOM, no globals mutated.
   The one verb: SHED. You carry a LIFO stack of husks picked up off the floor;
   shedding always sheds the TOP husk onto the adjacent tile you shed toward,
   and a husk only takes hold on the terrain it matches. Sheds are permanent —
   there is no picking a shed husk back up. */
(function (root) {
  'use strict';

  var HUSK = {
    p: { name: 'Plank',  onto: 'X', becomes: '.', verb: 'spans a chasm' },
    r: { name: 'Spring', onto: '.', becomes: '^', verb: 'takes root on open floor' }
  };

  var DIRS = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
  var MOVES = ['U', 'D', 'L', 'R'];
  var SHEDS = ['u', 'd', 'l', 'r'];
  var DEFAULT_CARRY = 3;

  function parse(level) {
    var rows = level.grid, h = rows.length, w = rows[0].length;
    var terrain = [], pickups = {}, px = 0, py = 0;
    for (var y = 0; y < h; y++) {
      var out = [];
      for (var x = 0; x < w; x++) {
        var ch = rows[y][x];
        if (ch === 'P') { px = x; py = y; ch = '.'; }
        else if (ch === 'p' || ch === 'r') { pickups[x + ',' + y] = ch; ch = '.'; }
        out.push(ch);
      }
      terrain.push(out);
    }
    return {
      w: w, h: h, terrain: terrain, pickups: pickups, px: px, py: py,
      stack: [], maxCarry: level.maxCarry || DEFAULT_CARRY
    };
  }

  function clone(s) {
    var t = new Array(s.h);
    for (var y = 0; y < s.h; y++) t[y] = s.terrain[y].slice();
    var pk = {};
    for (var k in s.pickups) pk[k] = s.pickups[k];
    return {
      w: s.w, h: s.h, terrain: t, pickups: pk, px: s.px, py: s.py,
      stack: s.stack.slice(), maxCarry: s.maxCarry
    };
  }

  function top(s) { return s.stack.length ? s.stack[s.stack.length - 1] : null; }
  function inBounds(s, x, y) { return x >= 0 && y >= 0 && x < s.w && y < s.h; }

  function canEnter(s, x, y) {
    if (!inBounds(s, x, y)) return null;
    var ch = s.terrain[y][x];
    if (ch === '#') return null;
    if (ch === 'X') return 'A chasm. Something needs to span it first.';
    return true;
  }

  function canShedOnto(s, x, y, item) {
    if (!inBounds(s, x, y)) return 'Nothing to shed onto out there.';
    if (s.pickups[x + ',' + y]) return 'Something is already lying there.';
    var ch = s.terrain[y][x];
    var h = HUSK[item];
    return ch === h.onto ? null : ('A ' + h.name + ' only ' + h.verb + '.');
  }

  function tryCollect(n, x, y) {
    var k = x + ',' + y;
    if (n.pickups[k] && n.stack.length < n.maxCarry) {
      var picked = n.pickups[k];
      delete n.pickups[k];
      n.stack.push(picked);
    }
  }

  /* Returns { state, note } or { blocked: reason }. Never mutates the input. */
  function step(s, action) {
    var shedding = SHEDS.indexOf(action) >= 0;
    var d = DIRS[shedding ? action.toUpperCase() : action];
    if (!d) return { blocked: 'unknown action' };
    var x = s.px + d[0], y = s.py + d[1];

    if (shedding) {
      if (!s.stack.length) return { blocked: 'You have nothing left to shed.' };
      var item = top(s);
      var why = canShedOnto(s, x, y, item);
      if (why) return { blocked: why };
      var n = clone(s);
      n.stack.pop();
      n.terrain[y][x] = HUSK[item].becomes;
      return { state: n, note: HUSK[item].name + ' takes hold.' };
    }

    var ok = canEnter(s, x, y);
    if (ok !== true) return { blocked: ok };
    var n = clone(s);
    n.px = x; n.py = y;
    tryCollect(n, x, y);

    if (n.terrain[y][x] === '^') {
      var mx = x + d[0], my = y + d[1];
      var overOk = inBounds(n, mx, my) && n.terrain[my][mx] !== '#';
      var lx = x + 2 * d[0], ly = y + 2 * d[1];
      var landOk = canEnter(n, lx, ly) === true;
      if (overOk && landOk) {
        n.px = lx; n.py = ly;
        tryCollect(n, lx, ly);
        return { state: n, note: 'The spring hurls you over the gap.' };
      }
    }
    return { state: n };
  }

  function isWin(s) { return s.terrain[s.py][s.px] === 'E'; }

  var api = {
    HUSK: HUSK, MOVES: MOVES, SHEDS: SHEDS, DIRS: DIRS,
    parse: parse, clone: clone, top: top, step: step, isWin: isWin
  };
  root.MoltEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
