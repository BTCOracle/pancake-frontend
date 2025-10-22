import { useTranslation } from "@pancakeswap/localization";
import { Currency, Price, isUnifiedCurrencySorted } from "@pancakeswap/swap-sdk-core";
import { AutoColumn, BunnyKnownPlaceholder, ChartDisableIcon, LineGraphIcon } from "@pancakeswap/uikit";
import * as Sentry from "@sentry/nextjs";
import { format } from "d3";
import { useCallback, useMemo } from "react";
import { styled, useTheme } from "styled-components";
import { TICK_SPACING_LEVEL, ZOOM_LEVELS, ZoomLevels } from "../../liquidity/infinity/constants";

import { Chart } from "./Chart";
import { InfoBox } from "./InfoBox";
import Loader from "./Loader";
import { Bound, BrushDomainType, ChartProps, LiquidityChartEntry, PriceChartEntry, TickDataRaw } from "./types";

const ChartWrapper = styled.div`
  position: relative;
  justify-content: center;
  align-content: center;
  margin-top: 26px;
`;
export interface PricePeriodRangeChartProps {
  tickCurrent?: number;
  liquidity?: bigint;
  isLoading?: boolean;
  error?: Error;
  baseCurrency?: Currency | null;
  quoteCurrency?: Currency | null;
  ticks?: TickDataRaw[];
  ticksAtLimit?: { [bound in Bound]?: boolean };
  price?: number;
  priceLower?: Price<Currency, Currency> | string;
  priceUpper?: Price<Currency, Currency> | string;
  onMinPriceInput?: (typedValue: string) => void;
  onMaxPriceInput?: (typedValue: string) => void;
  onBothRangeInput?: (leftTypedValue: string, rightTypedValue: string) => void;
  interactive?: boolean;
  zoomLevel?: ZoomLevels;
  formattedData: LiquidityChartEntry[] | undefined;
  priceHistoryData?: PriceChartEntry[];
  axisTicks?: ChartProps["axisTicks"];
  showGridLines?: boolean;
}

export function PricePeriodRangeChart({
  baseCurrency,
  quoteCurrency,
  ticksAtLimit = {},
  price,
  priceLower,
  priceUpper,
  onBothRangeInput,
  onMinPriceInput,
  onMaxPriceInput,
  interactive = true,
  isLoading,
  error,
  zoomLevel,
  formattedData,
  priceHistoryData,
  axisTicks,
  showGridLines = true,
}: PricePeriodRangeChartProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const isSorted = useMemo(
    () => baseCurrency && quoteCurrency && isUnifiedCurrencySorted(baseCurrency, quoteCurrency),
    [baseCurrency, quoteCurrency]
  );

  const brushDomain: BrushDomainType | undefined = useMemo(() => {
    let minPrice = priceLower as string;
    let maxPrice = priceUpper as string;

    if (priceLower instanceof Price && priceUpper instanceof Price) {
      minPrice = (isSorted ? priceLower : priceUpper?.invert()).toSignificant(18);
      maxPrice = (isSorted ? priceUpper : priceLower?.invert()).toSignificant(18);
    }

    return minPrice && maxPrice ? { max: parseFloat(maxPrice), min: parseFloat(minPrice) } : undefined;
  }, [isSorted, priceLower, priceUpper]);

  const onBrushDomainChangeEnded = useCallback(
    (domain: BrushDomainType, mode: string | undefined) => {
      // This prevents double inversion in V3's Add Liquidity when currencies change due to route updates,
      // while still allowing to set the initial domain on load
      if (mode === undefined && brushDomain) {
        return;
      }

      const { min, max } = brushDomain || {};
      const newMinPrice = domain.min <= 0 ? 1 / 10 ** 6 : domain.min;
      const newMaxPrice = domain.max;

      const updateMin =
        (!ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER] || mode === "handle" || mode === "reset") &&
        newMinPrice > 0 &&
        newMinPrice !== min;

      const updateMax =
        (!ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER] || mode === "reset") &&
        newMaxPrice > 0 &&
        newMaxPrice < 1e35 &&
        newMaxPrice !== max;

      if (updateMin && updateMax) {
        const parsedMinRangeValue = parseFloat(newMinPrice.toFixed(18));
        const parsedMaxRangeValue = parseFloat(newMaxPrice.toFixed(18));
        if (parsedMinRangeValue > 0 && parsedMaxRangeValue > 0 && parsedMinRangeValue < parsedMaxRangeValue) {
          onBothRangeInput?.(newMinPrice.toFixed(18), newMaxPrice.toFixed(18));
        }
      } else if (updateMin) {
        onMinPriceInput?.(newMinPrice.toFixed(18));
      } else if (updateMax) {
        onMaxPriceInput?.(newMaxPrice.toFixed(18));
      }
    },
    [isSorted, onBothRangeInput, onMinPriceInput, onMaxPriceInput, ticksAtLimit, brushDomain]
  );

  const brushLabelValue = useCallback(
    (d: "n" | "s", x: number) => {
      if (!price) return "";

      if (d === "s" && ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]) return "0";
      if (d === "n" && ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]) return "∞";

      const percent = (x < price ? -1 : 1) * ((Math.max(x, price) - Math.min(x, price)) / price) * 100;

      return price ? `${format(Math.abs(percent) > 1 ? ".2~s" : ".2~f")(percent)}%` : "";
    },
    [isSorted, price, ticksAtLimit]
  );

  if (error) {
    Sentry.captureMessage(error.toString(), "log");
  }

  const isUninitialized =
    !baseCurrency || !quoteCurrency || (formattedData === undefined && !isLoading) || !priceHistoryData;

  return (
    <AutoColumn gap="md" style={{ minHeight: "200px", width: "100%", marginBottom: "16px" }}>
      {isUninitialized ? (
        <InfoBox message={t("Your position will appear here.")} icon={<BunnyKnownPlaceholder />} />
      ) : isLoading ? (
        <InfoBox icon={<Loader size="40px" stroke={theme.colors.text} />} />
      ) : error ? (
        <InfoBox message={t("Liquidity data not available.")} icon={<ChartDisableIcon width="40px" />} />
      ) : !formattedData || formattedData.length === 0 || !price ? (
        <InfoBox message={t("There is no liquidity data.")} icon={<LineGraphIcon width="40px" />} />
      ) : (
        <ChartWrapper>
          <Chart
            key={baseCurrency.wrapped.address}
            data={{ liquiditySeries: formattedData, current: price, priceHistory: priceHistoryData }}
            dimensions={{ width: 400, height: 200 }}
            margins={{
              top: 10,
              right: 4,
              bottom: 20,
              left: 0,
            }}
            styles={{
              area: {
                selection: theme.colors.text,
              },
            }}
            interactive={interactive && Boolean(formattedData?.length)}
            brushLabels={brushLabelValue}
            brushDomain={brushDomain}
            onBrushDomainChange={onBrushDomainChangeEnded}
            zoomLevels={zoomLevel ?? ZOOM_LEVELS[TICK_SPACING_LEVEL.MEDIUM]}
            ticksAtLimit={ticksAtLimit}
            axisTicks={axisTicks}
            showGridLines={showGridLines}
          />
        </ChartWrapper>
      )}
    </AutoColumn>
  );
}
