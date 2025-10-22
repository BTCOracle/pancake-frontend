import Page from 'components/Layout/Page'
import { BurnDashboard } from 'views/BurnDashboard'

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Page>{children}</Page>
    </>
  )
}

const BurnDashboardPage = () => {
  return <BurnDashboard />
}

BurnDashboardPage.Layout = Layout
BurnDashboardPage.chains = []

export default BurnDashboardPage
