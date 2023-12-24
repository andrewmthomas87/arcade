-- CreateTable
CREATE TABLE "DoodledashGame" (
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "DoodledashGame_pkey" PRIMARY KEY ("gameId")
);

-- CreateTable
CREATE TABLE "DoodledashRound" (
    "gameId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "initJSON" TEXT NOT NULL,
    "stateJSON" TEXT NOT NULL,

    CONSTRAINT "DoodledashRound_pkey" PRIMARY KEY ("gameId","number")
);

-- AddForeignKey
ALTER TABLE "DoodledashGame" ADD CONSTRAINT "DoodledashGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoodledashRound" ADD CONSTRAINT "DoodledashRound_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "DoodledashGame"("gameId") ON DELETE RESTRICT ON UPDATE CASCADE;
