import { getPlayerCookieOrThrow } from '$lib/cookies';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { BOARD_SIZE_KEYS } from '$lib/games/codenames';
import { formatZodError } from '$lib/zod-error';
import { Codenames } from '$lib/games/codenames/game.server';

export const load: PageServerLoad = async ({ depends, params }) => {
  depends('codenames');

  const game = await db.game.findUniqueOrThrow({
    where: { id: Number(params.gameID) || -1 },
    include: { codenames: true },
  });

  return { game };
};

const createActionDataSchema = z.object({ boardSize: z.enum(BOARD_SIZE_KEYS) });

export const actions = {
  create: async ({ cookies, params, request }) => {
    const player = getPlayerCookieOrThrow(cookies);

    const game = await db.game.findUnique({
      where: { id: Number(params.gameID) || -1, players: { some: { id: player.id } } },
    });
    if (!game) {
      throw error(404);
    }

    const data = await request.formData();
    const parsedData = createActionDataSchema.safeParse({ boardSize: data.get('board-size') });
    if (!parsedData.success) {
      throw error(400, { message: formatZodError(parsedData.error) });
    }
    const { boardSize } = parsedData.data;

    await Codenames.create(game.id, boardSize);

    return {};
  },
} satisfies Actions;
