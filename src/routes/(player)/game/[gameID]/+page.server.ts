import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const game = await db.game.findUniqueOrThrow({ where: { id: Number(params.gameID) || -1 } });

  throw redirect(307, `/game/${params.gameID}/${game.type}`);
};
