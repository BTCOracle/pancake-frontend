import { IChainConfig } from '@bnb-chain/canonical-bridge-widget'

export const chains: IChainConfig[] = [
  {
    id: 1,
    name: 'Ethereum',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://ethereum-rpc.publicnode.com/'] } },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://etherscan.io' },
    },
  },
  {
    id: 10,
    name: 'Optimism',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://mainnet.optimism.io'] } },
    blockExplorers: {
      default: { name: 'OP Mainnet Explorer', url: 'https://optimistic.etherscan.io' },
    },
  },
  {
    id: 14,
    name: 'Flare',
    chainType: 'evm',
    nativeCurrency: {
      name: 'FLR',
      symbol: 'FLR',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://flare-api.flare.network/ext/bc/C/rpc'] } },
    blockExplorers: {
      default: { name: 'Flare Scan', url: 'https://flarescan.com/' },
    },
  },
  {
    id: 44,
    name: 'Crab Network',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Crab Network Native Token',
      symbol: 'CRAB',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://crab-rpc.darwinia.network'] } },
    blockExplorers: {
      default: { name: 'Crab explorer', url: 'https://crab-scan.darwinia.network' },
    },
  },
  {
    id: 56,
    name: 'BNB Smart Chain',
    chainType: 'evm',
    nativeCurrency: {
      name: 'BNB Chain Native Token',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://bsc-dataseed.bnbchain.org'] } },
    blockExplorers: {
      default: { name: 'bscscan', url: 'https://bscscan.com' },
    },
  },
  {
    id: 57,
    name: 'Syscoin',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Syscoin',
      symbol: 'SYS',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.syscoin.org'] } },
    blockExplorers: {
      default: { name: 'Syscoin Block Explorer', url: 'https://explorer.syscoin.org' },
    },
  },
  {
    id: 58,
    name: 'Ontology',
    chainType: 'evm',
    nativeCurrency: {
      name: 'ONG',
      symbol: 'ONG',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://dappnode1.ont.io:10339'] } },
    blockExplorers: {
      default: { name: 'explorer', url: 'https://explorer.ont.io' },
    },
  },
  {
    id: 66,
    name: 'OKXChain',
    chainType: 'evm',
    nativeCurrency: {
      name: 'OKXChain Global Utility Token',
      symbol: 'OKT',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://exchainrpc.okex.org'] } },
    blockExplorers: {
      default: { name: 'oklink', url: 'https://www.oklink.com/oktc' },
    },
  },
  {
    id: 73,
    name: 'FNCY',
    chainType: 'evm',
    nativeCurrency: {
      name: 'FNCY',
      symbol: 'FNCY',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://fncy-seed1.fncy.world'] } },
    blockExplorers: {
      default: { name: 'fncy scan', url: 'https://fncyscan.fncy.world' },
    },
  },
  {
    id: 100,
    name: 'Gnosis',
    chainType: 'evm',
    nativeCurrency: {
      name: 'xDAI',
      symbol: 'XDAI',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.gnosischain.com'] } },
    blockExplorers: {
      default: { name: 'gnosisscan', url: 'https://gnosisscan.io' },
    },
  },
  {
    id: 128,
    name: 'Huobi ECO Chain',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Huobi ECO Chain Native Token',
      symbol: 'HT',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://http-mainnet.hecochain.com'] } },
    blockExplorers: {
      default: { name: 'hecoinfo', url: 'https://hecoinfo.com', tokenUrlPattern: 'https://hecoscan.io/#/token20/{0}' },
    },
  },
  {
    id: 137,
    name: 'Polygon',
    chainType: 'evm',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://polygon-rpc.com'] } },
    blockExplorers: {
      default: { name: 'polygonscan', url: 'https://polygonscan.com' },
    },
  },
  {
    id: 169,
    name: 'Manta Pacific',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://pacific-rpc.manta.network/http'] } },
    blockExplorers: {
      default: { name: 'manta-pacific Explorer', url: 'https://pacific-explorer.manta.network' },
    },
  },
  {
    id: 196,
    name: 'X Layer',
    chainType: 'evm',
    nativeCurrency: {
      name: 'X Layer Global Utility Token',
      symbol: 'OKB',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.xlayer.tech'] } },
    blockExplorers: {
      default: { name: 'OKLink', url: 'https://www.oklink.com/xlayer' },
    },
  },
  {
    id: 204,
    name: 'opBNB',
    chainType: 'evm',
    nativeCurrency: {
      name: 'BNB Chain Native Token',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://opbnb-mainnet-rpc.bnbchain.org'] } },
    blockExplorers: {
      default: { name: 'opbnbscan', url: 'https://mainnet.opbnbscan.com' },
    },
  },
  {
    id: 248,
    name: 'Oasys',
    chainType: 'evm',
    nativeCurrency: {
      name: 'OAS',
      symbol: 'OAS',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.mainnet.oasys.games'] } },
    blockExplorers: {
      default: { name: 'Oasys-Mainnet explorer', url: 'https://explorer.oasys.games' },
    },
  },
  {
    id: 250,
    name: 'Fantom Opera',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Fantom',
      symbol: 'FTM',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpcapi.fantom.network'] } },
    blockExplorers: {
      default: { name: 'ftmscan', url: 'https://ftmscan.com' },
    },
  },
  {
    id: 288,
    name: 'Boba Network',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://mainnet.boba.network'] } },
    blockExplorers: {
      default: { name: 'Bobascan', url: 'https://bobascan.com' },
    },
  },
  {
    id: 314,
    name: 'Filecoin',
    chainType: 'evm',
    nativeCurrency: {
      name: 'filecoin',
      symbol: 'FIL',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://api.node.glif.io'] } },
    blockExplorers: {
      default: { name: 'Filfox', url: 'https://filfox.info/en' },
    },
  },
  {
    id: 324,
    name: 'zkSync',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://mainnet.era.zksync.io'] } },
    blockExplorers: {
      default: {
        name: 'zkSync Era Block Explorer',
        url: 'https://explorer.zksync.io',
        tokenUrlPattern: 'https://explorer.zksync.io/address/{0}',
      },
    },
  },
  {
    id: 336,
    name: 'Shiden',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Shiden',
      symbol: 'SDN',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://shiden.public.blastapi.io'] } },
    blockExplorers: {
      default: { name: 'subscan', url: 'https://shiden.subscan.io' },
    },
  },
  {
    id: 416,
    name: 'SX Network',
    chainType: 'evm',
    nativeCurrency: {
      name: 'SX Network',
      symbol: 'SX',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.sx.technology'] } },
    blockExplorers: {
      default: { name: 'SX Network Explorer', url: 'https://explorer.sx.technology' },
    },
  },
  {
    id: 592,
    name: 'Astar',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Astar',
      symbol: 'ASTR',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://evm.astar.network'] } },
    blockExplorers: {
      default: { name: 'subscan', url: 'https://astar.subscan.io' },
    },
  },
  {
    id: 1024,
    name: 'CLV Parachain',
    chainType: 'evm',
    nativeCurrency: {
      name: 'CLV',
      symbol: 'CLV',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://api-para.clover.finance'] } },
    blockExplorers: {
      default: { name: 'CLV Blockchain Explore', url: 'https://clvscan.com/' },
    },
  },
  {
    id: 1030,
    name: 'Conflux eSpace',
    chainType: 'evm',
    nativeCurrency: {
      name: 'CFX',
      symbol: 'CFX',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://evm.confluxrpc.com'] } },
    blockExplorers: {
      default: { name: 'Conflux Scan', url: 'https://evm.confluxscan.net' },
    },
  },
  {
    id: 1088,
    name: 'Metis Andromeda',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Metis',
      symbol: 'METIS',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://andromeda.metis.io/?owner=1088'] } },
    blockExplorers: {
      default: { name: 'Metis Andromeda explorer', url: 'https://andromeda-explorer.metis.io' },
    },
  },
  {
    id: 1101,
    name: 'Polygon zkEVM',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://zkevm-rpc.com'] } },
    blockExplorers: {
      default: { name: 'PolygonScan', url: 'https://zkevm.polygonscan.com' },
    },
  },
  {
    id: 1284,
    name: 'Moonbeam',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Glimmer',
      symbol: 'GLMR',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.api.moonbeam.network'] } },
    blockExplorers: {
      default: { name: 'moonscan', url: 'https://moonbeam.moonscan.io' },
    },
  },
  {
    id: 1285,
    name: 'Moonriver',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Moonriver',
      symbol: 'MOVR',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.api.moonriver.moonbeam.network'] } },
    blockExplorers: {
      default: { name: 'moonscan', url: 'https://moonriver.moonscan.io' },
    },
  },
  {
    id: 1329,
    name: 'Sei Network',
    chainType: 'evm',
    nativeCurrency: {
      name: 'SEI',
      symbol: 'SEI',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://evm-rpc.sei-apis.com'] } },
    blockExplorers: {
      default: { name: 'Sei Scan', url: 'https://www.seiscan.app/' },
    },
  },
  {
    id: 1625,
    name: 'Gravity Alpha',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Gravity',
      symbol: 'G.',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.gravity.xyz'] } },
    blockExplorers: {
      default: { name: 'Gravity Alpha Mainnet Explorer', url: 'https://explorer.gravity.xyz' },
    },
  },
  {
    id: 2001,
    name: 'Milkomeda C1',
    chainType: 'evm',
    nativeCurrency: {
      name: 'milkAda',
      symbol: 'mADA',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc-mainnet-cardano-evm.c1.milkomeda.com'] } },
    blockExplorers: {
      default: { name: 'Blockscout', url: 'https://explorer-mainnet-cardano-evm.c1.milkomeda.com' },
    },
  },
  {
    id: 2002,
    name: 'Milkomeda A1',
    chainType: 'evm',
    nativeCurrency: {
      name: 'milkALGO',
      symbol: 'mALGO',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc-mainnet-algorand-rollup.a1.milkomeda.com'] } },
    blockExplorers: {
      default: { name: '', url: '' },
    },
  },
  {
    id: 2222,
    name: 'Kava',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Kava',
      symbol: 'KAVA',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://evm.kava.io'] } },
    blockExplorers: {
      default: { name: 'Kava EVM Explorer', url: 'https://kavascan.com' },
    },
  },
  {
    id: 5000,
    name: 'Mantle',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Mantle',
      symbol: 'MNT',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.mantle.xyz/'] } },
    blockExplorers: {
      default: { name: 'Mantle Mainnet Explorer', url: 'https://explorer.mantle.xyz/' },
    },
  },
  {
    id: 7700,
    name: 'Canto',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Canto',
      symbol: 'CANTO',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://canto.gravitychain.io'] } },
    blockExplorers: {
      default: { name: 'Canto Explorer (OKLink)', url: 'https://www.oklink.com/canto' },
    },
  },
  {
    id: 8217,
    name: 'Klaytn',
    chainType: 'evm',
    nativeCurrency: {
      name: 'KLAY',
      symbol: 'KLAY',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://klaytn.blockpi.network/v1/rpc/public'] } },
    blockExplorers: {
      default: { name: 'Klaytnscope', url: 'https://scope.klaytn.com' },
    },
  },
  {
    id: 8453,
    name: 'Base',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://mainnet.base.org'] } },
    blockExplorers: {
      default: { name: 'basescan', url: 'https://basescan.org' },
    },
  },
  {
    id: 8822,
    name: 'IOTA EVM',
    chainType: 'evm',
    nativeCurrency: {
      name: 'IOTA Token',
      symbol: 'IOTA',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://json-rpc.evm.iotaledger.net'] } },
    blockExplorers: {
      default: { name: 'IOTA EVM explorer', url: 'https://explorer.evm.iota.org' },
    },
  },
  {
    id: 9001,
    name: 'Evmos',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Evmos',
      symbol: 'EVMOS',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://evmos-mainnet.public.blastapi.io'] } },
    blockExplorers: {
      default: {
        name: 'Evmos Explorer (Escan)',
        url: 'https://www.mintscan.io/evmos',
        tokenUrlPattern: 'https://www.mintscan.io/evmos/address/{0}',
      },
    },
  },
  {
    id: 13000,
    name: 'SPS',
    chainType: 'evm',
    nativeCurrency: {
      name: 'ECG',
      symbol: 'ECG  ',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.ssquad.games'] } },
    blockExplorers: {
      default: { name: 'SPS Explorer', url: 'http://spsscan.ssquad.games' },
    },
  },
  {
    id: 23294,
    name: 'Oasis Sapphire',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Sapphire Rose',
      symbol: 'ROSE',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://sapphire.oasis.io'] } },
    blockExplorers: {
      default: { name: 'Oasis Sapphire Explorer', url: 'https://explorer.oasis.io/mainnet/sapphire' },
    },
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://arb1.arbitrum.io/rpc'] } },
    blockExplorers: {
      default: { name: 'Arbiscan', url: 'https://arbiscan.io' },
    },
  },
  {
    id: 42170,
    name: 'Arbitrum Nova',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://nova.arbitrum.io/rpc'] } },
    blockExplorers: {
      default: { name: 'Arbitrum Nova Chain Explorer', url: 'https://nova-explorer.arbitrum.io' },
    },
  },
  {
    id: 42220,
    name: 'Celo',
    chainType: 'evm',
    nativeCurrency: {
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://forno.celo.org'] } },
    blockExplorers: {
      default: { name: 'Celoscan', url: 'https://celoscan.io' },
    },
  },
  {
    id: 42262,
    name: 'Oasis Emerald',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Emerald Rose',
      symbol: 'ROSE',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://emerald.oasis.io'] } },
    blockExplorers: {
      default: { name: 'Oasis Emerald Explorer', url: 'https://explorer.oasis.io/mainnet/emerald' },
    },
  },
  {
    id: 43114,
    name: 'Avalanche',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://api.avax.network/ext/bc/C/rpc'] } },
    blockExplorers: {
      default: { name: 'snowtrace', url: 'https://snowtrace.io' },
    },
  },
  {
    id: 47805,
    name: 'REI Network',
    chainType: 'evm',
    nativeCurrency: {
      name: 'REI',
      symbol: 'REI',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.rei.network'] } },
    blockExplorers: {
      default: { name: 'rei-scan', url: 'https://scan.rei.network' },
    },
  },
  {
    id: 59144,
    name: 'Linea',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Linea Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.linea.build'] } },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://lineascan.build' },
    },
  },
  {
    id: 71402,
    name: 'Godwoken',
    chainType: 'evm',
    nativeCurrency: {
      name: 'pCKB',
      symbol: 'pCKB',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://v1.mainnet.godwoken.io/rpc'] } },
    blockExplorers: {
      default: {
        name: 'GWScan Block Explorer',
        url: 'https://v1.gwscan.com',
        tokenUrlPattern: 'https://v1.gwscan.com/account/{0}',
      },
    },
  },
  {
    id: 81457,
    name: 'Blast',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.blast.io'] } },
    blockExplorers: {
      default: { name: 'Blastscan', url: 'https://blastscan.io' },
    },
  },
  // {
  //   id: 112358,
  //   name: 'Metachain One',
  //   nativeCurrency: {
  //     name: 'Metao',
  //     symbol: 'METAO',
  //     decimals: 18,
  //   },
  //   rpcUrl: 'https://rpc.metachain.one',
  //   explorer: {
  //     name: 'blockscout',
  //     url: 'https://explorer.metachain.one',
  //   },
  // },
  {
    id: 167000,
    name: 'Taiko',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.mainnet.taiko.xyz'] } },
    blockExplorers: {
      default: { name: 'Taiko Scan', url: 'https://taikoscan.io' },
    },
  },
  {
    id: 210425,
    name: 'PlatON',
    chainType: 'evm',
    nativeCurrency: {
      name: 'LAT',
      symbol: 'lat',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://openapi2.platon.network/rpc'] } },
    blockExplorers: {
      default: {
        name: 'PlatON explorer',
        url: 'https://scan.platon.network',
        tokenUrlPattern: 'https://scan.platon.network/tokens-detail?type=erc20&address={0}',
      },
    },
  },
  {
    id: 534352,
    name: 'Scroll',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.scroll.io'] } },
    blockExplorers: {
      default: { name: 'Scrollscan', url: 'https://scrollscan.com' },
    },
  },
  {
    id: 1313161554,
    name: 'Aurora',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://mainnet.aurora.dev'] } },
    blockExplorers: {
      default: { name: 'aurorascan.dev', url: 'https://aurorascan.dev' },
    },
  },
  {
    id: 1380012617,
    name: 'RARI Chain',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://mainnet.rpc.rarichain.org/http'] } },
    blockExplorers: {
      default: { name: 'Rari Mainnet Explorer', url: 'https://mainnet.explorer.rarichain.org/' },
    },
  },
  {
    id: 1666600000,
    name: 'Harmony One',
    chainType: 'evm',
    nativeCurrency: {
      name: 'ONE',
      symbol: 'ONE',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://api.harmony.one'] } },
    blockExplorers: {
      default: { name: 'Harmony Block Explorer', url: 'https://explorer.harmony.one' },
    },
  },
  // {
  //   id: 728126428,
  //   name: 'Tron',
  //   nativeCurrency: {
  //     name: 'TRX',
  //     symbol: 'TRX',
  //     decimals: 6,
  //   },
  //   rpcUrl: 'https://api.trongrid.io',
  //   explorer: {
  //     name: 'Tron Scan',
  //     url: 'https://tronscan.io/',
  //     tokenUrlPattern: 'https://tronscan.io/#/token20/{0}',
  //   },
  //   chainType: 'tron',
  // },

  {
    id: 7565164,
    name: 'Solana',
    nativeCurrency: {
      name: 'SOL',
      symbol: 'SOL',
      decimals: 9,
    },
    rpcUrls: { default: { http: ['https://solana-rpc.debridge.finance'] } },
    blockExplorers: {
      default: { name: 'Solana explorer', url: 'https://explorer.solana.com' },
    },
    chainType: 'solana',
  },
]
