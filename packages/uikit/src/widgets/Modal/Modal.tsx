import React, { PropsWithChildren, useContext, useRef } from "react";
import { useTheme } from "styled-components";
import { Box } from "../../components/Box";
import Heading from "../../components/Heading/Heading";
import { useMatchBreakpoints } from "../../contexts";
import getThemeValue from "../../util/getThemeValue";
import { ModalV2Context } from "./ModalV2";
import { ModalBackButton, ModalBody, ModalCloseButton, ModalContainer, ModalHeader, ModalTitle } from "./styles";
import { ModalProps, ModalWrapperProps } from "./types";

export const MODAL_SWIPE_TO_CLOSE_VELOCITY = 300;

export const ModalWrapper = ({
  children,
  onDismiss,
  hideCloseButton,
  minHeight,
  containerStyle = {},
  ...props
}: PropsWithChildren<ModalWrapperProps>) => {
  const { isMobile } = useMatchBreakpoints();
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    // @ts-ignore
    <ModalContainer
      drag={isMobile && !hideCloseButton ? "y" : false}
      dragConstraints={{ top: 0, bottom: 600 }}
      dragElastic={{ top: 0 }}
      dragSnapToOrigin
      onDragStart={() => {
        if (wrapperRef.current) wrapperRef.current.style.animation = "none";
      }}
      // @ts-ignore
      onDragEnd={(e, info) => {
        if (info.velocity.y > MODAL_SWIPE_TO_CLOSE_VELOCITY && onDismiss) onDismiss();
      }}
      ref={wrapperRef}
      $minHeight={minHeight}
      style={{ overflow: "visible", ...containerStyle }}
    >
      <Box overflow="hidden" borderRadius="32px" {...props}>
        {children}
      </Box>
    </ModalContainer>
  );
};

const getIsAndroid = () => {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const android = Boolean(ua.match(/Android/i));
  return android;
};

const getIsBinance = () => {
  try {
    return typeof window !== "undefined" && Boolean((window as any).ethereum?.isBinance);
  } catch (error) {
    console.error("Error checking Binance Web3 Wallet:", error);
    return false;
  }
};

const Modal: React.FC<React.PropsWithChildren<ModalProps>> = ({
  title,
  onDismiss: onDismiss_,
  onBack,
  children,
  hideCloseButton = false,
  headerPadding = "12px 24px",
  bodyPadding = "24px",
  headerBackground = "transparent",
  minWidth = "320px",
  minHeight = "300px",
  headerRightSlot,
  bodyAlignItems,
  headerBorderColor,
  bodyTop = "0px",
  headerProps,
  ...props
}) => {
  const context = useContext(ModalV2Context);
  const onDismiss = context?.onDismiss || onDismiss_;
  const isAndroid = getIsAndroid();
  const isBinance = getIsBinance();
  const theme = useTheme();
  return (
    <ModalWrapper
      minWidth={minWidth}
      minHeight={minHeight}
      onDismiss={onDismiss}
      hideCloseButton={hideCloseButton}
      {...props}
    >
      <ModalHeader
        background={getThemeValue(theme, `colors.${headerBackground}`, headerBackground)}
        p={headerPadding}
        headerBorderColor={headerBorderColor}
      >
        <ModalTitle>
          {onBack && <ModalBackButton onBack={onBack} />}
          <Heading {...headerProps}>{title}</Heading>
        </ModalTitle>
        {headerRightSlot}
        {!hideCloseButton && <ModalCloseButton onDismiss={onDismiss} />}
      </ModalHeader>
      <ModalBody
        position="relative"
        top={bodyTop}
        // prevent drag event from propagating to parent on scroll
        onPointerDownCapture={(e) => e.stopPropagation()}
        p={bodyPadding}
        style={{ alignItems: bodyAlignItems ?? "normal" }}
      >
        {children}
      </ModalBody>
      {isAndroid && isBinance ? <Box height="60px" width="100%" /> : null}
    </ModalWrapper>
  );
};

export default Modal;
