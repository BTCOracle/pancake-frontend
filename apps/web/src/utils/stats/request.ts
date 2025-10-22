export const fetchFromDune = (input: string | URL | Request, options?: RequestInit) =>
  fetch(input, {
    headers: {
      'X-DUNE-API-KEY': process.env.DUNE_API_KEY || '',
      'Content-Type': 'application/json',
    },
    ...options,
  })
