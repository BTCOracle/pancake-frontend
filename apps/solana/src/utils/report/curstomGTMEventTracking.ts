export enum GTMEvent {
  SwapTXSuccess = 'swapTXSuccess',
  WalletConnected = 'walletConnected',
  WalletDisconnect = 'walletDisconnect',
  CreateLiquidityPool = 'createLiquidityPool',
  PoolFarmVersion = 'poolFarmVersion',
  V3lpStep1 = 'V3lpStep1',
  V3lpStep2 = 'V3lpStep2',
  V3lpStep3 = 'V3lpStep3',
  CreatelpCmfDep = 'createlpCmfDep',
  CreatelpSuccess = 'createlpSuccess',
  DepositLiquidity = 'depositLiquidity',
  DepositCreatePosition = 'depositcreatePosition',
  CreateNewPosition = 'createNewPosition',
  AddPoolLiquidity = 'addPoolLiquidity',
  PoolLiquidityAddCmf = 'PoolLiquidityAddCmf',
  PoolLiquidityAddSuccess = 'PoolLiquidityAddSuccess',
  SubPoolLiquidity = 'subPoolLiquidity',
  PoolLiquiditySubCmf = 'PoolLiquiditySubCmf',
  PoolLiquiditySubSuccess = 'PoolLiquiditySubSuccess',
  SolErrorLog = 'SolErrorLog',
  SwapClick = 'SwapStarted'
}

export enum GTMCategory {
  Wallet = 'Wallet',
  Swap = 'swap',
  Liquidity = 'liquidity'
}

export enum GTMAction {
  SwapTransactionSent = 'swap_transaction_sent',
  WalletConnected = 'Wallet Connected',
  WalletDisconnect = 'Wallet Disconnect',
  ClickCreateBtn = 'Click Create Button on SOL LP Page',
  ClickContinueButton = 'Click on continue Button',
  ClickPreviewPoolButton = 'Click Preview Pool Button',
  ClickConfirmDepositButton = 'Click Confirm Deposit Button',
  CreateLPSuccess = 'Create LP Success',
  ClickDepositButton = 'Click Deposit Button',
  ClickCreatePositionButton = 'Click Create Position Button',
  ClickCreateNewPositionButton = 'Click Create New Position Button',
  ClickPlusButton = 'Click Plus Button',
  ClickAddPoolLiquidityConfirmButton = 'Click Add Pool liquidity Confirm Button',
  DepositSuccess = 'Deposit Success',
  ClickMinusButton = 'Click Minus Button',
  ClickSubPoolLiquidityConfirmButton = 'Click Sub Pool liquidity Confirm Button',
  WithdrawSuccess = 'Withdraw Success',
  ClickSwapButton = 'click swap Button',
  SwapTransactionSuccess = 'Swap Transaction Success'
}

interface CustomGTMDataLayer {
  event: GTMEvent
  category?: GTMCategory
  action?: GTMAction
  label?: string
  tx_id?: string
  chain?: string
  from_address?: string
  to_address?: string
}

export interface PoolLiquiditySuccessParams {
  walletAddress: string
  token0: string
  token1: string
  token0Amt: string
  token1Amt: string
  feeTier: string
}

type WindowWithDataLayer = Window & {
  dataLayer: CustomGTMDataLayer[] | undefined
}

declare const window: WindowWithDataLayer

export const customGTMEvent: WindowWithDataLayer['dataLayer'] = typeof window !== 'undefined' ? window?.dataLayer : undefined

interface SwapTXSuccessEventParams {
  txId: string
  chain?: string
  from?: string
  to?: string
}

export const logGTMSwapTXSuccessEvent = ({ txId, chain, from, to = '' }: SwapTXSuccessEventParams) => {
  console.info('---SwapTXSuccess---')
  window?.dataLayer?.push({
    event: GTMEvent.SwapTXSuccess,
    action: GTMAction.SwapTransactionSent,
    category: GTMCategory.Swap,
    txId,
    tx_id: txId,
    chain,
    fromAddress: from,
    toAddress: to
  })
}

