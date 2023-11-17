import { PrismaClient } from '@prisma/client';

const FREQUENCY_RANGE = [1, 15];
const CONCRETENESS_MIN = 4.5;

const db = new PrismaClient();

const words = await db.word.findMany({
  where: {
    frequency: { gte: FREQUENCY_RANGE[0], lte: FREQUENCY_RANGE[1] },
    partsOfSpeech: { contains: 'N' },
    concreteness: { gte: CONCRETENESS_MIN },
  },
});

await db.$transaction(
  words.map((word, i) => db.codenamesWord.create({ data: { index: i, word: word.word } })),
);
