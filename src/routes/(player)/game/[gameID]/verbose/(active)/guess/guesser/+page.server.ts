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
  if (!(state.step === 'guess' && player.id === state.guesserID)) {
    throw error(400);
  }

  const clues = Object.entries(state.clues[state.round - 1]).map(([id, clue]) => ({
    ...clue,
    player: game.players.find((p) => p.id === Number(id)),
  }));
  const uniqueClues = clues.filter((c) => !c.isDuplicate);
  const duplicateClueCount = clues.length - uniqueClues.length;

  return { uniqueClues, duplicateClueCount };
};

const guessActionDataSchema = z.object({
  guess: z
    .string()
    .trim()
    .min(1)
    .max(32)
    .regex(/^[a-zA-Z]*$/, 'Must be alpha'),
});

export const actions = {
  guess: async ({ cookies, params, request }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await VerboseDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
      include: VerboseDB.include.playersAndVerboseWithLatestRound,
    });
    if (game?.verbose?.rounds.length !== 1) {
      throw error(404);
    }
    const round = game.verbose.rounds[0];

    const data = await request.formData();
    const parsedData = guessActionDataSchema.safeParse({
      guess: data.get('guess'),
      count: data.get('count'),
    });
    if (!parsedData.success) {
      return fail(400, { error: formatZodError(parsedData.error) });
    }
    const { guess } = parsedData.data;

    try {
      const state = JSON.parse(round.stateJSON) as RoundState;

      await Verbose.guessSubmit(state, player, guess);
      await VerboseDB.updateRoundState(round, state);
    } catch (ex) {
      return fail(500, { error: 'Something went wrong' });
    }

    return { error: null };
  },

  pass: async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await VerboseDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
      include: VerboseDB.include.playersAndVerboseWithLatestRound,
    });
    if (game?.verbose?.rounds.length !== 1) {
      throw error(404);
    }
    const round = game.verbose.rounds[0];

    try {
      const state = JSON.parse(round.stateJSON) as RoundState;

      await Verbose.guessPass(state, player);
      await VerboseDB.updateRoundState(round, state);
    } catch (ex) {
      return fail(500, { error: 'Something went wrong' });
    }

    return { error: null };
  },
} satisfies Actions;
