import { db } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { GAME_TYPES } from '$lib/games';
import { formatZodError } from '$lib/zod-error';
import { getPlayerCookieOrThrow } from '$lib/cookies';

export const load: PageServerLoad = async ({ cookies, depends, params }) => {
  depends('lobby');

  const player = getPlayerCookieOrThrow(cookies);

  const lobby = await db.lobby.findUnique({
    where: { code: params.lobbyCode, players: { some: { id: player.id } } },
    include: { players: true, activeGame: { include: { players: true } } },
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

    const lobby = await db.lobby.findUnique({
      where: { code: params.lobbyCode, players: { some: { id: player.id } } },
      include: { players: true },
    });
    if (!(lobby && lobby.activeGameId === null)) {
      throw error(400);
    }

    const data = await request.formData();
    const parsedData = actionDataSchema.safeParse({ type: data.get('type') });
    if (!parsedData.success) {
      return fail(400, { error: formatZodError(parsedData.error) });
    }
    const type = parsedData.data.type;

    const game = await db.game.create({
      data: {
        type,
        players: { connect: lobby.players.map((player) => ({ id: player.id })) },
        lobby: { connect: { id: lobby.id } },
        activeLobby: { connect: { id: lobby.id } },
      },
    });

    throw redirect(303, `/game/${game.id}`);
  },
} satisfies Actions;
