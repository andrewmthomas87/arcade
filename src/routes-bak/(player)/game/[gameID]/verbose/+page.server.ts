import { getPlayerCookieOrThrow } from '$lib/cookies';
import { db } from '$lib/server/db';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { Verbose } from '$lib/games/verbose/game.server';
import { z } from 'zod';
import { formatZodError } from '$lib/zod-error';
import type { RoundState } from '$lib/games/verbose/game';

export const load: PageServerLoad = async ({ cookies, depends, params }) => {
  depends('verbose');

  const player = getPlayerCookieOrThrow(cookies);
  const game = await getGamePlayersAndLatestRound(Number(params.gameID) || -1, player.id);

  return { game };
};

const clueActionDataSchema = z.object({
  clue: z
    .string()
    .trim()
    .min(1)
    .max(32)
    .regex(/^[a-zA-Z]*$/, 'Must be alpha'),
});

const guessActionDataSchema = z.object({
  guess: z
    .string()
    .trim()
    .min(1)
    .max(32)
    .regex(/^[a-zA-Z]*$/, 'Must be alpha'),
});

export const actions = {
  create: async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await getGamePlayersAndLatestRound(Number(params.gameID) || -1, player.id);
    if (!game) {
      throw error(404);
    }

    try {
      await Verbose.create(
        game.id,
        game.players.map((p) => p.id),
      );
    } catch (ex) {
      return fail(500, { error: 'Something went wrong' });
    }

    return {};
  },

  clue: async ({ cookies, params, request }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await getGamePlayersAndLatestRound(Number(params.gameID) || -1, player.id);
    if (!(game && game.verbose?.rounds.length === 1)) {
      throw error(404);
    }
    const round = game.verbose.rounds[0];

    const data = await request.formData();
    const parsedData = clueActionDataSchema.safeParse({
      clue: data.get('clue'),
      count: data.get('count'),
    });
    if (!parsedData.success) {
      return fail(400, { error: formatZodError(parsedData.error) });
    }
    const { clue } = parsedData.data;

    try {
      await Verbose.submitClue(round, player, clue);
    } catch (ex) {
      return fail(500, { error: 'Something went wrong' });
    }

    return {};
  },

  guess: async ({ cookies, params, request }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await getGamePlayersAndLatestRound(Number(params.gameID) || -1, player.id);
    if (!(game && game.verbose?.rounds.length === 1)) {
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
      await Verbose.submitGuess(round, player, guess);
    } catch (ex) {
      return fail(500, { error: 'Something went wrong' });
    }

    return {};
  },

  pass: async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await getGamePlayersAndLatestRound(Number(params.gameID) || -1, player.id);
    if (!(game && game.verbose?.rounds.length === 1)) {
      throw error(404);
    }
    const round = game.verbose.rounds[0];

    try {
      await Verbose.submitPass(round, player);
    } catch (ex) {
      return fail(500, { error: 'Something went wrong' });
    }

    return {};
  },

  continue: async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await getGamePlayersAndLatestRound(Number(params.gameID) || -1, player.id);
    if (!(game && game.verbose?.rounds.length === 1)) {
      throw error(404);
    }
    const round = game.verbose.rounds[0];

    const state = JSON.parse(round.stateJSON) as RoundState;
    if (state.remainingRounds > 0) {
      try {
        await Verbose.continueToNextRound(round);
      } catch (ex) {
        return fail(500, { error: 'Something went wrong' });
      }
    } else {
      try {
        await Verbose.continueToEnd(round);
      } catch (ex) {
        return fail(500, { error: 'Something went wrong' });
      }
    }

    return {};
  },

  'play-again': async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await getGamePlayersAndLatestRound(Number(params.gameID) || -1, player.id);
    if (!(game && game.verbose?.rounds.length === 1)) {
      throw error(404);
    }
    const round = game.verbose.rounds[0];

    try {
      await Verbose.playAgain(game.verbose, round);
    } catch (ex) {
      return fail(500, { error: 'Something went wrong' });
    }

    return {};
  },

  lobby: async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await getGamePlayersAndLatestRound(Number(params.gameID) || -1, player.id);
    if (!game) {
      throw error(404);
    }

    await db.lobby.update({
      where: { id: game.lobbyId },
      data: { activeGame: { disconnect: true } },
    });

    return {};
  },
} satisfies Actions;

function getGamePlayersAndLatestRound(id: number, playerID: number) {
  return db.game.findUniqueOrThrow({
    where: { id, players: { some: { id: playerID } } },
    include: {
      players: true,
      verbose: { include: { rounds: { orderBy: { number: 'desc' }, take: 1 } } },
    },
  });
}
