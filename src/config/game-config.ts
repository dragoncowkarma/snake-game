export const GAME_CONFIG = {
  board: {
    width: 20,
    height: 20,
  },
  initialSnake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
  scorePerFood: 10,
  acceleration: {
    foodsPerStep: 5,
    stepMs: 10,
  },
  difficulty: {
    slow: {
      startTickMs: 220,
      minimumTickMs: 130,
    },
    normal: {
      startTickMs: 160,
      minimumTickMs: 90,
    },
  },
} as const;
