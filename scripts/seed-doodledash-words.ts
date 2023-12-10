import { PrismaClient } from '@prisma/client';

const FREQUENCY_MAX = 15;
const CONCRETENESS_MIN = 4.75;

const db = new PrismaClient();

const words = await db.word.findMany({
  where: {
    frequency: { lte: FREQUENCY_MAX },
    partsOfSpeech: { contains: 'N' },
    concreteness: { gte: CONCRETENESS_MIN },
  },
});

await db.doodledashWord.createMany({
  data: words.map((word, i) => ({ index: i, word: word.word })),
});
