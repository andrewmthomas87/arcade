import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params }) => {
  const game = await db.game.findUnique({
    where: { id: Number(params.gameID) || -1, type: 'codenames' },
  });
  if (!game) {
    throw error(404);
  }

  return {};
};
