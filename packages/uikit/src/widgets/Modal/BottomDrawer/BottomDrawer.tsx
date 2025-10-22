import React from "react";
import { styled } from "styled-components";
import { Box } from "../../../components";
import { ModalWrapper } from "../Modal";
import { ModalV2 } from "../ModalV2";
import { ModalCloseButton } from "../styles";
import { DrawerContainer } from "./styles";

export const TopBar = styled.div`
  position: absolute;
  top: 16px;
  left: calc(50% - 18px);
  width: 36px;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.v2Inverse};
  opacity: 0.1;
`;

interface BottomDrawerProps {
  content: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void | null;
  drawerContainerStyle?: React.CSSProperties;
  hideCloseButton?: boolean;
}

const BottomDrawer: React.FC<React.PropsWithChildren<BottomDrawerProps>> = ({
  drawerContainerStyle = {},
  content,
  isOpen,
  setIsOpen,
  hideCloseButton = false,
}) => {
  return (
    <ModalV2 isOpen={isOpen} onDismiss={() => setIsOpen(false)} closeOnOverlayClick>
      <ModalWrapper onDismiss={() => setIsOpen(false)}>
        <DrawerContainer style={drawerContainerStyle}>
          {!hideCloseButton ? (
            <Box position="absolute" right="24px" top="24px">
              <ModalCloseButton onDismiss={() => setIsOpen(false)} />
            </Box>
          ) : (
            <TopBar />
          )}

          {content}
        </DrawerContainer>
      </ModalWrapper>
    </ModalV2>
  );
};

export default BottomDrawer;
