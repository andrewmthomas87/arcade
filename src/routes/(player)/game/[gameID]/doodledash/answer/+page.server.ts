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
  if (state.step !== 'answer') {
    throw error(400);
  }

  const { index, answerTimerEnd } = state;
  const activePlayerID = state.order[state.round - 1][index];
  const activePlayer = game.players.find((p) => p.id === activePlayerID)!;
  const isMe = activePlayerID === player.id;
  const activeDrawing = state.drawings[state.round - 1][activePlayerID];
  const submittedAnswer = state.answers[state.round - 1][activePlayerID][player.id];

  return { index, answerTimerEnd, activePlayer, isMe, activeDrawing, submittedAnswer };
};

const defaultActionDataSchema = z.object({ answer: z.string() });

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

    const state = (await JSON.parse(round.stateJSON)) as RoundState;
    if (state.step !== 'answer') {
      throw error(400);
    }

    const data = await request.formData();
    const parsedData = defaultActionDataSchema.safeParse({ answer: data.get('answer') });
    if (!parsedData.success) {
      return fail(400, { error: formatZodError(parsedData.error) });
    }
    const { answer } = parsedData.data;

    try {
      const isActivePlayerComplete = Doodledash.answerSubmit(state, player, answer);
      if (isActivePlayerComplete) {
        Doodledash.answerFinalize(state);
        DoodledashJobs.clearAnswerTimer(game.id);
        DoodledashJobs.setGuessTimer(game.id, state.guessTimerEnd);
      }
      await DoodledashDB.updateRoundState(round, state);
    } catch (ex) {
      return fail(500, { error: 'Something went wrong' });
    }

    return {};
  },
} satisfies Actions;
