/* Molt — level data. Each grid row is a plain string:
   # wall, . floor, X chasm, E exit, P start, p plank pickup, r spring pickup. */
(function (root) {
  'use strict';

  var LEVELS = [
    {
      name: 'First Shed',
      teach: 'Walk into a Plank to carry it. Shift+direction sheds your top husk onto the tile it faces — a Plank only takes hold over a chasm.',
      grid: [
        '########',
        '#P.pX.E#',
        '########'
      ]
    },
    {
      name: 'The Spring',
      teach: 'A Spring only roots on open floor. Step onto one and it hurls you two tiles further — far enough to clear a one-tile chasm without ever bridging it.',
      grid: [
        '##########',
        '#P.r.X.E##',
        '##########'
      ]
    },
    {
      name: 'Buried',
      teach: 'You shed the top of your stack, always. Pick up the wrong thing last and it sits on top of the thing you actually need.',
      grid: [
        '###########',
        '#Ppr.X.X.E#',
        '###########'
      ]
    },
    {
      name: 'Two Planks',
      teach: 'You can only carry so much at once. Something has to come off before anything else goes on.',
      grid: [
        '##############',
        '#Ppr.X.pX.X.E#',
        '##############'
      ],
      maxCarry: 2
    }
  ];

  root.MoltLevels = LEVELS;
  if (typeof module !== 'undefined' && module.exports) module.exports = LEVELS;
})(typeof globalThis !== 'undefined' ? globalThis : this);
