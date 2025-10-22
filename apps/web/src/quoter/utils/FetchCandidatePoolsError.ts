export class FetchCandidatePoolsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FetchCandidatePoolsError'
  }
}
