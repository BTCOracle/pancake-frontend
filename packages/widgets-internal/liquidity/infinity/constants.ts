export interface ZoomLevels {
  initialMin: number;
  initialMax: number;
  min: number;
  max: number;
}

export enum TICK_SPACING_LEVEL {
  EXTRA_FINE = "EXTRA_FINE",
  FINE = "FINE",
  MEDIUM = "MEDIUM",
  COARSE = "COARSE",
}

export type TickSpacing = number;
type TickSpacingRange = [number, number];

export const TICK_SPACING_RANGE: Record<TICK_SPACING_LEVEL, TickSpacingRange> = {
  [TICK_SPACING_LEVEL.EXTRA_FINE]: [1, 9],
  [TICK_SPACING_LEVEL.FINE]: [10, 59],
  [TICK_SPACING_LEVEL.MEDIUM]: [60, 199],
  [TICK_SPACING_LEVEL.COARSE]: [200, Infinity],
};

export const ZOOM_LEVELS: Record<TICK_SPACING_LEVEL, ZoomLevels> = {
  [TICK_SPACING_LEVEL.EXTRA_FINE]: {
    initialMin: 0.999,
    initialMax: 1.001,
    min: 0.00001,
    max: 1.5,
  },
  [TICK_SPACING_LEVEL.FINE]: {
    initialMin: 0.999,
    initialMax: 1.001,
    min: 0.00001,
    max: 1.5,
  },
  [TICK_SPACING_LEVEL.MEDIUM]: {
    initialMin: 0.5,
    initialMax: 2,
    min: 0.00001,
    max: 20,
  },
  [TICK_SPACING_LEVEL.COARSE]: {
    initialMin: 0.5,
    initialMax: 2,
    min: 0.00001,
    max: 20,
  },
};

export const QUICK_ACTION_CONFIGS: Record<TICK_SPACING_LEVEL, { [percentage: number]: ZoomLevels }> = {
  [TICK_SPACING_LEVEL.EXTRA_FINE]: {
    0.1: {
      initialMin: 0.999,
      initialMax: 1.001,
      min: 0.00001,
      max: 1.5,
    },
    0.5: {
      initialMin: 0.995,
      initialMax: 1.005,
      min: 0.00001,
      max: 1.5,
    },
    1: {
      initialMin: 0.99,
      initialMax: 1.01,
      min: 0.00001,
      max: 1.5,
    },
  },
  [TICK_SPACING_LEVEL.FINE]: {
    5: {
      initialMin: 0.95,
      initialMax: 1.05,
      min: 0.00001,
      max: 1.5,
    },
    10: {
      initialMin: 0.9,
      initialMax: 1.1,
      min: 0.00001,
      max: 1.5,
    },
    20: {
      initialMin: 0.8,
      initialMax: 1.2,
      min: 0.00001,
      max: 1.5,
    },
  },
  [TICK_SPACING_LEVEL.MEDIUM]: {
    10: {
      initialMin: 0.9,
      initialMax: 1.1,
      min: 0.00001,
      max: 20,
    },
    20: {
      initialMin: 0.8,
      initialMax: 1.2,
      min: 0.00001,
      max: 20,
    },
    50: {
      initialMin: 0.5,
      initialMax: 1.5,
      min: 0.00001,
      max: 20,
    },
  },
  [TICK_SPACING_LEVEL.COARSE]: {
    10: {
      initialMin: 0.9,
      initialMax: 1.1,
      min: 0.00001,
      max: 1.5,
    },
    20: {
      initialMin: 0.8,
      initialMax: 1.2,
      min: 0.00001,
      max: 20,
    },
    50: {
      initialMin: 0.5,
      initialMax: 1.5,
      min: 0.00001,
      max: 20,
    },
  },
};
