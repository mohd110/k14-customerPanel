'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { Plus, Minus, Heart, Star, Clock, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { MENU, TOPPINGS_MAP } from '@/lib/menu'

function getCategoryEmoji(category: string) {
  switch (category) {
    case 'Biryani': return '🍛'
    case 'Gravy': return '🍲'
    case 'Breads': return '🫓'
    case 'Fry': return '🍗'
    case 'Kebabs': return '🍢'
    case 'Tandoor': return '🔥'
    case 'Desserts': return '🍧'
    case 'Combos': return '🍱'
    default: return '🍽'
  }
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  
  const product = MENU.find((item) => item.id === id)
  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)

  const [quantity, setQuantity] = useState(1)
  const [selectedToppings, setSelectedToppings] = useState<string[]>([])
  const [isFavorite, setIsFavorite] = useState(false)

  if (!product) {
    return (
      <div className="min-h-[100dvh] phone-screen flex flex-col items-center justify-center bg-neutral-900 px-5 text-center">
        <span className="text-5xl mb-4">🍽️</span>
        <h1 className="text-lg font-bold text-white mb-2">Item Not Found</h1>
        <button onClick={() => router.push('/menu')} className="px-6 py-2.5 bg-[#e23744] text-white font-bold rounded-xl cursor-pointer">
          Back to Menu
        </button>
      </div>
    )
  }

  // Calculate dynamic price based on selected toppings
  const activeToppingsPrice = TOPPINGS_MAP[product.category]?.reduce((sum, t) => {
    return selectedToppings.includes(t.name) ? sum + t.price : sum
  }, 0) || 0

  const itemTotalPrice = (product.price + activeToppingsPrice) * quantity

  function handleAddToCart() {
    if (!product) return

    const activeToppings = TOPPINGS_MAP[product.category]?.filter((t) =>
      selectedToppings.includes(t.name)
    ) || []

    const toppingsSuffix = activeToppings.length > 0
      ? ` (+ ${activeToppings.map(t => t.name).join(', ')})`
      : ''

    const finalName = `${product.name}${toppingsSuffix}`
    const finalPrice = product.price + activeToppings.reduce((sum, t) => sum + t.price, 0)
    const cartItemId = `${product.id}-${selectedToppings.join('-')}`

    addItem({
      id: cartItemId,
      name: finalName,
      price: finalPrice,
      description: product.description,
      photo_url: product.photo,
      is_available: true,
    })

    if (quantity > 1) {
      updateQuantity(cartItemId, quantity)
    }

    toast.success(`${finalName} added to cart!`)
    router.push('/menu')
  }

  return (
    <div className="min-h-[100dvh] phone-screen flex flex-col bg-[#0a0a0a] text-white pb-safe">
      {/* Header */}
      <header className="bg-neutral-900 sticky top-0 z-40 px-4 h-14 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 -ml-1 cursor-pointer">
            <ChevronLeft className="size-6 text-[#e23744]" />
          </button>
          <h1 className="text-base font-extrabold text-[#e23744]">Dish Details</h1>
        </div>
        <div className="w-8" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-28">
        {/* Product Image */}
        <div className="relative w-full aspect-square max-h-[300px] rounded-3xl overflow-hidden bg-neutral-900 mb-5 shadow-inner flex items-center justify-center text-8xl">
          {product.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.photo}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  parent.innerText = getCategoryEmoji(product.category);
                }
              }}
            />
          ) : (
            <span>{getCategoryEmoji(product.category)}</span>
          )}
          {/* Favorite heart button */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-900/85 hover:bg-neutral-900 flex items-center justify-center shadow-md backdrop-blur-sm cursor-pointer border border-neutral-800 transition-colors z-20"
          >
            <Heart className={`size-5 transition-colors ${isFavorite ? 'fill-[#e23744] text-[#e23744]' : 'text-neutral-300'}`} />
          </button>
        </div>

        {/* Title & Price Row */}
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-extrabold text-white leading-tight pr-4">
            {product.name}
          </h2>
          <span className="text-xl font-extrabold text-[#e23744] flex-shrink-0">
            ₹{product.price}
          </span>
        </div>

        {/* Rating and Duration */}
        <div className="flex items-center gap-3 text-xs font-semibold text-neutral-400 mb-4">
          <span className="flex items-center gap-1 text-amber-500 bg-[#2a2410] px-2 py-0.5 rounded-md">
            <Star className="size-3.5 fill-amber-500 text-amber-500" />
            4.8 (120+ reviews)
          </span>
          <span className="flex items-center gap-1 text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-md">
            <Clock className="size-3.5" />
            20–25 min
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-medium">
          {product.description}
        </p>

        {/* Optional Toppings */}
        {TOPPINGS_MAP[product.category] && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-extrabold text-white">Extra Toppings</h3>
              <span className="bg-neutral-800 text-neutral-400 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                Optional
              </span>
            </div>
            <div className="space-y-2.5">
              {TOPPINGS_MAP[product.category].map((topping) => {
                const isSelected = selectedToppings.includes(topping.name)
                return (
                  <label
                    key={topping.name}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#e23744] bg-[#2a1416]/10'
                        : 'border-neutral-800 hover:bg-neutral-900 bg-[#161616]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedToppings(selectedToppings.filter((t) => t !== topping.name))
                          } else {
                            setSelectedToppings([...selectedToppings, topping.name])
                          }
                        }}
                        className="rounded border-neutral-700 text-[#e23744] focus:ring-[#e23744] size-4 accent-[#e23744]"
                      />
                      <span className="text-xs font-bold text-neutral-200">{topping.name}</span>
                    </div>
                    <span className="text-xs font-extrabold text-neutral-400">+₹{topping.price}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] border-t border-neutral-800 px-5 pt-3.5 pb-6 bg-neutral-900 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] flex items-center justify-between gap-3 z-40">
        {/* Quantity capsule */}
        <div className="flex items-center bg-[#1c1c1c] rounded-full px-3 py-2 gap-4 h-13">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="text-neutral-400 hover:text-neutral-200 p-0.5 cursor-pointer"
          >
            <Minus className="size-4" strokeWidth={3} />
          </button>
          <span className="text-sm font-extrabold text-white w-4 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="text-neutral-400 hover:text-neutral-200 p-0.5 cursor-pointer"
          >
            <Plus className="size-4" strokeWidth={3} />
          </button>
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          className="flex-1 h-13 bg-[#e23744] hover:bg-[#c52d39] text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#e23744]/20 active:scale-[0.98] transition-all cursor-pointer text-sm"
        >
          Add to Cart &bull; ₹{itemTotalPrice}
        </button>
      </div>
    </div>
  )
}