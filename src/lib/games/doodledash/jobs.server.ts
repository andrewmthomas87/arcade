import { DoodledashDB } from '$lib/db/doodledash.server';
import type { RoundState } from './game';
import { Doodledash } from './game.server';

export class DoodledashJobs {
  static drawTimers: Record<number, number> = {};
  static answerTimers: Record<number, number> = {};
  static guessTimers: Record<number, number> = {};

  static async generatePrompts(id: number) {
    const game = await DoodledashDB.byID(id, {
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

      DoodledashJobs.setDrawTimer(id, state.drawTimerEnd);
    } catch (ex) {
      console.log('Failed to generate prompts: error');
      console.error(ex);
    }
  }

  static setDrawTimer(id: number, drawTimerEnd: number) {
    if (id in DoodledashJobs.drawTimers) {
      throw new Error('draw timer already exists');
    }

    DoodledashJobs.drawTimers[id] = setTimeout(
      DoodledashJobs.onDrawTimerEnd.bind(null, id),
      drawTimerEnd - Date.now(),
    );
  }

  static clearDrawTimer(id: number) {
    const timer = DoodledashJobs.drawTimers[id];
    if (timer === undefined) {
      return;
    }

    clearTimeout(timer);
    delete DoodledashJobs.drawTimers[id];
  }

  static setAnswerTimer(id: number, answerTimerEnd: number) {
    if (id in DoodledashJobs.answerTimers) {
      throw new Error('answer timer already exists');
    }

    DoodledashJobs.answerTimers[id] = setTimeout(
      DoodledashJobs.onAnswerTimerEnd.bind(null, id),
      answerTimerEnd - Date.now(),
    );
  }

  static clearAnswerTimer(id: number) {
    const timer = DoodledashJobs.answerTimers[id];
    if (timer === undefined) {
      return;
    }

    clearTimeout(timer);
    delete DoodledashJobs.answerTimers[id];
  }

  static setGuessTimer(id: number, guessTimerEnd: number) {
    if (id in DoodledashJobs.guessTimers) {
      throw new Error('guess timer already exists');
    }

    DoodledashJobs.guessTimers[id] = setTimeout(
      DoodledashJobs.onGuessTimerEnd.bind(null, id),
      guessTimerEnd - Date.now(),
    );
  }

  static clearGuessTimer(id: number) {
    const timer = DoodledashJobs.guessTimers[id];
    if (timer === undefined) {
      return;
    }

    clearTimeout(timer);
    delete DoodledashJobs.guessTimers[id];
  }

  static async onDrawTimerEnd(id: number, playerID: number) {
    delete DoodledashJobs.drawTimers[id];

    const game = await DoodledashDB.byIDAndPlayer(id, playerID, {
      include: DoodledashDB.include.playersAndDoodledashWithLatestRound,
    });
    if (game?.doodledash?.rounds.length !== 1) {
      return;
    }
    const round = game.doodledash.rounds[0];

    try {
      const state = JSON.parse(round.stateJSON) as RoundState;
      Doodledash.drawFinalize(state);
      await DoodledashDB.updateRoundState(round, state);

      DoodledashJobs.setAnswerTimer(id, state.answerTimerEnd);
    } catch (ex) {
      console.log('Failed to finalize draw: error');
      console.error(ex);
    }
  }

  static async onAnswerTimerEnd(id: number, playerID: number) {
    delete DoodledashJobs.answerTimers[id];

    const game = await DoodledashDB.byIDAndPlayer(id, playerID, {
      include: DoodledashDB.include.playersAndDoodledashWithLatestRound,
    });
    if (game?.doodledash?.rounds.length !== 1) {
      return;
    }
    const round = game.doodledash.rounds[0];

    try {
      const state = JSON.parse(round.stateJSON) as RoundState;
      Doodledash.answerFinalize(state);
      await DoodledashDB.updateRoundState(round, state);

      DoodledashJobs.setGuessTimer(id, state.guessTimerEnd);
    } catch (ex) {
      console.log('Failed to finalize answer: error');
      console.error(ex);
    }
  }

  static async onGuessTimerEnd(id: number, playerID: number) {
    delete DoodledashJobs.guessTimers[id];

    const game = await DoodledashDB.byIDAndPlayer(id, playerID, {
      include: DoodledashDB.include.playersAndDoodledashWithLatestRound,
    });
    if (game?.doodledash?.rounds.length !== 1) {
      return;
    }
    const round = game.doodledash.rounds[0];

    try {
      const state = JSON.parse(round.stateJSON) as RoundState;
      Doodledash.guessFinalize(state);
      await DoodledashDB.updateRoundState(round, state);
    } catch (ex) {
      console.log('Failed to finalize guess: error');
      console.error(ex);
    }
  }
}
