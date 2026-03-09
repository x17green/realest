'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const Phase2DemoContent = dynamic(() => import('@/components/marketing/Phase2DemoContent'), { ssr: false })

export default function Phase2DemoPage() {
  return <Phase2DemoContent />
}
