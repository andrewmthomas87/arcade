import { VerboseDB } from '$lib/db/verbose.server';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutParams, LayoutRouteId, LayoutServerLoad } from './$types';
import type { RoundState, Step } from '$lib/games/verbose/game';
import { getPlayerCookieOrThrow } from '$lib/cookies';

const ROUTE_ID_FOR_STEP = {
  clues: '/(player)/game/[gameID]/verbose/(active)/clues',
  guess: '/(player)/game/[gameID]/verbose/(active)/guess',
  result: '/(player)/game/[gameID]/verbose/(active)/result',
  end: '/(player)/game/[gameID]/verbose/end',
} satisfies Record<Step, LayoutRouteId>;

export const load: LayoutServerLoad = async ({ cookies, depends, params, route }) => {
  depends('verbose');

  const player = getPlayerCookieOrThrow(cookies);
  const game = await VerboseDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
    include: VerboseDB.include.playersAndVerboseWithLatestRound,
  });
  if (!game) {
    throw error(404);
  }

  let status;
  let routeID: LayoutRouteId;
  if (game.verbose?.rounds.length === 1) {
    const round = game.verbose.rounds[0];
    const state = JSON.parse(round.stateJSON) as RoundState;
    status = { score: state.score, remainingRounds: state.remainingRounds, round: state.round };
    routeID = ROUTE_ID_FOR_STEP[state.step];
  } else {
    routeID = '/(player)/game/[gameID]/verbose/create';
    status = null;
  }

  if (!route.id.startsWith(routeID)) {
    throw redirect(303, urlForRouteID(routeID, params));
  }

  return { status };
};

function urlForRouteID(routeID: LayoutRouteId, params: LayoutParams) {
  return routeID
    .replace('/(player)', '')
    .replace('/(active)', '')
    .replace('[gameID]', params.gameID);
}
