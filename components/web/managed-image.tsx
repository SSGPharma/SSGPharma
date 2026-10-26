"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Image from "next/image";
import { getStableMarketingFallback } from "@/lib/marketing-images";

type ManagedImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  style?: CSSProperties;
  fallbackSrc?: string;
};

function shouldSkipOptimization(src: string) {
  return src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("http://") || src.startsWith("https://") || src.endsWith(".svg");
}

function resolveFallbackImage(src: string | null | undefined, alt: string, fallbackSrc?: string): string {
  return fallbackSrc || getStableMarketingFallback(`${src || ""}:${alt}`);
}

export function ManagedImage({
  src,
  alt,
  className,
  fill,
  priority,
  style,
  fallbackSrc,
  ...props
}: ManagedImageProps) {
  const fallbackImage = resolveFallbackImage(src, alt, fallbackSrc);
  const resolvedSrc = src?.startsWith("images/") && process.env.NEXT_PUBLIC_CDN_URL
    ? `${process.env.NEXT_PUBLIC_CDN_URL.replace(/\/$/, "")}/${src.split("/").map(encodeURIComponent).join("/")}`
    : src || fallbackImage;

  return <ManagedImageInner key={`${src || ""}:${fallbackImage}`} src={resolvedSrc} alt={alt} className={className} fill={fill} priority={priority} style={style} fallbackImage={fallbackImage} {...props} />;
}

type ManagedImageInnerProps = Omit<ManagedImageProps, "fallbackSrc"> & {
  src: string;
  fallbackImage: string;
};

function ManagedImageInner({
  src,
  alt,
  className,
  fill,
  priority,
  style,
  fallbackImage,
  ...props
}: ManagedImageInnerProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      priority={priority}
      style={style}
      className={className}
      loading={priority ? undefined : "lazy"}
      unoptimized={shouldSkipOptimization(currentSrc)}
      onError={() => {
        if (currentSrc !== fallbackImage) {
          setCurrentSrc(fallbackImage);
        }
      }}
      {...props}
    />
  );
}
