export type Categoria = 'camisetas' | 'accesorios';

export type Talla = 'S' | 'M' | 'L' | 'XL';

export type Genero = 'hombre' | 'mujer' | 'unisex';

export interface ProductImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface Producto {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenes: ProductImage[];
  categoria: Categoria;
  genero: Genero;
  tallasDisponibles: Talla[];
  coloresDisponibles: string[];
  stock: number;
  fechaCreacion: string;
  destacado: boolean;
}

export interface CartItem extends Producto {
  tallaSeleccionada: Talla | null;
  colorSeleccionado: string | null;
  cantidad: number;
}
