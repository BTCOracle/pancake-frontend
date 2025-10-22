import { useTranslation } from "@pancakeswap/localization";
import { Box, InfoFilledIcon, LinkExternal, Placement, Text, TooltipText, useTooltip } from "@pancakeswap/uikit";
import { isMobile } from "react-device-detect";
import styled from "styled-components";

const InlineLink = styled(LinkExternal)`
  display: inline-flex;
  margin-left: 4px;
`;

type IncentraNoticeContentProps = {
  linkColor?: string;
  incentraUserLink?: string;
};

export const IncentraNoticeContent: React.FC<IncentraNoticeContentProps> = ({
  linkColor = "primary",
  incentraUserLink,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Box>
        <Text display="inline" color="currentColor">
          <p>{t("Incentives can now be earned on BOTH Incentra and Farms at the same time.")}</p>
          <br />
          {t("Stake your LP token in the Farm and accrue both Incentra and Farm rewards.")}
          <br />
          <br />
          {t("Claim your Farm rewards on PancakeSwap and your Incentra rewards on")}
          <InlineLink color={linkColor} external display="inline" href={incentraUserLink}>
            {t("Incentra's website")}
          </InlineLink>
        </Text>
      </Box>
    </>
  );
};

type IncentraNoticeProps = {
  // warning icon width/height px
  size?: string;
  placement?: Placement;
  tooltipOffset?: [number, number];
  incentraUserLink?: string;
};

const IncentraNotice: React.FC<IncentraNoticeProps> = ({
  size = "20px",
  placement = "top-start",
  tooltipOffset = [-20, 10],
  incentraUserLink,
}) => {
  const { tooltip, tooltipVisible, targetRef } = useTooltip(
    <IncentraNoticeContent incentraUserLink={incentraUserLink} />,
    {
      placement,
      tooltipOffset,
      trigger: isMobile ? "focus" : "hover",
    }
  );

  return (
    <>
      <TooltipText ref={targetRef} display="inline">
        <Text lineHeight={0}>
          <InfoFilledIcon color="#6532CD" width={size} height={size} />
        </Text>
      </TooltipText>
      {tooltipVisible ? tooltip : null}
    </>
  );
};

export default {
  WithTooltip: IncentraNotice,
  Content: IncentraNoticeContent,
};
