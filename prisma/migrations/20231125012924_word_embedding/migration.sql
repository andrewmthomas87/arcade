-- CreateTable
CREATE TABLE "WordEmbedding" (
    "word" TEXT NOT NULL,
    "embedding" vector(300) NOT NULL,

    CONSTRAINT "WordEmbedding_pkey" PRIMARY KEY ("word")
);
