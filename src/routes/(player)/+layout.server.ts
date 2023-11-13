import { COOKIE, parsePlayerCookie } from '$lib/cookies';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const playerCookie = parsePlayerCookie(cookies.get(COOKIE.player));
  if (!playerCookie) {
    throw redirect(307, '/name');
  }

  return { playerCookie };
};
