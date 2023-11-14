import { getPlayerCookieOrThrow } from '$lib/cookies';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, params }) => {
  const player = getPlayerCookieOrThrow(cookies);

  const game = await db.game.findUnique({
    where: { id: Number(params.gameID) || -1, players: { some: { id: player.id } } },
  });
  if (!game) {
    throw error(404);
  }

  return { game };
};
