import { Trans } from "@pancakeswap/localization";
import { Box, Button, ChevronDownIcon, Flex, FlexGap } from "../../../components";
import { LabelText, StyledUserMenu } from "../../Menu/components/UserMenu";
import MenuIcon from "../../Menu/components/UserMenu/MenuIcon";
import { Variant } from "../../Menu/components/UserMenu/types";

export type ConnectButtonProps = React.PropsWithChildren<{
  onClickConnect?: () => void;
  onClickAccount?: () => void;
  avatarSrc?: string;
  avatarClassName?: string;
  variant?: Variant;
  disabled?: boolean;
  account?: string;
}>;

export const SimpleConnectButton: React.FC<ConnectButtonProps> = ({
  onClickConnect,
  onClickAccount,
  account,
  avatarSrc,
  avatarClassName,
  variant = "default",
  disabled = false,
  ...props
}) => {
  if (account) {
    return (
      <UserMenu
        onClickAccount={onClickAccount}
        avatarSrc={avatarSrc}
        address={account}
        variant="default"
        avatarClassName={avatarClassName}
        disabled={disabled}
        {...props}
      />
    );
  }

  return (
    <Button onClick={onClickConnect} scale="sm" {...props}>
      <FlexGap gap="8px" justifyContent="center" alignItems="center">
        <Box display={["none", null, null, "block"]}>
          <Trans>Connect Wallet</Trans>
        </Box>
        <Box display={["block", null, null, "none"]}>
          <Trans>Connect</Trans>
        </Box>
      </FlexGap>
    </Button>
  );
};

type UserMenuProps = {
  onClickAccount?: () => void;
  avatarClassName?: string;
  avatarSrc?: string;
  variant?: Variant;
  address?: string;
  disabled?: boolean;
};
const UserMenu: React.FC<UserMenuProps> = ({
  onClickAccount,
  avatarClassName,
  avatarSrc,
  variant = "default",
  address,
  disabled,
  ...props
}) => {
  return (
    <Flex alignItems="center" height="100%" {...props}>
      <StyledUserMenu
        onClick={() => {
          onClickAccount?.();
        }}
      >
        <MenuIcon className={avatarClassName} avatarSrc={avatarSrc} variant={variant} />
        <LabelText title={address}>{address}</LabelText>
        {!disabled && <ChevronDownIcon color="text" width="24px" />}
      </StyledUserMenu>
    </Flex>
  );
};
