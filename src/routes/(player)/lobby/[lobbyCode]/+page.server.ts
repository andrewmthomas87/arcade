import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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
