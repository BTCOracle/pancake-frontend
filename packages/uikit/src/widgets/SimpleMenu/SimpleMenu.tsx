import { useIsMounted } from "@pancakeswap/hooks";
import throttle from "lodash/throttle";
import React, { ElementType, ReactElement, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { AtomBox } from "../../components/AtomBox";
import Flex from "../../components/Box/Flex";
import Logo from "../Menu/components/Logo";
import { MENU_HEIGHT } from "../Menu/config";
import { MenuContext } from "../Menu/context";
import { BodyWrapper, FixedContainer, Inner, StyledNav, Wrapper } from "../Menu/styled";
import { useIsomorphicLayoutEffect } from "./hooks/useIsomorphicLayoutEffect";

export type SimpleMenuProps = {
  linkComponent?: ElementType;
  announcementBanner?: ReactNode;
  brandLogo?: ReactElement;
  homeHref?: string;
  navigation?: ReactNode;
  subNavigation?: ReactNode;
  bottomNavigation?: ReactNode;
  rightSlot?: ReactNode;
};

export const SimpleMenu: React.FC<React.PropsWithChildren<SimpleMenuProps>> = ({
  linkComponent = "a",
  announcementBanner,
  brandLogo,
  homeHref = "/",
  navigation,
  subNavigation,
  bottomNavigation,
  rightSlot,
  children,
}) => {
  const isMounted = useIsMounted();
  const [showMenu, setShowMenu] = useState(true);
  const refPrevOffset = useRef(typeof window === "undefined" ? 0 : window.pageYOffset);

  const [totalTopMenuHeight, setTotalTopMenuHeight] = useState(MENU_HEIGHT);
  const announcementBannerRef = useRef<HTMLDivElement>(null);

  const updateMenuHeight = () => {
    if (announcementBannerRef.current) {
      const announcementBannerHeight = announcementBannerRef.current.getBoundingClientRect().height || 0;
      setTotalTopMenuHeight(MENU_HEIGHT + announcementBannerHeight);
    } else {
      setTotalTopMenuHeight(MENU_HEIGHT);
    }
  };

  useIsomorphicLayoutEffect(() => {
    if (isMounted) {
      updateMenuHeight();

      if (announcementBanner && announcementBannerRef.current) {
        const observer = new ResizeObserver(() => {
          updateMenuHeight();
        });
        observer.observe(announcementBannerRef.current!);
        return () => observer.disconnect();
      }
    }
    return () => {};
  }, [isMounted, announcementBanner]);

  useEffect(() => {
    const handleScroll = () => {
      const currentOffset = window.pageYOffset;
      const isBottomOfPage = window.document.body.clientHeight === currentOffset + window.innerHeight;
      const isTopOfPage = currentOffset === 0;

      const currentTotalHeight =
        announcementBanner && announcementBannerRef.current
          ? MENU_HEIGHT + (announcementBannerRef.current.getBoundingClientRect().height || 0)
          : totalTopMenuHeight;

      // Always show the menu when user reach the top
      if (isTopOfPage) {
        setShowMenu(true);
      }
      // Avoid triggering anything at the bottom because of layout shift
      else if (!isBottomOfPage) {
        if (currentOffset < refPrevOffset.current || currentOffset <= currentTotalHeight) {
          // Has scroll up
          setShowMenu(true);
        } else {
          // Has scroll down
          setShowMenu(false);
        }
      }
      refPrevOffset.current = currentOffset;
    };
    const throttledHandleScroll = throttle(handleScroll, 200);

    window.addEventListener("scroll", throttledHandleScroll);
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [totalTopMenuHeight, announcementBanner]);

  const providerValue = useMemo(() => ({ linkComponent, totalTopMenuHeight }), [linkComponent, totalTopMenuHeight]);

  return (
    <MenuContext.Provider value={providerValue}>
      <AtomBox
        asChild
        minHeight={{
          xs: "auto",
          md: "100vh",
        }}
      >
        <Wrapper>
          <FixedContainer showMenu={showMenu} $height={totalTopMenuHeight}>
            {announcementBanner ? <div ref={announcementBannerRef}>{announcementBanner}</div> : null}
            <StyledNav id="nav">
              <Flex>
                {brandLogo ?? <Logo href={homeHref} />}
                {navigation}
              </Flex>
              <Flex alignItems="center" height="100%">
                {rightSlot}
              </Flex>
            </StyledNav>
          </FixedContainer>
          {subNavigation}
          <BodyWrapper mt={!subNavigation ? `${totalTopMenuHeight + 1}px` : "0"}>
            <Inner>{children}</Inner>
          </BodyWrapper>
        </Wrapper>
      </AtomBox>
      {bottomNavigation}
    </MenuContext.Provider>
  );
};
