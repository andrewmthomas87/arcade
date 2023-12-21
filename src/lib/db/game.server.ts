import type { Prisma } from '@prisma/client';
import { db } from './db.server';

export class GameDB {
  static include = {
    activeLobbyAndLobby: { activeLobby: true, lobby: true },
  } satisfies Record<string, Prisma.GameInclude>;

  static create(type: string, playerIDs: number[], lobbyID: number) {
    return db.game.create({
      data: {
        type,
        players: { connect: playerIDs.map((id) => ({ id })) },
        lobby: { connect: { id: lobbyID } },
        activeLobby: { connect: { id: lobbyID } },
      },
    });
  }

  static byID(id: number) {
    return db.game.findUnique({ where: { id } });
  }

  static byIDAndPlayer<T extends Omit<Prisma.GameFindUniqueArgs, 'where'>>(
    id: number,
    playerID: number,
    extra: T,
  ) {
    const args = {
      where: { id, players: { some: { id: playerID } } },
      ...extra,
    } satisfies Prisma.GameFindUniqueArgs;

    return db.game.findUnique<typeof args>(args as any);
  }
}
