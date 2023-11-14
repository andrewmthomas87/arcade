import { db } from '$lib/server/db';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends, params }) => {
  depends('lobby');

  const lobby = await db.lobby.findUnique({
    where: { code: params.lobbyCode },
    include: { players: true },
  });
  if (!lobby) {
    throw error(404);
  }

  return { lobby };
};

export const actions = {
  default: async () => {
    return fail(400, { error: 'Not implemented' });
  },
} satisfies Actions;
