import { db } from './db.server';

export class PlayerDB {
  static create(name: string) {
    return db.player.create({ data: { name } });
  }

  static async exists(id: number) {
    return !!(await db.player.findUnique({ where: { id }, select: { id: true } }));
  }
}
