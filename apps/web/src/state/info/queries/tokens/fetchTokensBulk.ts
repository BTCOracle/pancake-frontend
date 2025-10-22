import { gql } from 'graphql-request'

export const fetchTokensBulk = (block: number | undefined, tokens: string[]) => {
  let tokenString = `[`
  tokens.forEach((address) => {
    tokenString = `${tokenString}"${address}",`
  })
  tokenString += ']'
  const queryString = `
    query tokens {
      tokens(where: {id_in: ${tokenString}},
    ${block ? `block: {number: ${block}} ,` : ''}
     orderBy: totalValueLockedUSD, orderDirection: desc) {
        id
        symbol
        name
        decimals
        derivedETH
        volumeUSD
        volume
        txCount
        totalValueLocked
        feesUSD
        totalValueLockedUSD
      }
    }
    `
  return gql`
    ${queryString}
  `
}