export const logGTMWalletConnectedEvent = (name: string) => {
  console.info('---wallet connected---')
  window?.dataLayer?.push({
    event: GTMEvent.WalletConnected,
    action: GTMAction.WalletConnected,
    category: GTMCategory.Wallet,
    label: name
  })
}

export const logGTMWalletDisconnectedEvent = (name: string) => {
  console.info('---wallet disconnected---')
  window?.dataLayer?.push({
    event: GTMEvent.WalletDisconnect,
    action: GTMAction.WalletDisconnect,
    category: GTMCategory.Wallet,
    label: name
  })
}

export const logGTMCreateLiquidityPoolEvent = () => {
  console.info('---CreateLiquidityPool---')
  window?.dataLayer?.push({
    event: GTMEvent.CreateLiquidityPool,
    action: GTMAction.ClickCreateBtn,
    category: GTMCategory.Liquidity,
    chain: 'Solana'
  })
}

export const logGTMPoolFarmVersionEvent = (product: 'Farm' | 'LP', version: 'V2' | 'V3') => {
  console.info('---PoolFarmVersion---')
  window?.dataLayer?.push({
    event: GTMEvent.PoolFarmVersion,
    action: GTMAction.ClickContinueButton,
    category: GTMCategory.Liquidity,
    label: product,
    desc: version
  })
}

export const logGTMV3lpStepEvent = (step: '1' | '2' | '3') => {
  console.info(`---V3lpStep${step}---`)
  window?.dataLayer?.push({
    event: step === '1' ? GTMEvent.V3lpStep1 : step === '2' ? GTMEvent.V3lpStep2 : GTMEvent.V3lpStep3,
    action: step === '3' ? GTMAction.ClickPreviewPoolButton : GTMAction.ClickContinueButton,
    category: GTMCategory.Liquidity,
    chain: 'Solana'
  })
}

export const logGTMCreatelpCmfDepEvent = (version: 'V2' | 'V3', isCreate: boolean) => {
  console.info(`---createlpCmfDep---`)
  window?.dataLayer?.push({
    event: GTMEvent.CreatelpCmfDep,
    action: GTMAction.ClickConfirmDepositButton,
    category: GTMCategory.Liquidity,
    desc: version,
    label: isCreate ? 'create_new_lp' : 'deposit_lp',
    chain: 'Solana'
  })
}

export const logGTMCreatelpSuccessEvent = ({
  version,
  isCreate,
  token0,
  token1,
  token0Amt,
  token1Amt,
  feeTier,
  walletAddress
}: { version: 'V2' | 'V3'; isCreate: boolean } & PoolLiquiditySuccessParams) => {
  console.info(`---createlpSuccess---`)
  window?.dataLayer?.push({
    event: GTMEvent.CreatelpSuccess,
    action: GTMAction.CreateLPSuccess,
    category: GTMCategory.Liquidity,
    token0,
    token1,
    token0Amt,
    token1Amt,
    feeTier,
    walletAddress,
    desc: version,
    label: isCreate ? 'create_new_lp' : 'deposit_lp'
  })
}

export const logGTMDepositLiquidityEvent = () => {
  console.info('---depositLiquidity---')
  window?.dataLayer?.push({
    event: GTMEvent.DepositLiquidity,
    action: GTMAction.ClickDepositButton,
    category: GTMCategory.Liquidity
  })
}

export const logGTMDepositCreatePositionEvent = () => {
  console.info('---depositcreatePosition---')
  window?.dataLayer?.push({
    event: GTMEvent.DepositCreatePosition,
    action: GTMAction.ClickCreatePositionButton,
    category: GTMCategory.Liquidity
  })
}

export const logGTMCreateNewPositionEvent = () => {
  console.info('---createNewPosition---')
  window?.dataLayer?.push({
    event: GTMEvent.CreateNewPosition,
    action: GTMAction.ClickCreateNewPositionButton,
    category: GTMCategory.Liquidity
  })
}

export const logGTMAddPoolLiquidityEvent = () => {
  console.info('---addPoolLiquidity---')
  window?.dataLayer?.push({
    event: GTMEvent.AddPoolLiquidity,
    action: GTMAction.ClickPlusButton,
    category: GTMCategory.Liquidity
  })
}

