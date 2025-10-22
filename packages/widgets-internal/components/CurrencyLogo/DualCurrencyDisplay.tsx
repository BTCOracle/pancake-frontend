import { UnifiedCurrency } from "@pancakeswap/sdk";
import { ArrowForwardIcon, AtomBoxProps, AutoColumn, Grid, RowFixed, Text } from "@pancakeswap/uikit";
import styled from "styled-components";
import { CurrencyLogo } from "./CurrencyLogo";

const StyledGrid = styled(Grid)`
  grid-template-columns: 3fr 1fr 3fr;
`;

const CurrencyColumn = styled(AutoColumn)`
  min-width: 130px;
  justify-items: center;

  @media (max-width: 360px) {
    min-width: 60px;
  }
`;

const MiddleColumn = styled(RowFixed)`
  @media (max-width: 360px) {
    transform: scale(0.8);
  }
`;

interface DualCurrencyDisplayProps extends AtomBoxProps {
  inputCurrency?: UnifiedCurrency;
  outputCurrency?: UnifiedCurrency;
  inputAmount?: string;
  outputAmount?: string;
  inputTextColor?: string;
  outputTextColor?: string;
  inputChainName?: string;
  outputChainName?: string;
  overrideIcon?: React.ReactNode;
  textRightOpacity?: number;
  textLeftOpacity?: number;
}
export const DualCurrencyDisplay = ({
  inputAmount,
  outputAmount,
  inputTextColor,
  outputTextColor,
  inputCurrency,
  outputCurrency,
  inputChainName,
  outputChainName,
  overrideIcon,
  textRightOpacity,
  textLeftOpacity,
  ...props
}: DualCurrencyDisplayProps) => {
  return (
    <StyledGrid {...props}>
      <CurrencyColumn>
        <CurrencyLogo currency={inputCurrency} size="40px" showChainLogo />

        <Text fontSize={["14px", "16px"]} color={inputTextColor} bold ellipsis style={{ opacity: textLeftOpacity }}>
          {inputAmount}&nbsp;
          {inputCurrency?.symbol}
        </Text>

        <Text textTransform="uppercase" color="textSubtle" fontSize="12px" bold style={{ opacity: textLeftOpacity }}>
          {inputChainName}
        </Text>
      </CurrencyColumn>
      <MiddleColumn m="auto" paddingTop="4px">
        {overrideIcon || <ArrowForwardIcon width="36px" ml="4px" color="textSubtle" />}
      </MiddleColumn>
      <CurrencyColumn>
        <CurrencyLogo currency={outputCurrency} size="40px" showChainLogo />

        <Text fontSize={["14px", "16px"]} bold ellipsis color={outputTextColor} style={{ opacity: textRightOpacity }}>
          {outputAmount}&nbsp;{outputCurrency?.symbol}
        </Text>

        <Text color="textSubtle" textTransform="uppercase" fontSize="12px" style={{ opacity: textRightOpacity }} bold>
          {outputChainName}
        </Text>
      </CurrencyColumn>
    </StyledGrid>
  );
};
