'use client'

// House copyright mark (left) + build credit (extreme right). Shown across
// the customer panel. Brand names are proper nouns → not translated.
export default function BrandFooter({ className = '' }: { className?: string }) {
  return (
    <footer
      className={`flex items-center justify-between gap-3 px-4 py-3 text-[9px] text-neutral-500 ${className}`}
    >
      <span className="font-semibold uppercase tracking-wide text-neutral-400">
        k14 epicurian delight foods
      </span>
      <span className="text-right text-neutral-500">Powered by Taskshift AI</span>
    </footer>
  )
}
