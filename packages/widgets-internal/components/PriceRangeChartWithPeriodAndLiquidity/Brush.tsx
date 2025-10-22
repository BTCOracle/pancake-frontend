import { usePreviousValue, useTheme } from "@pancakeswap/hooks";
import { BrushBehavior, brushY, D3BrushEvent, ScaleLinear, select } from "d3";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { styled } from "styled-components";
import { useMatchBreakpoints } from "@pancakeswap/uikit";

import {
  brushHandleAccentPath,
  brushHandleAccentPathMobile,
  brushHandlePath,
  brushHandlePathMobile,
  OffScreenHandle,
} from "./svg";
import { ToolTip } from "./ToolTip";
import { BrushDomainType } from "./types";

const Handle = styled.path<{ color: string; id: string }>`
  cursor: ew-resize;
  pointer-events: none;

  stroke-width: 1;
  stroke: transparent;
  fill: ${({ color }) => color};

  z-index: 1;
`;

const HandleAccent = styled.path`
  cursor: ew-resize;
  pointer-events: none;

  stroke-width: 0.5;
  stroke: ${({ theme }) => theme.colors.background};
  opacity: ${({ theme }) => theme.colors.background};

  z-index: 1;
`;

// flips the handles draggers when close to the container edges
const FLIP_HANDLE_THRESHOLD_PX = 15;

// margin to prevent tick snapping from putting the brush off screen
const BRUSH_EXTENT_MARGIN_PX = 2;

/**
 * Returns true if every element in `a` maps to the
 * same pixel coordinate as elements in `b`
 */
const compare = (a: BrushDomainType, b: BrushDomainType, xScale: ScaleLinear<number, number>): boolean => {
  // normalize pixels to 1 decimals
  const aNorm = [xScale(a.min).toFixed(1), xScale(a.max).toFixed(1)];
  const bNorm = [xScale(b.min).toFixed(1), xScale(b.max).toFixed(1)];
  return aNorm.every((v, i) => v === bNorm[i]);
};

