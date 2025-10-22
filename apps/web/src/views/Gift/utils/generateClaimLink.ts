export function generateClaimLink({ code }: { code: string }) {
  return `${window.location.protocol}//${window.location.host}/invite/${code}`
}
