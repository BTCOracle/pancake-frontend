import { useTheme } from "@pancakeswap/hooks";
import { useTranslation } from "@pancakeswap/localization";
import { ExpandableLabel, FlexGap, LightBulbIcon, Message, MessageText, Text } from "@pancakeswap/uikit";
import { useState } from "react";
import styled from "styled-components";

export const ExpandableLabelContainer = styled.span`
  button {
    color: ${({ theme }) => theme.colors.v2Primary60};
    padding: 0;
    font-size: 14px;
  }
`;

export const Tips = ({
  primaryMsg,
  additionalDetails,
  toggleButton,
  toggleButtonLabel,
}: {
  primaryMsg: string;
  additionalDetails?: string | string[] | React.ReactElement;
  toggleButton?: React.ReactElement;
  toggleButtonLabel?: {
    showLabel: string;
    hideLabel: string;
  };
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <Message
      style={{
        background: theme.colors.v2Primary10,
        borderColor: theme.colors.v2Primary20,
      }}
      variant="success"
      icon={<LightBulbIcon color={theme.colors.v2Primary60} width="24px" />}
    >
      <MessageText color={theme.colors.text}>
        <FlexGap gap="24px" flexDirection="column">
          <Text fontSize="14px" as="div">
            {primaryMsg}
          </Text>
          {isExpanded && (
            <>
              {Array.isArray(additionalDetails) ? (
                additionalDetails.map((str) => (
                  <Text fontSize="14px" as="div">
                    {str}
                  </Text>
                ))
              ) : typeof additionalDetails === "string" ? (
                <Text fontSize="14px" as="div">
                  {additionalDetails}
                </Text>
              ) : (
                additionalDetails
              )}
            </>
          )}
        </FlexGap>
        {additionalDetails
          ? toggleButton ?? (
              <ExpandableLabelContainer>
                <ExpandableLabel expanded={isExpanded} onClick={() => setIsExpanded((prev) => !prev)}>
                  {isExpanded
                    ? toggleButtonLabel?.hideLabel ?? t("Hide")
                    : toggleButtonLabel?.showLabel ?? t("Details")}
                </ExpandableLabel>
              </ExpandableLabelContainer>
            )
          : null}
      </MessageText>
    </Message>
  );
};
