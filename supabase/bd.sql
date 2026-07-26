-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.productos (
                                  id text NOT NULL,
                                  slug text NOT NULL UNIQUE,
                                  nombre text NOT NULL,
                                  descripcion text NOT NULL,
                                  precio integer NOT NULL,
                                  categoria USER-DEFINED NOT NULL,
                                  genero USER-DEFINED NOT NULL DEFAULT 'unisex'::genero,
                                  tallas_disponibles ARRAY NOT NULL DEFAULT '{}'::text[],
                                  colores_disponibles ARRAY NOT NULL DEFAULT '{}'::text[],
                                  stock integer NOT NULL DEFAULT 0,
                                  destacado boolean NOT NULL DEFAULT false,
                                  fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
                                  CONSTRAINT productos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.producto_imagenes (
                                          id uuid NOT NULL DEFAULT gen_random_uuid(),
                                          producto_id text NOT NULL,
                                          url text NOT NULL,
                                          alt text NOT NULL DEFAULT ''::text,
                                          orden integer NOT NULL DEFAULT 0,
                                          CONSTRAINT producto_imagenes_pkey PRIMARY KEY (id),
                                          CONSTRAINT producto_imagenes_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);
CREATE TABLE public.perfiles (
                                 id uuid NOT NULL,
                                 nombre text,
                                 telefono text,
                                 direccion text,
                                 ciudad text,
                                 CONSTRAINT perfiles_pkey PRIMARY KEY (id),
                                 CONSTRAINT perfiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.pedidos (
                                id uuid NOT NULL DEFAULT gen_random_uuid(),
                                usuario_id uuid,
                                nombre_entrega text NOT NULL,
                                email text NOT NULL,
                                telefono text NOT NULL,
                                direccion text NOT NULL,
                                ciudad text NOT NULL,
                                total integer NOT NULL,
                                estado USER-DEFINED NOT NULL DEFAULT 'pendiente'::estado_pedido,
                                created_at timestamp with time zone NOT NULL DEFAULT now(),
                                numero_pedido text NOT NULL UNIQUE,
                                CONSTRAINT pedidos_pkey PRIMARY KEY (id),
                                CONSTRAINT pedidos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id)
);
CREATE TABLE public.pedido_items (
                                     id uuid NOT NULL DEFAULT gen_random_uuid(),
                                     pedido_id uuid NOT NULL,
                                     producto_id text,
                                     nombre text NOT NULL,
                                     precio integer NOT NULL,
                                     talla text,
                                     color text,
                                     cantidad integer NOT NULL,
                                     imagen_url text,
                                     CONSTRAINT pedido_items_pkey PRIMARY KEY (id),
                                     CONSTRAINT pedido_items_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id),
                                     CONSTRAINT pedido_items_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);