'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface Props {
  /** A full payment URI to encode, e.g. a `upi://pay?...` deep link. */
  value: string
  /** Pixel size of the rendered QR. */
  size?: number
}

/**
 * Renders any payment string as a scannable QR code, generated client-side
 * (no third-party image service). Scanning a UPI link opens the customer's
 * banking / GPay / PhonePe app with the payee + amount pre-filled.
 */
export default function PaymentQR({ value, size = 200 }: Props) {
  const [dataUrl, setDataUrl] = useState<string>('')

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: { dark: '#1a1206', light: '#ffffff' },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(''))
  }, [value, size])

  if (!dataUrl) {
    return (
      <div
        className="animate-pulse rounded-xl bg-white/10"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="Scan to pay the advance via UPI"
      width={size}
      height={size}
      className="rounded-xl bg-white p-2"
    />
  )
}
