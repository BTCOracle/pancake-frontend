import { HOOK_CATEGORY } from "@pancakeswap/infinity-sdk";
import { Trans } from "@pancakeswap/localization";

export const hookCategoryDesc: Record<HOOK_CATEGORY, React.ReactNode> = {
  [HOOK_CATEGORY.ALM]: (
    <Trans>
      Active Liquidity Management hooks enable fine-tuned control over liquidity positions, helping liquidity providers
      optimize returns by automating rebalancing, concentration, and exposure strategies.
    </Trans>
  ),
  [HOOK_CATEGORY.DynamicFees]: (
    <Trans>
      Dynamic Fees hooks allow fee adjustments based on market conditions, enhancing protocol efficiency by optimizing
      transaction costs during high volatility or incentivizing trades in low-activity periods.
    </Trans>
  ),
  [HOOK_CATEGORY.JIT]: (
    <Trans>
      Just-In-Time (JIT) Mitigation hooks protect against predatory JIT liquidity strategies by implementing safeguards
      that ensure fairness, such as transaction batching, time delays, or penalties for opportunistic behavior.
    </Trans>
  ),
  [HOOK_CATEGORY.LiquidityIncentivisation]: (
    <Trans>
      Liquidity Incentivization hooks provide mechanisms to reward liquidity providers, using token incentives or
      innovative reward structures to attract and retain capital within the protocol.
    </Trans>
  ),
  [HOOK_CATEGORY.MEV]: (
    <Trans>
      MEV (Maximal Extractable Value) hooks focus on mitigating or leveraging MEV, enabling protocols to minimize
      negative impacts or capitalize on profitable reordering opportunities.
    </Trans>
  ),
  [HOOK_CATEGORY.RWA]: (
    <Trans>
      Real-World Assets hooks bridge traditional and decentralized finance, facilitating tokenized representation and
      on-chain interaction with real-world assets such as bonds, real estate, or commodities.
    </Trans>
  ),
  [HOOK_CATEGORY.YieldOptimisation]: (
    <Trans>
      Yield Optimization hooks automate strategies to maximize returns on deposited capital, dynamically reallocating
      funds across various pools or strategies to achieve optimal performance.
    </Trans>
  ),
  [HOOK_CATEGORY.Others]: <Trans>Other hooks are used to manage other aspects of the protocol.</Trans>,
  [HOOK_CATEGORY.Oracle]: (
    <Trans>
      Oracle hooks provide secure and reliable off-chain data integration, ensuring accurate price feeds, market data,
      or other critical information is available for on-chain applications.
    </Trans>
  ),
  [HOOK_CATEGORY.CrossChain]: (
    <Trans>
      Cross-Chain hooks enable seamless interaction between multiple blockchain ecosystems, allowing asset transfers,
      liquidity sharing, and protocol interoperability across chains.
    </Trans>
  ),
  [HOOK_CATEGORY.Leverage]: (
    <Trans>
      Leverage hooks facilitate borrowing mechanisms or margin trading, allowing users to amplify exposure and returns
      while managing associated risks.
    </Trans>
  ),
  [HOOK_CATEGORY.PricingCurve]: (
    <Trans>
      Pricing Curve hooks define innovative models for price determination and asset exchange, tailoring bonding curves
      or algorithms to specific use cases or liquidity needs.
    </Trans>
  ),
  [HOOK_CATEGORY.OrderType]: (
    <Trans>
      Order Type hooks introduce advanced trading functionalities, such as limit orders, stop-loss orders, or other
      conditional executions, enhancing flexibility for traders and liquidity providers.
    </Trans>
  ),
  [HOOK_CATEGORY.BrevisDiscount]: <Trans>Powered by Brevis, this hook enables swap fee discounts</Trans>,
  [HOOK_CATEGORY.PrimusDiscount]: <Trans>Powered by Primus, this hook enables swap fee discounts</Trans>,
};
