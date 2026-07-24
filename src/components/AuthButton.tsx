'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { LucideUserKey, UserRoundXIcon, Shield } from 'lucide-react'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [rol, setRol] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', data.user.id)
          .single()
        setRol(perfil?.rol ?? null)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', session.user.id)
          .single()
        setRol(perfil?.rol ?? null)
      } else {
        setRol(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setRol(null)
  }

  const isAdmin = rol === 'editor' || rol === 'admin' || rol === 'super_admin'

  if (loading) return null

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-1 rounded-md border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-300 transition-colors hover:border-[#a40202] hover:text-[#dc2626]"
          >
            <Shield size={16} />
          </Link>
        )}
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
    <Link
      href="/login"
      className="flex items-center gap-2 rounded-md border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-white transition-colors hover:border-[#a40202] hover:text-[#dc2626]"
    >
      <LucideUserKey size={18} aria-hidden="true" />
    </Link>
  )
}