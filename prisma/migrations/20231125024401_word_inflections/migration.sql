-- CreateTable
CREATE TABLE "WordInflections" (
    "word" TEXT NOT NULL,
    "inflections" TEXT[],

    CONSTRAINT "WordInflections_pkey" PRIMARY KEY ("word")
);
