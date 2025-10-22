import { MultiChainName } from 'state/info/constant'
import styled from 'styled-components'
import { CurrencyLogo } from 'views/Info/components/CurrencyLogo'

export const BaseCoinSvg = ({ color, index }: { color: string; index: string }) => (
  <svg width="83" height="88" viewBox="0 0 83 88" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask
      id="mask0_1475_43376"
      style={{ maskType: 'alpha' }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="14"
      width="83"
      height="74"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M80.2497 39.4112H82.4899V52.4082H82.4282C81.7554 72.1666 63.565 87.9999 41.2238 87.9999C18.4565 87.9999 0 71.5571 0 51.2739C0 50.7111 0.0142088 50.1513 0.0423242 49.5947L0.0423242 39.4112H2.19786C7.73505 24.9491 23.116 14.5479 41.2238 14.5479C59.3315 14.5479 74.7125 24.9491 80.2497 39.4112Z"
        fill="#C4C4C4"
      />
    </mask>
    <g mask="url(#mask0_1475_43376)">
      <rect x="0.0424805" y="1.08667" width="82.4475" height="94.8211" fill={color} />
      <g style={{ mixBlendMode: 'multiply' }} opacity="0.5">
        <rect
          x="0.0424805"
          y="8.26343"
          width="82.4475"
          height="87.6455"
          fill={`url(#paint0_radial_1475_43376-${index})`}
        />
      </g>
      <g style={{ mixBlendMode: 'soft-light' }}>
        <rect
          x="0.0424805"
          y="8.26343"
          width="82.4475"
          height="87.6455"
          fill={`url(#paint1_radial_1475_43376-${index})`}
        />
      </g>
    </g>
    <mask
      id="mask1_1475_43376"
      style={{ maskType: 'alpha' }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="83"
      height="79"
    >
      <ellipse cx="41.3815" cy="39.6386" rx="41.2238" ry="39.0954" fill="#C4C4C4" />
    </mask>
    <g mask="url(#mask1_1475_43376)">
      <rect x="0.272949" y="-0.00146484" width="82.4475" height="78.1909" fill={color} />
    </g>
    <g style={{ mixBlendMode: 'soft-light' }}>
      <ellipse cx="41.4965" cy="39.0958" rx="38.413" ry="36.4298" fill={`url(#paint2_linear_1475_43376-${index})`} />
    </g>
    <g style={{ mixBlendMode: 'multiply' }} opacity="0.7">
      <ellipse cx="41.4965" cy="39.0958" rx="38.413" ry="36.4298" fill={`url(#paint3_linear_1475_43376-${index})`} />
    </g>
    <g style={{ mixBlendMode: 'hard-light' }} opacity="0.9">
      <path
        d="M41.4965 78.2274C18.7292 78.2274 0.272693 60.7156 0.272694 39.1137C0.272694 17.5118 18.7292 -2.05063e-06 41.4965 -1.32104e-06C64.2637 -5.91451e-07 82.7202 17.5118 82.7202 39.1137C82.7202 60.7156 64.2637 78.2274 41.4965 78.2274ZM41.4965 2.66824C20.2823 2.66824 3.08487 18.9854 3.08487 39.1137C3.08487 59.242 20.2823 75.5592 41.4965 75.5592C62.7106 75.5592 79.908 59.242 79.908 39.1137C79.908 18.9854 62.7106 2.66824 41.4965 2.66824Z"
        fill={`url(#paint4_radial_1475_43376-${index})`}
      />
    </g>
    <defs>
      <radialGradient
        id={`paint0_radial_1475_43376-${index}`}
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(82.5505 45.5011) rotate(180) scale(72.7662 69.4026)"
      >
        <stop stopColor="#1E2226" />
        <stop offset="1" stopColor="#1E2026" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        id={`paint1_radial_1475_43376-${index}`}
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(3.7901 80.4515) rotate(-45.582) scale(27.6654 27.6597)"
      >
        <stop stopColor="#FAFAFA" />
        <stop offset="1" stopColor="#FAFAFA" stopOpacity="0" />
      </radialGradient>
      <linearGradient
        id={`paint2_linear_1475_43376-${index}`}
        x1="69.9447"
        y1="65.9629"
        x2="41.6125"
        y2="38.5439"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#F5F5F5" />
        <stop offset="1" stopColor="#F5F5F5" stopOpacity="0" />
      </linearGradient>
      <linearGradient
        id={`paint3_linear_1475_43376-${index}`}
        x1="9.32952"
        y1="9.03383"
        x2="64.5463"
        y2="69.7267"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor={color} />
        {/* <stop offset="0.0989583" stopColor="#2B2F36" /> */}
        {/* <stop offset="0.524632" stopColor="#B4B4B4" stopOpacity="0.536112" /> */}
        {/* <stop offset="1" stopColor="#F5F5F5" stopOpacity="0" /> */}
      </linearGradient>
      <radialGradient
        id={`paint4_radial_1475_43376-${index}`}
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(46.9617 33.9282) rotate(136.505) scale(56.3963 56.3185)"
      >
        <stop stopOpacity="0" />
        <stop offset="0.405819" stopColor="#333333" stopOpacity="0.613091" />
        <stop offset="1" stopColor={color} />
      </radialGradient>
    </defs>
  </svg>
)

const chainMap: Record<string, string> = {
  eth: 'ETH',
  zksync: 'ZKSYNC',
  arb: 'ARB',
  linea: 'LINEA',
  base: 'BASE',
  opbnb: 'OPBNB',
}

export const PickBaseCoin = ({
  tokenAddress,
  chain,
  color,
  right,
  top,
  id,
}: {
  tokenAddress: string
  chain: string
  color: string
  right: string
  top: string
  id: string
}) => {
  const chainName = chainMap[chain] as MultiChainName

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 3,
        right,
        top,
      }}
    >
      <TokenWrapper>
        <CurrencyLogo address={tokenAddress} chainName={chainName} size="71px" />
      </TokenWrapper>
      <BaseCoinSvg index={id} color={color} />
    </div>
  )
}

const TokenWrapper = styled.div`
  position: absolute;
  z-index: 2;
  width: 71px;
  height: 71px;
  left: 7px;
  top: 4px;
`
