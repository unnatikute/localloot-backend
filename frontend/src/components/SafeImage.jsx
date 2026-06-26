import { useEffect, useState } from "react";
import { resolveImageUrl, DEFAULT_IMAGES } from "../utils/images.js";

/**
 * Image with guaranteed fallback — uses React state so broken URLs
 * always swap to a hardcoded default (onError alone is unreliable in React).
 */
export default function SafeImage({
  src,
  alt = "",
  fallback = DEFAULT_IMAGES.offer,
  className = "",
  ...props
}) {
  const resolved = resolveImageUrl(src);
  const [imgSrc, setImgSrc] = useState(resolved || fallback);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const next = resolveImageUrl(src);
    setFailed(false);
    setImgSrc(next || fallback);
  }, [src, fallback]);

  const handleError = () => {
    if (!failed) {
      setFailed(true);
      setImgSrc(fallback);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
}
