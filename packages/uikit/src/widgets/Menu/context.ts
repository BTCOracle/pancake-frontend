import { createContext, ElementType, useContext } from "react";

export const MenuContext = createContext<{
  linkComponent: ElementType;
  totalTopMenuHeight: number;
}>({
  linkComponent: "a",
  totalTopMenuHeight: 0,
});

export const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenuContext must be used within a MenuProvider");
  }
  return context;
};
