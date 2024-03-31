import { VERBOSE_OPENAI_MODEL } from '$env/static/private';
import type { ChatCompletionMessageParam } from 'openai/resources';
import { ai, aiThrottler } from './ai.server';

const SCORE_GUESS_EXAMPLES: { target: string; guess: string; score: number }[] = [
  { target: 'latex', guess: 'gloves', score: 0 },
  { target: 'footwear', guess: 'boots', score: 2 },
  { target: 'congressman', guess: 'janitor', score: 0 },
  { target: 'tulip', guess: 'rose', score: 2 },
  { target: 'scorpion', guess: 'venom', score: 1 },
  { target: 'bourbon', guess: 'cocktail', score: 1 },
  { target: 'bunny', guess: 'hare', score: 3 },
  { target: 'cucumber', guess: 'curry', score: 0 },
];

export class VerboseAI {
  static async scoreGuess(target: string, guess: string) {
    const response = await aiThrottler.run(() =>
      ai.chat.completions.create({
        model: VERBOSE_OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: [
              'Assign a score for how closely the two words match in meaning.',
              '',
              '3: Exact match',
              '2: Very good match',
              '1: Somewhat of a match',
              '0: Not matching',
              '',
              'Output the numeric score.',
            ].join('\n'),
          },
          ...SCORE_GUESS_EXAMPLES.map<ChatCompletionMessageParam[]>(({ target, guess, score }) => [
            {
              role: 'user',
              content: `${target} and ${guess}`,
            },
            {
              role: 'assistant',
              content: score.toString(),
            },
          ]).flat(),
          {
            role: 'user',
            content: `${target} and ${guess}`,
          },
        ],
        max_tokens: 1,
      }),
    );
    if (response.choices.length !== 1) {
      throw new Error('expected choice');
    }

    const score = parseInt(response.choices[0].message.content || '');
    if (isNaN(score) || score < 0 || score > 3) {
      throw new Error('invalid response');
    }

    return score;
  }
}
