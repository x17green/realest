'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const Phase2DemoContent = dynamic(() => import('@/components/phase2-demo-content'), { ssr: false })

export default function Phase2DemoPage() {
  return <Phase2DemoContent />
}
