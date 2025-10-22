/**
 * Check if a timestamp is expired (in the past)
 * @param timestamp - ISO string timestamp
 * @returns boolean - true if the timestamp is in the past
 */
export const isExpired = (timestamp: string): boolean => {
  return new Date(timestamp).getTime() < Date.now()
}
