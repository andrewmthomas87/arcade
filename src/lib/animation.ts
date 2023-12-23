export const ANIMATION_BASE_DELAY_MS = 250;
export const ANIMATION_SPEED_MS = 86;

export function delay(step: number) {
  return ANIMATION_BASE_DELAY_MS + step * ANIMATION_SPEED_MS;
}
