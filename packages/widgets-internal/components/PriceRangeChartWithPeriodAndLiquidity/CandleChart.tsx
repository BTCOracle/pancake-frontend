import { useMemo } from "react";
import { ScaleLinear, ScaleTime } from "d3";
import { useTheme } from "@pancakeswap/hooks";
import { useTranslation } from "@pancakeswap/localization";
import { PriceChartEntry } from "./types";

export const CandleChart = ({
  series,
  xScale,
  yScale,
  xValue,
  yValue,
  color,
}: {
  series: PriceChartEntry[];
  xScale: ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
  xValue: (d: PriceChartEntry) => Date;
  yValue: (d: PriceChartEntry) => number;
  color: string;
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Calculate bandwidth for candlestick width
  const candleWidth = useMemo(() => {
    if (series.length < 2) return 10;
    const firstX = xScale(xValue(series[0]));
    const secondX = xScale(xValue(series[1]));
    return Math.abs(secondX - firstX) * 0.3; // 30% of available space
  }, [series, xScale, xValue]);

  // Colors for bullish and bearish candles
  const bullishColor = theme.colors.success || "#00d4aa";
  const bearishColor = theme.colors.failure || "#ed4b9e";

  if (series.every((i) => i.close <= 0)) {
    return (
      <text
        transform="scale(1)"
        x={0}
        y="50%"
        dominantBaseline="middle"
        fill={theme.colors.textSubtle}
        fontSize="9px"
        style={{ userSelect: "none" }}
      >
        {t("Insufficient data for historical price chart.")}
      </text>
    );
  }

  return (
    <g>
      {series.map((entry, index) => {
        const x = xScale(xValue(entry));
        const yHigh = yScale(entry.high);
        const yLow = yScale(entry.low);
        const yOpen = yScale(entry.open);
        const yClose = yScale(entry.close);

        const isBullish = entry.close > entry.open;
        const candleColor = isBullish ? bullishColor : bearishColor;

        return (
          <g key={index} transform={`translate(${x}, 0)`}>
            {/* High-Low line (wick) */}
            <line x1={0} y1={yLow} x2={0} y2={yHigh} stroke={candleColor} strokeWidth={1} strokeLinecap="round" />

            {/* Open-Close body */}
            <line
              x1={0}
              y1={yOpen}
              x2={0}
              y2={yClose}
              stroke={candleColor}
              strokeWidth={candleWidth}
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
};
