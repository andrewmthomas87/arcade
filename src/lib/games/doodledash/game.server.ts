import { DoodledashAI } from '$lib/ai/doodledash.server';
import type { PlayerCookie } from '$lib/cookies';
import { db } from '$lib/db/db.server';
import { sampleNRandomInts } from '$lib/utils/random';
import { shuffleArrayDurstenfeld } from '$lib/utils/shuffle';
import type { Drawing, RoundState } from './game';

export class Doodledash {
  static async generatePrompts(state: RoundState) {
    if (state.step !== 'generating_prompts') {
      throw new Error('expected generating_prompts step');
    }

    const count = await db.doodledashWord.count();

    const prompts: Record<number, string> = {};
    for (const id of state.playerIDs) {
      const indices = sampleNRandomInts(2, 0, count);
      const rows = await db.doodledashWord.findMany({ where: { index: { in: indices } } });
      const words = indices.map((index) => rows.find((row) => row.index === index)!.word);

      let prompt = null;
      for (let i = 0; i < 5; i++) {
        try {
          prompt = await DoodledashAI.generatePrompt(words);
          break;
        } catch (ex) {}
      }

      if (!prompt) {
        throw new Error('failed to generate prompts');
      }

      prompts[id] = prompt.trim().toLowerCase();
    }

    state.prompts[state.round - 1] = prompts;
    state.step = 'draw';
    state.drawTimerEnd = Date.now() + state.config.drawTime * 1000;
  }

  static drawSubmit(state: RoundState, player: PlayerCookie, drawing: Drawing) {
    if (state.step !== 'draw') {
      throw new Error('expected draw step');
    }

    state.drawings[state.round - 1][player.id] = drawing;

    const isDrawComplete =
      Object.keys(state.drawings[state.round - 1]).length === state.playerIDs.length;
    return isDrawComplete;
  }

  static drawFinalize(state: RoundState) {
    if (state.step !== 'draw') {
      throw new Error('expected draw step');
    }

    for (const playerID of state.playerIDs) {
      if (!(playerID in state.drawings[state.round - 1])) {
        state.drawings[state.round - 1][playerID] = [];
      }
    }

    state.drawTimerEnd = -1;

    const firstPlayerID = state.order[state.round - 1][0];
    state.answers[state.round - 1][firstPlayerID] = {};
    state.step = 'answer';
    state.answerTimerEnd = Date.now() + state.config.answerTime * 1000;
  }

  static answerSubmit(state: RoundState, player: PlayerCookie, answer: string) {
    if (state.step !== 'answer') {
      throw new Error('expected answer step');
    }

    const activePlayerID = state.order[state.round - 1][state.index];
    if (activePlayerID === player.id) {
      throw new Error('invalid action');
    }

    state.answers[state.round - 1][activePlayerID][player.id] = answer.trim().toLowerCase();

    const isActivePlayerComplete =
      Object.keys(state.answers[state.round - 1][activePlayerID]).length ===
      state.playerIDs.length - 1;
    return isActivePlayerComplete;
  }

  static answerFinalize(state: RoundState) {
    if (state.step !== 'answer') {
      throw new Error('expected answer step');
    }

    state.answerTimerEnd = -1;

    const activePlayerID = state.order[state.round - 1][state.index];

    const order = state.playerIDs.slice();
    shuffleArrayDurstenfeld(order);

    state.answerOrders[state.round - 1][activePlayerID] = order;
    state.guesses[state.round - 1][activePlayerID] = {};
    state.step = 'guess';
    state.guessTimerEnd = Date.now() + state.config.guessTime * 1000;
  }

  static guessSubmit(state: RoundState, player: PlayerCookie, guessIndex: number) {
    if (state.step !== 'guess') {
      throw new Error('expected guess step');
    }

    const activePlayerID = state.order[state.round - 1][state.index];
    if (activePlayerID === player.id) {
      throw new Error('invalid action');
    }

    const answerOrder = state.answerOrders[state.round - 1][activePlayerID];
    if (guessIndex < 0 || guessIndex >= answerOrder.length) {
      throw new Error('invalid guess index');
    }
    const guess = answerOrder[guessIndex];

    state.guesses[state.round - 1][activePlayerID][player.id] = guess;

    const isActivePlayerComplete =
      Object.keys(state.guesses[state.round - 1][activePlayerID]).length ===
      state.playerIDs.length - 1;
    return isActivePlayerComplete;
  }

  static guessFinalize(state: RoundState) {
    if (state.step !== 'guess') {
      throw new Error('expected guess step');
    }

    state.guessTimerEnd = -1;
    state.step = 'guess_result';
  }

  static guessResultContinue(state: RoundState) {
    if (state.step !== 'guess_result') {
      throw new Error('expected guess_result step');
    }

    const isLastPlayer = state.index === state.playerIDs.length - 1;
    if (isLastPlayer) {
      state.step = 'result';
    } else {
      state.index++;
      const nextActivePlayerID = state.order[state.round - 1][state.index];
      state.answers[state.round - 1][nextActivePlayerID] = {};
      state.step = 'answer';
      state.answerTimerEnd = Date.now() + state.config.answerTime * 1000;
    }

    return isLastPlayer;
  }

  static resultContinue(state: RoundState) {
    if (state.round === 3) {
      state.step = 'end';

      return false;
    }

    const order = state.playerIDs.slice();
    shuffleArrayDurstenfeld(order);

    state.round++;
    state.step = 'generating_prompts';
    state.index = 0;
    state.order.push(order);
    state.prompts.push({});
    state.drawings.push({});
    state.answers.push({});
    state.answerOrders.push({});
    state.guesses.push({});
    return true;
  }
}
