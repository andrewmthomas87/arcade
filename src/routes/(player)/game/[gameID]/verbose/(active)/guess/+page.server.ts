import { getPlayerCookieOrThrow } from '$lib/cookies';
import { VerboseDB } from '$lib/db/verbose.server';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { RoundState } from '$lib/games/verbose/game';

export const load: PageServerLoad = async ({ cookies, params }) => {
  const player = getPlayerCookieOrThrow(cookies);
  const game = await VerboseDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
    include: VerboseDB.include.playersAndVerboseWithLatestRound,
  });
  if (game?.verbose?.rounds.length !== 1) {
    throw error(404);
  }
  const round = game.verbose.rounds[0];

  const state = (await JSON.parse(round.stateJSON)) as RoundState;
  if (state.step !== 'guess') {
    throw error(400);
  }

  const isGuesser = player.id === state.guesserID;
  throw redirect(
    303,
    `/game/${params.gameID}/verbose/guess/${isGuesser ? 'guesser' : 'clue-giver'}`,
  );
};
