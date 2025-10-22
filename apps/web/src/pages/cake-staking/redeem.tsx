import { SUPPORT_CAKE_STAKING } from 'config/constants/supportChains'
import { VeCakeRedeem } from 'views/CakeStaking/VeCakeRedeem'

const CakeStakingPage = () => <VeCakeRedeem />

CakeStakingPage.chains = SUPPORT_CAKE_STAKING

export default CakeStakingPage
