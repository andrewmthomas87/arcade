import { getPlayerCookieOrThrow } from '$lib/cookies';
import { error, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { DoodledashDB } from '$lib/db/doodledash.server';
import { buildRoundState, type RoundInit } from '$lib/games/doodledash/game';
import { DoodledashJobs } from '$lib/games/doodledash/jobs.server';
import { z } from 'zod';
import { formatZodError } from '$lib/zod-error';

const defaultActionDataSchema = z.object({
  drawTime: z.coerce.number().min(10).max(300),
  guessTime: z.coerce.number().min(10).max(300),
  answerTime: z.coerce.number().min(10).max(300),
});

export const actions = {
  default: async ({ cookies, params, request }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await DoodledashDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
      include: DoodledashDB.include.playersAndDoodledashWithLatestRound,
    });
    if (!game) {
      throw error(404);
    } else if (game.doodledash) {
      return fail(400, { error: 'invalid action' });
    }

    const data = await request.formData();
    const parsedData = defaultActionDataSchema.safeParse({
      drawTime: data.get('draw-time'),
      guessTime: data.get('guess-time'),
      answerTime: data.get('answer-time'),
    });
    if (!parsedData.success) {
      return fail(400, { error: formatZodError(parsedData.error) });
    }
    const { drawTime, guessTime, answerTime } = parsedData.data;

    try {
      const init: RoundInit = {
        playerIDs: game.players.map((p) => p.id),
        config: { drawTime, answerTime, guessTime },
      };
      const state = buildRoundState(init);
      await DoodledashDB.create(game.id, init, state);

      setTimeout(() => DoodledashJobs.generatePrompts(game.id), 0);
    } catch {
      return fail(500, { error: 'Something went wrong' });
    }

    return { error: null };
  },
} satisfies Actions;
