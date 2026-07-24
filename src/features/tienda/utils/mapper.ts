import type { Producto, ProductImage, Variante, Talla } from '../types';

interface DbProductImage {
  id: string;
  producto_id: string;
  url: string;
  alt: string;
  orden: number;
}

interface DbProductVariant {
  id: string;
  producto_id: string;
  talla: string | null;
  color: string | null;
  stock: number;
  sku: string | null;
}

interface DbProduct {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  genero: string;
  tallas_disponibles: string[];
  colores_disponibles: string[];
  stock: number;
  destacado: boolean;
  fecha_creacion: string;
  producto_imagenes: DbProductImage[] | null;
  producto_variantes?: DbProductVariant[] | null;
}

const TALLAS_VALIDAS: string[] = ['S', 'M', 'L', 'XL'];

function esTallaValida(valor: string): valor is Talla {
  return TALLAS_VALIDAS.includes(valor);
}

function mapVariantes(dbVariants?: DbProductVariant[] | null): Variante[] | undefined {
  if (!dbVariants || dbVariants.length === 0) return undefined;

  return dbVariants.map((v) => ({
    id: v.id,
    talla: v.talla && esTallaValida(v.talla) ? v.talla : null,
    color: v.color ?? null,
    stock: v.stock,
    sku: v.sku ?? null,
  }));
}

function uniqueSorted<T>(arr: T[]): T[] {
  return [...new Set(arr)].sort();
}

export function mapDbProductoToProducto(db: DbProduct): Producto {
  const imagenes: ProductImage[] = (db.producto_imagenes ?? [])
    .sort((a, b) => a.orden - b.orden)
    .map((img) => ({
      url: img.url,
      alt: img.alt,
      width: 800,
      height: 800,
    }));

  const variantes = mapVariantes(db.producto_variantes);

  if (variantes) {
    const tallas = uniqueSorted(
      variantes
        .filter((v): v is Variante & { talla: Talla } => v.talla !== null)
        .map((v) => v.talla),
    ) as Talla[];

    const colores = uniqueSorted(
      variantes
        .filter((v) => v.color !== null)
        .map((v) => v.color!),
    );

    const stock = variantes.reduce((sum, v) => sum + v.stock, 0);

    return {
      id: db.id,
      slug: db.slug,
      nombre: db.nombre,
      descripcion: db.descripcion,
      precio: db.precio,
      categoria: db.categoria as Producto['categoria'],
      genero: db.genero as Producto['genero'],
      tallasDisponibles: tallas,
      coloresDisponibles: colores,
      stock,
      variantes,
      fechaCreacion: db.fecha_creacion,
      destacado: db.destacado,
      imagenes,
    };
  }

  return {
    id: db.id,
    slug: db.slug,
    nombre: db.nombre,
    descripcion: db.descripcion,
    precio: db.precio,
    categoria: db.categoria as Producto['categoria'],
    genero: db.genero as Producto['genero'],
    tallasDisponibles: db.tallas_disponibles as Producto['tallasDisponibles'],
    coloresDisponibles: db.colores_disponibles,
    stock: db.stock,
    fechaCreacion: db.fecha_creacion,
    destacado: db.destacado,
    imagenes,
  };
}
