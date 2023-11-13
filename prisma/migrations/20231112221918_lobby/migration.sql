-- CreateTable
CREATE TABLE "Lobby" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_LobbyToPlayer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_LobbyToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "Lobby" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LobbyToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Lobby_code_key" ON "Lobby"("code");

-- CreateIndex
CREATE UNIQUE INDEX "_LobbyToPlayer_AB_unique" ON "_LobbyToPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_LobbyToPlayer_B_index" ON "_LobbyToPlayer"("B");
