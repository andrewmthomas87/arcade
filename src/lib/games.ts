export const GAME_TYPES = ['codenames', 'verbose'] as const;

export type GameType = (typeof GAME_TYPES)[number];
