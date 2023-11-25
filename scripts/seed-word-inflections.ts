import { PrismaClient } from '@prisma/client';
import path from 'path';

if (Bun.argv.length !== 3) {
  console.log('Usage: seed-word-inflections.ts <data_dir_path>');
  process.exit(1);
}
const dataDirPath = Bun.argv[2];

const inflectionsMap = parseInflections(await Bun.file(path.join(dataDirPath, 'infl.txt')).text());

const db = new PrismaClient();
await db.$transaction(
  Array.from(inflectionsMap.entries()).map(([word, subwords]) =>
    db.wordInflections.create({ data: { word, inflections: Array.from(subwords) } }),
  ),
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
