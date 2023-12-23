import { getPlayerCookieOrThrow } from '$lib/cookies';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { GameDB } from '$lib/db/game.server';

export const load: LayoutServerLoad = async ({ cookies, depends, params }) => {
  depends('game');

  const player = getPlayerCookieOrThrow(cookies);

  const game = await GameDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
    include: GameDB.include.activeLobbyAndLobby,
  });
  if (!game) {
    throw error(404);
  } else if (!game.activeLobby) {
    throw redirect(307, `/lobby/${game.lobby.code}`);
  }

  return {};
};
