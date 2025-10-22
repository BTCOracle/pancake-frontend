import { useTranslation } from "@pancakeswap/localization";
import { Currency } from "@pancakeswap/swap-sdk-core";
import {
  Box,
  BoxProps,
  Button,
  Column,
  ColumnCenter,
  Flex,
  LinkExternal,
  OpenNewIcon,
  Row,
  SwapLoading,
  Text,
} from "@pancakeswap/uikit";
import { FC, ReactNode, Ref, useMemo } from "react";
import styled, { css } from "styled-components";
import { CurrencyLogo } from "../components/CurrencyLogo";
import { ConfirmModalState } from "./ApproveModalContent";
import { AnimationType, slideInAnimation, slideOutAnimation } from "./styles";

const TertiaryButton = styled(Button).attrs({ variant: "tertiary" })`
  height: unset;
  padding: 6px 8px;
  font-size: 14px;
  border-radius: 12px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
`;

export type PendingApproveModalState = Extract<
  ConfirmModalState,
  ConfirmModalState.APPROVING_TOKEN | ConfirmModalState.PERMITTING | ConfirmModalState.RESETTING_APPROVAL
>;

type AllowedAllowanceState =
  | ConfirmModalState.RESETTING_APPROVAL
  | ConfirmModalState.APPROVING_TOKEN
  | ConfirmModalState.PERMITTING;

interface ApproveModalContentV3Props extends Omit<BoxProps, "title"> {
  title: {
    [step in AllowedAllowanceState]: string;
  };
  isX: boolean;
  isBonus: boolean;
  currencyA: Currency;
  chainName?: string;
  asBadge: boolean;
  currentStep: ConfirmModalState;
  approvalModalSteps: PendingApproveModalState[];
}

interface StepTitleAnimationContainerProps {
  disableEntranceAnimation?: boolean;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export const StepTitleAnimationContainer: FC<StepTitleAnimationContainerProps> = styled(
  Column
)<StepTitleAnimationContainerProps>`
  align-items: center;
  transition: display 300ms ease-in-out;
  ${({ disableEntranceAnimation }) =>
    !disableEntranceAnimation &&
    css`
      ${slideInAnimation}
    `}

  &.${AnimationType.EXITING} {
    ${slideOutAnimation}
  }
`;

export const ApproveModalContentV3: React.FC<ApproveModalContentV3Props> = ({
  title,
  isX,
  isBonus,
  currencyA,
  chainName,
  asBadge,
  currentStep,
  approvalModalSteps,
  ...props
}) => {
  const { t } = useTranslation();

  return useMemo(
    () => (
      <Box width="100%" {...props}>
        <Flex alignItems="center">
          <ColumnCenter>
            <CurrencyLogo currency={currencyA} size="40px" showChainLogo />
            <Row mt="8px" gap="8px" width="fit-content">
              <Text bold>{currencyA.symbol}</Text>
              {chainName && (
                <Text color="textSubtle" bold>
                  ({chainName})
                </Text>
              )}
            </Row>
          </ColumnCenter>
        </Flex>
        <LinkExternal
          mt="8px"
          mx="auto"
          href="https://docs.pancakeswap.finance/~/changes/d1gFBwxReM0gH1aeMo0G/readme/help/what-is-an-approval-transaction"
          showExternalIcon={false}
          style={{ textDecoration: "none" }}
        >
          <TertiaryButton>
            <Text color="primary60" small bold>
              {t("Why approving this?")}
            </Text>
            <OpenNewIcon ml="4px" color="primary60" />
          </TertiaryButton>
        </LinkExternal>

        <Row mt="24px" justifyContent="center" gap="8px">
          <Text color="textSubtle" small>
            {t("Please proceed in your wallet")}
          </Text>
          <SwapLoading />
        </Row>
      </Box>
    ),
    [t, currencyA, chainName]
  );
};
