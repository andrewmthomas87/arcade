import { getPlayerCookieOrThrow } from '$lib/cookies';
import { error, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { VerboseDB } from '$lib/db/verbose.server';
import { LobbyDB } from '$lib/db/lobby.server';
import { buildRoundState, type RoundInit } from '$lib/games/verbose/game';
import { Verbose } from '$lib/games/verbose/game.server';

export const actions = {
  'play-again': async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await VerboseDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
      include: VerboseDB.include.playersAndVerboseWithLatestRound,
    });
    if (game?.verbose?.rounds.length !== 1) {
      throw error(404);
    }
    const round = game.verbose.rounds[0];

    try {
      const prevInit = JSON.parse(round.initJSON) as RoundInit;
      const { playerIDs } = prevInit;

      const word = await Verbose.getRandomWord();
      const init: RoundInit = { playerIDs, word };
      const state = buildRoundState(init);
      await VerboseDB.addRound(game.id, round.number + 1, init, state);
    } catch (ex) {
      return fail(500, { error: 'Something went wrong' });
    }

    return {};
  },

  lobby: async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);
    const game = await VerboseDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {});
    if (!game) {
      throw error(404);
    }

    await LobbyDB.disconnectActiveGame(game.lobbyId);

    return {};
  },
} satisfies Actions;
