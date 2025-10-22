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
    id: 25,
    name: 'Cronos',
    chainType: 'evm',
    nativeCurrency: {
      name: 'CRO',
      symbol: 'CRO',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://evm.cronos.org'] } },
    blockExplorers: {
      default: { name: 'Crono Scan', url: 'https://cronoscan.com/' },
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
      default: {
        name: 'hecoinfo',
        url: 'https://hecoinfo.com',
        tokenUrlPattern: 'https://hecoscan.io/#/token20/{0}',
      },
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
      default: { name: 'Manta Pacific Explorer', url: 'https://pacific-explorer.manta.network' },
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
    id: 223,
    name: 'b2',
    chainType: 'evm',
    nativeCurrency: {
      name: 'BTC',
      symbol: 'BTC',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.bsquared.network'] } },
    blockExplorers: {
      default: { name: 'B2 Network Explorer', url: 'https://explorer.bsquared.network' },
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
    id: 255,
    name: 'Kroma',
    chainType: 'evm',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://api.kroma.network'] } },
    blockExplorers: {
      default: { name: 'Kroma Scan', url: 'https://kromascan.com' },
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
      default: { name: 'zkSync Era Block Explorer', url: 'https://explorer.zksync.io' },
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
    rpcUrls: { default: { http: ['https://shiden.api.onfinality.io/public'] } },
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
      default: { name: 'Andromeda Explorer', url: 'https://andromeda-explorer.metis.io' },
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
    id: 1116,
    name: 'Core',
    chainType: 'evm',
    nativeCurrency: {
      name: 'CORE',
      symbol: 'CORE',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.coredao.org'] } },
    blockExplorers: {
      default: { name: 'Core Explorer', url: 'https://scan.coredao.org' },
    },
  },
  {
    id: 1284,
    name: 'Moonbeam',
    chainType: 'evm',
    nativeCurrency: {
      name: 'GLMR',
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
      default: { name: 'Kava Explorer', url: 'https://explorer.kava.io' },
    },
  },
  {
    id: 2525,
    name: 'inEVM',
    chainType: 'evm',
    nativeCurrency: {
      name: 'INJ',
      symbol: 'INJ',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://mainnet.rpc.inevm.com/http'] } },
    blockExplorers: {
      default: { name: 'inEVM Explorer', url: 'https://explorer.inevm.com' },
    },
  },
  {
    id: 2649,
    name: 'AILayer',
    chainType: 'evm',
    nativeCurrency: {
      name: 'BTC',
      symbol: 'BTC',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://mainnet-rpc.ailayer.xyz'] } },
    blockExplorers: {
      default: { name: 'AI Layer Explorer', url: 'https://mainnet-explorer.ailayer.xyz' },
    },
  },
  {
    id: 4200,
    name: 'Merlin',
    chainType: 'evm',
    nativeCurrency: {
      name: 'BTC',
      symbol: 'BTC',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.merlinchain.io'] } },
    blockExplorers: {
      default: { name: 'Merlin Scan', url: 'https://scan.merlinchain.io' },
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
    id: 6001,
    name: 'BB',
    chainType: 'evm',
    nativeCurrency: {
      name: 'BB',
      symbol: 'BB',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://fullnode-mainnet.bouncebitapi.com'] } },
    blockExplorers: {
      default: { name: 'BB Scan', url: 'https://bbscan.io' },
    },
  },
  {
    id: 7000,
    name: 'ZetaChain',
    chainType: 'evm',
    nativeCurrency: {
      name: 'ZETA',
      symbol: 'ZETA',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://zetachain-evm.blockpi.network:443/v1/rpc/public'] } },
    blockExplorers: {
      default: { name: 'Zeta Chain Explorer', url: 'https://explorer.zetachain.com/' },
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
    id: 11501,
    name: 'BEVM',
    chainType: 'evm',
    nativeCurrency: {
      name: 'BTC',
      symbol: 'BTC',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc-mainnet-1.bevm.io'] } },
    blockExplorers: {
      default: { name: 'BEVM Explorer', url: 'https://scan-mainnet.bevm.io' },
    },
  },
  {
    id: 13000,
    name: 'SPS',
    chainType: 'evm',
    nativeCurrency: {
      name: 'ECG',
      symbol: 'ECG',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.ssquad.games'] } },
    blockExplorers: {
      default: { name: 'SPS Explorer', url: 'http://spsscan.ssquad.games' },
    },
  },
  {
    id: 17777,
    name: 'EOS EVM',
    chainType: 'evm',
    nativeCurrency: {
      name: 'EOS',
      symbol: 'EOS',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://api.evm.eosnetwork.com'] } },
    blockExplorers: {
      default: { name: 'EOS EVM Explorer', url: 'https://explorer.evm.eosnetwork.com' },
    },
  },
  {
    id: 22776,
    name: 'MAP Protocol',
    chainType: 'evm',
    nativeCurrency: {
      name: 'MAPO',
      symbol: 'MAPO',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.maplabs.io'] } },
    blockExplorers: {
      default: { name: 'MAPO Scan', url: 'https://maposcan.io' },
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
    id: 34443,
    name: 'Mode',
    chainType: 'evm',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://mainnet.mode.network'] } },
    blockExplorers: {
      default: { name: 'Mode Explorer', url: 'https://explorer.mode.network' },
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
    id: 42766,
    name: 'ZKFair',
    chainType: 'evm',
    nativeCurrency: {
      name: 'USDC',
      symbol: 'USDC',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.zkfair.io'] } },
    blockExplorers: {
      default: { name: 'Zkfair Scan', url: 'https://scan.zkfair.io' },
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
    id: 48900,
    name: 'Zircuit',
    chainType: 'evm',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://zircuit-mainnet.drpc.org'] } },
    blockExplorers: {
      default: { name: 'Zircuit Explorer', url: 'https://explorer.zircuit.com' },
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
  {
    id: 112358,
    name: 'Metachain One',
    chainType: 'evm',
    nativeCurrency: {
      name: 'Metao',
      symbol: 'METAO',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.metachain.one'] } },
    blockExplorers: {
      default: { name: 'blockscout', url: 'https://explorer.metachain.one' },
    },
  },
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
    id: 200901,
    name: 'Bitlayer Mainnet',
    chainType: 'evm',
    nativeCurrency: {
      name: 'BTC',
      symbol: 'BTC',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.bitlayer.org'] } },
    blockExplorers: {
      default: { name: 'Bitlayer Scan', url: 'https://www.btrscan.com' },
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
    id: 60808,
    name: 'BOB',
    chainType: 'evm',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.gobob.xyz'] } },
    blockExplorers: {
      default: { name: 'BOB Explorer', url: 'https://explorer.gobob.xyz' },
    },
  },
  {
    id: 810180,
    name: 'zkLink',
    chainType: 'evm',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.zklink.io'] } },
    blockExplorers: {
      default: { name: 'ZKLink Explorer', url: 'https://explorer.zklink.io' },
    },
  },
  {
    id: 888888888,
    name: 'Ancient8',
    chainType: 'evm',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://rpc.ancient8.gg'] } },
    blockExplorers: {
      default: { name: 'Ancient8 Scan', url: 'https://scan.ancient8.gg' },
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
    id: 1482601649,
    name: 'SKALE Nebula Hub',
    chainType: 'evm',
    nativeCurrency: {
      name: 'sFUEL',
      symbol: 'sFUEL',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://mainnet.skalenodes.com/v1/green-giddy-denebola'] } },
    blockExplorers: {
      default: { name: 'SKALE Nebula Explorer', url: 'https://green-giddy-denebola.explorer.mainnet.skalenodes.com' },
    },
  },
  {
    id: 1564830818,
    name: 'SKALE Calypso',
    chainType: 'evm',
    nativeCurrency: {
      name: 'sFUEL',
      symbol: 'sFUEL',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague'] } },
    blockExplorers: {
      default: {
        name: 'SKALE Calypso Hub Explorer',
        url: 'https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com/',
      },
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
  {
    id: 2046399126,
    name: 'SKALE Europa Hub',
    chainType: 'evm',
    nativeCurrency: {
      name: 'sFUEL',
      symbol: 'sFUEL',
      decimals: 18,
    },
    rpcUrls: { default: { http: ['https://mainnet.skalenodes.com/v1/elated-tan-skat'] } },
    blockExplorers: {
      default: { name: 'SKALE Europa Hub Explorer', url: 'https://elated-tan-skat.explorer.mainnet.skalenodes.com' },
    },
  },
  {
    id: 728126428,
    name: 'Tron',
    chainType: 'tron',
    nativeCurrency: {
      name: 'TRX',
      symbol: 'TRX',
      decimals: 6,
    },
    rpcUrls: { default: { http: ['https://api.trongrid.io'] } },
    blockExplorers: {
      default: { name: 'Tron Scan', url: 'https://tronscan.io/', tokenUrlPattern: 'https://tronscan.io/#/token20/{0}' },
    },
  },
  {
    chainType: 'solana',
    id: 7565164,
    name: 'Solana',
    nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9 },
    rpcUrls: {
      default: { http: ['https://solana-rpc.debridge.finance'] },
    },
    blockExplorers: {
      default: {
        name: 'Solana explorer',
        url: 'https://explorer.solana.com',
        tokenUrlPattern: 'https://explorer.solana.com/address/{0}',
      },
    },
  },
]
