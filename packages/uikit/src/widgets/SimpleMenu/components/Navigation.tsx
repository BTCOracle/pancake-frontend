import React, { useMemo } from "react";
import { AtomBox, Flex } from "../../../components";
import MenuItems from "../../../components/MenuItems";
import { SubMenuItems, SubMenuItemsType } from "../../../components/SubMenuItems";
import { MenuItemsType } from "../../Menu";
import { useMenuContext } from "../../Menu/context";

export type NavigationProps = {
  links: Array<MenuItemsType>;
  activeItem?: string;
  activeSubItem?: string;
  activeSubItemChildItem?: string;
};

export const Navigation: React.FC<NavigationProps> = ({ links, activeItem, activeSubItem, activeSubItemChildItem }) => {
  return (
    <AtomBox display={{ xs: "none", lg: "block" }}>
      <MenuItems
        ml="24px"
        items={links}
        activeItem={activeItem}
        activeSubItem={activeSubItem}
        activeSubItemChildItem={activeSubItemChildItem}
      />
    </AtomBox>
  );
};

export type SubNavigationProps = {
  subLinks?: Array<SubMenuItemsType>;
  activeSubItem?: string;
  activeSubItemChildItem?: string;
};

export const SubNavigation: React.FC<SubNavigationProps> = ({ subLinks, activeSubItem, activeSubItemChildItem }) => {
  const { totalTopMenuHeight } = useMenuContext();

  const subLinksWithoutMobile = useMemo(() => subLinks?.filter((subLink) => !subLink.isMobileOnly), [subLinks]);
  const subLinksMobileOnly = useMemo(() => subLinks?.filter((subLink) => subLink.isMobileOnly), [subLinks]);

  if (!subLinks) return null;

  return (
    <Flex justifyContent="space-around" overflow="hidden">
      <SubMenuItems
        items={subLinksWithoutMobile}
        mt={`${totalTopMenuHeight + 1}px`}
        activeItem={activeSubItemChildItem || activeSubItem}
      />

      {subLinksMobileOnly && subLinksMobileOnly?.length > 0 && (
        <SubMenuItems
          items={subLinksMobileOnly}
          mt={`${totalTopMenuHeight + 1}px`}
          activeItem={activeSubItemChildItem || activeSubItem}
          isMobileOnly
        />
      )}
    </Flex>
  );
};
