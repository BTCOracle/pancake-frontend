import { BinLiquidityShape } from "@pancakeswap/infinity-sdk";
import {
  BidAskGraphIcon,
  ButtonMenu,
  ButtonMenuItem,
  CurveGraphIcon,
  FlexGap,
  FlexGapProps,
  SpotGraphIcon,
} from "@pancakeswap/uikit";
import { useCallback, useMemo } from "react";
import { styled } from "styled-components";

const StyledButtonMenuItem = styled(ButtonMenuItem)`
  height: 60px;
  font-size: 16px;
  line-height: 24px;
  display: flex;
  flex-direction: column;
`;

const PRESET_RANGE_ITEMS = [
  {
    label: "Spot",
    value: BinLiquidityShape.Spot,
    icon: SpotGraphIcon,
  },
  {
    label: "Curve",
    value: BinLiquidityShape.Curve,
    icon: CurveGraphIcon,
  },
  {
    label: "Bid-Ask",
    value: BinLiquidityShape.BidAsk,
    icon: BidAskGraphIcon,
  },
];

interface LiquidityShapePickerProps extends Omit<FlexGapProps, "onChange"> {
  value: keyof typeof BinLiquidityShape;
  onChange: (shape: BinLiquidityShape) => void;
}
export const LiquidityShapePicker = ({ value, onChange, ...props }: LiquidityShapePickerProps) => {
  const activeIndex = useMemo(() => PRESET_RANGE_ITEMS.findIndex((item) => item.value === value) ?? 0, [value]);

  const handleItemClick = useCallback(
    (i: number) => {
      onChange(PRESET_RANGE_ITEMS[i].value);
    },
    [onChange]
  );

  return (
    <FlexGap gap="12px" justifyContent="center" alignItems="center" {...props}>
      <ButtonMenu
        variant="subtle"
        activeIndex={activeIndex}
        onItemClick={handleItemClick}
        fullWidth
        style={{ whiteSpace: "nowrap" }}
      >
        {PRESET_RANGE_ITEMS.map((item, itemIndex) => (
          <StyledButtonMenuItem key={item.value}>
            <item.icon color={activeIndex === itemIndex ? "card" : "textSubtle"} />
            {item.label}
          </StyledButtonMenuItem>
        ))}
      </ButtonMenu>
    </FlexGap>
  );
};
