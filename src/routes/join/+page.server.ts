import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  default: async () => {
    return fail(400, { error: 'Not implemented' });
  },
} satisfies Actions;
