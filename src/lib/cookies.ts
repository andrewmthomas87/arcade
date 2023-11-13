import { z } from 'zod';

export const COOKIE = {
  player: 'arcade-player',
};

// Player

const playerCookieSchema = z.object({ id: z.number(), name: z.string() });

export type PlayerCookie = z.infer<typeof playerCookieSchema>;

export function parsePlayerCookie(cookie: string | undefined): PlayerCookie | undefined {
  if (cookie === undefined) {
    return undefined;
  }

  try {
    const data = JSON.parse(cookie);
    const player = playerCookieSchema.parse(data);

    return player;
  } catch {
    return undefined;
  }
}

export function serializePlayerCookie(id: number, name: string) {
  return JSON.stringify({ id, name } satisfies PlayerCookie);
}
