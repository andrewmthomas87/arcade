export const SIMPLIFY_TOLERANCE = 0.375;

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

export const WEIGHTS = [1, 2, 4, 8, 16, 32];

export type Weight = (typeof WEIGHTS)[number];

export type Coord = { x: number; y: number };

export type Path = {
  color: Color;
  weight: Weight;
  coords: Coord[];
};

export function drawPaths(
  ctx: CanvasRenderingContext2D,
  size: number,
  unit: number,
  paths: Path[],
  animateI?: number,
) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.clearRect(0, 0, size * unit, size * unit);

  let i = 0;
  for (const path of paths) {
    if (animateI !== undefined && i >= animateI) {
      break;
    }

    ctx.beginPath();

    if (path.coords.length === 1) {
      const { x, y } = path.coords[0];
      ctx.ellipse(
        x * unit,
        y * unit,
        (path.weight * unit) / 2,
        (path.weight * unit) / 2,
        0,
        0,
        2 * Math.PI,
      );

      ctx.fillStyle = path.color;
      ctx.fill();

      ctx.strokeStyle = path.color;
      ctx.lineWidth = 1;
      ctx.stroke();

      i++;
    } else {
      ctx.moveTo(path.coords[0].x * unit, path.coords[0].y * unit);
      for (let j = 1; j < path.coords.length && (animateI === undefined || i < animateI); j++) {
        ctx.lineTo(path.coords[j].x * unit, path.coords[j].y * unit);
        i++;
      }

      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.weight * unit;
      ctx.stroke();
    }
  }
}
