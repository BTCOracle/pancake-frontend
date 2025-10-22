import {
  QUICK_ACTION_CONFIGS,
  TICK_SPACING_LEVEL,
  TICK_SPACING_RANGE,
  TickSpacing,
  ZOOM_LEVELS,
  ZoomLevels,
} from "./constants";

export const getTickSpacingLevel = (tickSpacing?: TickSpacing): TICK_SPACING_LEVEL | undefined => {
  if (!tickSpacing) return undefined;
  return (Object.keys(TICK_SPACING_RANGE) as Array<TICK_SPACING_LEVEL>).find((level) => {
    const [min, max] = TICK_SPACING_RANGE[level];
    return tickSpacing >= min && tickSpacing <= max;
  });
};

export const getQuickActionConfigs = (tickSpacing?: TickSpacing) => {
  const tickSpacingLevel = getTickSpacingLevel(tickSpacing) ?? TICK_SPACING_LEVEL.MEDIUM;
  return QUICK_ACTION_CONFIGS[tickSpacingLevel];
};

export const getZoomLevelConfigs = (tickSpacing?: TickSpacing) => {
  const tickSpacingLevel = getTickSpacingLevel(tickSpacing) ?? TICK_SPACING_LEVEL.MEDIUM;
  return ZOOM_LEVELS[tickSpacingLevel];
};

/**
 * Calculates zoom levels for a custom percentage value based on tick spacing
 *
 * Logic:
 * 1. Determines the tick spacing level (EXTRA_FINE, FINE, MEDIUM, COARSE)
 * 2. Directly maps the percentage to a symmetric range around current price (1.0)
 * 3. For X% input: range becomes (1 - X/100) to (1 + X/100)
 * 4. Respects absolute min/max bounds from tick spacing configuration
 * 5. Full range (100%) returns the default zoom level for that tick spacing
 *
 * @param percentage - Custom percentage value (0-100)
 * @param tickSpacing - The tick spacing of the pool
 * @returns ZoomLevels object with calculated initialMin, initialMax, min, max
 */
export const getCustomZoomLevelFromPercentage = (percentage: number, tickSpacing?: TickSpacing): ZoomLevels => {
  const tickSpacingLevel = getTickSpacingLevel(tickSpacing) ?? TICK_SPACING_LEVEL.MEDIUM;
  const baseZoomLevel = ZOOM_LEVELS[tickSpacingLevel];

  // Handle full range (100%)
  if (percentage >= 100) {
    return baseZoomLevel;
  }

  // Validate percentage bounds
  const clampedPercentage = Math.max(0.01, Math.min(99.99, percentage));

  // Convert percentage to decimal (e.g., 20% → 0.20)
  const rangeMultiplier = clampedPercentage / 100;

  // Calculate initial price bounds: ±percentage around current price (1.0)
  // For 20%: 1 - 0.20 = 0.80 (-20%) and 1 + 0.20 = 1.20 (+20%)
  // For 80%: 1 - 0.80 = 0.20 (-80%) and 1 + 0.80 = 1.80 (+80%)
  const initialMin = Math.max(
    baseZoomLevel.min, // Respect absolute minimum bound
    1 - rangeMultiplier
  );

  const initialMax = Math.min(
    baseZoomLevel.max, // Respect absolute maximum bound
    1 + rangeMultiplier
  );

  return {
    initialMin,
    initialMax,
    min: baseZoomLevel.min, // Keep the same absolute bounds
    max: baseZoomLevel.max, // Keep the same absolute bounds
  };
};

/**
 * Validates if a custom percentage is valid for the given tick spacing
 *
 * @param percentage - The percentage to validate
 * @param tickSpacing - The tick spacing of the pool
 * @returns boolean indicating if the percentage is valid
 */
export const isValidCustomPercentage = (percentage: number, tickSpacing?: TickSpacing): boolean => {
  const tickSpacingLevel = getTickSpacingLevel(tickSpacing) ?? TICK_SPACING_LEVEL.MEDIUM;

  // Define minimum percentages based on tick spacing level
  const minPercentages: Record<TICK_SPACING_LEVEL, number> = {
    [TICK_SPACING_LEVEL.EXTRA_FINE]: 0.01, // 0.01% minimum for stable pairs
    [TICK_SPACING_LEVEL.FINE]: 0.1, // 0.1% minimum for low volatility
    [TICK_SPACING_LEVEL.MEDIUM]: 1, // 1% minimum for medium volatility
    [TICK_SPACING_LEVEL.COARSE]: 5, // 5% minimum for high volatility
  };

  const minPercentage = minPercentages[tickSpacingLevel];

  return percentage >= minPercentage && percentage <= 100;
};
