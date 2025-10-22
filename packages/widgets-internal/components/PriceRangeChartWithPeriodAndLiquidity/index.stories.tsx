import React from "react";
import { CurrencyAmount, Price } from "@pancakeswap/sdk";

import mockData from "./mockData.json";
import { PricePeriodRangeChart } from "./PricePeriodRangeChart";
import { cakeToken, bscToken } from "../../mockData";
import { TickDataRaw } from "./types";

export default {
  title: "Components/PriceRangeChart",
  component: PricePeriodRangeChart,
  argTypes: {},
};

export const Default: React.FC<React.PropsWithChildren> = () => {
  return (
    <div style={{ padding: "32px", width: "500px" }}>
      <PricePeriodRangeChart
        // price={0.0006380911608100259}
        price={parseFloat(
          new Price({
            baseAmount: CurrencyAmount.fromRawAmount(bscToken, "15671741929954778"),
            quoteAmount: CurrencyAmount.fromRawAmount(cakeToken, "10000000000000"),
          }).toSignificant(6)
        )}
        baseCurrency={bscToken}
        quoteCurrency={cakeToken}
        tickCurrent={-202763}
        liquidity={3799256509904881797n}
        formattedData={[]}
        ticks={mockData as unknown as TickDataRaw[]}
      />
    </div>
  );
};
