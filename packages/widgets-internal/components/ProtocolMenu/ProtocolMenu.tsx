import { Protocol } from "@pancakeswap/farms";
import { ButtonMenu, ButtonMenuItem } from "@pancakeswap/uikit";
import styled from "styled-components";

export interface IProtocolMenuProps {
  data: { label: string; value: Protocol | Protocol[] | null }[];
  activeIndex: number;
  onChange: (index: number) => void;
}

const StyledButtonMenuItem = styled(ButtonMenuItem)`
  padding: 0 8px;

  ${({ isActive }) => (isActive ? `padding: 0 12px;` : "")};
`;

const StyledMenu = styled(ButtonMenu)`
  width: 100%;
`;

export const ProtocolMenu: React.FC<IProtocolMenuProps> = ({ data, activeIndex, onChange }) => (
  <StyledMenu scale="sm" activeIndex={activeIndex ?? 0} onItemClick={onChange} variant="subtle">
    {data.map(({ label, value }) => (
      <StyledButtonMenuItem key={Array.isArray(value) ? value.join("") : value} height="43px">
        {label}
      </StyledButtonMenuItem>
    ))}
  </StyledMenu>
);
