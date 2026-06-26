import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../store/auth.jsx';
import { createApi } from '../api/client.js';
import { useStats } from '../store/stats.jsx';
import { getShopImage, DEFAULT_IMAGES } from '../utils/images.js';
import SafeImage from '../components/SafeImage.jsx';

export default function ShopDetail() {
  const { shopId } = useParams();
  const location = useLocation();
  const { token } = useAuth();
  const api = useMemo(() => createApi(token), [token]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const stats = useStats();

  const isSaved = shop?.id && stats?.isShopSaved?.(shop.id);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const fromState = location.state?.shop;
      if (fromState) {
        setShop(fromState);
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get(`/shops/${shopId}`);
        if (mounted) setShop(data);
      } catch {
        // ignore for mock flow
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [api, shopId, location.state]);

  const handleFollowToggle = async () => {
    if (!shop) return;
    if (isSaved) {
      try {
        await api.delete(`/shops/${shop.id}/save`);
      } catch {}
      stats.removeSavedShop(shop.id);
    } else {
      try {
        await api.post(`/shops/${shop.id}/save`);
      } catch {}
      stats.addSavedShop(shop);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Shop not found</p>
        <Link to="/categories" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Categories
        </Link>
      </div>
    );
  }

 return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 p-6">
        <SafeImage
          src={shop?.image_url || shop?.logo || shop?.shopImage || shop?.imageUrl}
          alt={shop.name || shop.shopName}
          fallback={DEFAULT_IMAGES.shop}
          className="w-full md:w-64 h-64 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{shop.name || shop.shopName}</h1>
          <p className="text-gray-700 mt-1">{shop.description}</p>
          {shop.area && (
            <p className="text-sm font-semibold text-blue-700 mt-2">
              📍 Pune: {shop.area?.name || shop.area}
            </p>
          )}
          <p className="text-sm text-gray-600 mt-2">{shop.address}</p>
          {(shop.phone || shop.mobileNumber) && (
            <a
            href={`tel:${shop.phone || shop.mobileNumber}`}
            className="text-sm text-blue-600 hover:underline block mt-1"
          >
            📞 {shop.phone || shop.mobileNumber}
            </a>
          )}
          {shop.map_lat && shop.map_lng && (
            <a
              className="text-sm text-blue-600 hover:underline block mt-2"
              target="_blank"
              rel="noreferrer"
              href={`https://www.google.com/maps?q=${shop.map_lat},${shop.map_lng}`}
            >
              Open in Google Maps →
            </a>
          )}
          <div className="mt-4">
            <button
              onClick={handleFollowToggle}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isSaved
                  ? 'bg-amber-100 text-amber-700 border-2 border-amber-300 hover:bg-amber-200'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              {isSaved ? '✓ Saved Shop' : '+ Save Shop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
