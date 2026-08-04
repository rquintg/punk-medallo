"use client";

import Image from "next/image";
import { useState } from "react";
import { AlbumCoverPlaceholder } from "./album-cover-placeholder";

interface CoverImageProps {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

export function CoverImage({
  src,
  alt,
  sizes,
  className,
  priority,
}: CoverImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <AlbumCoverPlaceholder />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}
