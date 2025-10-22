import { useTranslation } from "@pancakeswap/localization";
import { Skeleton, Text, useMatchBreakpoints } from "@pancakeswap/uikit";
import { BIG_ZERO } from "@pancakeswap/utils/bigNumber";
import BigNumber from "bignumber.js";
import React, { ReactNode, useMemo } from "react";
import { styled } from "styled-components";

import { DeserializedPool } from "../types";
import { BaseCell, CellContent } from "./BaseCell";

interface NameCellProps<T> {
  pool: DeserializedPool<T>;
  userShares?: BigNumber;
  tokenPairImage: ReactNode;
  tooltipComponent?: ReactNode;
}

const StyledCell = styled(BaseCell)`
  flex: 5;
  flex-direction: row;
  padding-left: 12px;
  ${({ theme }) => theme.mediaQueries.sm} {
    flex: 1 0 150px;
    padding-left: 32px;
  }
`;

export function NameCell<T>({ pool, tokenPairImage, tooltipComponent }: NameCellProps<T>) {
  const { t } = useTranslation();
  const { isMobile } = useMatchBreakpoints();
  const { sousId, stakingToken, earningToken, userData, isFinished, totalStaked } = pool;

  const stakingTokenSymbol = stakingToken.symbol;
  const earningTokenSymbol = earningToken.symbol;

  const stakedBalance = userData?.stakedBalance ? new BigNumber(userData.stakedBalance) : BIG_ZERO;
  const showStakedTag = stakedBalance.gt(0);

  const title: React.ReactNode = `${t("Earn.verb")} ${earningTokenSymbol}`;
  const subtitle: React.ReactNode = `${t("Stake")} ${stakingTokenSymbol}`;
  const showSubtitle = sousId !== 0 || (sousId === 0 && !isMobile);

  const isLoaded = useMemo(() => {
    return totalStaked && totalStaked.gte(0);
  }, [totalStaked]);

  return (
    <StyledCell role="cell">
      {isLoaded ? (
        <>
          {tokenPairImage}
          <CellContent>
            {showStakedTag && (
              <Text fontSize="12px" bold color={isFinished ? "failure" : "secondary"} textTransform="uppercase">
                {t("Staked")}
              </Text>
            )}
            <Text bold={!isMobile} small={isMobile}>
              {title}
            </Text>
            {showSubtitle && (
              <Text fontSize="12px" color="textSubtle">
                {subtitle}
              </Text>
            )}
          </CellContent>
          {tooltipComponent}
        </>
      ) : (
        <>
          <Skeleton mr="8px" width={36} height={36} variant="circle" />
          <CellContent>
            <Skeleton width={30} height={12} mb="4px" />
            <Skeleton width={65} height={12} />
          </CellContent>
        </>
      )}
    </StyledCell>
  );
}
