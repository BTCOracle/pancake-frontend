import { useTranslation } from "@pancakeswap/localization";
import {
  ButtonMenu,
  ButtonMenuItem,
  Flex,
  FlexGap,
  IconButton,
  Modal,
  ModalV2,
  NotificationDot,
  Text,
  Toggle,
  ToggleView,
  TuneIcon,
  useMatchBreakpoints,
  useModalV2,
  ViewMode,
} from "@pancakeswap/uikit";
import { useRouter } from "next/router";
import { styled } from "styled-components";
import { NextLinkFromReactRouter } from "../components/NextLink";

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;

  ${Text} {
    margin-left: 8px;
  }
`;

const ViewControls = styled.div`
  flex-wrap: wrap;
  justify-content: space-between;
  display: flex;
  align-items: center;
  width: 100%;

  > div {
    padding: 8px 0px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    justify-content: flex-start;
    width: auto;

    > div {
      padding: 0;
    }
  }
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-left: 16px;
  }
`;

interface PoolTableButtonsPropsType {
  stakedOnly: boolean;
  setStakedOnly: (s: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (s: ViewMode) => void;
  hasStakeInFinishedPools: boolean;
  hideViewMode?: boolean;
}

const PoolTabButtons = ({
  stakedOnly,
  setStakedOnly,
  hasStakeInFinishedPools,
  viewMode,
  setViewMode,
  hideViewMode = false,
}: PoolTableButtonsPropsType) => {
  const router = useRouter();
  const { t } = useTranslation();
  const filterModal = useModalV2();
  const { isMobile } = useMatchBreakpoints();

  const isExact = router.pathname === "/pools" || router.pathname === "/_mp/pools";

  const viewModeToggle = hideViewMode ? null : (
    <ToggleView idPrefix="clickPool" viewMode={viewMode} onToggle={setViewMode} />
  );

  const liveOrFinishedSwitch = (
    <Wrapper>
      <ButtonMenu activeIndex={isExact ? 0 : 1} scale="sm" variant="subtle">
        <ButtonMenuItem as={NextLinkFromReactRouter} to="/pools" replace>
          {t("Live")}
        </ButtonMenuItem>
        <NotificationDot show={hasStakeInFinishedPools}>
          <ButtonMenuItem id="finished-pools-button" as={NextLinkFromReactRouter} to="/pools/history" replace>
            {t("Old")}
          </ButtonMenuItem>
        </NotificationDot>
      </ButtonMenu>
    </Wrapper>
  );

  const stakedOnlySwitch = (
    <ToggleWrapper>
      <Toggle checked={stakedOnly} onChange={() => setStakedOnly(!stakedOnly)} scale="sm" />
      <Text> {t("Staked only")}</Text>
    </ToggleWrapper>
  );

  const FilterModalContent = () => (
    <Modal title={t("Filter")} headerBackground="gradientCardHeader" onDismiss={filterModal.onDismiss}>
      <FlexGap flexDirection="column" gap="16px">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <Text>{t("Pool status")}</Text>
          </Flex>
          {liveOrFinishedSwitch}
        </Flex>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <Text>{t("Staked only")}</Text>
          </Flex>
          <Toggle
            checked={stakedOnly}
            onChange={() => {
              setStakedOnly(!stakedOnly);
              filterModal.setIsOpen(false);
            }}
            scale="md"
          />
        </Flex>
      </FlexGap>
    </Modal>
  );

  return (
    <ViewControls>
      {viewModeToggle}
      {isMobile ? (
        <>
          <IconButton variant="text" scale="xs" onClick={filterModal.onOpen}>
            <TuneIcon color="primary" width="18px" />
          </IconButton>
          <ModalV2 isOpen={filterModal.isOpen} onDismiss={filterModal.onDismiss}>
            <FilterModalContent />
          </ModalV2>
        </>
      ) : (
        <>
          {liveOrFinishedSwitch}
          {stakedOnlySwitch}
        </>
      )}
    </ViewControls>
  );
};

export default PoolTabButtons;
