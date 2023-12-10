export const GAME_TYPES = ['codenames', 'doodledash', 'verbose'] as const;

export type GameType = (typeof GAME_TYPES)[number];
