import { useTranslation } from "@pancakeswap/localization";
import { Currency } from "@pancakeswap/swap-sdk-core";
import { FlexGap, IColumnsType, TableView, Tag, Text, TooltipText, useTooltip } from "@pancakeswap/uikit";
import { displayApr } from "@pancakeswap/utils/displayApr";
import { useMemo } from "react";
import styled from "styled-components";

import { CurrencyLogo, DoubleCurrencyLogo } from "../../components/CurrencyLogo";

interface Reward {
  title: string;
  currency?: Currency | [Currency, Currency];
  apr?: `${number}`;
  boostedApr?: `${number}`;
  rewardPerDay?: string;
}

export interface IRewardCardProps {
  rewards?: Reward[];
}

const Container = styled.div`
  table {
    tr {
      border: none;

      &:last-child {
        border: none;
      }

      th,
      td {
        padding: 4px 12px;
        vertical-align: middle;
        text-align: left;
      }
      th:last-child,
      td:last-child {
        padding-right: 12px;
        text-align: right;
      }

      th:first-child,
      td:first-child {
        padding-left: 12px;
      }
    }
  }
`;

export const RewardCard = ({ rewards }: IRewardCardProps) => {
  const { t } = useTranslation();

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <span>
      {t("These values represent the rewards earned in the last epoch. For the first epoch, the values are estimates.")}
      <br />
      {t("Epoch = 8-hour reward cycle")}
    </span>
  );

  const columns = useMemo(() => {
    return [
      {
        title: t("Reward"),
        dataIndex: "title",
        key: "title",
        minWidth: "110px",
        render: (title, item) => (
          <FlexGap gap="8px" alignItems="center">
            {Array.isArray(item.currency) ? (
              <DoubleCurrencyLogo currency0={item.currency[0]} currency1={item.currency[1]} innerMargin="-4px" />
            ) : (
              <CurrencyLogo currency={item.currency} />
            )}
            <Text bold>{title}</Text>
          </FlexGap>
        ),
      },
      {
        title: t("APR Breakdown"),
        dataIndex: "apr",
        key: "apr",
        render: (apr, item) => (
          <FlexGap alignItems="flex-start" flexDirection="column">
            {apr ? (
              <TooltipText fontSize="16px" bold decorationColor="secondary">
                {displayApr(parseFloat(apr) || 0)}
              </TooltipText>
            ) : null}
            <Text fontSize="12px" color="textSubtle">
              {Array.isArray(item.currency)
                ? `${t("Earn.verb")} ${item.currency[0]?.symbol} + ${item.currency[1]?.symbol}`
                : `${t("Earn.verb")} ${item.currency?.symbol}`}
            </Text>
          </FlexGap>
        ),
      },
      {
        title: (
          <>
            <TooltipText ref={targetRef} decorationColor="secondary">
              <Text color="secondary" bold fontSize="12px" textTransform="uppercase">
                {t("Reward Per Day")}
              </Text>
            </TooltipText>
            {tooltipVisible && tooltip}
          </>
        ),
        dataIndex: "rewardPerDay",
        key: "rewardPerDay",
        minWidth: "105px",
        render: (rewardPerDay) => (
          <FlexGap alignItems="center" flexDirection="column" flexWrap="wrap" alignContent="flex-end">
            <Tag variant="textSubtle" style={{ color: "var(--colors-background)" }}>
              {rewardPerDay}
            </Tag>
          </FlexGap>
        ),
      },
    ] as IColumnsType<Reward>[];
  }, [t, targetRef, tooltipVisible, tooltip]);

  return (
    <Container>
      <TableView columns={columns} data={rewards ?? []} />
    </Container>
  );
};
