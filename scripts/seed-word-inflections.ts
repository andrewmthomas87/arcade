import { PrismaClient } from '@prisma/client';
import path from 'path';

const INSERT_BATCH_SIZE = 500;

if (Bun.argv.length !== 3) {
  console.log('Usage: seed-word-inflections.ts <data_dir_path>');
  process.exit(1);
}
const dataDirPath = Bun.argv[2];

const inflectionsMap = parseInflections(await Bun.file(path.join(dataDirPath, 'infl.txt')).text());

const entries = Array.from(inflectionsMap.entries());

const db = new PrismaClient();
await db.$transaction(
  async () => {
    const n = Math.ceil(entries.length / INSERT_BATCH_SIZE);
    for (let i = 0; i < n; i++) {
      console.log(`Batch ${i + 1}/n`);

      const batch = entries.slice(i * INSERT_BATCH_SIZE, (i + 1) * INSERT_BATCH_SIZE);
      await db.wordInflections.createMany({
        data: batch.map(([word, subwords]) => ({ word, inflections: Array.from(subwords) })),
      });
    }
  },
  { timeout: 60 * 60 * 1000 },
);

function parseInflections(text: string) {
  const map = new Map<string, Set<string>>();

  for (const line of text.split('\r\n')) {
    if (!line) {
      continue;
    }

    const [left, right] = line.split(': ');
    const word = left.split(' ')[0].toLowerCase();
    const forms = right.split(' | ');
    const subwords = forms
      .flatMap((form) => form.split(', '))
      .map((entry) => {
        const wordAndTags = entry.split(' ')[0];
        const word = wordAndTags.replaceAll(/[~<!?]/g, '').toLowerCase();

        return word;
      });

    let set = map.get(word);
    if (!set) {
      set = new Set<string>();
      map.set(word, set);
    }

    for (const subword of subwords) {
      set.add(subword);
    }
  }

  return map;
}
