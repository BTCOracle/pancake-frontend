import { useCallback, useEffect, useMemo, useState } from "react";
import { usePreviousValue } from "@pancakeswap/hooks";
import { useTranslation } from "@pancakeswap/localization";
import {
  Box,
  Button,
  FlexGap,
  FlexGapProps,
  Input,
  Message,
  RowBetween,
  Text,
  useMatchBreakpoints,
} from "@pancakeswap/uikit";
import isUndefinedOrNull from "@pancakeswap/utils/isUndefinedOrNull";
import styled, { css } from "styled-components";
import { ZoomLevels } from "./constants";
import {
  getQuickActionConfigs,
  getZoomLevelConfigs,
  getCustomZoomLevelFromPercentage,
  isValidCustomPercentage,
} from "./utils";

const ButtonsContainer = styled(FlexGap).attrs({ gap: "5px" })`
  background-color: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.inputSecondary};
  border-radius: ${({ theme }) => theme.radii.default};

  box-shadow: ${({ theme }) => theme.shadows.inset2};
`;

const StyledButton = styled(Button).attrs(({ $isActive }) => ({
  scale: "xs",
  variant: $isActive ? "subtle" : "light",
}))<{
  $isActive?: boolean;
}>`
  height: 56px;
  font-size: 16px;
  padding: 0 12px;
  font-weight: ${({ $isActive }) => ($isActive ? 600 : 400)};
`;

const CustomInputContainer = styled(Box)<{ $small?: boolean }>`
  position: relative;
  max-width: 120px;

  ${({ $small }) =>
    $small
      ? css`
          height: 40px;
        `
      : css`
          height: 56px;
          min-width: 120px;
        `}
`;

const StyledInput = styled(Input)<{ $isValid?: boolean; $isActive?: boolean }>`
  height: 100%;
  font-size: 16px;
  text-align: center;

  padding-left: 0px !important;
  padding-right: 12px !important;

  border: ${({ theme, $isValid }) =>
    !$isValid ? `1px solid ${theme.colors.failure}` : `1px solid ${theme.colors.inputSecondary}`};
  background: ${({ theme }) => theme.colors.input};

  transition: all 0.2s ease-in-out;
`;

const PercentageLabel = styled(Text)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 16px;
  pointer-events: none;

  display: flex;
  align-items: center;
  gap: 4px;
`;

const VerticalLine = styled.div`
  width: 2px;
  height: 16px;
  background-color: ${({ theme }) => theme.colors.inputSecondary};
