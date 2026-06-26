import { useState, useEffect } from 'react';
import { useApi } from '../api/client';
import { useStats } from '../store/stats';
import OfferCard from './OfferCard';
import { normalizeOffer } from '../utils/images.js';

const DEMO_OFFERS = [
  {
    id: 1,
    title: '50% OFF on All Pizzas',
    description: 'Fresh Italian pizzas with premium ingredients and toppings',
    image_url: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg',
    discount: 50,
    price: 499,
    is_trending: true,
    rating: 4.6,
    reviews_count: 128,
    valid_until: '2024-02-15',
    shop: {
      id: 1,
      name: 'Pizza Palace',
      logo: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
      area: 'Downtown',
    },
  },
  {
    id: 2,
    title: 'Flat 60% OFF Designer Dresses',
    description: 'Exclusive collection of designer dresses - Latest fashion trends',
    image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=400&auto=format&fit=crop',
    discount: 60,
    price: 2999,
    is_trending: true,
    rating: 4.8,
    reviews_count: 256,
    valid_until: '2024-02-20',
    shop: {
      id: 2,
      name: 'Fashion Fiesta',
      logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=50&auto=format&fit=crop',
      area: 'Mall Road',
    },
  },
  {
    id: 3,
    title: 'Buy 1 Get 1 FREE on Coffee',
    description: 'Hot & fresh coffee with free pastries - Limited time offer',
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop',
    discount: 50,
    price: 150,
    is_trending: true,
    rating: 4.5,
    reviews_count: 189,
    valid_until: '2024-02-10',
    shop: {
      id: 3,
      name: 'Coffee Brew Co.',
      logo: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=50&auto=format&fit=crop',
      area: 'City Center',
    },
  },
  {
    id: 4,
    title: 'SmartWatch 45% OFF',
    description: 'Latest smartwatch with fitness tracking and health monitoring',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop',
    discount: 45,
    price: 8999,
    is_trending: true,
    rating: 4.7,
    reviews_count: 342,
    valid_until: '2024-02-25',
    shop: {
      id: 4,
      name: 'Tech Hub',
      logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=50&auto=format&fit=crop',
      area: 'Tech Park',
    },
  },
  {
    id: 5,
    title: 'Spa Package - Upto 70% OFF',
    description: 'Complete spa package - massage, facial & body care treatments',
    image_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=400&auto=format&fit=crop',
    discount: 70,
    price: 1999,
    is_trending: true,
    rating: 4.9,
    reviews_count: 217,
    valid_until: '2024-02-18',
    shop: {
      id: 5,
      name: 'Serenity Spa',
      logo: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=50&auto=format&fit=crop',
      area: 'Wellness Zone',
    },
  },
  {
    id: 6,
    title: 'Mega Burger Combo - 40% OFF',
    description: 'Delicious burger combo with fries and cold drink included',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop',
    discount: 40,
    price: 299,
    is_trending: false,
    rating: 4.4,
    reviews_count: 145,
    valid_until: '2024-02-12',
    shop: {
      id: 6,
      name: 'Burger House',
      logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=50&auto=format&fit=crop',
      area: 'Food Court',
    },
  },
];

export default function OffersGrid() {
  const [offers, setOffers] = useState(DEMO_OFFERS);
  const api = useApi();
  const stats = useStats();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await api.get('/offers?limit=12');
        if (response.data && (response.data.offers || response.data.length > 0)) {
          const raw = response.data.offers || response.data;
          const normalized = raw.map((o, index) =>
            normalizeOffer({
              ...o,
              image_url: o.image_url || DEMO_OFFERS[index % DEMO_OFFERS.length].image_url,
              discount:
                o.discount ||
                (o.originalPrice && o.price
                  ? Math.round(((o.originalPrice - o.price) / o.originalPrice) * 100)
                  : DEMO_OFFERS[index % DEMO_OFFERS.length].discount),
              price: o.price || DEMO_OFFERS[index % DEMO_OFFERS.length].price,
              shop:
                o.shop || {
                  ...DEMO_OFFERS[index % DEMO_OFFERS.length].shop,
                  id: o.shopId || null,
                  name: o.shopName || DEMO_OFFERS[index % DEMO_OFFERS.length].shop.name,
                  area: o.area || DEMO_OFFERS[index % DEMO_OFFERS.length].shop.area,
                },
            })
          );
          setOffers(normalized);
        }
      } catch (error) {
        console.error('Error fetching offers, using demo data:', error);
      }
    };

    fetchOffers();
  }, [api]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          onLike={async () => {
            if (stats.isOfferLiked(offer.id)) {
              try { await api.delete(`/offers/${offer.id}/like`); } catch {}
              stats.removeLikedOffer(offer.id);
            } else {
              try { await api.post(`/offers/${offer.id}/like`); } catch {}
              stats.addLikedOffer(offer);
            }
          }}
          onBookmark={async () => {
            if (stats.isOfferBookmarked(offer.id)) {
              try { await api.delete(`/offers/${offer.id}/bookmark`); } catch {}
              stats.removeBookmarkedOffer(offer.id);
            } else {
              try { await api.post(`/offers/${offer.id}/bookmark`); } catch {}
              stats.addBookmarkedOffer(offer);
            }
          }}
          linkState={{ offer, shop: offer.shop }}
        />
      ))}
    </div>
  );
}
