-- CreateTable
CREATE TABLE "DoodledashWord" (
    "index" INTEGER NOT NULL,
    "word" TEXT NOT NULL,

    CONSTRAINT "DoodledashWord_pkey" PRIMARY KEY ("index")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoodledashWord_word_key" ON "DoodledashWord"("word");
