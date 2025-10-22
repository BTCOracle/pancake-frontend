import { Box, CheckmarkCircleFillIcon, ErrorFillIcon, FlexGap, SwapLoading, Text } from "@pancakeswap/uikit";
import { PropsWithChildren, ReactNode } from "react";
import { styled } from "styled-components";

import { LightGreyCard } from "../Card";

const PendingBox = styled(Box)`
  padding: 2px;
  background-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 50%;
`;

const StyledSwapLoading = styled(SwapLoading)`
  filter: grayscale(1) brightness(2);
`;

export type TransactionListItemV2Props = PropsWithChildren<{
  status?: TransactionStatusV2;
  title?: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
}>;

export enum TransactionStatusV2 {
  Pending,
  PartialSuccess,
  Success,
  Failed,
  Expired,
}

export const TransactionListItemV2Title = styled(Text).attrs({
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
})`
  color: ${({ theme }) => theme.colors.textSubtle};
`;

export const TransactionListItemV2Desc = styled(Text).attrs({
  fontSize: "1rem",
  color: "text",
})``;

export function TransactionListItemV2({ status, onClick, children, action, title }: TransactionListItemV2Props) {
  return (
    <LightGreyCard padding="12px">
      <FlexGap flexDirection="row" justifyContent="space-between" alignItems="center" gap="0.5rem">
        <FlexGap flexDirection="column" gap="0.5rem" alignItems="flex-start">
          {title}
          <FlexGap
            flexDirection="row"
            gap="0.5rem"
            alignItems="center"
            justifyContent="flex-start"
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : "unset" }}
          >
            <StatusIndicator status={status} />
            {children}
          </FlexGap>
        </FlexGap>
        {action}
      </FlexGap>
    </LightGreyCard>
  );
}

function StatusIndicator({ status }: Pick<TransactionListItemV2Props, "status">) {
  if (status === TransactionStatusV2.Success) {
    return <CheckmarkCircleFillIcon width="24px" color="positive60" />;
  }

  if (status === TransactionStatusV2.PartialSuccess) {
    return <ErrorFillIcon width="24px" color="warning" />;
  }

  if (status === TransactionStatusV2.Failed) {
    return <ErrorFillIcon width="24px" color="failure" />;
  }

  if (status === TransactionStatusV2.Pending) {
    return (
      <PendingBox>
        <StyledSwapLoading size={16} />
      </PendingBox>
    );
  }

  return null;
}
