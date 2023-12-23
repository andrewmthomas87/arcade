import { getPlayerCookieOrThrow } from '$lib/cookies';
import { VerboseDB } from '$lib/db/verbose.server';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutParams, LayoutRouteId, LayoutServerLoad } from './$types';
import type { RoundState } from '$lib/games/verbose/game';

export const load: LayoutServerLoad = async ({ cookies, depends, params, route }) => {
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
  if (state.step !== 'guess') {
    throw error(400);
  }

  const isGuesser = player.id === state.guesserID;
  const routeID: LayoutRouteId = isGuesser
    ? '/(player)/game/[gameID]/verbose/(active)/guess/guesser'
    : '/(player)/game/[gameID]/verbose/(active)/guess/clue-giver';
  if (route.id !== routeID) {
    throw redirect(303, urlForRouteID(routeID, params));
  }

  return {};
};

function urlForRouteID(routeID: LayoutRouteId, params: LayoutParams) {
  return routeID
    .replace('/(player)', '')
    .replace('/(active)', '')
    .replace('[gameID]', params.gameID);
}
