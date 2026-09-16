/* Recoil — level data. Each grid row is a plain string:
   # wall, . floor (stops a slide), ~ ice (a slide keeps going),
   B box, P start, G goal on floor, I goal on ice (only collision, a wall,
   or the edge stops a box there — never the tile itself). */
(function (root) {
  'use strict';

  var LEVELS = [
    {
      name: 'Push',
      teach: 'Walk into a box and it slides one tile, onto the goal.',
      grid: [
        '######',
        '#PBG.#',
        '######'
      ]
    },
    {
      name: 'Ice',
      teach: 'Ice has no friction. A box you push onto it keeps going until something stops it — here, nothing does until the far wall.',
      grid: [
        '#########',
        '#PB~~~~G#',
        '#########'
      ]
    },
    {
      name: 'Handoff',
      teach: 'That box in the ice is not reachable on foot — the corridor is one box wide. Push what you *can* reach, and let the collision carry your push the rest of the way.',
      grid: [
        '##########',
        '#P.B~~~B~G',
        '##########'
      ]
    },
    {
      name: 'Chain',
      teach: 'Three boxes, one push. Each one only moves as far as what it hits — or doesn’t.',
      grid: [
        '#############',
        '#P.BIB~~B~~~G',
        '#############'
      ]
    }
  ];

  root.RecoilLevels = LEVELS;
  if (typeof module !== 'undefined' && module.exports) module.exports = LEVELS;
})(typeof globalThis !== 'undefined' ? globalThis : this);
