import { Prisma, PrismaClient } from '@prisma/client';
import path from 'path';

if (Bun.argv.length !== 3) {
  console.log('Usage: seed-words.ts <data_dir_path>');
  process.exit(1);
}
const dataDirPath = Bun.argv[2];

const partOfSpeechMap = parsePartOfSpeechFile(
  await Bun.file(path.join(dataDirPath, 'part-of-speech.txt')).text(),
);
const concretenessMap = parseConcretenessFile(
  await Bun.file(path.join(dataDirPath, 'concreteness.txt')).text(),
);
const wordsByFrequency = parseWordsByFrequencyFile(
  await Bun.file(path.join(dataDirPath, '2+2+3frq.txt')).text(),
);
const badWordsSet = parseBadWordsFile(
  await Bun.file(path.join(dataDirPath, 'bad-words.txt')).text(),
);

const wordDatas = wordsByFrequency.flatMap((words, i) => {
  const frequency = i + 1;

  return words
    .filter((word) => !badWordsSet.has(word.toLowerCase()))
    .map((word) => {
      const isAlpha = /^[a-z]+$/i.test(word);
      const partsOfSpeech = partOfSpeechMap.get(word);
      const concreteness = concretenessMap.get(word);
      if (partsOfSpeech === undefined || concreteness === undefined) {
        return null;
      }

      return {
        word,
        isAlpha,
        frequency,
        partsOfSpeech,
        concreteness,
      } satisfies Prisma.WordCreateInput;
    })
    .filter((x): x is Exclude<typeof x, null> => x !== null);
});

const db = new PrismaClient();
await db.word.createMany({ data: wordDatas });

function parsePartOfSpeechFile(text: string) {
  return new Map(
    text.split('\r\n').map((l) => {
      const parts = l.split('\t');
      const word = parts[0];
      const partsOfSpeech = parts[1];

      return [word, partsOfSpeech];
    }),
  );
}

function parseConcretenessFile(text: string) {
  return new Map(
    text
      .split('\r\n')
      .slice(1)
      .map((l) => {
        const parts = l.split('\t');
        const word = parts[0];
        const concreteness = Number(parts[2]);

        return [word, concreteness];
      }),
  );
}

function parseWordsByFrequencyFile(text: string) {
  return text
    .split(/-+ [0-9]+ -+\r\n/)
    .slice(1)
    .map((section) =>
      section
        .split('\r\n')
        .filter((l) => l.length > 0)
        // Skip non-headwords
        .filter((l) => !l.startsWith(' '))
        // Remove extra syntax characters
        .map((w) => w.replaceAll(/[!*()]/g, '')),
    );
}

function parseBadWordsFile(text: string) {
  return new Set(text.split('\r\n').map((w) => w.trim().toLowerCase()));
}
