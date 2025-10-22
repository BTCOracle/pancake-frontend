import { area, curveStepAfter, ScaleLinear } from "d3";
import { useMemo } from "react";

import { LiquidityChartEntry } from "./types";
import { Path } from "./Path";

export const Area = ({
  series,
  xScale,
  yScale,
  xValue,
  yValue,
  fill,
  opacity,
}: {
  series: LiquidityChartEntry[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  xValue: (d: LiquidityChartEntry) => number;
  yValue: (d: LiquidityChartEntry) => number;
  fill?: string | undefined;
  opacity?: number;
}) => {
  const lineGenerator = useMemo(
    () =>
      area()
        .curve(curveStepAfter)
        .x1((d: unknown) => xScale(xValue(d as LiquidityChartEntry)))
        .x0(xScale(0))
        .y((d: unknown) => yScale(yValue(d as LiquidityChartEntry))),
    [xScale, xValue, yScale, yValue]
  );
  return useMemo(
    () => (
      <Path
        opacity={opacity || 1}
        fill={fill}
        stroke={fill}
        d={
          lineGenerator(
            series.filter((d) => {
              const value = yScale(yValue(d));
              return value > 0 && value <= window.innerHeight;
            }) as Iterable<[number, number]>
          ) ?? undefined
        }
      />
    ),
    [lineGenerator, fill, opacity, series, yScale, yValue]
  );
};
