import type { Producto, Categoria, Genero } from '../types';

const U = 'https://images.unsplash.com/photo-';

const productos: Producto[] = [
  {
    id: '1',
    slug: 'camiseta-punk-medallo-logo',
    nombre: 'Camiseta Punk Medallo Logo',
    descripcion:
      'Camiseta oficial de Punk Medallo con logo serigrafiado. Algodón premium 100%, costura reforzada y cuello ribeteado. Ideal para rodar por la ciudad o aguantar ron en el underground.',
    precio: 65000,
    imagenes: [
      { url: `${U}1576566588028-4147f3842f27?w=800&auto=format&fit=crop`, alt: 'Camiseta Punk Medallo Logo frente', width: 800, height: 800 },
      { url: `${U}1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop`, alt: 'Camiseta Punk Medallo Logo espalda', width: 800, height: 800 },
    ],
    categoria: 'camisetas' as Categoria,
    genero: 'hombre' as Genero,
    tallasDisponibles: ['S', 'M', 'L', 'XL'],
    coloresDisponibles: ['Negro', 'Blanco'],
    stock: 0,
    fechaCreacion: '2026-01-15T00:00:00Z',
    destacado: true,
  },
  {
    id: '2',
    slug: 'camiseta-medallo-brutal',
    nombre: 'Camiseta Medallo Brutal',
    descripcion:
      'Diseño exclusivo "Medallo Brutal" con calavera punk. Estampado en alta calidad que no se cuartea ni desteñe. Algodón peinado 24.1 oz, costuras dobles.',
    precio: 72000,
    imagenes: [
      { url: `${U}1565383690591-1ee1b6582cef?w=800&auto=format&fit=crop`, alt: 'Camiseta Medallo Brutal frente', width: 800, height: 800 },
      { url: `${U}1618354691438-25bc04584c23?w=800&auto=format&fit=crop`, alt: 'Camiseta Medallo Brutal espalda', width: 800, height: 800 },
    ],
    categoria: 'camisetas' as Categoria,
    genero: 'hombre' as Genero,
    tallasDisponibles: ['M', 'L', 'XL'],
    coloresDisponibles: ['Negro', 'Rojo'],
    stock: 8,
    fechaCreacion: '2026-02-10T00:00:00Z',
    destacado: true,
  },
  {
    id: '3',
    slug: 'camiseta-ruido-subterraneo',
    nombre: 'Camiseta Ruido Subterráneo',
    descripcion:
      'Edición limitada "Ruido Subterráneo". Serigrafía a 4 tintas sobre algodón orgánico negro. Cada unidad viene numerada. No te la vas a encontrar en cualquier local.',
    precio: 78000,
    imagenes: [
      { url: `${U}1618354691373-d851c5c3a990?w=800&auto=format&fit=crop`, alt: 'Camiseta Ruido Subterráneo frente', width: 800, height: 800 },
      { url: `${U}1666358057084-5f63d94d6958?w=800&auto=format&fit=crop`, alt: 'Camiseta Ruido Subterráneo espalda', width: 800, height: 800 },
    ],
    categoria: 'camisetas' as Categoria,
    genero: 'hombre' as Genero,
    tallasDisponibles: ['S', 'M', 'L'],
    coloresDisponibles: ['Negro'],
    stock: 4,
    fechaCreacion: '2026-03-05T00:00:00Z',
    destacado: false,
  },
  {
    id: '4',
    slug: 'camiseta-sangre-punk',
    nombre: 'Camiseta Sangre Punk',
    descripcion:
      'Clásica camiseta de manga corta con diseño "Sangre Punk". Estampado tipo screen, costura overlock, resistente al lavado industrial. Pa la banda que suda hasta el alma.',
    precio: 60000,
    imagenes: [
      { url: `${U}1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop`, alt: 'Camiseta Sangre Punk frente', width: 800, height: 800 },
      { url: `${U}1571455786673-9d9d6c194f90?w=800&auto=format&fit=crop`, alt: 'Camiseta Sangre Punk espalda', width: 800, height: 800 },
    ],
    categoria: 'camisetas' as Categoria,
    genero: 'hombre' as Genero,
    tallasDisponibles: ['S', 'M', 'L', 'XL'],
    coloresDisponibles: ['Negro', 'Blanco', 'Rojo'],
    stock: 20,
    fechaCreacion: '2026-01-20T00:00:00Z',
    destacado: true,
  },
  {
    id: '5',
    slug: 'parche-punk-medallo',
    nombre: 'Parche Punk Medallo',
    descripcion:
      'Parche bordado de alta densidad 3 mm. Medida 10x4 cm. Ideal para chalecos, chaquetas, mochilas o tu chamarra de mezclilla. Velcro al dorso o para coser.',
    precio: 12000,
    imagenes: [
      { url: `${U}1507525586584-6a9c816efbed?w=800&auto=format&fit=crop`, alt: 'Parche Punk Medallo', width: 800, height: 800 },
    ],
    categoria: 'accesorios' as Categoria,
    genero: 'unisex' as Genero,
    tallasDisponibles: [],
    coloresDisponibles: [],
    stock: 50,
    fechaCreacion: '2026-02-01T00:00:00Z',
    destacado: true,
  },
  {
    id: '6',
    slug: 'pin-esmalte',
    nombre: 'Pin Esmalte Punk Medallo',
    descripcion:
      'Pin de esmalte duro con logo Punk Medallo. Medida 2.5 cm. Cierre de mariposa dorado. Colecciónala, pégala en tu solapa o intercámbiala en los toques.',
    precio: 8000,
    imagenes: [
      { url: `${U}1521249730512-fddd11477549?w=800&auto=format&fit=crop`, alt: 'Pin Esmalte Punk Medallo', width: 800, height: 800 },
    ],
    categoria: 'accesorios' as Categoria,
    genero: 'unisex' as Genero,
    tallasDisponibles: [],
    coloresDisponibles: [],
    stock: 100,
    fechaCreacion: '2026-02-15T00:00:00Z',
    destacado: false,
  },
  {
    id: '7',
    slug: 'sticker-pack',
    nombre: 'Sticker Pack Punk Medallo',
    descripcion:
      'Pack de 10 stickers vinilo laminados mate. 5 diseños distintos (2 de cada uno). Resistentes al sol y al agua, pa que los pegues donde caiga la noche.',
    precio: 10000,
    imagenes: [
      { url: `${U}1761276297637-4418549ead2d?w=800&auto=format&fit=crop`, alt: 'Sticker Pack Punk Medallo', width: 800, height: 800 },
    ],
    categoria: 'accesorios' as Categoria,
    genero: 'unisex' as Genero,
    tallasDisponibles: [],
    coloresDisponibles: [],
    stock: 200,
    fechaCreacion: '2026-03-01T00:00:00Z',
    destacado: false,
  },
  {
    id: '8',
    slug: 'camiseta-punk-medallo-mujer',
    nombre: 'Camiseta Punk Medallo Mujer',
    descripcion:
      'Camiseta mujeril oficial de Punk Medallo con logo serigrafiado. Corte entallado, algodón premium 100%, costura reforzada. Diseñada pa las bandas que mandan en la escena.',
    precio: 65000,
    imagenes: [
      { url: `${U}1576566588028-4147f3842f27?w=800&auto=format&fit=crop`, alt: 'Camiseta Punk Medallo Mujer frente', width: 800, height: 800 },
      { url: `${U}1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop`, alt: 'Camiseta Punk Medallo Mujer espalda', width: 800, height: 800 },
    ],
    categoria: 'camisetas' as Categoria,
    genero: 'mujer' as Genero,
    tallasDisponibles: ['S', 'M', 'L', 'XL'],
    coloresDisponibles: ['Negro', 'Blanco'],
    stock: 15,
    fechaCreacion: '2026-04-10T00:00:00Z',
    destacado: true,
  },
  {
    id: '9',
    slug: 'camiseta-sangre-punk-mujer',
    nombre: 'Camiseta Sangre Punk Mujer',
    descripcion:
      'Versión mujeril del clásico diseño "Sangre Punk". Corte entallado, estampado tipo screen, costura overlock. Pa las bandas que sueltan el alma en cada toque.',
    precio: 60000,
    imagenes: [
      { url: `${U}1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop`, alt: 'Camiseta Sangre Punk Mujer frente', width: 800, height: 800 },
      { url: `${U}1571455786673-9d9d6c194f90?w=800&auto=format&fit=crop`, alt: 'Camiseta Sangre Punk Mujer espalda', width: 800, height: 800 },
    ],
    categoria: 'camisetas' as Categoria,
    genero: 'mujer' as Genero,
    tallasDisponibles: ['S', 'M', 'L'],
    coloresDisponibles: ['Negro', 'Rojo'],
    stock: 10,
    fechaCreacion: '2026-04-15T00:00:00Z',
    destacado: true,
  },
  {
    id: '10',
    slug: 'camiseta-medallo-brutal-mujer',
    nombre: 'Camiseta Medallo Brutal Mujer',
    descripcion:
      'Versión mujeril del diseño "Medallo Brutal" con calavera punk. Corte entallado, estampado en alta calidad que no se cuartea ni desteñe. Algodón peinado 24.1 oz.',
    precio: 72000,
    imagenes: [
      { url: `${U}1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop`, alt: 'Camiseta Medallo Brutal Mujer frente', width: 800, height: 800 },
      { url: `${U}1618354691438-25bc04584c23?w=800&auto=format&fit=crop`, alt: 'Camiseta Medallo Brutal Mujer espalda', width: 800, height: 800 },
    ],
    categoria: 'camisetas' as Categoria,
    genero: 'mujer' as Genero,
    tallasDisponibles: ['S', 'M', 'L'],
    coloresDisponibles: ['Negro', 'Rojo'],
    stock: 12,
    fechaCreacion: '2026-05-01T00:00:00Z',
    destacado: true,
  },
  {
    id: '11',
    slug: 'camiseta-ruido-subterraneo-mujer',
    nombre: 'Camiseta Ruido Subterráneo Mujer',
    descripcion:
      'Edición limitada "Ruido Subterráneo" para mujer. Serigrafía a 4 tintas sobre algodón orgánico. Corte entallado, cada unidad numerada. Pa las que hacen ruido.',
    precio: 78000,
    imagenes: [
      { url: `${U}1666358057084-5f63d94d6958?w=800&auto=format&fit=crop`, alt: 'Camiseta Ruido Subterráneo Mujer frente', width: 800, height: 800 },
      { url: `${U}1571455786673-9d9d6c194f90?w=800&auto=format&fit=crop`, alt: 'Camiseta Ruido Subterráneo Mujer espalda', width: 800, height: 800 },
    ],
    categoria: 'camisetas' as Categoria,
    genero: 'mujer' as Genero,
    tallasDisponibles: ['S', 'M', 'L'],
    coloresDisponibles: ['Negro'],
    stock: 8,
    fechaCreacion: '2026-05-10T00:00:00Z',
    destacado: false,
  },
];

export async function getProductos(): Promise<Producto[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...productos]), 300);
  });
}

export async function getProductosDestacados(): Promise<Producto[]> {
  const destacados = productos.filter((p) => p.destacado);
  return new Promise((resolve) => {
    setTimeout(() => resolve([...destacados]), 200);
  });
}

export async function getProductoBySlug(slug: string): Promise<Producto | null> {
  const producto = productos.find((p) => p.slug === slug) ?? null;
  return new Promise((resolve) => {
    setTimeout(() => resolve(producto), 200);
  });
}

export async function getProductosByCategoria(categoria: Categoria): Promise<Producto[]> {
  const filtrados = productos.filter((p) => p.categoria === categoria);
  return new Promise((resolve) => {
    setTimeout(() => resolve([...filtrados]), 200);
  });
}

export async function getProductosByQuery(query: string): Promise<Producto[]> {
  const q = query.toLowerCase().trim();
  if (!q) return [...productos];
  const filtrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q) ||
      p.genero.toLowerCase().includes(q),
  );
  return new Promise((resolve) => {
    setTimeout(() => resolve([...filtrados]), 200);
  });
}

export type { Categoria };
