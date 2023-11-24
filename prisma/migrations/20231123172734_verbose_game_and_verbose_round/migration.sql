-- CreateTable
CREATE TABLE "VerboseGame" (
    "gameId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    CONSTRAINT "VerboseGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerboseRound" (
    "gameId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "initJSON" TEXT NOT NULL,
    "stateJSON" TEXT NOT NULL,

    PRIMARY KEY ("gameId", "number"),
    CONSTRAINT "VerboseRound_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "VerboseGame" ("gameId") ON DELETE RESTRICT ON UPDATE CASCADE
);
