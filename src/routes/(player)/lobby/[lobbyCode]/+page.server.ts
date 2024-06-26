import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { GAME_TYPES } from '$lib/games';
import { formatZodError } from '$lib/zod-error';
import { getPlayerCookieOrThrow } from '$lib/cookies';
import { LobbyDB } from '$lib/db/lobby.server';
import { GameDB } from '$lib/db/game.server';

export const load: PageServerLoad = async ({ cookies, depends, params }) => {
  depends('lobby');

  const player = getPlayerCookieOrThrow(cookies);

  const lobby = await LobbyDB.byCodeAndPlayer(params.lobbyCode, player.id, {
    include: LobbyDB.include.playersAndActiveGameWithPlayers,
  });
  if (!lobby) {
    throw error(404);
  }

  if (lobby.activeGame !== null && lobby.activeGame.players.find((x) => x.id === player.id)) {
    throw redirect(307, `/game/${lobby.activeGame.id}`);
  }

  return { lobby };
};

const actionDataSchema = z.object({ type: z.enum(GAME_TYPES) });

export const actions = {
  default: async ({ cookies, params, request }) => {
    const player = getPlayerCookieOrThrow(cookies);

    const lobby = await LobbyDB.byCodeAndPlayer(params.lobbyCode, player.id, {
      include: LobbyDB.include.players,
    });
    if (!lobby) {
      throw error(404);
    } else if (lobby.activeGameId !== null) {
      throw error(400);
    }

    const data = await request.formData();
    const parsedData = actionDataSchema.safeParse({ type: data.get('type') });
    if (!parsedData.success) {
      return fail(400, { error: formatZodError(parsedData.error) });
    }
    const type = parsedData.data.type;

    const game = await GameDB.create(
      type,
      lobby.players.map((p) => p.id),
      lobby.id,
    );

    throw redirect(303, `/game/${game.id}`);
  },
} satisfies Actions;
