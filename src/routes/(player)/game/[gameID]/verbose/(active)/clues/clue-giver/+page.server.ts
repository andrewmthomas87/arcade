import { getPlayerCookieOrThrow } from '$lib/cookies';
import { VerboseDB } from '$lib/db/verbose.server';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { RoundState } from '$lib/games/verbose/game';
import { z } from 'zod';
import { formatZodError } from '$lib/zod-error';
import { Verbose } from '$lib/games/verbose/game.server';

export const load: PageServerLoad = async ({ cookies, depends, params }) => {
  depends('verbose');

  const player = getPlayerCookieOrThrow(cookies);
  const game = await VerboseDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
    include: VerboseDB.include.playersAndVerboseWithLatestRound,
  });
  if (game?.verbose?.rounds.length !== 1) {
    throw error(404);
  }
  const round = game.verbose.rounds[0];

  const state = (await JSON.parse(round.stateJSON)) as RoundState;
  if (!(state.step === 'clues' && player.id !== state.guesserID)) {
    throw error(400);
  }

  const guesser = game.players.find((p) => p.id === state.guesserID);
  const word = state.words[state.round - 1];
  const hasSubmittedClue = state.clues[state.round - 1][player.id] !== undefined;
  const waiting = game.players.filter(
    (p) => p.id !== state.guesserID && state.clues[state.round - 1][p.id] === undefined,
  );

  return { guesser, word, hasSubmittedClue, waiting };
};

const defaultActionDataSchema = z.object({
  clue: z
    .string()
    .trim()
    .min(1)
    .max(32)
    .regex(/^[a-zA-Z]*$/, 'Must be alpha'),
});

export const actions = {
  default: async ({ cookies, params, request }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await VerboseDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
      include: VerboseDB.include.playersAndVerboseWithLatestRound,
    });
    if (!game) {
      throw error(404);
    } else if (game.verbose?.rounds.length !== 1) {
      return fail(400, { error: 'invalid action' });
    }
    const round = game.verbose.rounds[0];

    const data = await request.formData();
    const parsedData = defaultActionDataSchema.safeParse({ clue: data.get('clue') });
    if (!parsedData.success) {
      return fail(400, { error: formatZodError(parsedData.error) });
    }
    const { clue } = parsedData.data;

    try {
      const state = JSON.parse(round.stateJSON) as RoundState;

      await Verbose.cluesSubmit(state, player, clue);
      if (Verbose.cluesIsDone(state)) {
        Verbose.cluesFinalize(state);
      }

      await VerboseDB.updateRoundState(round, state);
    } catch (ex) {
      return fail(500, { error: 'Something went wrong' });
    }

    return { error: null };
  },
} satisfies Actions;
