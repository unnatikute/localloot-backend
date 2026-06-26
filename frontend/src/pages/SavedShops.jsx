import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth.jsx';
import { createApi } from '../api/client.js';
import { useStats } from '../store/stats.jsx';
import { getShopImage, DEFAULT_IMAGES } from '../utils/images.js';
import SafeImage from '../components/SafeImage.jsx';

export default function SavedShops() {
  const { token } = useAuth();
  const api = useMemo(() => createApi(token), [token]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const stats = useStats();

  useEffect(() => {
    let mounted = true;
    async function loadSavedShops() {
      setLoading(true);
      try {
        // Try API first
        const { data } = await api.get('/me/saved-shops');
        if (mounted) setShops(Array.isArray(data) ? data : []);
      } catch (e) {
        // Fallback to stats store (works without database)
        console.log('Using stats store for saved shops');
        if (mounted) {
          const savedFromStore = stats.savedShops || [];
          setShops(savedFromStore);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadSavedShops();
    return () => { mounted = false; };
  }, [api, stats.savedShops]);

  const handleUnsave = async (shopId) => {
    try {
      await api.delete(`/shops/${shopId}/save`);
    } catch (e) {
      // Continue even if API fails (works without database)
    }
    setShops((prev) => prev.filter((s) => String(s.id) !== String(shopId)));
    stats.removeSavedShop(shopId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your saved shops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⭐ Saved Shops</h1>
          <p className="text-gray-600 mt-1">{shops.length} shop{shops.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {shops.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="text-6xl mb-4">⭐</div>
          <p className="text-gray-600 text-lg">You haven't saved any shops yet.</p>
          <p className="text-gray-400 text-sm mt-2">Save shops to access them quickly later!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {shops.map((s) => (
            <div key={s.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              <SafeImage
                src={s?.image_url || s?.logo || s?.shopImage || s?.imageUrl}
                alt={s.name || s.shopName}
                fallback={DEFAULT_IMAGES.shop}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{s.name || s.shopName}</h3>
                <p className="text-sm text-gray-600 mb-2">{s.description || 'No description available.'}</p>
                {(s.area || s.area?.name) && (
                  <p className="text-xs text-gray-500 mb-2">📍 {typeof s.area === 'string' ? s.area : s.area?.name || 'Pune'}</p>
                )}
                {s.address && <p className="text-sm text-gray-600 mb-4">{s.address}</p>}
                {(s.phone || s.mobileNumber) && (
                  <p className="text-sm text-gray-600 mb-4">📞 {s.phone || s.mobileNumber}</p>
                )}
                <div className="flex gap-2">
                  <Link
                    to={`/shops/${s.id}`}
                    state={{ shop: s }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center transition-colors"
                  >
                    View Shop
                  </Link>
                  <button
                    onClick={() => handleUnsave(s.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    Unsave
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



