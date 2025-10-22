import { Currency, Price } from "@pancakeswap/swap-sdk-core";
import { FlexGap, SkeletonV2, SwapHorizIcon, Text } from "@pancakeswap/uikit";
import { formatPrice } from "@pancakeswap/utils/formatFractions";
import { useState } from "react";
import { displaySymbolWithChainName } from "../utils/displaySymbolWithChainName";

interface TradePriceProps {
  price?: Price<Currency, Currency>;
  loading?: boolean;
}

export function TradePrice({ price, loading }: TradePriceProps) {
  const [showInverted, setShowInverted] = useState<boolean>(false);

  const formattedPrice = showInverted ? formatPrice(price, 6) : formatPrice(price?.invert(), 6);
  const show = Boolean(price?.baseCurrency && price?.quoteCurrency);

  const isBridge = price?.baseCurrency?.chainId !== price?.quoteCurrency?.chainId;

  return (
    <FlexGap justifyContent="center" alignItems="center">
      {show ? (
        <>
          <SkeletonV2 width="50px" height="18px" borderRadius="8px" minHeight="auto" isDataReady={!loading}>
            <Text fontSize="14px">
              {`1 ${
                showInverted
                  ? displaySymbolWithChainName(price?.baseCurrency, isBridge)
                  : displaySymbolWithChainName(price?.quoteCurrency, isBridge)
              }`}
            </Text>
          </SkeletonV2>
          <SwapHorizIcon
            onClick={() => setShowInverted(!showInverted)}
            width="18px"
            height="18px"
            color="primary"
            ml="4px"
            mr="4px"
          />
          <SkeletonV2 width="100px" height="18px" borderRadius="8px" minHeight="auto" isDataReady={!loading}>
            <Text fontSize="14px">
              {`${formattedPrice} ${
                showInverted
                  ? displaySymbolWithChainName(price?.quoteCurrency, isBridge)
                  : displaySymbolWithChainName(price?.baseCurrency, isBridge)
              }`}
            </Text>
          </SkeletonV2>
        </>
      ) : (
        "-"
      )}
    </FlexGap>
  );
}
