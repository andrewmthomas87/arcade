import { getPlayerCookieOrThrow } from '$lib/cookies';
import { VerboseDB } from '$lib/db/verbose.server';
import { error, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { Verbose } from '$lib/games/verbose/game.server';
import { buildRoundState, type RoundInit } from '$lib/games/verbose/game';

export const actions = {
  default: async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await VerboseDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
      include: VerboseDB.include.playersAndVerboseWithLatestRound,
    });
    if (!game) {
      throw error(404);
    } else if (game.verbose) {
      return fail(400, { error: 'invalid action' });
    }

    try {
      const word = await Verbose.getRandomWord();
      const init: RoundInit = { playerIDs: game.players.map((p) => p.id), word };
      const state = buildRoundState(init);
      await VerboseDB.create(game.id, init, state);
    } catch {
      return fail(500, { error: 'Something went wrong' });
    }

    return { error: null };
  },
} satisfies Actions;
