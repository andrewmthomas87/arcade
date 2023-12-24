import { getPlayerCookieOrThrow } from '$lib/cookies';
import { DoodledashDB } from '$lib/db/doodledash.server';
import { error, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { buildRoundState, type RoundInit } from '$lib/games/doodledash/game';
import { DoodledashJobs } from '$lib/games/doodledash/jobs.server';
import { LobbyDB } from '$lib/db/lobby.server';

export const actions = {
  'play-again': async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await DoodledashDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
      include: DoodledashDB.include.playersAndDoodledashWithLatestRound,
    });
    if (game?.doodledash?.rounds.length !== 1) {
      throw error(404);
    }
    const round = game.doodledash.rounds[0];

    try {
      const prevInit = JSON.parse(round.initJSON) as RoundInit;
      const { playerIDs } = prevInit;

      const init: RoundInit = { playerIDs };
      const state = buildRoundState(init);
      await DoodledashDB.addRound(game.id, round.number + 1, init, state);

      setTimeout(() => DoodledashJobs.generatePrompts(game.id, player.id), 0);
    } catch (ex) {
      return fail(500, { error: 'Something went wrong' });
    }

    return {};
  },

  lobby: async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await DoodledashDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {});
    if (!game) {
      throw error(404);
    }

    await LobbyDB.disconnectActiveGame(game.lobbyId);

    return {};
  },
} satisfies Actions;
