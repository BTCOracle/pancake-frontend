import { useEffect } from 'react'
import type VConsole from 'vconsole'

const LoadVConsole: React.FC = () => {
  useEffect(() => {
    let vConsole: VConsole

    const loadVConsole = async () => {
      const V = (await import('vconsole')).default
      localStorage.setItem('vConsole_switch_y', `${window.innerHeight / 2}`)
      vConsole = new V()
    }
    loadVConsole()
    return () => {
      if (vConsole) {
        vConsole.destroy()
      }
    }
  }, [])
  return null
}

export default LoadVConsole
