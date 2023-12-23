import type { Prisma } from '@prisma/client';
import { db } from './db.server';

export class LobbyDB {
  static include = {
    players: { players: true },
    playersAndActiveGameWithPlayers: {
      players: true,
      activeGame: { include: { players: true } },
    },
  } satisfies Record<string, Prisma.LobbyInclude>;

  static createAndAddPlayer(code: string, playerID: number) {
    return db.lobby.create({
      data: { code, players: { connect: { id: playerID } } },
    });
  }

  static async existsByCode(code: string) {
    return !!(await db.lobby.findUnique({ where: { code }, select: { id: true } }));
  }

  static byCode(code: string) {
    return db.lobby.findUnique({ where: { code } });
  }

  static byCodeAndPlayer<T extends Omit<Prisma.LobbyFindUniqueArgs, 'where'>>(
    code: string,
    playerID: number,
    extra: T,
  ) {
    const args = {
      where: {
        code,
        players: { some: { id: playerID } },
      },
      ...extra,
    } satisfies Prisma.LobbyFindUniqueArgs;

    return db.lobby.findUnique<typeof args>(args as any);
  }

  static addPlayer(code: string, playerID: number) {
    return db.lobby.update({ where: { code }, data: { players: { connect: { id: playerID } } } });
  }

  static disconnectActiveGame(id: number) {
    return db.lobby.update({
      where: { id },
      data: { activeGame: { disconnect: true } },
    });
  }
}
