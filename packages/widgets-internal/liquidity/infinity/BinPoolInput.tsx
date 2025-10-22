import { Trans } from "@pancakeswap/localization";
import { Box, BoxProps, Input, Text } from "@pancakeswap/uikit";
import { styled } from "styled-components";

const Wrapper = styled(Box)`
  border-radius: ${({ theme }) => theme.spacing["16px"]};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  min-width: 104px;
  padding: ${({ theme }) => theme.spacing["16px"]};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

interface BinPoolInputProps extends Omit<BoxProps, "onChange"> {
  numBin: number;
  onChange: (numBin: number) => void;
}

export const BinPoolInput = ({ numBin, onChange, ...props }: BinPoolInputProps) => {
  return (
    <Wrapper {...props}>
      <Text bold color="secondary">
        <Trans>NUM BIN</Trans>
      </Text>
      <Input value={numBin} onChange={(e) => onChange(Number(e.target.value))} />
    </Wrapper>
  );
};
