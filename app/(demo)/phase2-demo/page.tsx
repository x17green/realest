'use client'

import React from 'react'
import dynamic from 'next/dynamic'

import { RealEstThemeProvider } from '@/components/providers/realest-theme-provider'

const Phase2DemoContent = dynamic(() => import('@/components/phase2-demo-content'), { ssr: false })

export default function Phase2DemoPage() {
  return (
    <RealEstThemeProvider defaultTheme="light">
      <Phase2DemoContent />
    </RealEstThemeProvider>
  )
}
