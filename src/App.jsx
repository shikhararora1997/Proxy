import { AnimatePresence } from 'framer-motion'
import { ProxyProvider, useProxy, STAGES } from './context/ProxyContext'
import { StealthEntry } from './screens/StealthEntry'
import { Diagnostic } from './screens/Diagnostic'
import { Revelation } from './screens/Revelation'
import { Letter } from './screens/Letter'

function FlowRouter() {
  const { stage } = useProxy()

  return (
    <AnimatePresence mode="wait">
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
    </AnimatePresence>
  )
}

function App() {
  return (
    <ProxyProvider>
      <FlowRouter />
    </ProxyProvider>
  )
}

export default App
