import type { Prisma, VerboseRound } from '@prisma/client';
import { db } from './db.server';
import type { RoundInit, RoundState } from '$lib/games/verbose/game';

export class VerboseDB {
  static include = {
    playersAndVerboseWithLatestRound: {
      players: true,
      verbose: { include: { rounds: { orderBy: { number: 'desc' }, take: 1 } } },
    },
  } satisfies Record<string, Prisma.GameInclude>;

  static create(id: number, init: RoundInit, state: RoundState) {
    return db.verboseGame.create({
      data: {
        game: { connect: { id } },
        rounds: {
          create: {
            number: 1,
            initJSON: JSON.stringify(init),
            stateJSON: JSON.stringify(state),
          },
        },
      },
    });
  }

  static byIDAndPlayer<T extends Omit<Prisma.GameFindUniqueArgs, 'where'>>(
    id: number,
    playerID: number,
    extra: T,
  ) {
    const args = {
      where: { id, type: 'verbose', players: { some: { id: playerID } } },
      ...extra,
    } satisfies Prisma.GameFindUniqueArgs;

    return db.game.findUnique<typeof args>(args as any);
  }

  static async updateRoundState(round: VerboseRound, state: RoundState) {
    return await db.verboseRound.update({
      where: { gameId_number: { gameId: round.gameId, number: round.number } },
      data: { stateJSON: JSON.stringify(state) },
    });
  }

  static addRound(id: number, number: number, init: RoundInit, state: RoundState) {
    return db.verboseGame.update({
      where: { gameId: id },
      data: {
        rounds: {
          create: {
            number: number,
            initJSON: JSON.stringify(init),
            stateJSON: JSON.stringify(state),
          },
        },
      },
    });
  }
}
