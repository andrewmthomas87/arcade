export const BOARD_SIZE_KEYS = ['3x3', '3x4', '3x5', '4x4', '4x5', '5x5'] as const;

export type BoardSizeKey = (typeof BOARD_SIZE_KEYS)[number];

export const BOARD_SIZES = {
  '3x3': { w: 3, h: 3 },
  '3x4': { w: 3, h: 4 },
  '3x5': { w: 3, h: 5 },
  '4x4': { w: 4, h: 4 },
  '4x5': { w: 4, h: 5 },
  '5x5': { w: 5, h: 5 },
} satisfies Record<BoardSizeKey, { w: number; h: number }>;

export type BoardSize = keyof typeof BOARD_SIZES;

export const BOARD_COUNTS = {
  '3x3': { blue: 3, red: 3, neutral: 1, bad: 1 },
  '3x4': { blue: 4, red: 4, neutral: 2, bad: 1 },
  '3x5': { blue: 5, red: 5, neutral: 3, bad: 1 },
  '4x4': { blue: 5, red: 5, neutral: 4, bad: 1 },
  '4x5': { blue: 0, red: 0, neutral: 0, bad: 1 },
  '5x5': { blue: 0, red: 0, neutral: 0, bad: 1 },
} satisfies Record<BoardSizeKey, Record<CardAssignment, number>>;

export type RoundState = {
  blueIDs: number[];
  redIDs: number[];
  blueClueGiverID: number;
  redClueGiverID: number;

  board: Card[][];
  covered: boolean[][];

  round: number;
  turn: 'blue' | 'red';
  step: Step;
  winner: 'blue' | 'red' | null;

  blueClues: Clue[];
  redClues: Clue[];
  blueGuesses: Guess[][];
  redGuesses: Guess[][];
};

export type Card = {
  word: string;
  assignment: CardAssignment;
};

export type CardAssignment = 'blue' | 'red' | 'neutral' | 'bad';

export type Step = 'clue' | 'guess' | 'guessResult' | 'result' | 'end';

export type Clue = {
  word: string;
  count: number | null;
};

export type Guess = {
  status: 'correct' | 'incorrect' | 'neutral' | 'bad';
  x: number;
  y: number;
};

export type RoundInit = Pick<
  RoundState,
  'blueIDs' | 'redIDs' | 'blueClueGiverID' | 'redClueGiverID' | 'board' | 'turn'
>;

export function buildRoundState(init: RoundInit): RoundState {
  const { blueIDs, redIDs, board, blueClueGiverID, redClueGiverID, turn } = init;
  const covered = Array.from(Array(board.length)).map((_, i) => Array(board[i].length).fill(false));

  return {
    blueIDs,
    redIDs,
    blueClueGiverID,
    redClueGiverID,
    board,
    covered,
    round: 1,
    turn,
    winner: null,
    step: 'clue',
    blueClues: [],
    redClues: [],
    blueGuesses: [],
    redGuesses: [],
  };
}
