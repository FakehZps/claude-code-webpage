import type { MDXComponents } from 'mdx/types'

export function getMDXComponents(): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="mb-6 mt-8 border-b border-neon-cyan/20 pb-2 font-orbitron text-2xl font-bold neon-text-cyan">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-6 font-orbitron text-xl font-bold neon-text-cyan">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-5 font-orbitron text-lg font-semibold text-neon-cyan/80">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mb-4 font-space-mono text-sm leading-relaxed text-gray-300">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-4 border-neon-cyan bg-surface px-4 py-3 font-space-mono text-sm text-neon-cyan">
        <span className="mr-2 opacity-60">&gt;_</span>
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="rounded bg-surface px-1.5 py-0.5 font-space-mono text-xs text-neon-yellow">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="my-4 overflow-x-auto border border-neon-cyan/30 bg-surface p-4 font-space-mono text-xs text-neon-cyan">
        {children}
      </pre>
    ),
    strong: ({ children }) => (
      <strong className="font-bold neon-text-yellow">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic neon-text-pink">{children}</em>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-neon-cyan underline underline-offset-2 transition-all duration-150 hover:neon-glow-cyan"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="mb-4 space-y-1 pl-4 font-space-mono text-sm text-gray-300">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 list-decimal space-y-1 pl-6 font-space-mono text-sm text-gray-300">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="flex gap-2">
        <span className="mt-0.5 shrink-0 text-neon-cyan">[&gt;]</span>
        <span>{children}</span>
      </li>
    ),
    hr: () => (
      <hr className="my-8 border-neon-cyan/30" />
    ),
  }
}
