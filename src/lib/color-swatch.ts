const KNOWN_COLORS: Record<string, string> = {
  Negro: '#1a1a1a',
  Blanco: '#f0f0f0',
  Rojo: '#dc2626',
  'Azul marino': '#1e3a5f',
  Azul: '#2563eb',
  'Azul claro': '#60a5fa',
  Verde: '#16a34a',
  'Verde militar': '#4a5d23',
  'Verde oliva': '#6b8e23',
  Amarillo: '#eab308',
  Naranja: '#ea580c',
  Morado: '#7c3aed',
  Rosa: '#ec4899',
  'Rosa claro': '#f9a8d4',
  Gris: '#6b7280',
  'Gris claro': '#d1d5db',
  'Gris oscuro': '#374151',
  Marrón: '#78350f',
  Beige: '#f5e6d3',
  Crema: '#fef3c7',
  Dorado: '#b8860b',
  Plateado: '#9ca3af',
  Borgoña: '#800020',
  Caqui: '#c3b091',
  Turquesa: '#14b8a6',
  Coral: '#f87171',
  Lavanda: '#c084fc',
  Mostaza: '#e6a817',
  'Vino tinto': '#722f37',
  'Rojo oscuro': '#991b1b',
  'Azul cielo': '#93c5fd',
  'Verde menta': '#6ee7b7',
  Melón: '#fde68a',
  Fuchsia: '#d946ef',
  'Azul rey': '#1d4ed8',
  'Verde esmeralda': '#047857',
  Oliva: '#808000',
  Carbón: '#36454f',
  Marfil: '#fffff0',
  Lila: '#c8a2c8',
  'Azul petróleo': '#1c3d5a',
  'Verde bosque': '#228b22',
  Terracota: '#cc4e3a',
  'Naranja quemado': '#cc5500',
  'Arena': '#dbc7a1',
  'Gris pizarra': '#708090',
  'Verde lima': '#32cd32',
  Salmón: '#fa8072',
  'Azul acero': '#4682b4',
  Granate: '#800000',
}

export function getColorHex(colorName: string): string {
  const known = KNOWN_COLORS[colorName]
  if (known) return known

  let hash = 0
  for (let i = 0; i < colorName.length; i++) {
    hash = colorName.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }

  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 55%, 45%)`
}
