# Quoter Implementation - README

This document describes the new quoter part of the PancakeSwap codebase. It explains how we create a “QuoteQuery” object, how we hash queries, how we determine the best quote atomically, how user inputs interact with these functionalities, and finally how to use the QuoterProvider component and the useAllTypeBestTrade hook.

---

## 1. What is a QuoteQuery and How Does Hashing Work?

### 1.1 QuoteQuery Explanation

A QuoteQuery is the core data structure that captures all parameters needed to request a quote for a swap or trade. It typically includes:
• The amount and currency involved,  
• The trade type (EXACT_INPUT or EXACT_OUTPUT),  
• The user’s chain ID,  
• Flags enabling or disabling specific router functionalities (e.g., v2Swap, v3Swap, infinitySwap, etc.),  
• Slippage,  
• An optional on-chain blockNumber for referencing current state, and  
• Other internal details such as reference signals for aborting or providing providers.

In short, the QuoteQuery object fully describes the scenario of a given potential swap.

### 1.2 Hashing Mechanism

To ensure consistent, memoized caching of results, each QuoteQuery is hashed. Internally, the system uses a utility class called PoolHashHelper, which:

• Sorts and hashes the tokens involved in the query (so the hashing is not order-dependent).  
• Encodes the rest of the parameters (network, user flags, slippage, etc.).  
• Produces a unique, reproducible hash string, stored in the QuoteQuery as quoteQuery.hash.

This hash allows the system to:

- Avoid re-running the same logic for identical scenarios.
- Identify ongoing or previous queries that can be reused.
- Abort old queries (by referencing the corresponding hash).

---

## 2. How “bestQuoteAtom” Works

The bestQuoteAtom is an atomFamily (from jotai) that receives a QuoteQuery as input, looks up or calculates the best quote for that query, and returns a structured loadable object. In essence:

1. You call bestQuoteAtom(quoteQuery).
2. Internally, it tries different potential swap routes (e.g., off-chain quoter, quoter worker, etc.).
3. It finds the best trade among those routes (or determines that no valid route exists).
4. The result is stored in a loadable (loading, success, or error).

When the bestQuoteAtom sees that certain fields (like currency, amount, or chain ID) have changed, it recalculates. This ensures that as user inputs or system changes occur, the bestQuoteAtom always presents the “best trade” or an error if no route is found.

---

## 3. How This Part Interacts with User Input

Throughout the app, user input is captured by various components (e.g., typed values, selected tokens). A common place to see this is in the useQuoterSync hook:

1. The user chooses an input and output token, and types an amount.
2. The application constructs a QuoteQuery from that input.
3. The QuoteQuery is hashed, making it unique for that scenario.
4. The bestQuoteAtom is then read for that hash. If the user changes any fields, a new QuoteQuery (and thus a new hash) is created.
5. Old queries are aborted (via an AbortController) to prevent stale results from overwriting fresh results.

This flow allows the quote system to be highly responsive, aborting outdated queries that are no longer needed, then focusing on the new queries that reflect the user’s current input.

---

## 4. How to Use QuoterProvider and useAllTypeBestTrade

### 4.1 QuoterProvider

The QuoterProvider is a React provider component that initializes all quote-related atoms and synchronization. It also runs a small suspended component (QuoteSync) to keep the quote logic up to date. Here is an example of how to wrap your application with QuoterProvider:

---

Example usage:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QuoteProvider } from 'quoter/QuoteProvider'

function App() {
  return (
    <QuoteProvider>
      {/_ The rest of your application _/}
      <MySwapPage />
    </QuoteProvider>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
```

---

Inside the QuoterProvider, contexts such as the “QuoteContext” are provided. The child hook useQuoterSync can then observe user input changes, build QuoteQuery objects, track them with atomic state, and fetch best quotes.

### 4.2 useAllTypeBestTrade

Once your application is wrapped in the QuoterProvider, you can consume the best trade result easily:

---

```typescript
import React from 'react'
import { useAllTypeBestTrade } from 'quoter/hook/useAllTypeBestTrade'

function MySwapPage() {
  const { bestOrder, tradeLoaded, tradeError, refreshTrade } = useAllTypeBestTrade()

  if (tradeError) {
    return <div>Error loading best trade: {tradeError.message}</div>
  }

  if (!tradeLoaded) {
    return <div>Loading best trade...</div>
  }

  if (!bestOrder) {
    return <div>No Best Trade Found.</div>
  }

  return (
    <div>
      <p>Found a best Order with route: {bestOrder.type}</p>
      {/_ bestOrder.trade or other data can be displayed _/}
      <button onClick={refreshTrade}>Refresh Trade</button>
    </div>
  )
}
```

---

Here’s what’s happening in the snippet:

1. useAllTypeBestTrade selects the best final route from the store (which is maintained by the bestQuoteAtom) and returns a simple UI-friendly result:  
   • bestOrder (the final route)  
   • tradeLoaded / tradeError (status flags)  
   • refreshTrade (to manually trigger a new quote if needed)

2. You can pause or resume quoting if desired (e.g., if user wants to hold the current price).

---

## Summary

• A QuoteQuery object encapsulates all parameters for fetching a quote.  
• Each QuoteQuery is uniquely hashed for caching and concurrency control.  
• The bestQuoteAtom checks multiple possible routes to pick (and store) the best quote.  
• Hooks like useQuoterSync feed user input into the system, generating QuoteQuery objects.  
• QuoterProvider sets up the environment for quoting, and useAllTypeBestTrade retrieves the final best trade in your UI.

With this structure, your application can efficiently compute and display the best swap route for any given user input, while also being responsive to changes (like typed amounts, token changes, chain changes, and so on).