export const logGTMPoolLiquidityAddCmfEvent = () => {
  console.info('---PoolLiquidityAddCmf---')
  window?.dataLayer?.push({
    event: GTMEvent.PoolLiquidityAddCmf,
    action: GTMAction.ClickAddPoolLiquidityConfirmButton,
    category: GTMCategory.Liquidity
  })
}

export const logGTMPoolLiquidityAddSuccessEvent = ({
  walletAddress,
  token0,
  token1,
  token0Amt,
  token1Amt,
  feeTier
}: PoolLiquiditySuccessParams) => {
  console.info('---PoolLiquidityAddSuccess---')
  window?.dataLayer?.push({
    event: GTMEvent.PoolLiquidityAddSuccess,
    action: GTMAction.DepositSuccess,
    category: GTMCategory.Liquidity,
    walletAddress,
    token0,
    token1,
    token0Amt,
    token1Amt,
    feeTier
  })
}

export const logGTMSubPoolLiquidityEvent = () => {
  console.info('---subPoolLiquidity---')
  window?.dataLayer?.push({
    event: GTMEvent.SubPoolLiquidity,
    action: GTMAction.ClickMinusButton,
    category: GTMCategory.Liquidity
  })
}

export const logGTMPoolLiquiditySubCmfEvent = () => {
  console.info('---PoolLiquiditySubCmf---')
  window?.dataLayer?.push({
    event: GTMEvent.PoolLiquiditySubCmf,
    action: GTMAction.ClickSubPoolLiquidityConfirmButton,
    category: GTMCategory.Liquidity
  })
}

export const logGTMPoolLiquiditySubSuccessEvent = ({
  walletAddress,
  token0,
  token1,
  token0Amt,
  token1Amt,
  feeTier
}: PoolLiquiditySuccessParams) => {
  console.info('---PoolLiquiditySubSuccess---')
  window?.dataLayer?.push({
    event: GTMEvent.PoolLiquiditySubSuccess,
    action: GTMAction.WithdrawSuccess,
    category: GTMCategory.Liquidity,
    walletAddress,
    token0,
    token1,
    token0Amt,
    token1Amt,
    feeTier
  })
}

export interface SolErrorLogParams {
  action: 'Add Liquidity Fail' | 'Remove Liquidity Fail' | 'Create Liquidity Pool Fail' | 'Swap Fail' | 'Wallet Connect Fail'
  e: any
}

export const logGTMSolErrorLogEvent = ({ action, e }: SolErrorLogParams) => {
  console.info('---SolErrorLog---')
  let errorMsg = ''
  try {
    errorMsg = typeof e === 'string' ? e : 'message' in e ? e.message : e.toString()
  } catch (e) {
    //
  }
  window?.dataLayer?.push({
    event: GTMEvent.SolErrorLog,
    action,
    category: action === 'Swap Fail' ? GTMCategory.Swap : action === 'Wallet Connect Fail' ? GTMCategory.Wallet : GTMCategory.Liquidity,
    label: 0,
    desc: errorMsg
  })
}

export const logGTMSwapClickEvent = () => {
  console.info('---SwapClick---')
  window?.dataLayer?.push({
    event: GTMEvent.SwapClick,
    action: GTMAction.ClickSwapButton,
    category: GTMCategory.Swap,
    chain: 'Solana'
  })
}

export interface SwapClickParams {
  fromAddress: string
  fromToken: string
  fromAmt: string
  toToken: string
  toAmt: string
  txId: string
}

export const logGTMSwapTxSuccEvent = ({ fromToken, fromAmt, toToken, toAmt, txId, fromAddress }: SwapClickParams) => {
  console.info('---SwapTXSuccess---')
  window?.dataLayer?.push({
    event: GTMEvent.SwapTXSuccess,
    action: GTMAction.SwapTransactionSuccess,
    from_address: fromAddress,
    token0: fromToken,
    token0Amt: fromAmt,
    token1: toToken,
    token1Amt: toAmt,
    tx_id: txId,
    chain: 'Solana'
  })
}
