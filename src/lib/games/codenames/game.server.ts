import { db } from '$lib/server/db';
import type { BoardSize } from '.';

export class Codenames {
  static async create(gameID: number, boardSize: BoardSize) {
    return await db.codenamesGame.create({
      data: { game: { connect: { id: gameID } }, boardSize },
    });
  }
}
