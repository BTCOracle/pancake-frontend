import { Currency, UnifiedCurrency } from "@pancakeswap/sdk";
import { useMemo } from "react";
import { styled } from "styled-components";

import Image from "next/image";
import { ASSET_CDN } from "../../utils/endpoints";
import { CurrencyLogo } from "./CurrencyLogo";

const Wrapper = styled.div<{ margin: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: ${({ margin }) => margin && "4px"};
`;

interface DoubleCurrencyLogoProps {
  margin?: boolean;
  size?: number;
  currency0?: UnifiedCurrency;
  currency1?: UnifiedCurrency;
  innerMargin?: string | number;
  showChainLogo?: boolean;
  showChainLogoCurrency1?: boolean;
}

export function DoubleCurrencyLogo({
  currency0,
  currency1,
  size = 20,
  margin = false,
  innerMargin = "4px",
  showChainLogo = false,
  showChainLogoCurrency1 = false,
}: DoubleCurrencyLogoProps) {
  const chainLogoSize = useMemo(() => size * 0.66, [size]);
  return (
    <>
      <Wrapper margin={margin}>
        {currency0 && (
          <CurrencyLogo
            currency={currency0}
            size={`${size.toString()}px`}
            style={{ marginRight: innerMargin, minWidth: `${size.toString()}px` }}
          />
        )}
        {currency1 && (
          <CurrencyLogo
            currency={currency1}
            size={`${size.toString()}px`}
            style={{ minWidth: `${size.toString()}px` }}
            showChainLogo={showChainLogoCurrency1}
          />
        )}
        {showChainLogo && currency0 ? (
          <Image
            alt={`chain-${currency0.chainId}`}
            src={`${ASSET_CDN}/web/chains/${currency0.chainId}.png`}
            style={{ maxHeight: chainLogoSize, margin: "8px" }}
            width={chainLogoSize}
            height={chainLogoSize}
            unoptimized
          />
        ) : null}
      </Wrapper>
    </>
  );
}
