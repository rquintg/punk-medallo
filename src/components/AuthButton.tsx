'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { LucideUserKey, UserRoundXIcon, PackageSearch, Ticket } from 'lucide-react'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) return null

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/cuenta/pedidos"
          className="hidden items-center gap-2 rounded-md border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-white transition-colors hover:border-[#a40202] hover:text-[#dc2626] sm:flex"
          title="Mis pedidos"
        >
          <PackageSearch size={18} aria-hidden="true" />
          <span className="text-xs">Pedidos</span>
        </Link>
        <Link
          href="/cuenta/boletas"
          className="hidden items-center gap-2 rounded-md border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-white transition-colors hover:border-[#a40202] hover:text-[#dc2626] sm:flex"
          title="Mis boletas"
        >
          <Ticket size={18} aria-hidden="true" />
          <span className="text-xs">Boletas</span>
        </Link>
        <span className="text-xs text-white/50 block max-w-[100px] truncate">
          Hola {user.user_metadata?.name || user.email?.split('@')[0]}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-white transition-colors hover:border-[#a40202] hover:text-[#dc2626]"
        >
          <UserRoundXIcon size={18} aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/tienda/rastrear"
        className="flex items-center gap-2 rounded-md border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-white transition-colors hover:border-[#a40202] hover:text-[#dc2626]"
        title="Rastrear pedido"
      >
        <PackageSearch size={18} aria-hidden="true" />
        <span className="hidden text-xs md:inline">Rastrear</span>
      </Link>
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-md border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-white transition-colors hover:border-[#a40202] hover:text-[#dc2626]"
      >
        <LucideUserKey size={18} aria-hidden="true" />
      </Link>
    </div>
  )
}