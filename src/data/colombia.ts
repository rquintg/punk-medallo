export interface Departamento {
  id: string
  nombre: string
  ciudades: string[]
}

export const OTRO_DEPARTAMENTO: Departamento = {
  id: 'otro',
  nombre: 'Otro departamento...',
  ciudades: ['Otra ciudad...'],
}

export const OTRA_CIUDAD = 'Otra ciudad...'

export const departamentos: Departamento[] = [
  {
    id: '05',
    nombre: 'Antioquia',
    ciudades: ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Rionegro', 'Apartadó', 'Turbo', OTRA_CIUDAD],
  },
  {
    id: '08',
    nombre: 'Atlántico',
    ciudades: ['Barranquilla', 'Soledad', 'Malambo', 'Puerto Colombia', 'Baranoa', OTRA_CIUDAD],
  },
  {
    id: '11',
    nombre: 'Bogotá D.C.',
    ciudades: ['Bogotá', OTRA_CIUDAD],
  },
  {
    id: '13',
    nombre: 'Bolívar',
    ciudades: ['Cartagena', 'Magangué', 'Turbaco', 'El Carmen de Bolívar', OTRA_CIUDAD],
  },
  {
    id: '15',
    nombre: 'Boyacá',
    ciudades: ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', OTRA_CIUDAD],
  },
  {
    id: '17',
    nombre: 'Caldas',
    ciudades: ['Manizales', 'La Dorada', 'Chinchiná', 'Villamaría', OTRA_CIUDAD],
  },
  {
    id: '18',
    nombre: 'Caquetá',
    ciudades: ['Florencia', 'San Vicente del Caguán', 'Cartagena del Chairá', OTRA_CIUDAD],
  },
  {
    id: '19',
    nombre: 'Cauca',
    ciudades: ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Miranda', OTRA_CIUDAD],
  },
  {
    id: '20',
    nombre: 'Cesar',
    ciudades: ['Valledupar', 'Aguachica', 'Codazzi', 'La Paz', OTRA_CIUDAD],
  },
  {
    id: '27',
    nombre: 'Chocó',
    ciudades: ['Quibdó', 'Istmina', 'Bahía Solano', 'Nuquí', OTRA_CIUDAD],
  },
  {
    id: '23',
    nombre: 'Córdoba',
    ciudades: ['Montería', 'Cereté', 'Sahagún', 'Lorica', 'Tierralta', OTRA_CIUDAD],
  },
  {
    id: '25',
    nombre: 'Cundinamarca',
    ciudades: ['Soacha', 'Fusagasugá', 'Zipaquirá', 'Facatativá', 'Chía', 'Madrid', OTRA_CIUDAD],
  },
  {
    id: '94',
    nombre: 'Guainía',
    ciudades: ['Inírida', OTRA_CIUDAD],
  },
  {
    id: '95',
    nombre: 'Guaviare',
    ciudades: ['San José del Guaviare', OTRA_CIUDAD],
  },
  {
    id: '41',
    nombre: 'Huila',
    ciudades: ['Neiva', 'Pitalito', 'Garzón', 'La Plata', OTRA_CIUDAD],
  },
  {
    id: '44',
    nombre: 'La Guajira',
    ciudades: ['Riohacha', 'Maicao', 'Uribia', 'Albania', OTRA_CIUDAD],
  },
  {
    id: '47',
    nombre: 'Magdalena',
    ciudades: ['Santa Marta', 'Ciénaga', 'Fundación', 'El Banco', OTRA_CIUDAD],
  },
  {
    id: '50',
    nombre: 'Meta',
    ciudades: ['Villavicencio', 'Acacías', 'Granada', 'Puerto López', OTRA_CIUDAD],
  },
  {
    id: '52',
    nombre: 'Nariño',
    ciudades: ['Pasto', 'Tumaco', 'Ipiales', 'Túquerres', OTRA_CIUDAD],
  },
  {
    id: '54',
    nombre: 'Norte de Santander',
    ciudades: ['Cúcuta', 'Ocaña', 'Pamplona', 'Los Patios', OTRA_CIUDAD],
  },
  {
    id: '86',
    nombre: 'Putumayo',
    ciudades: ['Mocoa', 'Puerto Asís', 'Valle del Guamuez', OTRA_CIUDAD],
  },
  {
    id: '63',
    nombre: 'Quindío',
    ciudades: ['Armenia', 'Calarcá', 'Montenegro', 'La Tebaida', OTRA_CIUDAD],
  },
  {
    id: '66',
    nombre: 'Risaralda',
    ciudades: ['Pereira', 'Dosquebradas', 'La Virginia', 'Santa Rosa de Cabal', OTRA_CIUDAD],
  },
  {
    id: '88',
    nombre: 'San Andrés y Providencia',
    ciudades: ['San Andrés', 'Providencia', OTRA_CIUDAD],
  },
  {
    id: '68',
    nombre: 'Santander',
    ciudades: ['Bucaramanga', 'Floridablanca', 'Girón', 'Barrancabermeja', 'San Gil', OTRA_CIUDAD],
  },
  {
    id: '70',
    nombre: 'Sucre',
    ciudades: ['Sincelejo', 'Corozal', 'Santiago de Tolú', 'San Marcos', OTRA_CIUDAD],
  },
  {
    id: '73',
    nombre: 'Tolima',
    ciudades: ['Ibagué', 'El Espinal', 'Honda', 'Melgar', 'Mariquita', OTRA_CIUDAD],
  },
  {
    id: '76',
    nombre: 'Valle del Cauca',
    ciudades: ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga', 'Yumbo', OTRA_CIUDAD],
  },
  {
    id: '91',
    nombre: 'Amazonas',
    ciudades: ['Leticia', 'Puerto Nariño', OTRA_CIUDAD],
  },
  {
    id: '81',
    nombre: 'Arauca',
    ciudades: ['Arauca', 'Arauquita', 'Saravena', OTRA_CIUDAD],
  },
  {
    id: '85',
    nombre: 'Casanare',
    ciudades: ['Yopal', 'Aguazul', 'Villanueva', 'Paz de Ariporo', OTRA_CIUDAD],
  },
  {
    id: '97',
    nombre: 'Vaupés',
    ciudades: ['Mitú', OTRA_CIUDAD],
  },
  {
    id: '99',
    nombre: 'Vichada',
    ciudades: ['Puerto Carreño', 'La Primavera', OTRA_CIUDAD],
  },
]

export function findDepartamento(value: string): Departamento | undefined {
  return departamentos.find(
    (d) => d.nombre === value || d.id === value,
  )
}

export function getCiudadesByDepartamento(nombre: string): string[] {
  const d = departamentos.find((d) => d.nombre === nombre)
  return d?.ciudades ?? []
}
