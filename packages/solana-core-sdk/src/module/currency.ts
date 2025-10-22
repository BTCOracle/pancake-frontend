import { SOL_INFO } from "../raydium/token/constant";

import { Token } from "./token";

interface CurrencyProps {
  isNative?: boolean;
  decimals: number;
  symbol?: string;
  name?: string;
}
/**
 * A currency is any fungible financial instrument on Solana, including SOL and all SPL tokens.
 * The only instance of the base class `Currency` is SOL.
 */
export class Currency {
  public readonly symbol?: string;

  public readonly name?: string;

  public readonly decimals: number;

  public readonly isNative: boolean = false;

  /**
   * The only instance of the base class `Currency`.
   */
  public static readonly SOL: Currency = new Currency({ ...SOL_INFO, isNative: true });

  /**
   * Constructs an instance of the base class `Currency`. The only instance of the base class `Currency` is `Currency.SOL`.
   * @param decimals - decimals of the currency
   * @param symbol - symbol of the currency
   * @param name - name of the currency
   */
  public constructor({ decimals, symbol = "UNKNOWN", name = "UNKNOWN", isNative = false }: CurrencyProps) {
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
    this.isNative = isNative;
  }

  public equals(other: Currency): boolean {
    return this === other;
  }
}

/**
 * Compares two currencies for equality
 */
export function currencyEquals(currencyA: Currency, currencyB: Currency): boolean {
  if (currencyA instanceof Token && currencyB instanceof Token) {
    return currencyA.equals(currencyB);
  }
  if (currencyA instanceof Token || currencyB instanceof Token) {
    return false;
  }
  return currencyA === currencyB;
}
