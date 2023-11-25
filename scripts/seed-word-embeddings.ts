import { PrismaClient } from '@prisma/client';
import path from 'path';
import LineByLineReader from 'line-by-line';

const DIMENSIONS = 300;
const INSERT_BATCH_SIZE = 500;

if (Bun.argv.length !== 3) {
  console.log('Usage: seed-word-embeddings.ts <data_dir_path>');
  process.exit(1);
}
const dataDirPath = Bun.argv[2];

const db = new PrismaClient();
const lr = new LineByLineReader(path.join(dataDirPath, 'embeddings.txt'));

let i = 0;
console.log(i);

await new Promise<void>((resolve) => {
  const inputs: { ref: [string, string][] } = { ref: [] };
  lr.on('line', async (line) => {
    const parts = line.split(' ');
    if (parts.length !== DIMENSIONS + 1) {
      return;
    }

    const word = parts[0];
    const embedding = parts.slice(1);
    const embeddingStr = `[${embedding.join(',')}]`;

    if (!/^[a-z]+$/.test(word)) {
      return;
    }

    inputs.ref.push([word, embeddingStr]);

    if (inputs.ref.length === INSERT_BATCH_SIZE) {
      lr.pause();

      const batch = inputs.ref;
      inputs.ref = [];

      await insertWordEmbeddings(batch);
      i += batch.length;
      console.log(i);

      lr.resume();
    }
  });

  lr.on('end', async () => {
    if (inputs.ref.length > 0) {
      const batch = inputs.ref;
      inputs.ref = [];

      await insertWordEmbeddings(batch);
      i += batch.length;
      console.log(i);
    }

    resolve();
  });
});

function insertWordEmbeddings(inputs: [string, string][]) {
  const sql = `INSERT INTO "WordEmbedding" (word, embedding) VALUES ${inputs
    .map(([word, embeddingStr]) => `('${word}', '${embeddingStr}')`)
    .join(', ')}`;
  return db.$executeRawUnsafe(sql);
}
