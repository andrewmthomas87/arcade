export type RoundState = {
  playerIDs: number[];
  score: number;
  remainingRounds: number;

  round: number;
  guesserID: number;
  step: Step;

  words: string[];
  clues: Record<string, Clue>[];
  guesses: Guess[];
};

export type Step = 'clues' | 'guess' | 'result' | 'end';

export type Clue = {
  word: string;
  headwords: string[];
  isDuplicate: boolean;
};

export type Guess = {
  word: string | null;
  isCorrect: boolean;
  score: number;
};

export type RoundInit = Pick<RoundState, 'playerIDs'> & { word: string };

export function buildRoundState(init: RoundInit): RoundState {
  const { playerIDs, word } = init;

  return {
    playerIDs,
    score: 0,
    remainingRounds: Math.min(13, playerIDs.length * 2),
    round: 1,
    guesserID: playerIDs[Math.trunc(Math.random() * playerIDs.length)],
    step: 'clues',
    words: [word],
    clues: [{}],
    guesses: [],
  };
}
