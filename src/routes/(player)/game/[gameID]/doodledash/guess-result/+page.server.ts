import { getPlayerCookieOrThrow } from '$lib/cookies';
import { DoodledashDB } from '$lib/db/doodledash.server';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { RoundState } from '$lib/games/doodledash/game';
import { Doodledash } from '$lib/games/doodledash/game.server';

export const load: PageServerLoad = async ({ cookies, depends, params }) => {
  depends('doodledash');

  const player = getPlayerCookieOrThrow(cookies);
  const game = await DoodledashDB.byIDAndPlayer(Number(params.gameID) || -1, player.id, {
    include: DoodledashDB.include.playersAndDoodledashWithLatestRound,
  });
  if (game?.doodledash?.rounds.length !== 1) {
    throw error(404);
  }
  const round = game.doodledash.rounds[0];

  const state = (await JSON.parse(round.stateJSON)) as RoundState;
  if (state.step !== 'guess_result') {
    throw error(400);
  }

  const index = state.index;
  const players = game.players;
  const myID = player.id;
  const activePlayerID = state.order[state.round - 1][index];
  const activePlayer = game.players.find((p) => p.id === activePlayerID)!;
  const isMe = activePlayerID === player.id;
  const prompt = state.prompts[state.round - 1][activePlayerID];
  const activeDrawing = state.drawings[state.round - 1][activePlayerID];
  const answers = state.answers[state.round - 1][activePlayerID];
  const guesses = state.guesses[state.round - 1][activePlayerID];
  const guessesByPlayer = Object.fromEntries<number[]>(
    state.playerIDs.map((playerID) => [playerID, []]),
  );
  for (const playerID of state.playerIDs) {
    if (playerID === activePlayerID) {
      continue;
    }

    const guessPlayerID = guesses[playerID];
    guessesByPlayer[guessPlayerID].push(playerID);
  }

  return {
    index,
    players,
    myID,
    activePlayer,
    isMe,
    prompt,
    activeDrawing,
    answers,
    guessesByPlayer,
  };
};

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
    if (state.step !== 'guess_result') {
      throw error(400);
    }

    try {
      Doodledash.guessResultContinue(state);
      await DoodledashDB.updateRoundState(round, state);
    } catch (ex) {
      return fail(500, { error: 'Something went wrong' });
    }

    return {};
  },
} satisfies Actions;
