'use client'

import { useLanguage, t } from '@/lib/k14-store'

// Drop-in translated text usable inside server components: <Txt en="..." hi="..." />.
// Renders Hindi when the login toggle is set to Hindi, English otherwise.
export default function Txt({ en, hi }: { en: string; hi: string }) {
  const { lang } = useLanguage()
  return <>{t(en, hi, lang)}</>
}
