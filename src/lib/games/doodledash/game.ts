import type { Path } from '$lib/canvas/canvas';
import { shuffleArrayDurstenfeld } from '$lib/utils/shuffle';

export type RoundState = {
  playerIDs: number[];
  scores: Record<number, number>;

  round: number;
  step: Step;
  index: number;

  order: number[][];
  prompts: Record<number, string>[];
  drawings: Record<number, Drawing>[];
  answers: Record<number, Record<number, string>>[];
  answerOrders: Record<number, number[]>[];
  guesses: Record<number, Record<number, number>>[];
};

export type Step =
  | 'generating_prompts'
  | 'draw'
  | 'answer'
  | 'guess'
  | 'guess_result'
  | 'result'
  | 'end';

export type Drawing = Path[];

export type RoundInit = Pick<RoundState, 'playerIDs'>;

export function buildRoundState(init: RoundInit): RoundState {
  const { playerIDs } = init;
  const order = playerIDs.slice();
  shuffleArrayDurstenfeld(order);

  return {
    playerIDs,
    scores: Object.fromEntries(playerIDs.map((id) => [id, 0])),
    round: 1,
    step: 'generating_prompts',
    index: 0,
    order: [order],
    prompts: [{}],
    drawings: [{}],
    answers: [{}],
    answerOrders: [{}],
    guesses: [{}],
  };
}
