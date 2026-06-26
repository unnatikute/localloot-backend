import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Heart, Share2 } from 'lucide-react';
import { useApi } from '../api/client';
import { useStats } from '../store/stats';
import { DEFAULT_IMAGES } from '../utils/images.js';
import SafeImage from './SafeImage.jsx';

// Demo data for shops
const DEMO_SHOPS = [
  {
    id: 1,
    name: 'Pizza Palace',
    logo: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg',
    area: 'Downtown',
    rating: 4.5,
    reviews_count: 128,
    description: 'Authentic Italian pizzas with premium ingredients',
    category: 'Food',
    tags: ['Pizza', 'Italian', 'Dine-in', 'Delivery'],
    is_featured: true
  },
  {
    id: 2,
    name: 'Fashion Fiesta',
    logo: 'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg',
    area: 'Mall Road',
    rating: 4.8,
    reviews_count: 256,
    description: 'Latest fashion trends at affordable prices',
    category: 'Fashion',
    tags: ['Clothing', 'Accessories', 'Trending'],
    is_featured: true
  },
  {
    id: 3,
    name: 'Coffee Brew Co.',
    logo: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
    area: 'City Center',
    rating: 4.6,
    reviews_count: 189,
    description: 'Premium specialty coffee and pastries',
    category: 'Cafe',
    tags: ['Coffee', 'Pastries', 'Cafe'],
    is_featured: false
  },
  {
    id: 4,
    name: 'Tech Hub',
    logo: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
    area: 'Tech Park',
    rating: 4.7,
    reviews_count: 342,
    description: 'Latest gadgets and electronics',
    category: 'Electronics',
    tags: ['Gadgets', 'SmartPhones', 'Warranty'],
    is_featured: true
  },
  {
    id: 5,
    name: 'Serenity Spa',
    logo: 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg',
    area: 'Wellness Zone',
    rating: 4.9,
    reviews_count: 217,
    description: 'Relaxing spa and wellness center',
    category: 'Beauty',
    tags: ['Spa', 'Massage', 'Wellness'],
    is_featured: true
  },
  {
    id: 6,
    name: 'Burger House',
    logo: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
    area: 'Food Court',
    rating: 4.4,
    reviews_count: 145,
    description: 'Delicious burgers and fast food',
    category: 'Food',
    tags: ['Burgers', 'FastFood', 'Delivery'],
    is_featured: false
  },
  {
    id: 7,
    name: 'Beauty Corner',
    logo: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg',
    area: 'Market Street',
    rating: 4.3,
    reviews_count: 98,
    description: 'Cosmetics and beauty products',
    category: 'Beauty',
    tags: ['Makeup', 'Skincare', 'Perfume'],
    is_featured: false
  },
  {
    id: 8,
    name: 'Bookworm Cafe',
    logo: 'https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg',
    area: 'Literature Hub',
    rating: 4.7,
    reviews_count: 176,
    description: 'Books and cozy cafe ambiance',
    category: 'Entertainment',
    tags: ['Books', 'Cafe', 'Reading'],
    is_featured: true
  }
];

export default function ShopGrid() {
  const [shops, setShops] = useState(DEMO_SHOPS);
  const api = useApi();
  const stats = useStats();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await api.get('/shops?limit=8');
        const list = Array.isArray(response.data) ? response.data : response.data?.shops;
        if (list && list.length > 0) {
          setShops(list);
        }
        // If API returns nothing, keep using demo data
      } catch (error) {
        console.error('Error fetching shops, using demo data:', error);
        // Keep demo data on error - don't disrupt UI
      }
    };

    fetchShops();
  }, [api]);

  const toggleFollow = (e, shop) => {
    e.preventDefault();
    e.stopPropagation();
    if (!stats) return;
    if (stats.isShopSaved(shop.id)) {
      stats.removeSavedShop(shop.id);
    } else {
      stats.addSavedShop(shop);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {shops.map((shop) => (
        <div
          key={shop.id}
          className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group h-full flex flex-col"
        >
          {/* Shop Image */}
          <div className="relative h-48 bg-gray-100 overflow-hidden">
            <Link to={`/shops/${shop.id}`} state={{ shop }} className="block h-full">
              <SafeImage
                src={shop?.logo || shop?.image_url || shop?.shopImage || shop?.imageUrl}
                alt={shop.name || shop.shopName}
                fallback={DEFAULT_IMAGES.shop}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </Link>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />

            {/* Save / Follow Button - outside Link so click works reliably */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFollow(e, shop);
              }}
              className="absolute top-3 right-3 px-3 py-1 bg-white rounded-full shadow-md hover:bg-amber-50 transition z-20 flex items-center gap-1"
              title={stats.isShopSaved(shop.id) ? 'Unsave shop' : 'Save shop'}
            >
              <Heart
                className={`w-5 h-5 transition ${
                  stats.isShopSaved(shop.id) ? 'fill-amber-500 text-amber-500' : 'text-gray-600'
                }`}
              />
              <span className="text-xs font-medium text-gray-700">
                {stats.isShopSaved(shop.id) ? 'Saved' : 'Save'}
              </span>
            </button>

            {/* Badge */}
            {shop.is_featured && (
              <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">
                ⭐ Featured
              </div>
            )}
          </div>

          {/* Shop Info */}
          <div className="p-4 flex flex-col flex-1">
            <Link to={`/shops/${shop.id}`} state={{ shop }} className="hover:underline">
              <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2">
                {shop.name || shop.shopName}
              </h3>
            </Link>

            {/* Location */}
            {(shop.area || shop.area?.name) && (
              <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">
                  {typeof shop.area === 'string' ? shop.area : shop.area?.name}
                </span>
              </div>
            )}

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-sm text-gray-900">
                  {shop.rating ? shop.rating.toFixed(1) : '4.5'}
                </span>
              </div>
              <span className="text-gray-500 text-xs">
                ({shop.reviews_count || 120} reviews)
              </span>
            </div>

            {/* Description */}
            {shop.description && (
              <p className="text-gray-600 text-xs line-clamp-2 mb-3">{shop.description}</p>
            )}

            {/* Category Tags */}
            <div className="flex gap-2 flex-wrap mb-4">
              {shop.category && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {shop.category}
                </span>
              )}
              {shop.tags?.slice(0, 1).map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-auto">
              <Link
                to={`/shops/${shop.id}`}
                state={{ shop }}
                className="flex-1 px-3 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition text-sm text-center"
              >
                View Shops
              </Link>
             
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
