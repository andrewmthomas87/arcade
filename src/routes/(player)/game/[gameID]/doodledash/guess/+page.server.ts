import { getPlayerCookieOrThrow } from '$lib/cookies';
import { DoodledashDB } from '$lib/db/doodledash.server';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { RoundState } from '$lib/games/doodledash/game';
import { z } from 'zod';
import { formatZodError } from '$lib/zod-error';
import { Doodledash } from '$lib/games/doodledash/game.server';

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
  if (state.step !== 'guess') {
    throw error(400);
  }

  const index = state.index;
  const activePlayerID = state.order[state.round - 1][index];
  const activePlayer = game.players.find((p) => p.id === activePlayerID)!;
  const isMe = activePlayerID === player.id;
  const activeDrawing = state.drawings[state.round - 1][activePlayerID];
  const activeAnswers = state.answerOrders[state.round - 1][activePlayerID].map((playerID) =>
    playerID === activePlayerID
      ? state.prompts[state.round - 1][activePlayerID]
      : state.answers[state.round - 1][activePlayerID][playerID],
  );
  const submittedGuessPlayerID = state.guesses[state.round - 1][activePlayerID][player.id];
  let submittedGuess = undefined;
  if (submittedGuessPlayerID !== undefined) {
    submittedGuess =
      submittedGuessPlayerID === activePlayerID
        ? state.prompts[state.round - 1][activePlayerID]
        : state.answers[state.round - 1][activePlayerID][submittedGuessPlayerID];
  }

  return { index, activePlayer, isMe, activeDrawing, activeAnswers, submittedGuess };
};

const defaultActionDataSchema = z.object({ index: z.coerce.number() });

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
    if (state.step !== 'guess') {
      throw error(400);
    }

    const data = await request.formData();
    const parsedData = defaultActionDataSchema.safeParse({ index: data.get('index') });
    if (!parsedData.success) {
      return fail(400, { error: formatZodError(parsedData.error) });
    }
    const { index } = parsedData.data;

    try {
      Doodledash.guessSubmit(state, player, index);
      await DoodledashDB.updateRoundState(round, state);
    } catch (ex) {
      return fail(500, { error: 'Something went wrong' });
    }

    return {};
  },
} satisfies Actions;
