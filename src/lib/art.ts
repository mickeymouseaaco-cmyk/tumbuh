/**
 * Shared drawing data (SVG paths) for hair and topic icons, so the app and design checks draw the same thing.
 * Hair is drawn on the 160×160 baby head (head circle: centre 80,86, radius 57).
 */

export type Stroke = { d: string; fill?: boolean; width?: number; opacity?: number };

/** Hair grows with age: newborn curl → wisps → short tufts → full fringe. */
export function hairFor(age: number): Stroke[] {
  if (age < 6) {
    return [{ d: 'M76 33 C73 24 86 21 88 28 C89 32 83 34 82 30', width: 3.6 }];
  }
  if (age < 12) {
    return [
      { d: 'M74 33 C70 19 88 13 92 25 C94 32 84 35 84 28', width: 4.5 },
      { d: 'M66 33 C64 26 68 22 72 24', width: 3, opacity: 0.8 },
      { d: 'M96 34 C98 28 103 27 105 31', width: 2.6, opacity: 0.7 },
    ];
  }
  if (age < 24) {
    return [
      {
        d: 'M44 50 C46 36 60 27 72 27 C70 33 74 36 78 30 C80 36 86 36 88 29 C92 35 98 35 98 29 C108 32 116 40 118 50 C110 44 104 44 100 48 C96 42 90 42 86 47 C82 41 74 41 70 47 C66 42 58 42 54 48 C51 45 47 46 44 50 Z',
        fill: true,
      },
      { d: 'M78 28 C76 20 86 16 89 22', width: 4 },
    ];
  }
  return [
    {
      d: 'M25 82 C21 46 46 25 80 25 C114 25 139 46 135 82 C131 70 125 62 117 58 C113 66 104 66 100 57 C95 65 85 66 81 56 C77 66 66 66 62 57 C57 66 48 66 44 58 C35 62 28 70 25 82 Z',
      fill: true,
    },
    { d: 'M72 26 C68 15 86 10 90 21', width: 4 },
  ];
}

/* ---------- Topic icons (24×24, stroked, drawn in the topic's ink colour) ---------- */

export const topicArt: Record<string, Stroke[]> = {
  // toothbrush with a blob of paste
  clean: [
    { d: 'M2.5 16.5h10' , width: 2.4 },
    { d: 'M12.5 14.5h8.2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-8.2z' },
    { d: 'M14 14.5v-3.5M16.2 14.5v-3.5M18.4 14.5v-3.5M20.6 14.5v-3.5' , width: 1.4 },
    { d: 'M13.6 9.6c1.4-2.4 6.2-2.4 7.6 0', width: 1.6 },
  ],
  // toothpaste tube squeezing out a drop
  fluoride: [
    { d: 'M4.5 7.5h9.5l3.5 2.6v4.8L14 17.5H4.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z' },
    { d: 'M17.5 10.6h2.3v3.8h-2.3' },
    { d: 'M6.5 7.5v10M8.3 7.5v10', width: 1.2, opacity: 0.7 },
    { d: 'M22 13.3c0 .9-.7 1.5-1.5 1.5s-1.5-.6-1.5-1.5 1.5-2.6 1.5-2.6 1.5 1.7 1.5 2.6z' },
  ],
  // baby bottle
  food: [
    { d: 'M10.2 2.6h3.6l.9 2.9H9.3z' },
    { d: 'M8.5 5.5h7v2.3h-7z' },
    { d: 'M9 7.8h6l1 2v9.6a1.6 1.6 0 0 1-1.6 1.6H9.6A1.6 1.6 0 0 1 8 19.4V9.8z' },
    { d: 'M10.4 12h2.2M10.4 14.8h2.2M10.4 17.6h2.2', width: 1.3 },
  ],
  // teething ring with a handle
  teething: [
    { d: 'M9 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12z' },
    { d: 'M9 17.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z', width: 1.4 },
    { d: 'M13.3 10.8l3-3' },
    { d: 'M18.2 8.6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
  ],
  // dental mirror
  dentist: [
    { d: 'M3 21l9.2-9.2' , width: 2.4 },
    { d: 'M15.5 12.5a4.6 4.6 0 1 0 0-9.2 4.6 4.6 0 0 0 0 9.2z' },
    { d: 'M13.6 6.2a2.4 2.4 0 0 1 2.4-1.4', width: 1.3, opacity: 0.8 },
  ],
};
