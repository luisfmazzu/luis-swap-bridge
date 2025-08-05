'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

// Lazy load framer-motion components
export const motion = {
  div: dynamic(() => import('framer-motion').then(mod => mod.motion.div), { 
    ssr: false,
    loading: () => <div />
  }),
  section: dynamic(() => import('framer-motion').then(mod => mod.motion.section), { 
    ssr: false,
    loading: () => <section />
  }),
  button: dynamic(() => import('framer-motion').then(mod => mod.motion.button), { 
    ssr: false,
    loading: () => <button />
  }),
  span: dynamic(() => import('framer-motion').then(mod => mod.motion.span), { 
    ssr: false,
    loading: () => <span />
  }),
}

// Optional: Create a wrapper for common animation patterns
interface AnimatedWrapperProps {
  children: ReactNode
  className?: string
  initial?: object
  animate?: object
  transition?: object
  whileHover?: object
  whileTap?: object
}

export function AnimatedWrapper({ 
  children, 
  className, 
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  transition = { duration: 0.6 },
  whileHover,
  whileTap
}: AnimatedWrapperProps) {
  const MotionDiv = motion.div
  
  return (
    <MotionDiv
      initial={initial}
      animate={animate}
      transition={transition}
      whileHover={whileHover}
      whileTap={whileTap}
      className={className}
    >
      {children}
    </MotionDiv>
  )
}