import { getPlayerCookieOrThrow } from '$lib/cookies';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { BOARD_SIZE_KEYS } from '$lib/games/codenames/game';
import { formatZodError } from '$lib/zod-error';
import { Codenames } from '$lib/games/codenames/game.server';

export const load: PageServerLoad = async ({ depends, params }) => {
  depends('codenames');

  const game = await db.game.findUniqueOrThrow({
    where: { id: Number(params.gameID) || -1 },
    include: {
      players: true,
      codenames: { include: { rounds: { orderBy: { number: 'desc' }, take: 1 } } },
    },
  });

  return { game };
};

const createActionDataSchema = z.object({
  blueIDs: z.string().transform<number[]>((v) => JSON.parse(v)),
  redIDs: z.string().transform<number[]>((v) => JSON.parse(v)),
  boardSize: z.enum(BOARD_SIZE_KEYS),
});

const clueActionDataSchema = z.object({
  clue: z
    .string()
    .trim()
    .min(1)
    .max(32)
    .regex(/^[a-zA-Z]*$/, 'Must be alpha'),
  count: z.union([z.literal('null').transform(() => null), z.coerce.number().positive()]),
});

const guessActionDataSchema = z.object({
  guess: z.string().transform((v, ctx) => {
    const parts = v.split(',');
    if (parts.length !== 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'invalid guess' });

      return z.NEVER;
    }

    const [x, y] = parts.map((s) => parseInt(s));
    if (isNaN(x) || isNaN(y)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'invalid guess' });

      return z.NEVER;
    }

    return { x, y };
  }),
});

export const actions = {
  create: async ({ cookies, params, request }) => {
    const player = getPlayerCookieOrThrow(cookies);

    const game = await db.game.findUnique({
      where: { id: Number(params.gameID) || -1, players: { some: { id: player.id } } },
    });
    if (!game) {
      throw error(404);
    }

    const data = await request.formData();
    const parsedData = createActionDataSchema.safeParse({
      blueIDs: data.get('blue-ids'),
      redIDs: data.get('red-ids'),
      boardSize: data.get('board-size'),
    });
    if (!parsedData.success) {
      throw error(400, { message: formatZodError(parsedData.error) });
    }
    const { blueIDs, redIDs, boardSize } = parsedData.data;

    await Codenames.create(game.id, blueIDs, redIDs, boardSize);

    return {};
  },

  clue: async ({ cookies, params, request }) => {
    const player = getPlayerCookieOrThrow(cookies);

    const game = await db.game.findUnique({
      where: { id: Number(params.gameID) || -1, players: { some: { id: player.id } } },
      include: { codenames: { include: { rounds: { orderBy: { number: 'desc' }, take: 1 } } } },
    });
    if (!(game && game.codenames && game.codenames.rounds.length === 1)) {
      throw error(404);
    }
    const round = game.codenames.rounds[0];

    const data = await request.formData();
    const parsedData = clueActionDataSchema.safeParse({
      clue: data.get('clue'),
      count: data.get('count'),
    });
    if (!parsedData.success) {
      throw error(400, { message: formatZodError(parsedData.error) });
    }
    const { clue, count } = parsedData.data;

    await Codenames.submitClue(round, player, { word: clue, count });

    return {};
  },

  guess: async ({ cookies, params, request }) => {
    const player = getPlayerCookieOrThrow(cookies);

    const game = await db.game.findUnique({
      where: { id: Number(params.gameID) || -1, players: { some: { id: player.id } } },
      include: { codenames: { include: { rounds: { orderBy: { number: 'desc' }, take: 1 } } } },
    });
    if (!(game && game.codenames && game.codenames.rounds.length === 1)) {
      throw error(404);
    }
    const round = game.codenames.rounds[0];

    const data = await request.formData();
    const parsedData = guessActionDataSchema.safeParse({ guess: data.get('guess') });
    if (!parsedData.success) {
      throw error(400, { message: formatZodError(parsedData.error) });
    }
    const { guess } = parsedData.data;

    await Codenames.submitGuess(round, player, guess);

    return {};
  },

  'end-guess': async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);

    const game = await db.game.findUnique({
      where: { id: Number(params.gameID) || -1, players: { some: { id: player.id } } },
      include: { codenames: { include: { rounds: { orderBy: { number: 'desc' }, take: 1 } } } },
    });
    if (!(game && game.codenames && game.codenames.rounds.length === 1)) {
      throw error(404);
    }
    const round = game.codenames.rounds[0];

    await Codenames.endGuess(round, player);

    return {};
  },

  'guess-again': async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);

    const game = await db.game.findUnique({
      where: { id: Number(params.gameID) || -1, players: { some: { id: player.id } } },
      include: { codenames: { include: { rounds: { orderBy: { number: 'desc' }, take: 1 } } } },
    });
    if (!(game && game.codenames && game.codenames.rounds.length === 1)) {
      throw error(404);
    }
    const round = game.codenames.rounds[0];

    await Codenames.guessAgain(round, player);

    return {};
  },

  'result-continue': async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);

    const game = await db.game.findUnique({
      where: { id: Number(params.gameID) || -1, players: { some: { id: player.id } } },
      include: { codenames: { include: { rounds: { orderBy: { number: 'desc' }, take: 1 } } } },
    });
    if (!(game && game.codenames && game.codenames.rounds.length === 1)) {
      throw error(404);
    }
    const round = game.codenames.rounds[0];

    await Codenames.resultContinue(round);

    return {};
  },

  'play-again': async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);

    const game = await db.game.findUnique({
      where: { id: Number(params.gameID) || -1, players: { some: { id: player.id } } },
      include: { codenames: { include: { rounds: { orderBy: { number: 'desc' }, take: 1 } } } },
    });
    if (!(game && game.codenames && game.codenames.rounds.length === 1)) {
      throw error(404);
    }
    const round = game.codenames.rounds[0];

    await Codenames.playAgain(game.codenames, round);

    return {};
  },

  lobby: async ({ cookies, params }) => {
    const player = getPlayerCookieOrThrow(cookies);

    const game = await db.game.findUnique({
      where: { id: Number(params.gameID) || -1, players: { some: { id: player.id } } },
    });
    if (!game) {
      throw error(404);
    }

    await db.lobby.update({
      where: { id: game.lobbyId },
      data: { activeGame: { disconnect: true } },
    });

    return {};
  },
} satisfies Actions;
