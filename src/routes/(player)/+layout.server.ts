import { COOKIE, parsePlayerCookie } from '$lib/cookies';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { PlayerDB } from '$lib/db/player.server';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const player = parsePlayerCookie(cookies.get(COOKIE.player));
  if (!player) {
    throw redirect(307, '/name');
  }

  const exists = PlayerDB.exists(player.id);
  if (!exists) {
    cookies.delete(COOKIE.player, { path: '/' });

    throw redirect(307, '/name');
  }

  return { player };
};
