import { getPlayerCookieOrThrow } from '$lib/cookies';
import { DoodledashDB } from '$lib/db/doodledash.server';
import { error, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { RoundState } from '$lib/games/doodledash/game';
import { Doodledash } from '$lib/games/doodledash/game.server';
import { DoodledashJobs } from '$lib/games/doodledash/jobs.server';

export const actions = {
  default: async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await DoodledashDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
      include: DoodledashDB.include.playersAndDoodledashWithLatestRound,
    });
    if (game?.doodledash?.rounds.length !== 1) {
      throw error(404);
    }
    const round = game.doodledash.rounds[0];

    const state = (await JSON.parse(round.stateJSON)) as RoundState;
    if (state.step !== 'result') {
      throw error(400);
    }

    try {
      const shouldGeneratePrompts = Doodledash.resultContinue(state);
      await DoodledashDB.updateRoundState(round, state);

      if (shouldGeneratePrompts) {
        setTimeout(() => DoodledashJobs.generatePrompts(game.id), 0);
      }
    } catch (ex) {
      return fail(500, { error: 'Something went wrong' });
    }

    return {};
  },
} satisfies Actions;
