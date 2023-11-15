export const BOARD_SIZE_KEYS = ['3x3', '4x3', '4x4', '5x4', '5x5'] as const;

export type BoardSizeKey = (typeof BOARD_SIZE_KEYS)[number];

export const BOARD_SIZES = {
  '3x3': { w: 3, h: 3 },
  '4x3': { w: 4, h: 3 },
  '4x4': { w: 4, h: 4 },
  '5x4': { w: 5, h: 4 },
  '5x5': { w: 5, h: 5 },
} satisfies Record<BoardSizeKey, { w: number; h: number }>;

export type BoardSize = keyof typeof BOARD_SIZES;
