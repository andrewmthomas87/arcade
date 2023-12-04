import { db } from '$lib/server/db';
import type { VerboseGame, VerboseRound } from '@prisma/client';
import { buildRoundState, type RoundInit, type RoundState } from './game';
import type { PlayerCookie } from '$lib/cookies';

export class Verbose {
  static async create(gameID: number, playerIDs: number[]) {
    const word = await getRandomWord();
    const init: RoundInit = { playerIDs, word };
    const roundState = buildRoundState(init);

    return await db.verboseGame.create({
      data: {
        game: { connect: { id: gameID } },
        rounds: {
          create: {
            number: 1,
            initJSON: JSON.stringify(init),
            stateJSON: JSON.stringify(roundState),
          },
        },
      },
    });
  }

  static async submitClue(round: VerboseRound, player: PlayerCookie, word: string) {
    const state = JSON.parse(round.stateJSON) as RoundState;
    if (state.step !== 'clues') {
      throw new Error('expected clues step');
    } else if (state.guesserID === player.id) {
      throw new Error('unauthorized');
    } else if (state.clues[state.round - 1][player.id]) {
      throw new Error('already submitted clue');
    }

    const headwords = (
      await db.wordInflections.findMany({
        where: { word: { not: word }, inflections: { has: word } },
      })
    ).map((r) => r.word);

    state.clues[state.round - 1][player.id] = { word, headwords, isDuplicate: false };

    const isReadyForGuess =
      Object.keys(state.clues[state.round - 1]).length === state.playerIDs.length - 1;
    if (isReadyForGuess) {
      // Mark duplicates
      const clues = new Map<string, number>();
      for (const clue of Object.values(state.clues[state.round - 1])) {
        const s = clue.word.toLowerCase();
        clues.set(s, (clues.get(s) || 0) + 1);

        for (const headword of clue.headwords) {
          const s = headword.toLowerCase();
          clues.set(s, (clues.get(s) || 0) + 1);
        }
      }

      for (const key of Object.keys(state.clues[state.round - 1])) {
        const clue = state.clues[state.round - 1][key];

        let isDuplicate = false;

        const s = clue.word.toLowerCase();
        if ((clues.get(s) || 0) >= 2) {
          isDuplicate = true;
        }

        for (const headword of clue.headwords) {
          const s = headword.toLowerCase();
          if ((clues.get(s) || 0) >= 2) {
            isDuplicate = true;
          }
        }

        clue.isDuplicate = isDuplicate;
      }

      state.step = 'guess';
    }

    await updateRoundState(round, state);
  }

  static async submitGuess(round: VerboseRound, player: PlayerCookie, word: string) {
    const state = JSON.parse(round.stateJSON) as RoundState;
    if (state.step !== 'guess') {
      throw new Error('expected guess step');
    } else if (state.guesserID !== player.id) {
      throw new Error('unauthorized');
    } else if (state.guesses.length >= state.round) {
      throw new Error('already submitted guess');
    }

    let isCorrect = word.toLowerCase() === state.words[state.round - 1].toLowerCase();
    if (!isCorrect) {
      const headwordsOverlap = await db.wordInflections.count({
        where: { inflections: { hasEvery: [word, state.words[state.round - 1]] } },
      });
      if (headwordsOverlap) {
        isCorrect = true;
      }
    }

    let score = 0;
    if (isCorrect) {
      score = 8;
    } else {
      const { euclidean, cosine } = await getDistances(
        state.words[state.round - 1],
        word.toLowerCase(),
      );
      const distanceScore =
        (Math.max(0, (euclidean - 0.1) / 0.3) + Math.max(0, (cosine - 0.1) / 0.4)) / 2;

      if (distanceScore <= 0.5714) {
        score = 5;
      } else if (distanceScore <= 0.7552) {
        score = 4;
      } else if (distanceScore <= 0.8411) {
        score = 3;
      } else if (distanceScore <= 0.9151) {
        score = 2;
      } else if (distanceScore <= 1.1513) {
        score = 1;
      }
    }

    state.guesses.push({ word, isCorrect, score });
    state.score += score;
    state.remainingRounds = Math.max(0, state.remainingRounds - (score > 0 ? 1 : 2));
    state.step = 'result';

    await updateRoundState(round, state);
  }

  static async submitPass(round: VerboseRound, player: PlayerCookie) {
    const state = JSON.parse(round.stateJSON) as RoundState;
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

    await updateRoundState(round, state);
  }

  static async continueToNextRound(round: VerboseRound) {
    const state = JSON.parse(round.stateJSON) as RoundState;
    if (state.step !== 'result') {
      throw new Error('expected result step');
    } else if (state.remainingRounds <= 0) {
      throw new Error('no remaining rounds');
    }

    const prevGuesserIndex = state.playerIDs.findIndex((id) => id === state.guesserID);
    const word = await getRandomWord();

    state.round++;
    state.guesserID = state.playerIDs[(prevGuesserIndex + 1) % state.playerIDs.length];
    state.step = 'clues';

    state.words.push(word);
    state.clues.push({});

    await updateRoundState(round, state);
  }

  static async continueToEnd(round: VerboseRound) {
    const state = JSON.parse(round.stateJSON) as RoundState;
    if (state.step !== 'result') {
      throw new Error('expected result step');
    } else if (state.remainingRounds !== 0) {
      throw new Error("can't end with remaining rounds");
    }

    state.step = 'end';

    await updateRoundState(round, state);
  }

  static async playAgain(verbose: VerboseGame, round: VerboseRound) {
    const prevInit = JSON.parse(round.initJSON) as RoundInit;

    const { playerIDs } = prevInit;
    const word = await getRandomWord();

    const init: RoundInit = { playerIDs, word };
    const roundState = buildRoundState(init);

    return await db.verboseGame.update({
      where: { gameId: verbose.gameId },
      data: {
        rounds: {
          create: {
            number: round.number + 1,
            initJSON: JSON.stringify(init),
            stateJSON: JSON.stringify(roundState),
          },
        },
      },
    });
  }
}

async function getRandomWord() {
  const count = await db.verboseWord.count();
  const index = Math.trunc(Math.random() * count);
  const word = await db.verboseWord.findUniqueOrThrow({ where: { index } });

  return word.word;
}

async function updateRoundState(round: VerboseRound, state: RoundState) {
  return await db.verboseRound.update({
    where: { gameId_number: { gameId: round.gameId, number: round.number } },
    data: { stateJSON: JSON.stringify(state) },
  });
}

async function getDistances(a: string, b: string) {
  const exists = (await db.wordEmbedding.count({ where: { word: { in: [a, b] } } })) === 2;
  if (!exists) {
    return { euclidean: Infinity, cosine: Infinity };
  }

  const distances = await db.$queryRaw<{ euclidean: number; cosine: number }[]>`
WITH w as (
  SELECT embedding
  FROM "WordEmbedding"
  WHERE word = ${a}
)
SELECT
  embedding <-> (SELECT embedding FROM w) euclidean,
  embedding <=> (SELECT embedding FROM w) cosine
  FROM "WordEmbedding"
  WHERE word = ${b}
  `;
  if (distances.length !== 1) {
    return { euclidean: Infinity, cosine: Infinity };
  }

  return distances[0];
}
