import { BigintIsh } from "@pancakeswap/sdk";
import { FeeAmount } from "@pancakeswap/v3-sdk";
import { ZoomLevels } from "../../liquidity/infinity/constants";
import { TickFormat, type TicksType } from "./AxisBottom";

export interface LiquidityChartEntry {
  activeLiquidity: number;
  price0: number;
}

export interface PriceChartEntry {
  time: Date | null;
  open: number;
  close: number;
  high: number;
  low: number;
}

interface Dimensions {
  width: number;
  height: number;
}

interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type BrushDomainType = { min: number; max: number };

export interface ChartProps {
  // to distringuish between multiple charts in the DOM
  id?: string;

  data: {
    liquiditySeries: LiquidityChartEntry[];
    priceHistory: PriceChartEntry[];
    current: number;
  };

  ticksAtLimit: { [bound in Bound]?: boolean | undefined };

  styles: {
    area: {
      // color of the ticks in range
      selection: string;
    };
  };

  dimensions: Dimensions;
  margins: Margins;

  interactive?: boolean;

  brushLabels: (d: "n" | "s", x: number) => string;
  brushDomain: BrushDomainType | undefined;
  onBrushDomainChange: (domain: BrushDomainType, mode: string | undefined) => void;

  zoomLevels: ZoomLevels;
  showZoomButtons?: boolean;
  axisTicks?: { bottomTicks?: TicksType; bottomFormat?: TickFormat };
  showGridLines?: boolean;
}

export enum Bound {
  LOWER = "LOWER",
  UPPER = "UPPER",
}

export interface TickDataRaw {
  tick: string | number;
  liquidityGross: BigintIsh;
  liquidityNet: BigintIsh;
}

// Tick with fields parsed to bigints, and active liquidity computed.
export interface TickProcessed {
  tick: number;
  liquidityActive: bigint;
  liquidityNet: bigint;
  price0: string;
}

export const ZOOM_LEVELS: Record<FeeAmount, ZoomLevels> = {
  [FeeAmount.LOWEST]: {
    initialMin: 0.999,
    initialMax: 1.001,
    min: 0.00001,
    max: 1.5,
  },
  [FeeAmount.LOW]: {
    initialMin: 0.999,
    initialMax: 1.001,
    min: 0.00001,
    max: 1.5,
  },
  [FeeAmount.MEDIUM]: {
    initialMin: 0.5,
    initialMax: 2,
    min: 0.00001,
    max: 20,
  },
  [FeeAmount.HIGH]: {
    initialMin: 0.5,
    initialMax: 2,
    min: 0.00001,
    max: 20,
  },
};
