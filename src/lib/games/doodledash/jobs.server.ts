import { DoodledashDB } from '$lib/db/doodledash.server';
import type { RoundState } from './game';
import { Doodledash } from './game.server';

export class DoodledashJobs {
  static async generatePrompts(id: number, playerID: number) {
    console.log('generatePrompts', { id, playerID });

    const game = await DoodledashDB.byIDAndPlayer(id, playerID, {
      include: DoodledashDB.include.playersAndDoodledashWithLatestRound,
    });
    if (game?.doodledash?.rounds.length !== 1) {
      console.log('Failed to generate prompts: invalid game');

      return;
    }
    const round = game.doodledash.rounds[0];

    try {
      const state = JSON.parse(round.stateJSON) as RoundState;
      await Doodledash.generatePrompts(state);
      await DoodledashDB.updateRoundState(round, state);
    } catch (ex) {
      console.log('Failed to generate prompts: error');
      console.error(ex);
    }
  }
}
