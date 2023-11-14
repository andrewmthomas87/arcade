-- CreateTable
CREATE TABLE "Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "lobbyId" INTEGER NOT NULL,
    CONSTRAINT "Game_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_GameToPlayer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_GameToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GameToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lobby" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "activeGameId" INTEGER,
    CONSTRAINT "Lobby_activeGameId_fkey" FOREIGN KEY ("activeGameId") REFERENCES "Game" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lobby" ("code", "id") SELECT "code", "id" FROM "Lobby";
DROP TABLE "Lobby";
ALTER TABLE "new_Lobby" RENAME TO "Lobby";
CREATE UNIQUE INDEX "Lobby_code_key" ON "Lobby"("code");
CREATE UNIQUE INDEX "Lobby_activeGameId_key" ON "Lobby"("activeGameId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_GameToPlayer_AB_unique" ON "_GameToPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToPlayer_B_index" ON "_GameToPlayer"("B");
