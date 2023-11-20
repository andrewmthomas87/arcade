import { getPlayerCookieOrThrow } from '$lib/cookies';
import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, params }) => {
  const player = getPlayerCookieOrThrow(cookies);

  const game = await db.game.findUnique({
    where: { id: Number(params.gameID) || -1, players: { some: { id: player.id } } },
    include: { activeLobby: true, lobby: true },
  });
  if (!game) {
    throw error(404);
  } else if (!game.activeLobby) {
    throw redirect(307, `/lobby/${game.lobby.code}`);
  }

  return {};
};
