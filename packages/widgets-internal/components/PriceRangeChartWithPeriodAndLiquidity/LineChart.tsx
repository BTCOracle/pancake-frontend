import { useMemo } from "react";
import { ScaleLinear, ScaleTime, curveMonotoneX, line } from "d3";
import { useTheme } from "@pancakeswap/hooks";
import { useTranslation } from "@pancakeswap/localization";
import { PriceChartEntry } from "./types";
import { Path } from "./Path";

export const LineChart = ({
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
  const lineGenerator = useMemo(
    () =>
      line()
        .curve(curveMonotoneX)
        .x((d) => xScale(xValue(d as unknown as PriceChartEntry)))
        .y((d) => yScale(yValue(d as unknown as PriceChartEntry))),
    [xScale, xValue, yScale, yValue]
  );
  // Get the last point coordinates
  const [lastX, lastY] = useMemo(() => {
    const lastPoint = series[series.length - 1];
    return [xScale(xValue(lastPoint)), yScale(yValue(lastPoint))];
  }, [series, xScale, xValue, yScale, yValue]);

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
    <>
      <Path d={lineGenerator(series as Iterable<[number, number]>) ?? undefined} stroke={color} fill="none" />
      <circle cx={lastX} cy={lastY} r="1.5" fill={color} />
    </>
  );
};
