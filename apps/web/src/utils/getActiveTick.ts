export const getActiveTick = (tickCurrent: number | undefined, tickSpacing: number | undefined) =>
  tickCurrent !== undefined && tickSpacing ? Math.floor(tickCurrent / tickSpacing) * tickSpacing : undefined