export const Brush = ({
  id,
  scale,
  interactive,
  brushLabelValue,
  brushExtent,
  setBrushExtent,
  setLocalBrushExtent: setLocalBrushExtentPropCallback,
  innerWidth,
  innerHeight,
  minHandleColor,
  maxHandleColor,
  width,
  current,
}: {
  id: string;
  scale: ScaleLinear<number, number>;
  interactive: boolean;
  brushLabelValue: (d: "n" | "s", x: number) => string;
  brushExtent: BrushDomainType;
  setBrushExtent: (extent: BrushDomainType, mode: string | undefined) => void;
  setLocalBrushExtent: (extent: BrushDomainType | null) => void;
  innerWidth: number;
  width: number;
  innerHeight: number;
  minHandleColor: string;
  maxHandleColor: string;
  current: number;
}) => {
  const { theme } = useTheme();
  const { isMobile } = useMatchBreakpoints();

  const brushRef = useRef<SVGGElement | null>(null);
  const brushBehavior = useRef<BrushBehavior<SVGGElement> | null>(null);
  // only used to drag the handles on brush for performance
  const [localBrushExtent, setLocalBrushExtent] = useState<BrushDomainType | null>(brushExtent);
  const [showLabels, setShowLabels] = useState(false);
  const [hovering, setHovering] = useState(false);

  const previousBrushExtent = usePreviousValue(brushExtent);

  useEffect(() => {
    setLocalBrushExtentPropCallback?.(localBrushExtent);
  }, [localBrushExtent, setLocalBrushExtentPropCallback]);

  const brushed = useCallback(
    (event: D3BrushEvent<unknown>) => {
      const { type, selection, mode } = event;

      if (!selection) {
        setLocalBrushExtent(null);
        return;
      }

      const [min, max] = (selection as [number, number]).map(scale.invert).sort((a, b) => a - b) as [number, number];
      const scaled = { min, max };

      // avoid infinite render loop by checking for change
      if (type === "end" && !compare(brushExtent, scaled, scale)) {
        setBrushExtent(scaled, mode);
      }

      setLocalBrushExtent(scaled);
    },
    [scale, brushExtent, setBrushExtent]
  );

  // keep local and external brush extent in sync
  // i.e. snap to ticks on bruhs end
  useEffect(() => {
    setLocalBrushExtent(brushExtent);
  }, [brushExtent]);

  // initialize the brush
  useEffect(() => {
    if (!brushRef.current) return;

    brushBehavior.current = brushY<SVGGElement>()
      .extent([
        [0 + BRUSH_EXTENT_MARGIN_PX, 0],
        [innerWidth - BRUSH_EXTENT_MARGIN_PX, innerHeight],
      ])
      .handleSize(30)
      .filter(() => interactive)
      .on("brush end", brushed);

    brushBehavior.current(select(brushRef.current));

    if (previousBrushExtent && compare(brushExtent, previousBrushExtent, scale)) {
      select(brushRef.current)
        .transition()
        .call(brushBehavior.current.move as any, [brushExtent.max, brushExtent.min].map(scale));
    }

    // brush linear gradient
    select(brushRef.current)
      .selectAll(".selection")
      .attr("stroke", "none")
      .attr("fill-opacity", "0.05")
      .attr("fill", `url(#${id}-gradient-selection)`);
  }, [brushExtent, brushed, id, innerHeight, innerWidth, interactive, previousBrushExtent, scale, isMobile]);

  // respond to xScale changes only
  useEffect(() => {
    if (!brushRef.current || !brushBehavior.current) return;

    brushBehavior.current.move(select(brushRef.current) as any, [brushExtent.max, brushExtent.min].map(scale) as any);
  }, [brushExtent, scale]);

  // show labels when local brush changes
  useEffect(() => {
    setShowLabels(true);
    const timeout = setTimeout(() => setShowLabels(false), 1500);
    return () => clearTimeout(timeout);
  }, [localBrushExtent]);

  // variables to help render the SVGs
  const flipMinHandle = localBrushExtent && scale(localBrushExtent.min) < innerHeight - FLIP_HANDLE_THRESHOLD_PX;
  const flipMaxHandle = localBrushExtent && scale(localBrushExtent.max) < FLIP_HANDLE_THRESHOLD_PX;

  const minHandleInView =
    localBrushExtent && scale(localBrushExtent.min) >= 0 && scale(localBrushExtent.min) <= innerHeight;
  const maxHandleInView =
    localBrushExtent && scale(localBrushExtent.max) >= 0 && scale(localBrushExtent.max) <= innerHeight;

  const showMinArrow = !minHandleInView;
  const showMaxArrow = !maxHandleInView;

  const [max, min] = useMemo(
    () => [(localBrushExtent ?? brushExtent).max, (localBrushExtent ?? brushExtent).min],
    [localBrushExtent, brushExtent]
  );

  const gradientMiddle = useMemo(() => {
    return `${(Math.abs(min - current) / Math.abs(max - min)) * 100}%`;
  }, [max, min, current]);

  const toolTipNRef = useRef<SVGTextElement>(null);
  const toolTipSRef = useRef<SVGTextElement>(null);

  const toolTipNWidth = toolTipNRef.current?.getBBox().width;
  const toolTipSWidth = toolTipSRef.current?.getBBox().width;
  const toolTipWidth = useMemo(
    () => (toolTipNWidth && toolTipSWidth ? Math.max(toolTipNWidth, toolTipSWidth) : undefined),
    [toolTipNWidth, toolTipSWidth]
  );

  return useMemo(
    () => (
      <>
        <defs>
          <linearGradient id={`${id}-gradient-selection`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={minHandleColor} stopOpacity={1} />
            <stop offset={gradientMiddle} stopColor={minHandleColor} stopOpacity={0.1} />
            <stop offset={gradientMiddle} stopColor={maxHandleColor} stopOpacity={0.1} />
            <stop offset="100%" stopColor={maxHandleColor} stopOpacity={1} />
          </linearGradient>

          {/* clips at exactly the svg area */}
          <clipPath id={`${id}-brush-clip`}>
            <rect x="0" y="0" width={innerWidth} height={innerHeight} />
          </clipPath>

          <linearGradient id={`${id}-gradient-handle`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: theme.colors.secondary, stopOpacity: 1 }} />
            <stop offset="68%" style={{ stopColor: theme.colors.secondary, stopOpacity: 1 }} />
            <stop offset="71.8%" style={{ stopColor: theme.colors.secondary, stopOpacity: 1 }} />
            <stop offset="81.7%" style={{ stopColor: theme.colors.secondary, stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* will host the d3 brush */}
        <g
          ref={brushRef}
          clipPath={`url(#${id}-brush-clip)`}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        />
        {/* Top dashed line */}
        <line x1="0" y1={scale(max)} x2={innerWidth} y2={scale(max)} stroke={maxHandleColor} strokeWidth="1" />
        {/* bottom dashed line */}
        <line x1="0" y1={scale(min)} x2={innerWidth} y2={scale(min)} stroke={minHandleColor} strokeWidth="1" />

        {localBrushExtent && (
          <>
            {maxHandleInView ? (
              <g
                transform={`translate(${innerWidth - width}, ${scale(localBrushExtent.max)}), scale(1, ${
                  flipMaxHandle ? "1" : "-1"
                })`}
              >
                <g>
                  <Handle
                    color={theme.colors.secondary}
                    d={isMobile ? brushHandlePathMobile(width) : brushHandlePath(width)}
                    id={`${id}-gradient-handle`}
                  />
                  <HandleAccent d={isMobile ? brushHandleAccentPathMobile() : brushHandleAccentPath()} />
                </g>
                <ToolTip
                  width={toolTipWidth}
                  textRef={toolTipNRef}
                  flip={!flipMaxHandle}
                  text={brushLabelValue("n", localBrushExtent.max)}
                  visible={showLabels || hovering}
                  isMobile={isMobile}
                />
              </g>
            ) : null}

            {minHandleInView ? (
              <g
                transform={`translate(${innerWidth - width}, ${Math.max(0, scale(localBrushExtent.min))}), scale(1, ${
                  flipMinHandle ? "1" : "-1"
                })`}
              >
                <g>
                  <Handle
                    color={theme.colors.secondary}
                    d={isMobile ? brushHandlePathMobile(width) : brushHandlePath(width)}
                    id={`${id}-gradient-handle`}
                  />
                  <HandleAccent d={isMobile ? brushHandleAccentPathMobile() : brushHandleAccentPath()} />
                </g>

                <ToolTip
                  width={toolTipWidth}
                  textRef={toolTipSRef}
                  flip={!flipMinHandle}
                  text={brushLabelValue("s", localBrushExtent.min)}
                  visible={showLabels || hovering}
                  isMobile={isMobile}
                />
              </g>
            ) : null}

            {showMinArrow && (
              <g transform={`translate(${innerWidth - width}, ${innerHeight - 20})`}>
                <OffScreenHandle color={theme.colors.secondary} size={8} />
              </g>
            )}

            {showMaxArrow && (
              <g transform={`translate(${innerWidth - width}, ${20}) scale(1, -1)`}>
                <OffScreenHandle color={theme.colors.secondary} size={8} />
              </g>
            )}
          </>
        )}
      </>
    ),
    [
      toolTipWidth,
      max,
      min,
      gradientMiddle,
      brushLabelValue,
      maxHandleColor,
      maxHandleInView,
      flipMaxHandle,
      flipMinHandle,
      hovering,
      id,
      theme,
      innerHeight,
      innerWidth,
      localBrushExtent,
      showMaxArrow,
      showLabels,
      showMinArrow,
      minHandleColor,
      minHandleInView,
      scale,
      width,
      isMobile,
    ]
  );
};
