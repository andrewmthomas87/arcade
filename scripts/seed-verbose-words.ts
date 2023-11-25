import { PrismaClient } from '@prisma/client';

const FREQUENCY_RANGE = [10, 15];
const CONCRETENESS_MIN = 4.5;

const db = new PrismaClient();

const words = await db.word.findMany({
  where: {
    frequency: { gte: FREQUENCY_RANGE[0], lte: FREQUENCY_RANGE[1] },
    partsOfSpeech: { contains: 'N' },
    concreteness: { gte: CONCRETENESS_MIN },
  },
});

await db.verboseWord.createMany({ data: words.map((word, i) => ({ index: i, word: word.word })) });
