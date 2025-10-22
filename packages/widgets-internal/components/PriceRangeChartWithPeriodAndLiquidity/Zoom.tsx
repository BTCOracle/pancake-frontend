import { AutoRenewIcon, Box, useMatchBreakpoints, ZoomInIcon, ZoomOutIcon } from "@pancakeswap/uikit";
import { ScaleLinear, select, zoom, ZoomBehavior, zoomIdentity, ZoomTransform } from "d3";
import { useEffect, useMemo, useRef } from "react";
import { styled } from "styled-components";
import type { ZoomLevels } from "../../liquidity/infinity/constants";

const Wrapper = styled.div<{ $count: number; $isMobile?: boolean }>`
  display: grid;
  grid-template-columns: repeat(${({ $count }) => $count.toString()}, 1fr);
  grid-gap: 6px;

  position: absolute;
  top: ${({ $isMobile }) => ($isMobile ? `-5px` : `-26px`)};
  right: ${({ $isMobile }) => ($isMobile ? `auto` : `0`)};
  left: ${({ $isMobile }) => ($isMobile ? `0` : `auto`)};
`;

export const ZoomOverlay = styled.rect`
  fill: transparent;
  cursor: grab;

  z-index: 3;

  &:active {
    cursor: grabbing;
  }
`;

export default function Zoom({
  svg,
  xScale,
  setZoom,
  width,
  height,
  resetBrush,
  showResetButton,
  zoomLevels,
}: {
  svg: SVGElement | null;
  xScale: ScaleLinear<number, number>;
  setZoom: (transform: ZoomTransform) => void;
  width: number;
  height: number;
  resetBrush: () => void;
  showResetButton: boolean;
  zoomLevels: ZoomLevels;
}) {
  const zoomBehavior = useRef<ZoomBehavior<Element, unknown>>();
  const { isMobile } = useMatchBreakpoints();

  const [zoomIn, zoomOut, _zoomInitial, zoomReset] = useMemo(
    () => [
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .transition()
          .call(zoomBehavior.current.scaleBy, 2),
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .transition()
          .call(zoomBehavior.current.scaleBy, 0.5),
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .transition()
          .call(zoomBehavior.current.scaleTo, 0.5),
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .call(zoomBehavior.current.transform, zoomIdentity.translate(0, 0).scale(1))
          .transition()
          .call(zoomBehavior.current.scaleTo, 0.5),
    ],
    [svg]
  );

  useEffect(() => {
    zoomBehavior.current = zoom()
      .scaleExtent([zoomLevels.min, zoomLevels.max])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", ({ transform }: { transform: ZoomTransform }) => setZoom(transform));

    if (svg) {
      select(svg as Element).call(zoomBehavior.current);
    }
  }, [height, width, setZoom, svg, xScale, zoomBehavior, zoomLevels, zoomLevels.max, zoomLevels.min]);

  return (
    <Wrapper $count={showResetButton ? 3 : 2} $isMobile={isMobile}>
      {showResetButton && (
        <Box
          style={{
            cursor: "pointer",
            textAlign: "center",
            paddingTop: "2px",
            paddingLeft: "4px",
          }}
        >
          <AutoRenewIcon
            color="primary"
            width={20}
            onClick={() => {
              resetBrush();
              zoomReset();
            }}
          />
        </Box>
      )}
      <Box
        style={{
          cursor: "pointer",
        }}
      >
        <ZoomInIcon width={24} onClick={zoomIn} color="primary60" />
      </Box>
      <Box
        style={{
          cursor: "pointer",
        }}
      >
        <ZoomOutIcon width={24} onClick={zoomOut} color="primary60" />
      </Box>
    </Wrapper>
  );
}
