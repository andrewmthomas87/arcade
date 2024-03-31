import { db } from '$lib/db/db.server';
import type { PlayerCookie } from '$lib/cookies';
import type { RoundState } from './game';
import { VerboseAI } from '$lib/ai/verbose.server';

export class Verbose {
  static async getRandomWord() {
    const count = await db.verboseWord.count();
    const index = Math.trunc(Math.random() * count);
    const word = await db.verboseWord.findUniqueOrThrow({ where: { index } });

    return word.word;
  }

  static async cluesSubmit(state: RoundState, player: PlayerCookie, word: string) {
    if (state.step !== 'clues') {
      throw new Error('expected clues step');
    } else if (state.guesserID === player.id) {
      throw new Error('unauthorized');
    } else if (state.clues[state.round - 1][player.id]) {
      throw new Error('already submitted clue');
    }

    const headwords = (
      await db.wordInflections.findMany({
        where: { word: { not: word.toLowerCase() }, inflections: { has: word.toLowerCase() } },
      })
    ).map((r) => r.word.toLowerCase());

    state.clues[state.round - 1][player.id] = { word, headwords, isDuplicate: false };
  }

  static cluesIsDone(state: RoundState) {
    if (state.step !== 'clues') {
      throw new Error('expected clues step');
    }

    return Object.keys(state.clues[state.round - 1]).length === state.playerIDs.length - 1;
  }

  static cluesFinalize(state: RoundState) {
    if (state.step !== 'clues') {
      throw new Error('expected clues step');
    }

    // Count words and headwords
    const counts = new Map<string, number>();
    for (const clue of Object.values(state.clues[state.round - 1])) {
      const s = clue.word.toLowerCase();
      counts.set(s, (counts.get(s) || 0) + 1);

      for (const headword of clue.headwords) {
        const s = headword.toLowerCase();
        counts.set(s, (counts.get(s) || 0) + 1);
      }
    }

    // Mark duplicates
    for (const key of Object.keys(state.clues[state.round - 1])) {
      const clue = state.clues[state.round - 1][key];

      let isDuplicate = false;

      const s = clue.word.toLowerCase();
      if ((counts.get(s) || 0) > 1) {
        isDuplicate = true;
      }

      for (const headword of clue.headwords) {
        const s = headword.toLowerCase();
        if ((counts.get(s) || 0) > 1) {
          isDuplicate = true;
        }
      }

      clue.isDuplicate = isDuplicate;
    }

    state.step = 'guess';
  }

  static async guessSubmit(state: RoundState, player: PlayerCookie, word: string) {
    if (state.step !== 'guess') {
      throw new Error('expected guess step');
    } else if (state.guesserID !== player.id) {
      throw new Error('unauthorized');
    } else if (state.guesses.length >= state.round) {
      throw new Error('already submitted guess');
    }

    let isCorrect = word.toLowerCase() === state.words[state.round - 1].toLowerCase();
    if (!isCorrect) {
      const guessHeadwords = await db.wordInflections.findMany({
        where: { word: { not: word.toLowerCase() }, inflections: { has: word.toLowerCase() } },
      });
      const wordHeadwords = await db.wordInflections.findMany({
        where: {
          word: { not: state.words[state.round - 1].toLowerCase() },
          inflections: { has: state.words[state.round - 1].toLowerCase() },
        },
      });

      const isOverlap =
        new Set([word.toLowerCase(), ...guessHeadwords, ...wordHeadwords]).size <
        1 + guessHeadwords.length + wordHeadwords.length;
      if (isOverlap) {
        isCorrect = true;
      }
    }

    let score = 0;
    if (isCorrect) {
      score = 5;
    } else {
      try {
        score = await VerboseAI.scoreGuess(
          state.words[state.round - 1].toLowerCase(),
          word.toLowerCase(),
        );
      } catch (ex) {
        score = 0;
      }
    }

    state.guesses.push({ word, isCorrect, score });
    state.score += score;
    state.remainingRounds = Math.max(0, state.remainingRounds - (score > 0 ? 1 : 2));
    state.step = 'result';
  }

  static async guessPass(state: RoundState, player: PlayerCookie) {
    if (state.step !== 'guess') {
      throw new Error('expected guess step');
    } else if (state.guesserID !== player.id) {
      throw new Error('unauthorized');
    } else if (state.guesses.length >= state.round) {
      throw new Error('already submitted guess');
    }

    state.guesses.push({ word: null, isCorrect: false, score: 0 });
    state.step = 'result';
    state.remainingRounds = Math.max(0, state.remainingRounds - 1);
  }

  static async resultContinue(state: RoundState) {
    if (state.step !== 'result') {
      throw new Error('expected result step');
    }

    if (state.remainingRounds === 0) {
      state.step = 'end';
    } else {
      const prevGuesserIndex = state.playerIDs.findIndex((id) => id === state.guesserID);
      const word = await Verbose.getRandomWord();

      state.round++;
      state.guesserID = state.playerIDs[(prevGuesserIndex + 1) % state.playerIDs.length];
      state.step = 'clues';

      state.words.push(word);
      state.clues.push({});
    }
  }
}
