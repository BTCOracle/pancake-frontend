import { useTranslation } from "@pancakeswap/localization";
import { Currency } from "@pancakeswap/sdk";
import { AutoColumn, Row, SwapLoading, Text } from "@pancakeswap/uikit";
import { PropsWithChildren } from "react";
import { DualCurrencyDisplay } from "../components/CurrencyLogo";

interface SwapPendingModalContentV3Props extends PropsWithChildren {
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  amountA?: string;
  amountB?: string;
  chainNameA?: string;
  chainNameB?: string;
}

export const SwapPendingModalContentV3: React.FC<SwapPendingModalContentV3Props> = ({
  currencyA,
  currencyB,
  amountA,
  amountB,
  chainNameA,
  chainNameB,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <AutoColumn width="100%">
      <DualCurrencyDisplay
        inputCurrency={currencyA}
        outputCurrency={currencyB}
        inputAmount={amountA}
        outputAmount={amountB}
        inputChainName={chainNameA}
        outputChainName={chainNameB}
      />

      <Row mt="32px" justifyContent="center" gap="8px">
        <Text color="textSubtle" small>
          {t("Please proceed in your wallet")}
        </Text>
        <SwapLoading />
      </Row>

      {children}
    </AutoColumn>
  );
};
