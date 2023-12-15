import { COOKIE, parsePlayerCookie } from '$lib/cookies';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const player = parsePlayerCookie(cookies.get(COOKIE.player));
  if (!player) {
    throw redirect(307, '/name');
  }

  const count = await db.player.count({ where: { id: player.id } });
  if (count === 0) {
    cookies.delete(COOKIE.player, { path: '/' });

    throw redirect(307, '/name');
  }

  return { player };
};
