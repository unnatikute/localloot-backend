import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth.jsx";
import { createApi } from "../api/client.js";
import { useStats } from "../store/stats.jsx";
import { normalizeOffer, DEFAULT_IMAGES } from "../utils/images.js";
import SafeImage from "../components/SafeImage.jsx";


export default function OfferDetail() {
  const { offerId } = useParams();
  const { token } = useAuth();
  const api = useMemo(() => createApi(token), [token]);
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const stats = useStats();

  const liked = offer?.id && stats?.isOfferLiked?.(offer.id);
  const bookmarked = offer?.id && stats?.isOfferBookmarked?.(offer.id);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const { data } = await api.get(`/offers/${offerId}`);
        if (mounted) setOffer(data);
      } catch (e) {
        console.error("Error loading offer:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [api, offerId]);

  const handleLike = async () => {
    if (!offer) return;

    try {
      if (liked) {
        await api.delete(`/offers/${offer.id}/like`);
        stats.removeLikedOffer(offer.id);
      } else {
        await api.post(`/offers/${offer.id}/like`);
        stats.addLikedOffer(offer);
      }
    } catch (e) {
      console.error("LIKE ERROR:", e.response?.data || e.message);
      alert("Like failed");
    }
  };

  const handleBookmark = async () => {
    if (!offer) return;

    try {
      if (bookmarked) {
        await api.delete(`/offers/${offer.id}/bookmark`);
        stats.removeBookmarkedOffer(offer.id);
      } else {
        await api.post(`/offers/${offer.id}/bookmark`);
        stats.addBookmarkedOffer(offer);
      }
    } catch (e) {
      console.error("BOOKMARK ERROR:", e.response?.data || e.message);
      alert("Bookmark failed");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/offers/${offer.id}`;
    const shareData = {
      title: offer.title,
      text: offer.description || offer.title,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Error copying to clipboard:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading offer details...</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Offer not found</p>
        <Link
          to="/categories"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Back to Categories
        </Link>
      </div>
    );
  }

  const shop = offer.shop;

  const hasMap = offer?.googleMapUrl;

  const mapEmbedUrl = hasMap
    ? `https://maps.google.com/maps?q=${offer.googleMapUrl}&z=15&output=embed`
    : null;

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-600">
        <Link to="/" className="hover:text-blue-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/categories" className="hover:text-blue-600">
          Categories
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{offer.title}</span>
      </nav>

       <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <SafeImage
              src={offer?.image_url || offer?.imageUrl || offer?.image}
              alt={offer.title}
              fallback={DEFAULT_IMAGES.offer}
              className="w-full h-96 object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {offer.title}
                  </h1>
                  {offer.is_trending && (
                    <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                      🔥 Trending
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {offer.description || "No description available."}
              </p>

              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={handleLike}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    liked
                      ? "bg-red-100 text-red-700 border-2 border-red-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300"
                  }`}
                >
                  {liked ? "❤️ Liked" : "🤍 Like"}
                </button>
                <button
                  onClick={handleBookmark}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    bookmarked
                      ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300"
                  }`}
                >
                  {bookmarked ? "🔖 Bookmarked" : "📑 Bookmark"}
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-2 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-300 transition-all"
                >
                  📤 Share
                </button>
              </div>
            </div>
          </div>

          {hasMap && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">📍 Location</h2>
                <div
                  className="rounded-lg overflow-hidden border-2 border-gray-200"
                  style={{ height: "400px" }}
                >
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={mapEmbedUrl}
                    title="Shop Location"
                  />
                </div>
                <a
                  href={offer.googleMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {shop && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Shop Details</h3>
              <div className="space-y-4">
                <SafeImage
                  src={shop?.image_url || shop?.logo || shop?.shopImage || shop?.imageUrl}
                  alt={shop.name}
                  fallback={DEFAULT_IMAGES.shop}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div>
                  <Link
                    to={`/shops/${shop.id}`}
                    state={{ shop }}
                    className="text-2xl font-bold text-blue-600 hover:text-blue-800"
                  >
                    {shop.name}
                  </Link>
                </div>
                {shop.description && (
                  <p className="text-gray-600 text-sm">{shop.description}</p>
                )}
                {shop.address && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Address:
                    </p>
                    <p className="text-gray-600 text-sm">{shop.address}</p>
                  </div>
                )}
                {shop.phone && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Phone:
                    </p>
                    <a
                      href={`tel:${shop.phone}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {shop.phone}
                    </a>
                  </div>
                )}
                {shop.area && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Area:
                    </p>
                    <p className="text-gray-600 text-sm">
                      Pune: {shop.area?.name || shop.area}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4">Offer Details</h3>
            <div className="space-y-3 text-sm">
              {offer.starts_at && (
                <div>
                  <p className="font-semibold text-gray-700">Starts:</p>
                  <p className="text-gray-600">
                    {new Date(offer.starts_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              {offer.ends_at && (
                <div>
                  <p className="font-semibold text-gray-700">Ends:</p>
                  <p className="text-gray-600">
                    {new Date(offer.ends_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              {offer.category && (
                <div>
                  <p className="font-semibold text-gray-700">Category:</p>
                  <p className="text-gray-600">
                    {offer.category?.name || offer.category}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
