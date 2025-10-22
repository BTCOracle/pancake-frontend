import React from "react";
import { SpaceProps } from "styled-system";

import { ChevronDownIcon, ChevronUpIcon } from "../Svg";
import Button from "./Button";
import IconButton from "./IconButton";

export interface ExpandableButtonProps extends SpaceProps {
  onClick?: () => void;
  expanded?: boolean;
  iconColor?: string;
  iconSize?: string;
}

export const ExpandableButton: React.FC<React.PropsWithChildren<ExpandableButtonProps>> = ({
  onClick,
  expanded,
  children,
  ...rest
}) => {
  return (
    <IconButton aria-label="Hide or show expandable content" onClick={onClick} {...rest}>
      {children}
      {expanded ? <ChevronUpIcon color="invertedContrast" /> : <ChevronDownIcon color="invertedContrast" />}
    </IconButton>
  );
};
ExpandableButton.defaultProps = {
  expanded: false,
};

export const ExpandableLabel: React.FC<React.PropsWithChildren<ExpandableButtonProps>> = ({
  onClick,
  expanded,
  children,
  iconColor = "primary",
  iconSize,
  ...rest
}) => {
  return (
    <Button
      pr={0}
      variant="text"
      aria-label="Hide or show expandable content"
      onClick={onClick}
      endIcon={
        expanded ? (
          <ChevronUpIcon width={iconSize} height={iconSize} color={iconColor} />
        ) : (
          <ChevronDownIcon width={iconSize} height={iconSize} color={iconColor} />
        )
      }
      {...rest}
    >
      {children}
    </Button>
  );
};
ExpandableLabel.defaultProps = {
  expanded: false,
};
