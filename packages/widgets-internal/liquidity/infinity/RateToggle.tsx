import { useTranslation } from "@pancakeswap/localization";
import { Currency } from "@pancakeswap/sdk";
import { Button, FlexGap, FlexGapProps, RefreshIcon, SyncAltIcon, Text } from "@pancakeswap/uikit";
import { styled } from "styled-components";

const RateToggleButton = styled(Button)`
  border-radius: 8px;
  padding: 10px 6px;
  border: 2px solid ${({ theme }) => theme.colors.primary60};
  color: ${({ theme }) => theme.colors.primary60};
`;

interface RateToggleProps extends FlexGapProps {
  currencyA?: Currency | null;
  handleRateToggle: () => void;
  handleReset?: () => void;
  showReset?: boolean;
}
export function RateToggle({ currencyA, handleRateToggle, showReset, handleReset, ...props }: RateToggleProps) {
  const { t } = useTranslation();

  return currencyA ? (
    <FlexGap alignItems="center" gap="5px" width="fit-content" {...props}>
      <Text mr="6px" color="textSubtle" small>
        {t("View prices in")}
      </Text>
      <RateToggleButton
        mt="2px"
        variant="secondary"
        scale="xs"
        onClick={handleRateToggle}
        startIcon={<SyncAltIcon color="primary60" />}
      >
        {currencyA?.symbol}
      </RateToggleButton>
      {showReset && (
        <RateToggleButton
          mt="2px"
          variant="secondary"
          scale="xs"
          onClick={handleReset}
          startIcon={<RefreshIcon color="primary" />}
        >
          <Text textTransform="capitalize" color="primary">
            {t("reset")}
          </Text>
        </RateToggleButton>
      )}
    </FlexGap>
  ) : null;
}
