// Prices are stored in whole rupees in the DB.
export const money = (rupees: number) => `₹${rupees.toLocaleString('en-IN')}`

// Human order reference, e.g. "k14/LKO/19062026/OR-3".
// The DB assigns `order_code` on insert (see migration 005); until that lands
// we fall back to a short slice of the UUID so older orders still render.
export function orderNumber(o: { order_code?: string | null; id: string }): string {
  return o.order_code || `#${o.id.slice(0, 8).toUpperCase()}`
}
