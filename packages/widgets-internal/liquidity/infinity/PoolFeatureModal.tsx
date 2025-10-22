import { useTranslation } from "@pancakeswap/localization";
import { AutoColumn, Flex, FlexGap, LinkExternal, Modal, Text } from "@pancakeswap/uikit";
import Miscellaneous from "@pancakeswap/uikit/components/Svg/Icons/Miscellaneous";
import { ReactNode } from "react";

type PoolTypeModalProps = {
  onDismiss?: () => void;
  content: ReactNode;
  title: ReactNode;
  link?: string;
};

const ModalTitle: React.FC<{ content: ReactNode }> = ({ content }) => {
  const { t } = useTranslation();

  return (
    <>
      <FlexGap gap="8px" alignItems="center">
        <Miscellaneous color="textSubtle" width="24px" height="24px" />
        <Text fontSize={24} bold>
          {content}
        </Text>
      </FlexGap>
    </>
  );
};

export const PoolFeatureModal: React.FC<PoolTypeModalProps> = ({ onDismiss, title, content, link }) => {
  const { t } = useTranslation();
  return (
    <Modal title={<ModalTitle content={title} />} onDismiss={onDismiss}>
      <Flex minHeight="120px" flexDirection="column" width={["100%", "100%", "100%", "480px"]}>
        <AutoColumn gap="24px">
          <AutoColumn gap="sm">
            <Text fontSize={12} color="secondary" bold textTransform="uppercase">
              {t("Description")}
            </Text>
            <Text ellipsis style={{ whiteSpace: "pre-wrap" }}>
              {content}
            </Text>
          </AutoColumn>

          {link ? (
            <>
              <Text fontSize={12} color="secondary" bold textTransform="uppercase">
                {t("Links")}
              </Text>
              <Flex justifyContent="space-between">
                <Text color="textSubtle">{t("Docs")}</Text>
                <LinkExternal href={link} marginTop="auto">
                  <Text color="primary60" bold>
                    {t("View details in Docs")}
                  </Text>
                </LinkExternal>
              </Flex>
            </>
          ) : null}
        </AutoColumn>
      </Flex>
    </Modal>
  );
};
