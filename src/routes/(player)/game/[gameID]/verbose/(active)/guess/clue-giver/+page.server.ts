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
  if (!(state.step === 'guess' && player.id !== state.guesserID)) {
    throw error(400);
  }

  const guesser = game.players.find((p) => p.id === state.guesserID);
  const word = state.words[state.round - 1];
  const clues = Object.entries(state.clues[state.round - 1]).map(([id, clue]) => ({
    ...clue,
    player: game.players.find((p) => p.id === Number(id)),
  }));
  const uniqueClues = clues.filter((c) => !c.isDuplicate);
  const duplicateClues = clues.filter((c) => c.isDuplicate);

  return { guesser, word, uniqueClues, duplicateClues };
};
