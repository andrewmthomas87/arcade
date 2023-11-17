-- CreateTable
CREATE TABLE "Word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "word" TEXT NOT NULL,
    "isAlpha" BOOLEAN NOT NULL,
    "frequency" INTEGER NOT NULL,
    "partsOfSpeech" TEXT NOT NULL,
    "concreteness" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Word_word_key" ON "Word"("word");
