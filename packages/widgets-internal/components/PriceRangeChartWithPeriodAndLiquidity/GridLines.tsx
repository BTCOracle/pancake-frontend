import { ScaleLinear, ScaleTime, axisLeft, axisBottom, select } from "d3";
import { useTheme } from "@pancakeswap/hooks";
import { useEffect, useRef } from "react";
import { styled } from "styled-components";

interface GridLinesProps {
  priceScale: ScaleLinear<number, number>;
  periodScale: ScaleTime<number, number>;
  innerWidth: number;
  innerHeight: number;
  showHorizontal?: boolean;
  showVertical?: boolean;
  horizontalTicks?: number;
  verticalTicks?: number;
}

const StyledGridGroup = styled.g<{ $stroke: string }>`
  .grid line {
    stroke: ${({ $stroke }) => $stroke};
    stroke-width: 0.5;
    stroke-opacity: 0.3;
    shape-rendering: crispEdges;
  }

  .grid path {
    stroke-width: 0;
  }

  .grid text {
    display: none;
  }
`;

export const GridLines = ({
  priceScale,
  periodScale,
  innerWidth,
  innerHeight,
  showHorizontal = true,
  showVertical = true,
  horizontalTicks = 6,
  verticalTicks = 6,
}: GridLinesProps) => {
  const { theme } = useTheme();
  const horizontalGridRef = useRef<SVGGElement>(null);
  const verticalGridRef = useRef<SVGGElement>(null);

  const gridColor = theme.colors.cardBorder;

  useEffect(() => {
    if (showHorizontal && horizontalGridRef.current) {
      const horizontalGrid = axisLeft(priceScale)
        .ticks(horizontalTicks)
        .tickSize(-innerWidth)
        .tickFormat(() => "");

      select(horizontalGridRef.current).call(horizontalGrid);
    }

    if (showVertical && verticalGridRef.current) {
      const verticalGrid = axisBottom(periodScale)
        .ticks(verticalTicks)
        .tickSize(-innerHeight)
        .tickFormat(() => "");

      select(verticalGridRef.current).call(verticalGrid);
    }
  }, [
    priceScale,
    periodScale,
    innerWidth,
    innerHeight,
    horizontalTicks,
    verticalTicks,
    showHorizontal,
    showVertical,
    gridColor,
  ]);

  return (
    <StyledGridGroup $stroke={gridColor}>
      {showHorizontal && <g ref={horizontalGridRef} className="grid horizontal-grid" />}

      {showVertical && (
        <g ref={verticalGridRef} className="grid vertical-grid" transform={`translate(0, ${innerHeight})`} />
      )}
    </StyledGridGroup>
  );
};
