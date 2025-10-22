import { ScaleLinear } from "d3";
import { useMemo } from "react";
import { styled } from "styled-components";

const StyledLine = styled.line`
  opacity: ${({ opacity }) => opacity ?? 0.5};
  stroke-width: ${({ strokeWidth }) => strokeWidth ?? 2};
  stroke: ${({ theme, stroke }) => stroke ?? theme.colors.primary};
  fill: none;
  stroke-dasharray: 2;
`;

export const VerticalLine = ({
  value,
  xScale,
  innerHeight,
}: {
  value: number;
  xScale: ScaleLinear<number, number>;
  innerHeight: number;
}) =>
  useMemo(
    () => <StyledLine x1={xScale(value)} y1="0" x2={xScale(value)} y2={innerHeight} />,
    [value, xScale, innerHeight]
  );

export const HorizontalLine = ({
  value,
  yScale,
  color,
  strokeWidth,
  x1,
  x2,
}: {
  value: number;
  yScale: ScaleLinear<number, number>;
  x1: number;
  x2: number;
  color?: string;
  strokeWidth?: number;
}) =>
  useMemo(
    () => <StyledLine stroke={color} strokeWidth={strokeWidth} y1={yScale(value)} x1={x1} y2={yScale(value)} x2={x2} />,
    [value, yScale, x1, x2, color, strokeWidth]
  );
