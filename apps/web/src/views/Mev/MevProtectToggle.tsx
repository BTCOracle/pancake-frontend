import React from 'react'
import { MevSwapDetail } from './MevSwapDetail'
import { MevToggle } from './MevToggle'

export const MevProtectToggle: React.FC<{ size?: 'sm' | 'md' }> = ({ size }) => {
  return (
    <>
      <MevSwapDetail />
      <MevToggle size={size} />
    </>
  )
}
