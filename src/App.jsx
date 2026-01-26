import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { ProxyProvider, useProxy, STAGES } from './context/ProxyContext'
import { VaultEntrance } from './screens/VaultEntrance'
import { StealthEntry } from './screens/StealthEntry'
import { Diagnostic } from './screens/Diagnostic'
import { Revelation } from './screens/Revelation'
import { Letter } from './screens/Letter'
import { Dashboard } from './screens/Dashboard'

function FlowRouter() {
  const { stage } = useProxy()

  return (
    <AnimatePresence mode="wait">
      {stage === STAGES.VAULT_ENTRANCE && (
        <VaultEntrance key="vault-entrance" />
      )}
      {stage === STAGES.STEALTH_ENTRY && (
        <StealthEntry key="stealth-entry" />
      )}
      {stage === STAGES.DIAGNOSTIC && (
        <Diagnostic key="diagnostic" />
      )}
      {stage === STAGES.REVELATION && (
        <Revelation key="revelation" />
      )}
      {stage === STAGES.LETTER && (
        <Letter key="letter" />
      )}
      {stage === STAGES.DASHBOARD && (
        <Dashboard key="dashboard" />
      )}
    </AnimatePresence>
  )
}

function App() {
  return (
    <AuthProvider>
      <ProxyProvider>
        <FlowRouter />
      </ProxyProvider>
    </AuthProvider>
  )
}

export default App
