import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const DIMENSIONS = 300;
const INSERT_BATCH_SIZE = 500;

if (Bun.argv.length !== 3) {
  console.log('Usage: seed-word-embeddings.ts <data_dir_path>');
  process.exit(1);
}
const dataDirPath = Bun.argv[2];

const db = new PrismaClient();

const embeddingsStream = fs.createReadStream(path.join(dataDirPath, 'embeddings.txt'));
const rl = readline.createInterface({ input: embeddingsStream, crlfDelay: Infinity });

const inputs: [string, string][] = [];
rl.on('line', async (line) => {
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

  inputs.push([word, embeddingStr]);
});

await db.$transaction(
  async () => {
    for (let i = 0; i < Math.ceil(inputs.length / INSERT_BATCH_SIZE); i++) {
      const batch = inputs.slice(i * INSERT_BATCH_SIZE, (i + 1) * INSERT_BATCH_SIZE);
      const sql = `INSERT INTO "WordEmbedding" (word, embedding) VALUES ${batch
        .map(([word, embeddingStr]) => `('${word}', '${embeddingStr}')`)
        .join(', ')}`;
      await db.$executeRawUnsafe(sql);
    }
  },
  { timeout: 60 * 60 * 1000 },
);
