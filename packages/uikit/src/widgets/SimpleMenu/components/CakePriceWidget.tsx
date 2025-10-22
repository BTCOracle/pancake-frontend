import { AtomBox, CakePrice as UIKitCakePrice } from "../../../components";

type CakePriceProps = {
  cakePriceUsd?: number;
  chainId: number;
  showSkeleton?: boolean;
};

export const CakePriceWidget: React.FC<CakePriceProps> = ({ cakePriceUsd, chainId, showSkeleton = true }) => {
  return (
    <AtomBox mr="12px" display={{ xs: "none", xxl: "block" }}>
      <UIKitCakePrice chainId={chainId} showSkeleton={showSkeleton} cakePriceUsd={cakePriceUsd} />
    </AtomBox>
  );
};
