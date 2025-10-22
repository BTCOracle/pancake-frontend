import { AutoRow, InfoIcon, Text, useTooltip } from "@pancakeswap/uikit";
import { forwardRef, useMemo } from "react";
import styled from "styled-components";

export type FeatureStackProps = {
  features: React.ReactNode[];
  fold?: boolean;
  icon?: React.ReactNode;
  showInfoIcon?: boolean;
  onItemClick?: (feature: React.ReactNode) => void;
};

const StyledFeatureItem = styled.div`
  display: inline-flex;
  gap: 4px;
  padding: 2px 10px 2px 10px;
  border: 2px solid ${({ theme }) => theme.colors.tertiary20};
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.tertiary};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

const StyledFeatureItemTextContainer = styled.div`
  display: inline-block;
  white-space: nowrap;
`;

const StyledFeatureItemWithCounts = styled.div`
  display: inline-flex;
`;

const CountsIndicator = styled(Text)`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSubtle};
  background-color: ${({ theme }) => theme.colors.tertiary};
  border-radius: 999px;
  border: 2px solid ${({ theme }) => theme.colors.backgroundAlt};
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  min-width: 24px;
  margin-left: -6px;
`;

const StyledRows = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 8px;
`;

const FeatureItem: React.FC<
  React.PropsWithChildren<{
    icon?: React.ReactNode;
    onClick?: () => void;
  }>
> = ({ children, icon, onClick }) => {
  return (
    <StyledFeatureItem onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      {/* @notice: hide icon temporarily */}
      {/* {icon ?? <MiscellaneousIcon width={18} height={18} color="textSubtle" />} */}
      <StyledFeatureItemTextContainer>{children}</StyledFeatureItemTextContainer>
    </StyledFeatureItem>
  );
};

const FeatureItemWithCounts = forwardRef<HTMLDivElement, React.PropsWithChildren<{ count: number }>>(
  ({ count, children }, ref) => {
    return (
      <StyledFeatureItemWithCounts ref={ref}>
        <FeatureItem>{children}</FeatureItem>
        {count > 0 && <CountsIndicator as="span">+{count}</CountsIndicator>}
      </StyledFeatureItemWithCounts>
    );
  }
);

const FlattenFeatures: React.FC<FeatureStackProps> = ({ features, icon, onItemClick, showInfoIcon }) => {
  return (
    <>
      {features.map((feature) =>
        showInfoIcon ? (
          <AutoRow justifyContent="flex-end" gap="4px" key={feature?.toString()}>
            <FeatureItem icon={icon} key={feature?.toString()}>
              {feature}
            </FeatureItem>
            {showInfoIcon && (
              <InfoIcon
                onClick={() => onItemClick?.(feature)}
                width={18}
                height={18}
                color="textSubtle"
                style={{ cursor: "pointer" }}
              />
            )}
          </AutoRow>
        ) : (
          <FeatureItem key={feature?.toString()} onClick={onItemClick ? () => onItemClick?.(feature) : undefined}>
            {feature}
          </FeatureItem>
        )
      )}
    </>
  );
};

const FoldedFeatures: React.FC<FeatureStackProps> = ({ features, ...props }) => {
  const count = useMemo(() => features.length - 1, [features]);
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <StyledRows>
      <FlattenFeatures features={features} {...props} />
    </StyledRows>
  );

  if (features.length === 1) {
    return <FlattenFeatures {...props} fold={false} features={features} />;
  }

  return (
    <>
      <FeatureItemWithCounts ref={targetRef} count={count}>
        {features[0]}
      </FeatureItemWithCounts>
      {count > 0 && tooltipVisible && tooltip}
    </>
  );
};

export const FeatureStack: React.FC<FeatureStackProps> = ({ fold, ...props }) => {
  return fold ? <FoldedFeatures fold={fold} {...props} /> : <FlattenFeatures {...props} />;
};
