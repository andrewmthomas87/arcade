import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { GameDB } from '$lib/db/game.server';

export const load: PageServerLoad = async ({ params }) => {
  const game = await GameDB.byID(Number(params.gameID) || -1);
  if (!game) {
    throw error(404);
  }

  throw redirect(307, `/game/${params.gameID}/${game.type}`);
};
