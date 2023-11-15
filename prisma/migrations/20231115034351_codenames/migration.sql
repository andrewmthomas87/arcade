-- CreateTable
CREATE TABLE "CodenamesGame" (
    "gameId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "boardSize" TEXT NOT NULL,
    CONSTRAINT "CodenamesGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
