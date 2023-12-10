export const COLORS = [
  '#FFFFFF',
  '#C2C3C7',
  '#5F574F',
  '#AB5236',
  '#FFCCAA',
  '#FFA300',
  '#FFEC27',
  '#00E436',
  '#008751',
  '#29ADFF',
  '#1D2B53',
  '#83769C',
  '#7E2553',
  '#FF77A8',
  '#FF004D',
];

export type Color = (typeof COLORS)[number];

export const WEIGHTS = [2, 4, 8, 16];

export type Weight = (typeof WEIGHTS)[number];

export type Coord = { x: number; y: number };

export type Path = {
  color: Color;
  weight: Weight;
  coords: Coord[];
};
