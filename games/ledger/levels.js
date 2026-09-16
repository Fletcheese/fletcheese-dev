/* Ledger — level data. Grid rows are terrain only (# wall, . floor).
   Actors are listed separately: a Walker always tries to step one tile in
   its fixed direction; a Follower does the same but only if the actor named
   in `ref` has already been resolved this round. `wants` lists the actor
   index and the tile it must be standing on for the round to count as won. */
(function (root) {
  'use strict';

  var LEVELS = [
    {
      name: 'Right of Way',
      teach: 'Two fixed walkers, one turn order. Whoever the ledger puts first gets the tile — reorder it and play the round.',
      grid: ['#####', '#...#', '#...#', '#####'],
      actors: [
        { x: 1, y: 1, dir: 'R', kind: 'walker' },
        { x: 2, y: 1, dir: 'D', kind: 'walker' }
      ],
      order: [0, 1],
      wants: [{ actor: 0, x: 2, y: 1 }]
    },
    {
      name: 'Depends On',
      teach: 'The third actor is a Follower — it only moves if the second one has already gone this round, whether or not the second one actually got anywhere.',
      grid: ['#######', '#.....#', '#.....#', '#######'],
      actors: [
        { x: 1, y: 1, dir: 'R', kind: 'walker' },
        { x: 2, y: 1, dir: 'D', kind: 'walker' },
        { x: 3, y: 2, dir: 'R', kind: 'follower', ref: 1 }
      ],
      order: [0, 1, 2],
      wants: [
        { actor: 0, x: 2, y: 1 },
        { actor: 2, x: 4, y: 2 }
      ]
    },
    {
      name: 'Chain of Custody',
      teach: 'A Follower can depend on another Follower. Three actors, and now exactly one of the six orders resolves everything in a single round.',
      grid: ['########', '#......#', '########'],
      actors: [
        { x: 1, y: 1, dir: 'R', kind: 'walker' },
        { x: 3, y: 1, dir: 'R', kind: 'follower', ref: 0 },
        { x: 5, y: 1, dir: 'R', kind: 'follower', ref: 1 }
      ],
      order: [2, 1, 0],
      wants: [
        { actor: 1, x: 4, y: 1 },
        { actor: 2, x: 6, y: 1 }
      ]
    },
    {
      name: 'The Whole Ledger',
      teach: 'A blocker to clear and a two-link chain of dependency, all at once. Four actors, twenty-four orders, one of them right.',
      grid: ['########', '#......#', '#......#', '########'],
      actors: [
        { x: 1, y: 1, dir: 'R', kind: 'walker' },
        { x: 2, y: 1, dir: 'D', kind: 'walker' },
        { x: 3, y: 2, dir: 'R', kind: 'follower', ref: 0 },
        { x: 5, y: 2, dir: 'R', kind: 'follower', ref: 2 }
      ],
      order: [3, 2, 1, 0],
      wants: [
        { actor: 0, x: 2, y: 1 },
        { actor: 2, x: 4, y: 2 },
        { actor: 3, x: 6, y: 2 }
      ]
    }
  ];

  root.LedgerLevels = LEVELS;
  if (typeof module !== 'undefined' && module.exports) module.exports = LEVELS;
})(typeof globalThis !== 'undefined' ? globalThis : this);
