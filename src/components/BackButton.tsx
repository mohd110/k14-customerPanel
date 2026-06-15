'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface BackButtonProps {
  className?: string
  iconClassName?: string
}

export default function BackButton({ 
  className = "p-1 -ml-1 cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center rounded-lg",
  iconClassName = "size-6 text-[#e23744]"
}: BackButtonProps) {
  const router = useRouter()
  return (
    <button 
      onClick={() => router.back()} 
      className={className} 
      aria-label="Go back"
    >
      <ChevronLeft className={iconClassName} />
    </button>
  )
}
