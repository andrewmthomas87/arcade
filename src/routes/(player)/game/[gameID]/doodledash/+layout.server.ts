import { getPlayerCookieOrThrow } from '$lib/cookies';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutParams, LayoutRouteId, LayoutServerLoad } from './$types';
import { DoodledashDB } from '$lib/db/doodledash.server';
import type { RoundState, Step } from '$lib/games/doodledash/game';

const ROUTE_ID_FOR_STEP = {
  generating_prompts: '/(player)/game/[gameID]/doodledash/generating-prompts',
  draw: '/(player)/game/[gameID]/doodledash/draw',
  answer: '/(player)/game/[gameID]/doodledash/answer',
  guess: '/(player)/game/[gameID]/doodledash/guess',
  guess_result: '/(player)/game/[gameID]/doodledash/guess-result',
  result: '/(player)/game/[gameID]/doodledash/result',
  end: '/(player)/game/[gameID]/doodledash/end',
} satisfies Record<Step, LayoutRouteId>;

export const load: LayoutServerLoad = async ({ cookies, depends, params, route }) => {
  depends('doodledash');

  const player = getPlayerCookieOrThrow(cookies);
  const game = await DoodledashDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
    include: DoodledashDB.include.playersAndDoodledashWithLatestRound,
  });
  if (!game) {
    throw error(404);
  }

  let routeID: LayoutRouteId;
  if (game.doodledash?.rounds.length === 1) {
    const round = game.doodledash.rounds[0];
    const state = JSON.parse(round.stateJSON) as RoundState;
    routeID = ROUTE_ID_FOR_STEP[state.step];
  } else {
    routeID = '/(player)/game/[gameID]/doodledash/create';
  }

  if (route.id !== routeID) {
    throw redirect(303, urlForRouteID(routeID, params));
  }
};

function urlForRouteID(routeID: LayoutRouteId, params: LayoutParams) {
  return routeID
    .replace('/(player)', '')
    .replace('/(active)', '')
    .replace('[gameID]', params.gameID);
}
