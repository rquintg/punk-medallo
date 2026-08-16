'use client'

interface ToggleSwitchProps {
  name: string
  label: string
  description?: string
  defaultChecked?: boolean
}

export default function ToggleSwitch({ name, label, description, defaultChecked = false }: ToggleSwitchProps) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <div className="min-w-0">
        <span className="block text-sm font-medium text-[var(--admin-text)]">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-[var(--admin-text-dim)]">{description}</span>
        )}
      </div>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-[var(--admin-hover)] transition-colors has-[:checked]:bg-[var(--admin-accent)]">
        <input
          type="checkbox"
          name={name}
          value="true"
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-black/10 transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  )
}