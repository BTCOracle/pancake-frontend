import { useMatchBreakpoints } from "@pancakeswap/uikit";
import { Axis as d3Axis, axisBottom, NumberValue, select, ScaleTime, AxisTimeInterval } from "d3";
import { useMemo } from "react";
import { styled } from "styled-components";

const StyledGroup = styled.g<{ $isMobile: boolean }>`
  text {
    font-size: ${({ $isMobile }) => ($isMobile ? "14px" : "8px")};
    color: ${({ theme }) => theme.colors.textSubtle};
    transform: translateY(5px);
  }
`;

const Axis = ({ axisGenerator }: { axisGenerator: d3Axis<NumberValue> }) => {
  const axisRef = (axis: SVGGElement) => {
    // eslint-disable-next-line no-unused-expressions
    axis &&
      select(axis)
        .call(axisGenerator)
        .call((g) => g.select(".domain").remove())
        .selectAll("text")
        .each(function breakText() {
          const text = select(this);
          const words = text.text().split("\n");
          text.text("");
          words.forEach((word, i) => {
            text
              .append("tspan")
              .text(word)
              .attr("x", 0)
              .attr("dy", i === 0 ? 0 : "1.2em");
          });
        });
  };

  return <g ref={axisRef} />;
};

export type TicksType = number | AxisTimeInterval | null | undefined;
export type TickFormat = (
  domainValue: NumberValue | Date,
  index: number,
  ticksValue: Array<NumberValue | Date>
) => string;
type SimpleTickFormat = (domainValue: NumberValue | Date, index: number) => string;

interface AxisBottomProps<T> {
  xScale: T;
  innerHeight: number;
  offset?: number;
  ticks: TicksType;
  tickFormat?: TickFormat;
}

export const AxisBottom = <T extends ScaleTime<number, number>>({
  xScale,
  innerHeight,
  offset = 0,
  ticks = 6,
  tickFormat,
}: AxisBottomProps<T>) => {
  const { isMobile } = useMatchBreakpoints();
  const axisGenerator = useMemo(() => {
    const ticksValue = axisBottom(xScale).ticks(ticks).tickSize(0);
    return tickFormat ? ticksValue.tickFormat(tickFormat as SimpleTickFormat) : ticksValue;
  }, [xScale, ticks, tickFormat]);

  return (
    <StyledGroup $isMobile={isMobile} transform={`translate(0, ${innerHeight + offset + (isMobile ? 5 : 0)})`}>
      <Axis axisGenerator={axisGenerator} />
    </StyledGroup>
  );
};
