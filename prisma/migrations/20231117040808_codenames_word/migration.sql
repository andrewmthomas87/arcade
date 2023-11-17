-- CreateTable
CREATE TABLE "CodenamesWord" (
    "index" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "word" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CodenamesWord_word_key" ON "CodenamesWord"("word");
