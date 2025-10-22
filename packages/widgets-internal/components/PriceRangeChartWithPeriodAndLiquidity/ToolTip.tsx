import { styled } from "styled-components";

const LabelGroup = styled.g<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? "1" : "0")};
  transition: opacity 300ms;
`;
const TooltipBackground = styled.rect`
  fill: ${({ theme }) => theme.colors.secondary};
`;

const TooltipText = styled.text`
  text-anchor: middle;
  font-size: 10px;
  fill: ${({ theme }) => theme.colors.background};
`;

export interface ToolTipProps {
  visible: boolean;
  flip: boolean;
  text: string;
  textRef: React.Ref<SVGTextElement>;
  width?: number;
  isMobile?: boolean;
}

const LABEL_WIDTH = 37;
const LABEL_HEIGHT = 20;
const PADDING_RIGHT = 4;

const MOBILE_LABEL_WIDTH = 45;
const MOBILE_LABEL_HEIGHT = 24;
const MOBILE_PADDING_RIGHT = 5;

export const ToolTip = ({
  visible = false,
  flip = false,
  text = "",
  textRef,
  width,
  isMobile = false,
}: ToolTipProps) => {
  const labelWidth = isMobile ? MOBILE_LABEL_WIDTH : LABEL_WIDTH;
  const labelHeight = isMobile ? MOBILE_LABEL_HEIGHT : LABEL_HEIGHT;
  const paddingRight = isMobile ? MOBILE_PADDING_RIGHT : PADDING_RIGHT;
  const defaultWidth = width ?? labelWidth;
  const boxWidth = Math.ceil(defaultWidth + paddingRight * 2);
  return (
    <LabelGroup
      transform={`translate(-${boxWidth + (isMobile ? 8 : 6)}, ${
        labelHeight * (flip ? 0.5 : -0.5) + (isMobile ? 9 : 7)
      }), scale(1, ${flip ? "-1" : "1"})`}
      visible={visible}
    >
      <TooltipBackground y="0" x="0" height={labelHeight} width={boxWidth} rx={isMobile ? 5 : 4} />
      <TooltipText
        y={labelHeight / 2 + 1}
        x={boxWidth / 2}
        dominantBaseline="middle"
        ref={textRef}
        style={{ fontSize: isMobile ? "12px" : "10px" }}
      >
        {text}
      </TooltipText>
    </LabelGroup>
  );
};
