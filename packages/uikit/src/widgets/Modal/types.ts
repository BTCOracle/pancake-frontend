import { BoxProps } from "../../components/Box";
import { TextProps } from "../../components/Text/types";

export interface ModalTheme {
  background: string;
}

export type Handler = () => void;

export interface InjectedProps {
  onDismiss?: Handler;
  mode?: string;
}

export interface ModalWrapperProps extends InjectedProps, Omit<BoxProps, "title" | "content"> {
  containerStyle?: React.CSSProperties;
  hideCloseButton?: boolean;
}

export interface ModalProps extends ModalWrapperProps {
  title: React.ReactNode;
  hideCloseButton?: boolean;
  onBack?: () => void;
  headerPadding?: string;
  bodyPadding?: string;
  headerBackground?: string;
  headerRightSlot?: React.ReactNode;
  bodyAlignItems?: string;
  headerBorderColor?: string;
  bodyTop?: string;
  headerProps?: TextProps;
}
