import { ElementType, ReactNode } from "react";
import { BorderProps, LayoutProps, ResponsiveValue, SpaceProps } from "styled-system";
import type { PolymorphicComponentProps } from "../../util/polymorphic";

export const scales = {
  MD: "md",
  SM: "sm",
  XS: "xs",
} as const;

export const variants = {
  PRIMARY: "primary",
  PRIMARY60: "primary60",
  PRIMARY60_OUTLINE: "primary60Outline",
  SECONDARY: "secondary",
  TERTIARY: "tertiary",
  TEXT: "text",
  TEXT_PRIMARY_60: "textPrimary60",
  DANGER: "danger",
  DANGER_OUTLINE: "dangerOutline",
  SUBTLE: "subtle",
  SUCCESS: "success",
  LIGHT: "light",
  BUBBLEGUM: "bubblegum",
} as const;

export type Scale = (typeof scales)[keyof typeof scales];
export type Variant = (typeof variants)[keyof typeof variants];

export interface BaseButtonProps extends LayoutProps, SpaceProps, BorderProps {
  as?: "a" | "button" | ElementType;
  external?: boolean;
  isLoading?: boolean;
  scale?: ResponsiveValue<Scale>;
  variant?: Variant;
  disabled?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  decorator?: {
    backgroundColor?: string;
    color?: string;
    text: string;
    direction?: "left" | "right";
  };
}

export type ButtonProps<P extends ElementType = "button"> = PolymorphicComponentProps<P, BaseButtonProps>;
