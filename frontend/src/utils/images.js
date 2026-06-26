/** Verified working Unsplash fallbacks used across LocalLoot */
export const DEFAULT_IMAGES = {
  offer:
    "https://images.unsplash.com/photo-1516321318423-f06f70b504b5?q=80&w=800&auto=format&fit=crop",
  shop:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop",
  shopLogo:
    "https://images.unsplash.com/photo-1555939594-58d7cb561cea?q=80&w=200&auto=format&fit=crop",
  category:
    "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=800&auto=format&fit=crop",
  banner:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1600&auto=format&fit=crop",
  avatar:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&auto=format&fit=crop",
  food:
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop",
  fashion:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop",
  electronics:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop",
  beauty:
    "https://images.unsplash.com/photo-1544161515-81205f8991e2?q=80&w=800&auto=format&fit=crop",
};

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || "http://localhost:8080";

function firstValidUrl(...values) {
  for (const value of values) {
    if (value && String(value).trim()) return String(value).trim();
  }
  return null;
}

/**
 * Resolve image paths for display.
 * - Full http(s) URLs (Cloudinary, Unsplash) → used as-is
 * - /uploads/... relative paths → kept relative so Vite proxy forwards to backend
 * - Bare filenames → prefixed with /uploads/
 */
export function resolveImageUrl(url) {
  if (!url || !String(url).trim()) return null;
  const trimmed = String(url).trim();

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("//")
  ) {
    return trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  if (trimmed.startsWith("uploads/")) {
    return `/${trimmed}`;
  }
  // Unknown bare path — try backend origin (production fallback)
  if (import.meta.env.PROD) {
    return `${API_ORIGIN}/${trimmed}`;
  }
  return `/uploads/${trimmed}`;
}

export function getOfferImage(offer) {
  const raw = firstValidUrl(offer?.image_url, offer?.imageUrl, offer?.image);
  return resolveImageUrl(raw) || DEFAULT_IMAGES.offer;
}

export function getShopImage(shop) {
  const raw = firstValidUrl(
    shop?.image_url,
    shop?.logo,
    shop?.shopImage,
    shop?.imageUrl,
    shop?.image
  );
  return resolveImageUrl(raw) || DEFAULT_IMAGES.shop;
}

export function getShopLogo(shop) {
  const raw = firstValidUrl(
    shop?.logo,
    shop?.shopImage,
    shop?.image_url,
    shop?.imageUrl,
    shop?.image
  );
  return resolveImageUrl(raw) || DEFAULT_IMAGES.shopLogo;
}

export function getCategoryBanner(category) {
  const raw = firstValidUrl(category?.banner_image_url, category?.bannerImageUrl);
  return resolveImageUrl(raw) || DEFAULT_IMAGES.category;
}

/** Normalize API offer objects so image_url is always set */
export function normalizeOffer(offer) {
  if (!offer) return offer;
  const image = getOfferImage(offer);
  return {
    ...offer,
    image_url: image,
    imageUrl: image,
  };
}

/** Normalize API shop objects */
export function normalizeShop(shop) {
  if (!shop) return shop;
  const image = getShopImage(shop);
  return {
    ...shop,
    image_url: image,
    logo: getShopLogo(shop),
  };
}

export function onImageError(e, fallback = DEFAULT_IMAGES.offer) {
  if (e?.target && e.target.src !== fallback) {
    e.target.onerror = null;
    e.target.src = fallback;
  }
}
