import { getPlayerCookieOrThrow } from '$lib/cookies';
import { error, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { DoodledashDB } from '$lib/db/doodledash.server';
import { buildRoundState, type RoundInit, type RoundState } from '$lib/games/doodledash/game';
import { Doodledash } from '$lib/games/doodledash/game.server';
import { DoodledashJobs } from '$lib/games/doodledash/jobs.server';

export const actions = {
  default: async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await DoodledashDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
      include: DoodledashDB.include.playersAndDoodledashWithLatestRound,
    });
    if (!game) {
      throw error(404);
    } else if (game.doodledash) {
      return fail(400, { error: 'invalid action' });
    }

    try {
      const init: RoundInit = { playerIDs: game.players.map((p) => p.id) };
      const state = buildRoundState(init);
      await DoodledashDB.create(game.id, init, state);

      setTimeout(() => DoodledashJobs.generatePrompts(game.id, player.id), 0);
    } catch {
      return fail(500, { error: 'Something went wrong' });
    }

    return { error: null };
  },
} satisfies Actions;
