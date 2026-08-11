'use client'

import { useMemo, useState } from 'react'
import { departamentos, OTRO_DEPARTAMENTO, OTRA_CIUDAD } from '@/data/colombia'

interface Props {
  departamento: string
  ciudad: string
  departamentoError?: string
  ciudadError?: string
  onDepartamentoChange: (value: string) => void
  onCiudadChange: (value: string) => void
}

const allDeptos = [...departamentos, OTRO_DEPARTAMENTO]

export default function CiudadDepartamentoSelect({
  departamento,
  ciudad,
  departamentoError,
  ciudadError,
  onDepartamentoChange,
  onCiudadChange,
}: Props) {
  const selectedDepto = useMemo(
    () => departamentos.find((d) => d.nombre === departamento),
    [departamento],
  )

  const [deptoCustom, setDeptoCustom] = useState(false)
  const [ciudadCustom, setCiudadCustom] = useState(false)

  const ciudades = selectedDepto ? selectedDepto.ciudades : [OTRA_CIUDAD]
  const isCustomDepto = deptoCustom || (!!departamento && !selectedDepto)
  const isCustomCiudad = ciudadCustom || (!!ciudad && !ciudades.includes(ciudad))

  function handleSelectDepto(nombre: string) {
    if (nombre === OTRO_DEPARTAMENTO.nombre) {
      setDeptoCustom(true)
      onDepartamentoChange('')
    } else {
      setDeptoCustom(false)
      onDepartamentoChange(nombre)
    }
    setCiudadCustom(false)
  }

  function handleSelectCiudad(val: string) {
    if (val === OTRA_CIUDAD) {
      setCiudadCustom(true)
      onCiudadChange('')
    } else {
      setCiudadCustom(false)
      onCiudadChange(val)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm text-neutral-300">
          Departamento *
        </label>
        <select
          value={isCustomDepto ? OTRO_DEPARTAMENTO.nombre : departamento}
          onChange={(e) => handleSelectDepto(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-red-600"
        >
          <option value="">Selecciona un departamento</option>
          {allDeptos.map((d) => (
            <option key={d.id} value={d.nombre}>
              {d.nombre}
            </option>
          ))}
        </select>
        {isCustomDepto && (
          <input
            type="text"
            value={departamento}
            onChange={(e) => onDepartamentoChange(e.target.value)}
            placeholder="Escribe el departamento"
            className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
          />
        )}
        {departamentoError && (
          <p className="mt-1 text-xs text-red-400">{departamentoError}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-neutral-300">
          Ciudad *
        </label>
        <select
          value={isCustomCiudad ? OTRA_CIUDAD : ciudad}
          onChange={(e) => handleSelectCiudad(e.target.value)}
          disabled={!departamento}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!departamento ? (
            <option value="">Primero selecciona un departamento</option>
          ) : (
            <>
              <option value="">Selecciona una ciudad</option>
              {ciudades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </>
          )}
        </select>
        {isCustomCiudad && (
          <input
            type="text"
            value={ciudad}
            onChange={(e) => onCiudadChange(e.target.value)}
            placeholder="Escribe la ciudad"
            className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
          />
        )}
        {ciudadError && (
          <p className="mt-1 text-xs text-red-400">{ciudadError}</p>
        )}
      </div>
    </div>
  )
}
