import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ItemSeleccion {
  tipoId: string
  nombre: string
  precio: number
  cantidad: number
}

interface BoletasCheckoutState {
  slug: string | null
  items: ItemSeleccion[]
  clienteNombre: string
  telefono: string
  aceptaPrivacidad: boolean
  aceptaTerminosBoleteria: boolean
  cupon: { codigo: string; descuento: number } | null
  step: 1 | 2
  hydrated: boolean
  setHydrated: (v: boolean) => void
  setItems: (items: ItemSeleccion[], slug: string) => void
  setField: (patch: Partial<Pick<BoletasCheckoutState, 'clienteNombre' | 'telefono' | 'aceptaPrivacidad' | 'aceptaTerminosBoleteria' | 'step'>>) => void
  setCupon: (cupon: { codigo: string; descuento: number } | null) => void
  setStep: (step: 1 | 2) => void
  clear: () => void
  subtotal: () => number
  total: () => number
  validateStep1: () => string | null
}

export const useBoletasCheckout = create<BoletasCheckoutState>()(
  persist(
    (set, get) => ({
      slug: null,
      items: [],
      clienteNombre: '',
      telefono: '',
      aceptaPrivacidad: false,
      aceptaTerminosBoleteria: false,
      cupon: null,
      step: 1,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      setItems: (items, slug) => set({ items, slug, step: 1 }),
      setField: (patch) => set(patch),
      setCupon: (cupon) => set({ cupon }),
      setStep: (step) => set({ step }),
      clear: () => set({ items: [], slug: null, cupon: null, step: 1 }),
      subtotal: () => get().items.reduce((s, i) => s + i.precio * i.cantidad, 0),
      total: () => Math.max(0, get().subtotal() - (get().cupon?.descuento ?? 0)),
      validateStep1: () => {
        const { clienteNombre, telefono, aceptaPrivacidad, aceptaTerminosBoleteria } = get()
        if (!clienteNombre.trim() || clienteNombre.trim().length < 2) return 'Ingresa tu nombre completo'
        if (telefono.replace(/\D/g, '').length < 10) return 'El telefono debe tener al menos 10 digitos (ej: 3001234567)'
        if (!aceptaPrivacidad) return 'Debes aceptar la politica de privacidad'
        if (!aceptaTerminosBoleteria) return 'Debes aceptar los terminos de boleteria'
        return null
      },
    }),
    {
      name: 'pm-boletas-checkout-v2',
      version: 2,
      partialize: (state) => ({
        slug: state.slug,
        items: state.items,
        clienteNombre: state.clienteNombre,
        telefono: state.telefono,
        aceptaPrivacidad: state.aceptaPrivacidad,
        aceptaTerminosBoleteria: state.aceptaTerminosBoleteria,
        cupon: state.cupon,
        step: state.step,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
