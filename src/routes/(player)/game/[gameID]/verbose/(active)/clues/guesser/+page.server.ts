import { getPlayerCookieOrThrow } from '$lib/cookies';
import { VerboseDB } from '$lib/db/verbose.server';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { RoundState } from '$lib/games/verbose/game';

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
  if (!(state.step === 'clues' && player.id === state.guesserID)) {
    throw error(400);
  }

  const waiting = game.players.filter(
    (p) => p.id !== state.guesserID && state.clues[state.round - 1][p.id] === undefined,
  );

  return { waiting };
};
