export const MAX_DECIMALS_DISPLAY = 6;

/**
 * Truncates a decimal string to a specified number of decimal places
 * @param value - The string value containing a decimal number
 * @param maxDecimals - The maximum number of decimal places to keep
 * @returns The truncated decimal string
 */
export function truncateDecimals(value?: string, maxDecimals = MAX_DECIMALS_DISPLAY): string {
  if (!value) {
    return "";
  }

  if (!value.includes(".")) {
    return value;
  }

  const [wholeNumber, decimal] = value.split(".");
  if (!decimal || decimal.length <= maxDecimals) {
    return value;
  }

  return `${wholeNumber}.${decimal.slice(0, maxDecimals)}`;
}
