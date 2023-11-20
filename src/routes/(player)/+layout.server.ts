import { COOKIE, parsePlayerCookie } from '$lib/cookies';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const player = parsePlayerCookie(cookies.get(COOKIE.player));
  if (!player) {
    throw redirect(307, '/name');
  }

  return { player };
};
