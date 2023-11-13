import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { ZodError, z } from 'zod';
import { CODE_LENGTH } from '$lib/code';
import { db } from '$lib/server/db';
import { COOKIE, parsePlayerCookie } from '$lib/cookies';

const codeSchema = z.string().trim().length(CODE_LENGTH);

export const actions = {
  default: async ({ cookies, request }) => {
    const player = parsePlayerCookie(cookies.get(COOKIE.player));
    if (!player) {
      throw new Error('expected player cookie');
    }

    const data = await request.formData();
    let code;
    try {
      code = codeSchema.parse(data.get('code'));
    } catch (ex) {
      if (ex instanceof ZodError) {
        return fail(400, { error: ex.issues.map((x) => x.message).join(', ') });
      }
    }

    const lobby = await db.lobby.findUnique({ where: { code } });
    if (!lobby) {
      return fail(404, { error: 'Unknown code' });
    }

    await db.lobby.update({ where: { code }, data: { players: { connect: { id: player.id } } } });

    throw redirect(303, `/lobby/${lobby.code}`);
  },
} satisfies Actions;
