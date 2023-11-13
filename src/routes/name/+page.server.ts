import { ZodError, z } from 'zod';
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { COOKIE, serializePlayerCookie } from '$lib/cookies';

const nameSchema = z
  .string()
  .trim()
  .min(2)
  .max(16)
  .regex(/^[a-zA-Z0-9]*$/, 'Must be alphanumeric');

export const actions = {
  default: async ({ cookies, request }) => {
    const data = await request.formData();
    let name;
    try {
      name = nameSchema.parse(data.get('name'));
    } catch (ex) {
      if (ex instanceof ZodError) {
        return fail(400, { error: ex.issues.map((x) => x.message).join(', ') });
      }

      throw ex;
    }

    const player = await db.player.create({ data: { name } });
    cookies.set(COOKIE.player, serializePlayerCookie(player.id, player.name));

    throw redirect(303, '/');
  },
} satisfies Actions;
