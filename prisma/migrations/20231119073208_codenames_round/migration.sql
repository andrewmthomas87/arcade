-- CreateTable
CREATE TABLE "CodenamesRound" (
    "gameId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "initJSON" TEXT NOT NULL,
    "stateJSON" TEXT NOT NULL,

    PRIMARY KEY ("gameId", "number"),
    CONSTRAINT "CodenamesRound_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "CodenamesGame" ("gameId") ON DELETE RESTRICT ON UPDATE CASCADE
);
