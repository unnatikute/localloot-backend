import { Link } from 'react-router-dom';
import { useStats } from '../store/stats.jsx';
import { DEFAULT_IMAGES } from '../utils/images.js';
import SafeImage from './SafeImage.jsx';

export default function OfferCard({ offer, onLike, onBookmark, linkState, isLiked, isBookmarked }) {
  const stats = useStats();
  const liked = isLiked ?? (offer?.id && stats?.isOfferLiked?.(offer.id));
  const bookmarked = isBookmarked ?? (offer?.id && stats?.isOfferBookmarked?.(offer.id));

  const formatDuration = (ms) => {
    if (ms <= 0) return "Expired";
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const timeLeft = (() => {
    if (!offer?.validUntil || offer.status !== "APPROVED") return null;
    const now = new Date();
    const until = new Date(offer.validUntil);
    const diff = until - now;
    if (diff <= 0) return "Expired";
    return formatDuration(diff);
  })();

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/offers/${offer.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: offer.title,
          text: offer.description || offer.title,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.();
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark?.();
  };

   return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <div className="relative">
        <SafeImage
          src={offer?.image_url || offer?.imageUrl || offer?.image}
          alt={offer.title}
          fallback={DEFAULT_IMAGES.offer}
          className="w-full h-48 object-cover"
        />
        {offer.is_trending && (
            <span className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg">
              🔥 Trending
            </span>
          )}
        </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{offer.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {offer.description || 'No description available.'}
          </p>
          {offer.shop && (
            <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm font-semibold text-blue-700 mb-1">
                📍 Pune: {offer.shop.area?.name || offer.shop.area || 'Pune'}
              </p>
              <p className="text-xs text-gray-600">🏪 {offer.shop.name}</p>
            </div>
          )}
          {(offer.validFrom || offer.validUntil) && (
            <div className="mb-2 text-xs text-gray-500">
              {offer.validFrom && offer.validUntil && (
                <span>{new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validUntil).toLocaleDateString()}</span>
              )}
              {!offer.validFrom && offer.validUntil && (
                <span>Valid until {new Date(offer.validUntil).toLocaleDateString()}</span>
              )}
              {offer.validFrom && !offer.validUntil && (
                <span>Valid from {new Date(offer.validFrom).toLocaleDateString()}</span>
              )}
            </div>
          )}
          {timeLeft && (
            <div className="mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${timeLeft === 'Expired' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {timeLeft === 'Expired' ? 'Expired' : `Ends in ${timeLeft}`}
              </span>
            </div>
          )}
          {(offer.discount || offer.price) && (
            <div className="mb-3 flex items-center gap-3">
              {offer.discount && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                  {offer.discount}% OFF
                </span>
              )}
              {offer.price && (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-600">₹{offer.price}</span>
                  {offer.originalPrice && offer.originalPrice > offer.price && (
                    <span className="text-sm text-gray-400 line-through">₹{offer.originalPrice}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              liked
                ? 'bg-red-100 text-red-600 border border-red-300'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            {liked ? `❤️ Liked` : `🤍 Like`}
          </button>
          <button
            onClick={handleBookmark}
            className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              bookmarked
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
            }`}
          >
            {bookmarked ? `🔖 Saved` : `📑 Save`}
          </button>
          <button
            onClick={handleShare}
            className="px-3 py-2 text-sm rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors"
            title="Share"
          >
            📤
          </button>
          <Link
            to={`/offers/${offer.id}`}
            state={linkState}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
