-- CreateTable
CREATE TABLE "VerboseWord" (
    "index" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "word" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "VerboseWord_word_key" ON "VerboseWord"("word");
