import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TopOffersSlider from '../components/TopOffersSlider';
import ShopGrid from '../components/ShopGrid';
import OffersGrid from '../components/OffersGrid';
import OfferCard from '../components/OfferCard';
import ChatBot from '../components/ChatBot';
import { MapPin, Bell, Filter, Clock, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '../store/auth';
import { useStats } from '../store/stats';
import { useMemo } from 'react';
import { isAdmin, isShopkeeper } from '../utils/roles';
import { createApi } from '../api/client';
import { getShopImage, DEFAULT_IMAGES } from '../utils/images.js';
import SafeImage from '../components/SafeImage.jsx';

function LoggedInHome({ user }) {
  const userIsAdmin = isAdmin(user);
  const userIsShopkeeper = isShopkeeper(user);
  const stats = useStats();
  const api = useMemo(() => createApi(user?.token), [user?.token]);
  const [currentLocation, setCurrentLocation] = useState(user?.location || 'Delhi');
  const [activeFilters, setActiveFilters] = useState([]);

  const handleLocationChange = () => {
    const newLocation = prompt('Enter your location:', currentLocation);
    if (newLocation && newLocation.trim()) {
      setCurrentLocation(newLocation.trim());
      // TODO: Update user location in backend/auth
      console.log('Location changed to:', newLocation);
    }
  };

  const toggleFilter = (filterName) => {
    setActiveFilters(prev => 
      prev.includes(filterName) 
        ? prev.filter(f => f !== filterName)
        : [...prev, filterName]
    );
    console.log('Active filters:', activeFilters);
  };

   return (
    <div className="w-full">
      <div className="space-y-12">
        {/* Enhanced Welcome Header */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">Home: {user?.name || 'User'} 👋</h1>
                <div className="flex items-center gap-2 text-blue-100 mb-4">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{currentLocation}</span>
                  <button 
                    onClick={handleLocationChange}
                    className="text-sm underline hover:text-white"
                  >
                    Change Location
                  </button>
                </div>
                <p className="text-xl text-blue-100">Discover amazing deals and exclusive offers near you</p>
              </div>
            </div>
            
            {/* Quick Actions - role-based */}
        <section className="grid md:grid-cols-4 gap-4">
          <Link to="/categories" className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition text-center">
            <div className="text-3xl mb-3">🔍</div>
            <div className="font-bold text-gray-900">Browse Offers</div>
            <div className="text-sm text-gray-600">Find new deals</div>
          </Link>
          {userIsAdmin && (
            <Link to="/admin" className="bg-white p-6 rounded-xl border border-purple-200 hover:border-purple-500 hover:shadow-lg transition text-center">
              <div className="text-3xl mb-3">⭐</div>
              <div className="font-bold text-gray-900">Admin Panel</div>
              <div className="text-sm text-gray-600">Manage platform</div>
            </Link>
          )}
          {userIsShopkeeper && (
            <Link to="/shop-dashboard" className="bg-white p-6 rounded-xl border border-green-200 hover:border-green-500 hover:shadow-lg transition text-center">
              <div className="text-3xl mb-3">🏪</div>
              <div className="font-bold text-gray-900">Shop Dashboard</div>
              <div className="text-sm text-gray-600">Manage your offers</div>
            </Link>
          )}
          {!userIsShopkeeper && !userIsAdmin && (
            <>
              <Link to="/mybookmarks" className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition text-center">
                <div className="text-3xl mb-3">💾</div>
                <div className="font-bold text-gray-900">My Bookmarks</div>
                <div className="text-sm text-gray-600">Saved deals</div>
              </Link>
              <Link to="/savedshops" className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition text-center">
                <div className="text-3xl mb-3">🏪</div>
                <div className="font-bold text-gray-900">Followed Shops</div>
                <div className="text-sm text-gray-600">Your favorites</div>
              </Link>
            </>
          )}
          <Link to="/categories" className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition text-center">
            <div className="text-3xl mb-3">📍</div>
            <div className="font-bold text-gray-900">Near Me</div>
            <div className="text-sm text-gray-600">Local deals</div>
          </Link>
        </section>
          </div>
        </section>

            {/* Personal Stats - from stats store */}
        <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Activity</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats?.bookmarks ?? 0}</div>
              <div className="text-sm text-gray-600">Saved Deals</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats?.saves ?? 0}</div>
              <div className="text-sm text-gray-600">Followed Shops</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats?.likes ?? 0}</div>
              <div className="text-sm text-gray-600">Liked Offers</div>
            </div>
          </div>
        </section>
      
        {/* Top Offers Slider */}
        <section>
        <TopOffersSlider
  onLike={async (o) => {
    try { await api.post(`/offers/${o.id}/like`); } catch {}
    stats.addLikedOffer(o);
  }}
  onBookmark={async (o) => {
    try { await api.post(`/offers/${o.id}/bookmark`); } catch {}
    stats.addBookmarkedOffer(o);
  }}
/>
        </section>

        {/* Quick Filters */}
        <section className="flex flex-wrap gap-3 items-center">
          <span className="font-semibold text-gray-700">Quick Filters:</span>
          <button 
            onClick={() => toggleFilter('flash')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
              activeFilters.includes('flash') 
                ? 'bg-blue-500 text-white' 
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            Flash Deals
          </button>
          <button 
            onClick={() => toggleFilter('trending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
              activeFilters.includes('trending') 
                ? 'bg-green-500 text-white' 
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Trending Now
          </button>
          <button 
            onClick={() => toggleFilter('rated')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
              activeFilters.includes('rated') 
                ? 'bg-purple-500 text-white' 
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            <Star className="w-4 h-4" />
            Highly Rated
          </button>
          <button 
            onClick={() => toggleFilter('distance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
              activeFilters.includes('distance') 
                ? 'bg-orange-500 text-white' 
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            Distance: 5km
          </button>
        </section>

        {/* Category Pills */}
        <section className="overflow-x-auto">
          <div className="flex gap-3 pb-2">
            {[
              { name: 'Food & Dining', emoji: '🍕', count: 120 },
              { name: 'Fashion', emoji: '👗', count: 85 },
              { name: 'Electronics', emoji: '📱', count: 65 },
              { name: 'Beauty', emoji: '💄', count: 45 },
              { name: 'Health & Wellness', emoji: '💪', count: 35 },
              { name: 'Home & Living', emoji: '🏠', count: 55 },
              { name: 'Sports', emoji: '⚽', count: 25 },
              { name: 'More', emoji: '➕', count: null }
            ].map((cat) => (
              <Link
                key={cat.name}
                to="/categories"
                className="px-4 py-2 bg-white border border-gray-200 rounded-full font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-500 transition whitespace-nowrap shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
                {cat.count && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{cat.count}</span>}
              </Link>
            ))}
          </div>
        </section>

        {/* Flash Deals - New Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">⚡ Flash Deals</h2>
              <p className="text-gray-600 mt-1">Limited time offers - act fast!</p>
            </div>
            <Link to="/categories" className="text-blue-500 hover:text-blue-700 font-semibold">
              View All →
            </Link>
          </div>
          <OffersGrid />
        </section>

        {/* Offers Near You */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">📍 Offers Near You</h2>
              <p className="text-gray-600 mt-1">Hot deals in your area</p>
            </div>
            <Link to="/categories" className="text-blue-500 hover:text-blue-700 font-semibold">
              View All →
            </Link>
          </div>
          <OffersGrid />
        </section>

        {/* Recommended For You */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">⭐ Recommended For You</h2>
              <p className="text-gray-600 mt-1">Personalized picks based on your preferences</p>
            </div>
            <Link to="/categories" className="text-blue-500 hover:text-blue-700 font-semibold">
              View All →
            </Link>
          </div>
          <ShopGrid />
        </section>

        {/* Saved Deals Preview - from stats store */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">💾 Your Saved Deals</h2>
              <p className="text-gray-600 mt-1">Quick access to your bookmarked offers</p>
            </div>
            <Link to="/mybookmarks" className="text-blue-500 hover:text-blue-700 font-semibold">
              View All →
            </Link>
          </div>
          {stats?.bookmarkedOffers?.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {stats.bookmarkedOffers.slice(0, 6).map((o) => (
                <OfferCard
                  key={o.id}
                  offer={o}
                  onLike={async () => {
                    try { await createApi(user?.token).post(`/offers/${o.id}/like`); } catch {}
                    stats.addLikedOffer(o);
                  }}
                  onBookmark={async () => {
                    try { await createApi(user?.token).delete(`/offers/${o.id}/bookmark`); } catch {}
                    stats.removeBookmarkedOffer(o.id);
                  }}
                  linkState={{ offer: o, shop: o.shop }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">
              No saved deals yet. Start exploring and save your favorites!
            </div>
          )}
        </section>

        {/* Followed Shops - from stats store */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">🏪 Followed Shops</h2>
              <p className="text-gray-600 mt-1">Shops you're following for the latest updates</p>
            </div>
            <Link to="/savedshops" className="text-blue-500 hover:text-blue-700 font-semibold">
              View All →
            </Link>
          </div>
          {stats?.savedShops?.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {stats.savedShops.slice(0, 6).map((s) => (
                <div key={s.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                  <SafeImage
                    src={s?.image_url || s?.logo || s?.shopImage || s?.imageUrl}
                    alt={s.name || s.shopName}
                    fallback={DEFAULT_IMAGES.shop}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{s.name || s.shopName}</h3>
                    <p className="text-sm text-gray-600 mb-2">{s.description || 'No description.'}</p>
                    {s.area && (
                      <p className="text-xs text-gray-500 mb-2">📍 {s.area?.name || s.area}</p>
                    )}
                    <div className="flex gap-2">
                      <Link
                        to={`/shops/${s.id}`}
                        state={{ shop: s }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center"
                      >
                        View Shop
                      </Link>
                      <button
                        onClick={() => stats.removeSavedShop(s.id)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                      >
                        Unfollow
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">
              No followed shops yet. Follow shops to get notified about new offers!
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Fresh offers updated every hour from your favorite local shops</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📍</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Location-based Deals</h3>
              <p className="text-gray-600">Find exclusive offers from shops in your area and nearby neighborhoods</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">❤️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Save & Share</h3>
              <p className="text-gray-600">Bookmark offers, like shops, and share deals with friends instantly</p>
            </div>
          </div>
        </section>

        {/* Notification CTA */}
        <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8 text-center">
          <div className="text-4xl mb-4">🔔</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated!</h2>
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Enable notifications to get instant alerts about new offers from your favorite shops and personalized recommendations.
          </p>
          <button className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition">
            Enable Notifications
          </button>
        </section>
      </div>
    </div>
  );
}

function GuestHome() {
  const [currentLocation, setCurrentLocation] = useState('Delhi');

  const handleLocationChange = () => {
    const newLocation = prompt('Enter your location:', currentLocation);
    if (newLocation && newLocation.trim()) {
      setCurrentLocation(newLocation.trim());
      console.log('Location changed to:', newLocation);
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Discover Local Deals! 🛍️</h1>
            <div className="flex items-center justify-center gap-2 text-blue-100 mb-6">
              <MapPin className="w-6 h-6" />
              <span className="text-xl">{currentLocation}</span>
              <button
                onClick={handleLocationChange}
                className="text-sm underline hover:text-white"
              >
                Change Location
              </button>
            </div>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users saving money on local deals. Find exclusive offers from shops in your area!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl text-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl text-lg hover:bg-white hover:bg-opacity-10 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600 font-semibold">Active Offers</div>
              <div className="text-sm text-gray-500">Updated daily</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600 font-semibold">Local Shops</div>
              <div className="text-sm text-gray-500">Verified partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">10K+</div>
              <div className="text-gray-600 font-semibold">Happy Users</div>
              <div className="text-sm text-gray-500">Saving money</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">₹50K+</div>
              <div className="text-gray-600 font-semibold">Money Saved</div>
              <div className="text-sm text-gray-500">This month</div>
            </div>
          </div>
        </section>

        {/* Top Offers Slider */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">🔥 Hot Deals Right Now</h2>
            <p className="text-xl text-gray-600">Don't miss out on these amazing offers!</p>
          </div>
          <TopOffersSlider />
        </section>

        {/* How It Works */}
        <section className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How LocalLoot Works</h2>
            <p className="text-xl text-gray-600">Simple steps to start saving</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Set Your Location</h3>
              <p className="text-gray-600">Tell us your city and we'll show you deals from nearby shops</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Browse & Save</h3>
              <p className="text-gray-600">Explore offers, bookmark your favorites, and get notified about new deals</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Enjoy Savings</h3>
              <p className="text-gray-600">Visit shops with your saved offers and enjoy exclusive discounts</p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600">Find deals in your favorite categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Food & Dining', emoji: '🍕', color: 'bg-red-100 text-red-700' },
              { name: 'Fashion', emoji: '👗', color: 'bg-pink-100 text-pink-700' },
              { name: 'Electronics', emoji: '📱', color: 'bg-blue-100 text-blue-700' },
              { name: 'Beauty', emoji: '💄', color: 'bg-purple-100 text-purple-700' },
              { name: 'Health', emoji: '💪', color: 'bg-green-100 text-green-700' },
              { name: 'Home', emoji: '🏠', color: 'bg-yellow-100 text-yellow-700' },
              { name: 'Sports', emoji: '⚽', color: 'bg-indigo-100 text-indigo-700' },
              { name: 'More', emoji: '➕', color: 'bg-gray-100 text-gray-700' }
            ].map((cat) => (
              <Link
                key={cat.name}
                to="/categories"
                className={`p-6 rounded-xl font-bold text-center hover:scale-105 transition transform shadow-md hover:shadow-lg ${cat.color}`}
              >
                <div className="text-4xl mb-2">{cat.emoji}</div>
                <div>{cat.name}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Real stories from real savers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">R</div>
                <div className="ml-4">
                  <div className="font-bold text-gray-900">Rahul S.</div>
                  <div className="text-yellow-500">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 italic">"Saved ₹500 on my grocery bill last month! The app is amazing for finding local deals."</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">P</div>
                <div className="ml-4">
                  <div className="font-bold text-gray-900">Priya M.</div>
                  <div className="text-yellow-500">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 italic">"Love the personalized recommendations. Found great deals on fashion and beauty products!"</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">A</div>
                <div className="ml-4">
                  <div className="font-bold text-gray-900">Amit K.</div>
                  <div className="text-yellow-500">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 italic">"The flash deals are incredible! Got 50% off on electronics. Highly recommend!"</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Saving?</h2>
          <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
            Join thousands of users who are already saving money with LocalLoot. Create your free account today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-green-600 font-bold rounded-xl text-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl text-lg hover:bg-white hover:bg-opacity-10 transition"
            >
              Sign In
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  return (
    <>
      {user ? <LoggedInHome user={user} /> : <GuestHome />}
      <ChatBot />
    </>
  );
}




