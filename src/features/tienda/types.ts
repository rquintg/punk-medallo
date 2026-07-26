export type Talla = 'S' | 'M' | 'L' | 'XL';

export type Genero = 'hombre' | 'mujer' | 'unisex';

export type CategoriaInfo = {
  id: string
  nombre: string
  slug: string
}

export interface ProductImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface Variante {
  id: string;
  talla: Talla | null;
  color: string | null;
  stock: number;
  sku: string | null;
}

export interface Producto {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenes: ProductImage[];
  categoria_id: string | null;
  categoria: CategoriaInfo | null;
  genero: Genero;
  tallasDisponibles: Talla[];
  coloresDisponibles: string[];
  stock: number;
  variantes?: Variante[];
  fechaCreacion: string;
  destacado: boolean;
}

export interface CartItem extends Producto {
  variantId: string | null;
  tallaSeleccionada: Talla | null;
  colorSeleccionado: string | null;
  cantidad: number;
}

export interface PedidoItem {
  nombre: string;
  precio: number;
  talla: string | null;
  color: string | null;
  cantidad: number;
  imagen_url: string | null;
}

export type ProductoFilters = {
  categoria_id?: string
  genero?: Genero
  talla?: Talla
  precio_min?: number
  precio_max?: number
  q?: string
}
