/* Ledger — rules engine. Pure: no DOM, no globals mutated.
   The one verb: REORDER. You never move a piece — you set the sequence in
   which the fixed actors take their turn this round, then play the round.
   Effects apply one at a time in that sequence, so who goes first decides
   who gets the tile. A Follower is stricter still: it only moves if the
   actor it depends on has already been resolved this round, whether or not
   that actor's own move actually succeeded. */
(function (root) {
  'use strict';

  var DIRS = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };

  function parse(level) {
    var rows = level.grid, h = rows.length, w = rows[0].length;
    var terrain = [];
    for (var y = 0; y < h; y++) terrain.push(rows[y].split(''));
    var actors = level.actors.map(function (a) {
      return { x: a.x, y: a.y, dir: a.dir, kind: a.kind, ref: (a.ref === undefined ? null : a.ref) };
    });
    return {
      w: w, h: h, terrain: terrain, actors: actors,
      order: level.order.slice(), wants: level.wants.slice(), round: 0
    };
  }

  function clone(s) {
    var t = new Array(s.h);
    for (var y = 0; y < s.h; y++) t[y] = s.terrain[y].slice();
    var actors = s.actors.map(function (a) { return { x: a.x, y: a.y, dir: a.dir, kind: a.kind, ref: a.ref }; });
    return { w: s.w, h: s.h, terrain: t, actors: actors, order: s.order.slice(), wants: s.wants.slice(), round: s.round };
  }

  function inBounds(s, x, y) { return x >= 0 && y >= 0 && x < s.w && y < s.h; }
  function occupied(s, x, y) {
    for (var i = 0; i < s.actors.length; i++) if (s.actors[i].x === x && s.actors[i].y === y) return true;
    return false;
  }

  /* Returns { state } or { blocked: reason }. Never mutates the input. */
  function step(s, action) {
    if (action.type === 'swap') {
      var i = action.i;
      if (i < 0 || i >= s.order.length - 1) return { blocked: 'no such swap' };
      var n = clone(s);
      var tmp = n.order[i]; n.order[i] = n.order[i + 1]; n.order[i + 1] = tmp;
      return { state: n };
    }
    if (action.type === 'play') {
      var n2 = clone(s);
      var resolved = {};
      for (var k = 0; k < n2.order.length; k++) {
        var id = n2.order[k];
        var a = n2.actors[id];
        var canMove = a.kind !== 'follower' || !!resolved[a.ref];
        if (canMove) {
          var d = DIRS[a.dir];
          var nx = a.x + d[0], ny = a.y + d[1];
          if (inBounds(n2, nx, ny) && n2.terrain[ny][nx] !== '#' && !occupied(n2, nx, ny)) {
            a.x = nx; a.y = ny;
          }
        }
        resolved[id] = true;
      }
      n2.round++;
      return { state: n2 };
    }
    return { blocked: 'unknown action' };
  }

  function isWin(s) {
    for (var i = 0; i < s.wants.length; i++) {
      var w = s.wants[i], a = s.actors[w.actor];
      if (a.x !== w.x || a.y !== w.y) return false;
    }
    return true;
  }

  var api = { DIRS: DIRS, parse: parse, clone: clone, step: step, isWin: isWin };
  root.LedgerEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