`;

interface PriceRangePickerProps extends Omit<FlexGapProps, "onChange"> {
  onChange: (value: number | null, zoomLevel: ZoomLevels) => void;
  value?: number | null;
  tickSpacing: number | undefined;
}

const CapitalEfficiencyWarning = ({
  setShowCapitalEfficiencyWarning,
  setFullRange,
}: {
  setShowCapitalEfficiencyWarning: (value: boolean) => void;
  setFullRange: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <Message variant="warning">
      <Box>
        <Text fontSize="16px">{t("Efficiency Comparison")}</Text>
        <Text color="textSubtle">{t("Full range positions may earn less fees than concentrated positions.")}</Text>
        <Button
          mt="16px"
          onClick={() => {
            setShowCapitalEfficiencyWarning(false);
            setFullRange();
          }}
          scale="md"
          variant="danger"
        >
          {t("I understand")}
        </Button>
      </Box>
    </Message>
  );
};

export const PriceRangePicker = ({ onChange, value, tickSpacing, ...props }: PriceRangePickerProps) => {
  const { t } = useTranslation();
  const { isMobile, isTablet } = useMatchBreakpoints();
  const isSmallScreen = isMobile || isTablet;

  const [showCapitalEfficiencyWarning, setShowCapitalEfficiencyWarning] = useState<boolean>(false);
  const [customPercentage, setCustomPercentage] = useState<string>("");
  const [isCustomInputFocused, setIsCustomInputFocused] = useState<boolean>(false);
  const [isUserTyping, setIsUserTyping] = useState<boolean>(false);
  const prevTickSpacing = usePreviousValue(tickSpacing);

  const handleClick = useCallback(
    (action: number, zoomLevel: ZoomLevels) => {
      if (value === action) {
        onChange?.(null, getZoomLevelConfigs(tickSpacing));
      } else {
        onChange?.(action, zoomLevel);
      }
      // Clear custom input when preset button is clicked
      setCustomPercentage("");
      setIsUserTyping(false);
    },
    [onChange, value, tickSpacing]
  );

  const config = useMemo(() => getQuickActionConfigs(tickSpacing), [tickSpacing]);

  const setFullRange = useCallback(() => {
    onChange?.(100, getZoomLevelConfigs(tickSpacing));
    setCustomPercentage("");
    setIsUserTyping(false);
  }, [onChange, tickSpacing]);

  const resetRange = useCallback(() => {
    onChange?.(null, getZoomLevelConfigs(tickSpacing));
    setCustomPercentage("");
    setIsUserTyping(false);
  }, [onChange, tickSpacing]);

  // Handle custom percentage input
  const handleCustomPercentageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;
      const numericValue = parseFloat(inputValue);

      if (isUndefinedOrNull(numericValue)) {
        setCustomPercentage("");
        setIsUserTyping(false);
        return;
      }

      if (numericValue < 0 || numericValue > 100) {
        return;
      }

      setCustomPercentage(inputValue);
      setIsUserTyping(true);

      // Only trigger onChange if we have a complete, valid number
      // This prevents clearing the input while typing intermediate values
      if (
        !Number.isNaN(numericValue) &&
        inputValue.trim() !== "" &&
        isValidCustomPercentage(numericValue, tickSpacing)
      ) {
        const customZoomLevel = getCustomZoomLevelFromPercentage(numericValue, tickSpacing);
        onChange?.(numericValue, customZoomLevel);
      }
    },
    [onChange, tickSpacing]
  );

  const handleCustomInputFocus = useCallback(() => {
    setIsCustomInputFocused(true);
    setIsUserTyping(true);
  }, []);

  const handleCustomInputBlur = useCallback(() => {
    setIsCustomInputFocused(false);
    setIsUserTyping(false);
  }, []);

  const isCustomPercentageValid = useMemo(() => {
    if (!customPercentage) return true;
    const numericValue = parseFloat(customPercentage);
    return !Number.isNaN(numericValue) && isValidCustomPercentage(numericValue, tickSpacing);
  }, [customPercentage, tickSpacing]);

  const isCustomInputActive = useMemo(() => {
    if (!customPercentage) return false;
    const numericValue = parseFloat(customPercentage);
    return !Number.isNaN(numericValue) && numericValue === value;
  }, [customPercentage, value]);

  useEffect(() => {
    if (prevTickSpacing !== tickSpacing && value) {
      resetRange();
    }
  }, [tickSpacing, value, onChange, resetRange, prevTickSpacing]);

  // Update custom percentage when value changes from external source
  // useEffect(() => {
  //   // Don't update the input if the user is actively typing
  //   if (isUserTyping) return;

  //   if (value && !config[value] && value !== 100) {
  //     setCustomPercentage(value.toString());
  //   } else if (!value || config[value] || value === 100) {
  //     setCustomPercentage("");
  //   }
  // }, [value, config, isUserTyping]);

  if (!tickSpacing) return null;

  return showCapitalEfficiencyWarning ? (
    <CapitalEfficiencyWarning
      setShowCapitalEfficiencyWarning={setShowCapitalEfficiencyWarning}
      setFullRange={setFullRange}
    />
  ) : (
    <>
      <ButtonsContainer {...props}>
        {Object.entries(config)
          ?.sort(([a], [b]) => +a - +b)
          .map(([quickAction, zoomLevel]) => (
            <StyledButton
              key={quickAction}
              onClick={() => handleClick(+quickAction, zoomLevel)}
              $isActive={+quickAction === value}
              width="100%"
              py="14px"
            >
              {quickAction}%
            </StyledButton>
          ))}

        <StyledButton
          width="100%"
          minWidth="max-content"
          onClick={() => {
            if (value === 100) {
              handleClick(100, getZoomLevelConfigs(tickSpacing));
              return;
            }
            setShowCapitalEfficiencyWarning(true);
          }}
          $isActive={value === 100}
          py="14px"
        >
          {t("Full Range")}
        </StyledButton>

        {/* Custom Percentage Input */}
        {!isSmallScreen && (
          <CustomInputContainer width="100%">
            <StyledInput
              value={customPercentage}
              onChange={handleCustomPercentageChange}
              onFocus={handleCustomInputFocus}
              onBlur={handleCustomInputBlur}
              placeholder={t("Custom")}
              $isValid={isCustomPercentageValid}
              $isActive={isCustomInputActive || isCustomInputFocused}
              type="number"
              min="0"
              max="100"
              step="0.01"
            />
            <PercentageLabel>
              <VerticalLine />%
            </PercentageLabel>
          </CustomInputContainer>
        )}
      </ButtonsContainer>
      {isSmallScreen && (
        <RowBetween mt="8px" alignItems="center">
          <Text>{t("Custom")}</Text>
          <CustomInputContainer width="30%" $small>
            <StyledInput
              value={customPercentage}
              onChange={handleCustomPercentageChange}
              onFocus={handleCustomInputFocus}
              onBlur={handleCustomInputBlur}
              placeholder="2.5"
              $isValid={isCustomPercentageValid}
              $isActive={isCustomInputActive || isCustomInputFocused}
              type="number"
              min="0"
              max="100"
              step="0.01"
            />
            <PercentageLabel>
              <VerticalLine />%
            </PercentageLabel>
          </CustomInputContainer>
        </RowBetween>
      )}
    </>
  );
};
