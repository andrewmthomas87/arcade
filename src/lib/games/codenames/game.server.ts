import { db } from '$lib/server/db';
import { shuffleArrayDurstenfeld } from '$lib/utils/shuffle';
import type { CodenamesGame, CodenamesRound } from '@prisma/client';
import { BOARD_COUNTS, BOARD_SIZES, buildRoundState, type BoardSize } from './game';
import type {
  BoardSizeKey,
  Card,
  CardAssignment,
  Clue,
  Guess,
  RoundInit,
  RoundState,
} from './game';
import type { PlayerCookie } from '$lib/cookies';

export class Codenames {
  static async create(gameID: number, blueIDs: number[], redIDs: number[], boardSize: BoardSize) {
    const turn = Math.random() < 0.5 ? 'blue' : 'red';

    const size = BOARD_SIZES[boardSize];
    const counts = BOARD_COUNTS[boardSize];
    const board = await generateBoard(size, counts, turn);

    const init: RoundInit = {
      blueIDs,
      redIDs,
      blueClueGiverID: blueIDs[Math.trunc(Math.random() * blueIDs.length)],
      redClueGiverID: redIDs[Math.trunc(Math.random() * redIDs.length)],
      turn,
      board,
    };
    const roundState = buildRoundState(init);

    return await db.codenamesGame.create({
      data: {
        game: { connect: { id: gameID } },
        boardSize,
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

  static async submitClue(round: CodenamesRound, player: PlayerCookie, clue: Clue) {
    const state = JSON.parse(round.stateJSON) as RoundState;
    if (state.step !== 'clue') {
      throw new Error('expected clue step');
    } else if (
      !(
        (state.turn === 'blue' && state.blueClueGiverID === player.id) ||
        (state.turn === 'red' && state.redClueGiverID === player.id)
      )
    ) {
      throw new Error('unauthorized');
    }

    if (state.turn === 'blue') {
      state.blueClues.push(clue);
      state.blueGuesses.push([]);
    } else {
      state.redClues.push(clue);
      state.redGuesses.push([]);
    }

    state.step = 'guess';

    await db.codenamesRound.update({
      where: { gameId_number: { gameId: round.gameId, number: round.number } },
      data: { stateJSON: JSON.stringify(state) },
    });
  }

  static async submitGuess(
    round: CodenamesRound,
    player: PlayerCookie,
    guess: Pick<Guess, 'x' | 'y'>,
  ) {
    const state = JSON.parse(round.stateJSON) as RoundState;
    if (state.step !== 'guess') {
      throw new Error('expected guess step');
    } else if (
      !(
        (state.turn === 'blue' &&
          state.blueIDs.includes(player.id) &&
          state.blueClueGiverID !== player.id) ||
        (state.turn === 'red' &&
          state.redIDs.includes(player.id) &&
          state.redClueGiverID !== player.id)
      )
    ) {
      throw new Error('unauthorized');
    } else if (
      guess.y < 0 ||
      guess.y >= state.board.length ||
      guess.x < 0 ||
      guess.x >= state.board[guess.y].length ||
      state.covered[guess.y][guess.x]
    ) {
      throw new Error('invalid guess');
    }

    const card = state.board[guess.y][guess.x];
    state.covered[guess.y][guess.x] = true;

    let status: Guess['status'];
    if (card.assignment === 'blue' || card.assignment === 'red') {
      status = card.assignment === state.turn ? 'correct' : 'incorrect';
    } else {
      status = card.assignment;
    }

    if (state.turn === 'blue') {
      state.blueGuesses[state.round - 1].push({ ...guess, status });
    } else {
      state.redGuesses[state.round - 1].push({ ...guess, status });
    }

    state.step = 'guessResult';

    await db.codenamesRound.update({
      where: { gameId_number: { gameId: round.gameId, number: round.number } },
      data: { stateJSON: JSON.stringify(state) },
    });
  }

  static async endGuess(round: CodenamesRound, player: PlayerCookie) {
    const state = JSON.parse(round.stateJSON) as RoundState;
    if (!(state.step === 'guess' || state.step === 'guessResult')) {
      throw new Error('expected guess or guessResult step');
    } else if (
      !(
        (state.turn === 'blue' &&
          state.blueIDs.includes(player.id) &&
          state.blueClueGiverID !== player.id) ||
        (state.turn === 'red' &&
          state.redIDs.includes(player.id) &&
          state.redClueGiverID !== player.id)
      )
    ) {
      throw new Error('unauthorized');
    }

    const guesses =
      state.turn === 'blue'
        ? state.blueGuesses[state.round - 1]
        : state.redGuesses[state.round - 1];
    const guess = guesses.length > 0 ? guesses[guesses.length - 1] : null;

    const uncoveredCards = state.board.flatMap((row, y) =>
      row.filter((_, x) => !state.covered[y][x]),
    );
    const uncoveredCardCount = uncoveredCards.filter((c) => c.assignment === state.turn).length;

    if (guess && guess.status === 'bad') {
      state.winner = state.turn === 'blue' ? 'red' : 'blue';
      state.step = 'end';
    } else if (uncoveredCardCount === 0) {
      state.winner = state.turn;
      state.step = 'end';
    } else {
      state.step = 'result';
    }

    await db.codenamesRound.update({
      where: { gameId_number: { gameId: round.gameId, number: round.number } },
      data: { stateJSON: JSON.stringify(state) },
    });
  }

  static async guessAgain(round: CodenamesRound, player: PlayerCookie) {
    const state = JSON.parse(round.stateJSON) as RoundState;
    if (state.step !== 'guessResult') {
      throw new Error('expected guessResult step');
    } else if (
      !(
        (state.turn === 'blue' &&
          state.blueIDs.includes(player.id) &&
          state.blueClueGiverID !== player.id) ||
        (state.turn === 'red' &&
          state.redIDs.includes(player.id) &&
          state.redClueGiverID !== player.id)
      )
    ) {
      throw new Error('unauthorized');
    }

    const clue =
      state.turn === 'blue' ? state.blueClues[state.round - 1] : state.redClues[state.round - 1];
    const guesses =
      state.turn === 'blue'
        ? state.blueGuesses[state.round - 1]
        : state.redGuesses[state.round - 1];
    const guess = guesses.length > 0 ? guesses[guesses.length - 1] : null;

    const uncoveredCards = state.board.flatMap((row, y) =>
      row.filter((_, x) => !state.covered[y][x]),
    );
    const uncoveredCardCount = uncoveredCards.filter((c) => c.assignment === state.turn).length;

    if (uncoveredCardCount === 0) {
      throw new Error('out of cards');
    } else if (clue.count !== null && guesses.length > clue.count) {
      throw new Error('out of guesses');
    } else if (guess?.status !== 'correct') {
      throw new Error('invalid action');
    }

    state.step = 'guess';

    await db.codenamesRound.update({
      where: { gameId_number: { gameId: round.gameId, number: round.number } },
      data: { stateJSON: JSON.stringify(state) },
    });
  }

  static async resultContinue(round: CodenamesRound) {
    const init = JSON.parse(round.initJSON) as RoundInit;

    const state = JSON.parse(round.stateJSON) as RoundState;
    if (state.step !== 'result') {
      throw new Error('expected result step');
    }

    if (state.turn !== init.turn) {
      state.round++;
    }
    state.turn = state.turn === 'blue' ? 'red' : 'blue';
    state.step = 'clue';

    await db.codenamesRound.update({
      where: { gameId_number: { gameId: round.gameId, number: round.number } },
      data: { stateJSON: JSON.stringify(state) },
    });
  }

  static async playAgain(codenames: CodenamesGame, round: CodenamesRound) {
    const prevInit = JSON.parse(round.initJSON) as RoundInit;

    const prevBlueClueGiverIndex = prevInit.blueIDs.findIndex(
      (id) => id === prevInit.blueClueGiverID,
    );
    const prevRedClueGiverIndex = prevInit.blueIDs.findIndex(
      (id) => id === prevInit.redClueGiverID,
    );
    const blueClueGiverID =
      prevInit.blueIDs[(prevBlueClueGiverIndex + 1) % prevInit.blueIDs.length];
    const redClueGiverID = prevInit.redIDs[(prevRedClueGiverIndex + 1) % prevInit.redIDs.length];

    const turn = prevInit.turn === 'blue' ? 'red' : 'blue';

    const size = BOARD_SIZES[codenames.boardSize as BoardSizeKey];
    const counts = BOARD_COUNTS[codenames.boardSize as BoardSizeKey];
    const board = await generateBoard(size, counts, turn);

    const init: RoundInit = {
      blueIDs: prevInit.blueIDs,
      redIDs: prevInit.redIDs,
      blueClueGiverID,
      redClueGiverID,
      board,
      turn,
    };
    const roundState = buildRoundState(init);

    return await db.codenamesGame.update({
      where: { gameId: codenames.gameId },
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

async function generateBoard(
  size: { w: number; h: number },
  counts: { blue: number; red: number; neutral: number; bad: number },
  turn: 'blue' | 'red',
) {
  if (counts.blue + counts.red + counts.neutral + counts.bad !== size.w * size.h - 1) {
    throw new Error('incorrect number of counts');
  }

  const count = await db.codenamesWord.count();

  const indices = new Set<number>();
  while (indices.size < size.w * size.h) {
    const index = Math.trunc(Math.random() * count);
    indices.add(index);
  }

  const words = await db.codenamesWord.findMany({ where: { index: { in: Array.from(indices) } } });
  shuffleArrayDurstenfeld(words);

  const assignments = ([turn] as CardAssignment[]).concat(
    Array(counts.blue).fill('blue'),
    Array(counts.red).fill('red'),
    Array(counts.neutral).fill('neutral'),
    Array(counts.bad).fill('bad'),
  );
  shuffleArrayDurstenfeld(assignments);

  const board: Card[][] = [];
  for (let i = 0; i < size.w * size.h; i++) {
    const x = i % size.w;
    const y = Math.trunc(i / size.w);
    if (x === 0) {
      board.push([]);
    }

    const word = words[i].word;
    const assignment = assignments[i];
    board[y][x] = { word, assignment };
  }

  return board;
}
