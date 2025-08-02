"use client"

import { motion } from "framer-motion"

export function CrystalDivider() {
  return (
    <div className="relative w-full h-32 overflow-hidden">
      {/* Base background that transitions from hero end to available-on start */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-primary/20" />

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Hero-end gradients (complex, matching hero section end) */}
          <linearGradient id="heroEndGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.1" />
            <stop offset="30%" stopColor="hsl(var(--primary-light))" stopOpacity="0.4" />
            <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--primary-light))" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="heroEndGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="40%" stopColor="hsl(var(--foreground))" stopOpacity="0.2" />
            <stop offset="80%" stopColor="hsl(var(--primary-light))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          </linearGradient>

          {/* Available-on start gradients (simpler, matching next section) */}
          <linearGradient id="availableStartGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="availableStartGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
          </linearGradient>

          {/* Transition gradients (blend between the two) */}
          <linearGradient id="transitionGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.08" />
            <stop offset="25%" stopColor="hsl(var(--primary-light))" stopOpacity="0.25" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="75%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
          </linearGradient>

          {/* Glow effects for crystals */}
          <filter id="crystalGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Large Crystal Shards - Hero End Colors */}
        <motion.polygon
          points="0,0 200,0 150,64 50,64"
          fill="url(#heroEndGradient1)"
          filter="url(#crystalGlow)"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        <motion.polygon
          points="180,0 400,0 380,80 160,60"
          fill="url(#heroEndGradient2)"
          filter="url(#crystalGlow)"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
        />

        {/* Medium Crystal Shards - Transition Colors */}
        <motion.polygon
          points="350,0 550,0 520,70 370,50"
          fill="url(#transitionGradient1)"
          filter="url(#crystalGlow)"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
        />

        <motion.polygon
          points="500,0 700,0 680,75 480,55"
          fill="url(#transitionGradient1)"
          filter="url(#crystalGlow)"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
        />

        {/* Small Crystal Shards - Available-On Start Colors */}
        <motion.polygon
          points="650,0 850,0 830,65 670,45"
          fill="url(#availableStartGradient1)"
          filter="url(#crystalGlow)"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
        />

        <motion.polygon
          points="800,0 1000,0 980,70 820,50"
          fill="url(#availableStartGradient2)"
          filter="url(#crystalGlow)"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 1.0, ease: "easeOut" }}
        />

        <motion.polygon
          points="950,0 1200,0 1200,60 970,40"
          fill="url(#availableStartGradient1)"
          filter="url(#crystalGlow)"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
        />

        {/* Floating Crystal Fragments */}
        <motion.polygon
          points="100,20 140,20 135,40 105,35"
          fill="url(#heroEndGradient1)"
          filter="url(#strongGlow)"
          animate={{
            y: [0, -5, 0],
            rotate: [0, 2, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <motion.polygon
          points="300,15 330,15 325,35 305,30"
          fill="url(#transitionGradient1)"
          filter="url(#strongGlow)"
          animate={{
            y: [0, -8, 0],
            rotate: [0, -3, 0],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: 4,
            delay: 0.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <motion.polygon
          points="600,25 625,25 620,40 605,38"
          fill="url(#availableStartGradient1)"
          filter="url(#strongGlow)"
          animate={{
            y: [0, -6, 0],
            rotate: [0, 4, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3.5,
            delay: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <motion.polygon
          points="900,18 920,18 918,32 902,30"
          fill="url(#availableStartGradient2)"
          filter="url(#strongGlow)"
          animate={{
            y: [0, -4, 0],
            rotate: [0, -2, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 4.5,
            delay: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Connecting Light Rays */}
        <motion.line
          x1="150"
          y1="32"
          x2="300"
          y2="25"
          stroke="hsl(var(--primary))"
          strokeWidth="0.5"
          strokeOpacity="0.4"
          strokeDasharray="3,6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 2, ease: "easeInOut" }}
        />

        <motion.line
          x1="315"
          y1="25"
          x2="610"
          y2="32"
          stroke="hsl(var(--primary-light))"
          strokeWidth="0.5"
          strokeOpacity="0.3"
          strokeDasharray="4,8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 2.5, ease: "easeInOut" }}
        />

        <motion.line
          x1="612"
          y1="32"
          x2="910"
          y2="25"
          stroke="hsl(var(--primary))"
          strokeWidth="0.5"
          strokeOpacity="0.2"
          strokeDasharray="2,10"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 3, ease: "easeInOut" }}
        />

        {/* Bottom fill to ensure seamless connection */}
        <rect x="0" y="80" width="1200" height="48" fill="url(#availableStartGradient1)" opacity="0.8" />
      </svg>

      {/* Subtle overlay for final blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-primary/15 pointer-events-none" />
    </div>
  )
}
