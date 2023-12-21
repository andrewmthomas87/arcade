import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getPlayerCookieOrThrow } from '$lib/cookies';
import { generateRandomCode } from '$lib/code';
import { db } from '$lib/server/db';

const GENERATE_CODE_MAX_ATTEMPTS = 10;

export const actions = {
  default: async ({ cookies }) => {
    const player = getPlayerCookieOrThrow(cookies);

    const code = await generateUniqueCode(GENERATE_CODE_MAX_ATTEMPTS);
    if (code === null) {
      return fail(400, { error: 'Failed to generate unique code' });
    }

    const lobby = await createLobby(code, player.id);

    throw redirect(303, `/lobby/${lobby.code}`);
  },
} satisfies Actions;

async function generateUniqueCode(maxAttempts: number) {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateRandomCode();

    const lobby = await db.lobby.findUnique({ where: { code }, select: { code: true } });
    if (lobby === null) {
      return code;
    }
  }

  return null;
}

async function createLobby(code: string, playerID: number) {
  return await db.lobby.create({
    data: { code, players: { connect: { id: playerID } } },
  });
}
