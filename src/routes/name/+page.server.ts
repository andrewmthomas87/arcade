import { z } from 'zod';
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { COOKIE, serializePlayerCookie } from '$lib/cookies';
import { formatZodError } from '$lib/zod-error';

const actionDataSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(16)
    .regex(/^[a-zA-Z0-9]*$/, 'Must be alphanumeric'),
});

export const actions = {
  default: async ({ cookies, request }) => {
    const data = await request.formData();
    const parsedData = actionDataSchema.safeParse({ name: data.get('name') });
    if (!parsedData.success) {
      return fail(400, { error: formatZodError(parsedData.error) });
    }
    const name = parsedData.data.name;

    const player = await db.player.create({ data: { name } });
    cookies.set(COOKIE.player, serializePlayerCookie(player.id, player.name));

    throw redirect(303, '/');
  },
} satisfies Actions;
