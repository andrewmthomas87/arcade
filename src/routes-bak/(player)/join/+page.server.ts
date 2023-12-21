import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { z } from 'zod';
import { CODE_LENGTH } from '$lib/code';
import { db } from '$lib/server/db';
import { getPlayerCookieOrThrow } from '$lib/cookies';
import { formatZodError } from '$lib/zod-error';

const actionDataSchema = z.object({ code: z.string().trim().length(CODE_LENGTH) });

export const actions = {
  default: async ({ cookies, request }) => {
    const player = getPlayerCookieOrThrow(cookies);

    const data = await request.formData();
    const parsedData = actionDataSchema.safeParse({ code: data.get('code') });
    if (!parsedData.success) {
      return fail(400, { error: formatZodError(parsedData.error) });
    }
    const code = parsedData.data.code;

    const lobby = await db.lobby.findUnique({ where: { code } });
    if (!lobby) {
      return fail(404, { error: 'Unknown code' });
    }

    await db.lobby.update({ where: { code }, data: { players: { connect: { id: player.id } } } });

    throw redirect(303, `/lobby/${lobby.code}`);
  },
} satisfies Actions;
