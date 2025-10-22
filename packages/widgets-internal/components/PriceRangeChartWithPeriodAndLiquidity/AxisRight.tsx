import { useTheme } from "@pancakeswap/hooks";
import { useMatchBreakpoints } from "@pancakeswap/uikit";
import { axisLeft, Axis as d3Axis, NumberValue, ScaleLinear, select } from "d3";
import { useCallback } from "react";
import { styled } from "styled-components";

const StyledGroup = styled.g<{ $isMobile: boolean }>`
  z-index: 2;

  line {
    display: none;
  }

  text {
    font-size: ${({ $isMobile }) => ($isMobile ? "14px" : "8px")};
    color: ${({ theme }) => theme.colors.textSubtle};
  }
`;

const Axis = ({
  axisGenerator,
  highlightValue,
  selectedMin,
  selectedMax,
  yScale,
}: {
  axisGenerator: d3Axis<NumberValue>;
  highlightValue?: number;
  selectedMin?: number;
  selectedMax?: number;
  yScale: ScaleLinear<number, number>;
}) => {
  const { theme } = useTheme();

  const min = yScale.domain()[0];
  const max = yScale.domain()[1];

  const axisRef = (axis: SVGGElement) => {
    if (!axis) return;
    const axisGroup = select(axis);

    axisGroup.call(axisGenerator).call((g) => g.select(".domain").remove());

    const isValueNearEdge = (value: number) => {
      return value < min + (max - min) * 0.05 || value > max - (max - min) * 0.05;
    };

    // Highlight current value if provided
    if (highlightValue !== undefined) {
      axisGroup.selectAll(".tick rect").remove();
      axisGroup
        .selectAll(".tick")
        .filter((d) => d === highlightValue)
        .select("text")
        .style("fill", theme.colors.v2Default)
        .attr("transform", "translate(-2, 0)")
        .each(function iter() {
          const bbox = (this as SVGTextElement).getBBox();
          select((this as SVGTextElement).parentElement)
            .insert("rect", "text")
            .attr("x", bbox.x - 4)
            .attr("y", isValueNearEdge(highlightValue) ? bbox.y - 4 : bbox.y)
            .attr("width", bbox.width + 4)
            .attr("height", bbox.height)
            .attr("rx", 4)
            .attr("fill", theme.colors.primary);
        });

      // Highlight selectedMax if provided
      if (selectedMax !== undefined) {
        axisGroup
          .selectAll(".tick")
          .filter((d) => d === selectedMax)
          .select("text")
          .style("fill", theme.colors.v2Default)
          .style("z-index", 10)
          .attr("transform", isValueNearEdge(selectedMax) ? "translate(-2, 8)" : "translate(-2, 0)")
          .each(function iter() {
            const bbox = (this as SVGTextElement).getBBox();
            select((this as SVGTextElement).parentElement)
              .insert("rect", "text")
              .attr("x", bbox.x - 4)
              .attr("y", isValueNearEdge(selectedMax) ? bbox.y + 8 : bbox.y)
              .attr("width", bbox.width + 4)
              .attr("height", bbox.height)
              .attr("rx", 4)
              .attr("fill", theme.colors.secondary);
          });
      }

      // Highlight selectedMin if provided
      if (selectedMin !== undefined) {
        axisGroup
          .selectAll(".tick")
          .filter((d) => d === selectedMin)
          .select("text")
          .style("fill", theme.colors.v2Default)
          .style("z-index", 10)
          .attr("transform", isValueNearEdge(selectedMin) ? "translate(-2, -8)" : "translate(-2, 0)")
          .each(function iter() {
            const bbox = (this as SVGTextElement).getBBox();
            select((this as SVGTextElement).parentElement)
              .insert("rect", "text")
              .attr("x", bbox.x - 4)
              .attr("y", isValueNearEdge(selectedMin) ? bbox.y - 8 : bbox.y)
              .attr("width", bbox.width + 4)
              .attr("height", bbox.height)
              .attr("rx", 4)
              .attr("fill", theme.colors.secondary);
          });
      }
    }
  };

  return <g ref={axisRef} />;
};

export const AxisRight = ({
  yScale,
  innerWidth,
  offset = 0,
  ticks = 6,
  highlightValue,
  selectedMin,
  selectedMax,
  onAxisMount,
}: {
  highlightValue?: number;
  selectedMin?: number;
  selectedMax?: number;
  yScale: ScaleLinear<number, number>;
  innerWidth: number;
  offset?: number;
  ticks?: number;
  onAxisMount?: (element: SVGGElement | null) => void;
}) => {
  const defaultTicks = yScale.ticks(ticks);
  const { isMobile } = useMatchBreakpoints();

  // If current is defined, replace the closest tick with current
  let finalTicks = defaultTicks;

  if (highlightValue !== undefined) {
    const closestTick = finalTicks.reduce((prev, curr) =>
      Math.abs(curr - highlightValue) < Math.abs(prev - highlightValue) ? curr : prev
    );
    finalTicks = finalTicks.map((tick) => (tick === closestTick ? highlightValue : tick));
  }

  // If selectedMin is defined, replace the closest tick with selectedMin
  if (selectedMin !== undefined) {
    const closestTick = finalTicks.reduce((prev, curr) =>
      Math.abs(curr - selectedMin) < Math.abs(prev - selectedMin) ? curr : prev
    );
    finalTicks = finalTicks.map((tick) => (tick === closestTick ? selectedMin : tick));
  }

  // If selectedMax is defined, replace the closest tick with selectedMax
  if (selectedMax !== undefined) {
    const closestTick = finalTicks.reduce((prev, curr) =>
      Math.abs(curr - selectedMax) < Math.abs(prev - selectedMax) ? curr : prev
    );
    finalTicks = finalTicks.map((tick) => (tick === closestTick ? selectedMax : tick));
  }

  return (
    <StyledGroup
      id="price-range-chart-axis-right"
      $isMobile={isMobile}
      transform={`translate(${innerWidth + offset})`}
      ref={onAxisMount}
    >
      <Axis
        axisGenerator={axisLeft(yScale).tickValues(finalTicks).tickSize(0)}
        highlightValue={highlightValue}
        selectedMin={selectedMin}
        selectedMax={selectedMax}
        yScale={yScale}
      />
    </StyledGroup>
  );
};
