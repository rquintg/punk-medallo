import { getProductosFiltrados } from '@/features/tienda/services/products';
import ProductCard from '@/components/tienda/product-card';

interface RelatedProductsProps {
  categoriaId: string | null;
  excludeId: string;
}

export async function RelatedProducts({ categoriaId, excludeId }: RelatedProductsProps) {
  if (!categoriaId) return null;

  const productos = await getProductosFiltrados({ categoria_id: categoriaId });
  const relacionados = productos.filter((p) => p.id !== excludeId).slice(0, 4);

  if (relacionados.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-8 text-xl font-bold text-white">Productos relacionados</h2>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {relacionados.map((producto) => (
          <ProductCard key={producto.id} product={producto} />
        ))}
      </div>
    </section>
  );
}
