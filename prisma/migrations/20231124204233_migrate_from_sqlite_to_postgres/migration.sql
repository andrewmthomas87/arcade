-- CreateTable
CREATE TABLE "Word" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "isAlpha" BOOLEAN NOT NULL,
    "frequency" INTEGER NOT NULL,
    "partsOfSpeech" TEXT NOT NULL,
    "concreteness" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lobby" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "activeGameId" INTEGER,

    CONSTRAINT "Lobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "lobbyId" INTEGER NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodenamesWord" (
    "index" INTEGER NOT NULL,
    "word" TEXT NOT NULL,

    CONSTRAINT "CodenamesWord_pkey" PRIMARY KEY ("index")
);

-- CreateTable
CREATE TABLE "CodenamesGame" (
    "gameId" INTEGER NOT NULL,
    "boardSize" TEXT NOT NULL,

    CONSTRAINT "CodenamesGame_pkey" PRIMARY KEY ("gameId")
);

-- CreateTable
CREATE TABLE "CodenamesRound" (
    "gameId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "initJSON" TEXT NOT NULL,
    "stateJSON" TEXT NOT NULL,

    CONSTRAINT "CodenamesRound_pkey" PRIMARY KEY ("gameId","number")
);

-- CreateTable
CREATE TABLE "VerboseWord" (
    "index" INTEGER NOT NULL,
    "word" TEXT NOT NULL,

    CONSTRAINT "VerboseWord_pkey" PRIMARY KEY ("index")
);

-- CreateTable
CREATE TABLE "VerboseGame" (
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "VerboseGame_pkey" PRIMARY KEY ("gameId")
);

-- CreateTable
CREATE TABLE "VerboseRound" (
    "gameId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "initJSON" TEXT NOT NULL,
    "stateJSON" TEXT NOT NULL,

    CONSTRAINT "VerboseRound_pkey" PRIMARY KEY ("gameId","number")
);

-- CreateTable
CREATE TABLE "_LobbyToPlayer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_GameToPlayer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Word_word_key" ON "Word"("word");

-- CreateIndex
CREATE UNIQUE INDEX "Lobby_code_key" ON "Lobby"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Lobby_activeGameId_key" ON "Lobby"("activeGameId");

-- CreateIndex
CREATE UNIQUE INDEX "CodenamesWord_word_key" ON "CodenamesWord"("word");

-- CreateIndex
CREATE UNIQUE INDEX "VerboseWord_word_key" ON "VerboseWord"("word");

-- CreateIndex
CREATE UNIQUE INDEX "_LobbyToPlayer_AB_unique" ON "_LobbyToPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_LobbyToPlayer_B_index" ON "_LobbyToPlayer"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToPlayer_AB_unique" ON "_GameToPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToPlayer_B_index" ON "_GameToPlayer"("B");

-- AddForeignKey
ALTER TABLE "Lobby" ADD CONSTRAINT "Lobby_activeGameId_fkey" FOREIGN KEY ("activeGameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodenamesGame" ADD CONSTRAINT "CodenamesGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodenamesRound" ADD CONSTRAINT "CodenamesRound_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "CodenamesGame"("gameId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerboseGame" ADD CONSTRAINT "VerboseGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerboseRound" ADD CONSTRAINT "VerboseRound_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "VerboseGame"("gameId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LobbyToPlayer" ADD CONSTRAINT "_LobbyToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "Lobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LobbyToPlayer" ADD CONSTRAINT "_LobbyToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToPlayer" ADD CONSTRAINT "_GameToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToPlayer" ADD CONSTRAINT "_GameToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
