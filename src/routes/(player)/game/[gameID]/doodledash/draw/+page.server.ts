import { getPlayerCookieOrThrow } from '$lib/cookies';
import { DoodledashDB } from '$lib/db/doodledash.server';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { RoundState } from '$lib/games/doodledash/game';
import { z } from 'zod';
import { formatZodError } from '$lib/zod-error';
import { Doodledash } from '$lib/games/doodledash/game.server';
import { DoodledashJobs } from '$lib/games/doodledash/jobs.server';

export const load: PageServerLoad = async ({ cookies, depends, params }) => {
  depends('doodledash');

  const player = getPlayerCookieOrThrow(cookies);
  const game = await DoodledashDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
    include: DoodledashDB.include.playersAndDoodledashWithLatestRound,
  });
  if (game?.doodledash?.rounds.length !== 1) {
    throw error(404);
  }
  const round = game.doodledash.rounds[0];

  const state = (await JSON.parse(round.stateJSON)) as RoundState;
  if (state.step !== 'draw') {
    throw error(400);
  }

  const { drawTimerEnd } = state;
  const prompt = state.prompts[state.round - 1][player.id];
  const submittedDrawing = state.drawings[state.round - 1][player.id];

  return { drawTimerEnd, prompt, submittedDrawing };
};

const defaultActionDataSchema = z.object({ drawing: z.string() });

export const actions = {
  default: async ({ cookies, params, request }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await DoodledashDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
      include: DoodledashDB.include.playersAndDoodledashWithLatestRound,
    });
    if (game?.doodledash?.rounds.length !== 1) {
      throw error(404);
    }
    const round = game.doodledash.rounds[0];

    const data = await request.formData();
    const parsedData = defaultActionDataSchema.safeParse({ drawing: data.get('drawing') });
    if (!parsedData.success) {
      return fail(400, { error: formatZodError(parsedData.error) });
    }
    const { drawing } = parsedData.data;

    try {
      const state = JSON.parse(round.stateJSON) as RoundState;

      const isDrawComplete = Doodledash.drawSubmit(state, player, JSON.parse(drawing));
      if (isDrawComplete) {
        Doodledash.drawFinalize(state);
        DoodledashJobs.clearDrawTimer(game.id);
        DoodledashJobs.setAnswerTimer(game.id, state.answerTimerEnd);
      }
      await DoodledashDB.updateRoundState(round, state);
    } catch (ex) {
      return fail(500, { error: 'Something went wrong' });
    }

    return {};
  },
} satisfies Actions;
