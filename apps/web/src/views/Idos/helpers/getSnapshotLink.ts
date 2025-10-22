export const getSnapshotDeepLink = (projectId: string) => {
  if (typeof window === 'undefined') return ''
  const appId = 'xoqXxUSMRccLCrZNRebmzj'
  const startPagePath = window.btoa('pages/subpackages/snapshot/index')
  const startPageQuery = window.btoa(`projectId=${projectId}`)

  const deeplink = `bnc://app.binance.com/mp/app?appId=${appId}&startPagePath=${startPagePath}&startPageQuery=${startPageQuery}&showOptions=2`

  return deeplink
}
