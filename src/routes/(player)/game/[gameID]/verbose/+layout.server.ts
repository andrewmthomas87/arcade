import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params }) => {
  // Ensure game exists and has type verbose
  const game = await db.game.findUnique({
    where: { id: Number(params.gameID) || -1, type: 'verbose' },
  });
  if (!game) {
    throw error(404);
  }

  return {};
};
