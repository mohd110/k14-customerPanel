import { Badge } from '@/components/ui/badge'
import { OrderStatus } from '@/lib/types'

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending:          { label: 'Pending',        className: 'bg-neutral-800    text-neutral-200   border-transparent' },
  accepted:         { label: 'Accepted',       className: 'bg-blue-100    text-blue-700   border-transparent' },
  preparing:        { label: 'Preparing',      className: 'bg-yellow-100  text-yellow-700 border-transparent' },
  ready:            { label: 'Ready',          className: 'bg-[#10241a]   text-green-400  border-transparent' },
  out_for_delivery: { label: 'On the Way',     className: 'bg-orange-100  text-orange-700 border-transparent' },
  delivered:        { label: 'Delivered',      className: 'bg-[#10241a]   text-green-400  border-transparent' },
  cancelled:        { label: 'Cancelled',      className: 'bg-[#2a1416]     text-[#e23744]    border-transparent' },
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = statusConfig[status] ?? statusConfig.pending
  return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
}