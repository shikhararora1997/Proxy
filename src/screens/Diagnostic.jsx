import { useProxy, STAGES } from '../context/ProxyContext'
import { LensFocusPage } from '../components/transitions/LensFocus'
import { VectorOnboarding } from '../components/onboarding/VectorOnboarding'

/**
 * Diagnostic Screen - Vector-Based Onboarding
 *
 * Users calibrate 5 personality axes via sliders.
 * A radar chart shows their profile shape in real-time.
 * Euclidean distance matching determines the winning persona.
 */
export function Diagnostic() {
  const { setPersonaId, setStage } = useProxy()

  const handleComplete = (personaId) => {
    setPersonaId(personaId)
    // Small delay before transition to revelation
    setTimeout(() => {
      setStage(STAGES.REVELATION)
    }, 300)
  }

  return (
    <LensFocusPage>
      <VectorOnboarding onComplete={handleComplete} />
    </LensFocusPage>
  )
}
