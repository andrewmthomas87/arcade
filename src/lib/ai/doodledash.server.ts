import { DOODLEDASH_OPENAI_MODEL } from '$env/static/private';
import { ai, aiThrottler } from './ai.server';

export class DoodledashAI {
  static async generatePrompt(words: string[]) {
    const response = await aiThrottler.run(() =>
      ai.chat.completions.create({
        model: DOODLEDASH_OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'Generate a prompt for a drawing game, incorporating the provided words. Prompts are about 5 words. Prompts should be draw-able. No punctuation.',
          },
          { role: 'user', content: 'scooter and telephone' },
          { role: 'assistant', content: 'scooter tangled in telephone wires' },
          { role: 'user', content: 'sweater and bear' },
          { role: 'assistant', content: 'bear knitting a cozy sweater' },
          { role: 'user', content: 'lemon and ear' },
          { role: 'assistant', content: 'lemon-shaped earrings' },
          { role: 'user', content: words.join(' and ') },
        ],
        max_tokens: 20,
      }),
    );
    if (response.choices.length !== 1) {
      throw new Error('expected choice');
    }

    return response.choices[0].message.content || '';
  }
}
