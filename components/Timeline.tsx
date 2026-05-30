'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import TimelineNode from './TimelineNode'
import YearWrapUpNode from './YearWrapUpNode'
import type { LogMeta } from '@/lib/mdx'

interface TimelineProps {
  logs: LogMeta[]
}

export default function Timeline({ logs }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 20%', 'end end'],
  })

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <div
      ref={containerRef}
      data-testid="timeline"
      className="relative mx-auto max-w-5xl px-4 pb-24"
    >
      {/* Vertical timeline line track (static faint background) */}
      <div
        className="absolute bottom-0 top-0 w-0.5 bg-neon-cyan/10"
        style={{ left: 'calc(50% - 1px)' }}
        aria-hidden="true"
      />
      {/* Mobile line position */}
      <div
        className="absolute bottom-0 top-0 w-0.5 bg-neon-cyan/10 md:hidden"
        style={{ left: 'calc(2rem - 1px)' }}
        aria-hidden="true"
      />

      {/* Animated line (desktop) */}
      <div
        className="absolute top-0 hidden w-0.5 overflow-hidden md:block"
        style={{ left: 'calc(50% - 1px)', bottom: 0 }}
        aria-hidden="true"
      >
        <motion.div
          className="w-full origin-top"
          style={{
            height: lineHeight,
            background: '#00f3ff',
            boxShadow: '0 0 8px #00f3ff, 0 0 20px #00f3ff',
          }}
        />
      </div>

      {/* Animated line (mobile) */}
      <div
        className="absolute top-0 w-0.5 overflow-hidden md:hidden"
        style={{ left: 'calc(2rem - 1px)', bottom: 0 }}
        aria-hidden="true"
      >
        <motion.div
          className="w-full origin-top"
          style={{
            height: lineHeight,
            background: '#00f3ff',
            boxShadow: '0 0 8px #00f3ff, 0 0 20px #00f3ff',
          }}
        />
      </div>

      {/* Nodes */}
      <div className="flex flex-col gap-12 pl-12 md:pl-0">
        {logs.map((log, index) => {
          if (log.category === 'roundup') {
            return <YearWrapUpNode key={log.slug} log={log} />
          }
          return (
            <motion.div
              key={log.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <TimelineNode
                log={log}
                side={index % 2 === 0 ? 'left' : 'right'}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
