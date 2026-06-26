import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../store/auth.jsx";
import { createApi } from "../api/client.js";
import TrendingBanner from "../components/TrendingBanner.jsx";
import OfferCard from "../components/OfferCard.jsx";
import AreaFilter from "../components/AreaFilter.jsx";
import { useStats } from "../store/stats.jsx";
import { getCategoryBanner, normalizeOffer, DEFAULT_IMAGES } from "../utils/images.js";
import SafeImage from "../components/SafeImage.jsx";
import { 
  validateSearchQuery, 
  sanitizeSearchInput, 
  validateArea, 
  validatePriceRange,
  validateDiscountRange,
  validateRatingRange,
  debounce 
} from "../utils/validation.js";
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal, 
  ArrowUpDown,
  DollarSign,
  Percent,
  Star,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function Categories() {
  const { token } = useAuth();
  const api = useMemo(() => createApi(token), [token]);

  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [trending, setTrending] = useState([]);
  const [topOffers, setTopOffers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  
  // Filter states
  const [areaId, setAreaId] = useState("");
  const [areaQuery, setAreaQuery] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [searchAreaQuery, setSearchAreaQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Advanced filters
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minDiscount, setMinDiscount] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("relevance"); // relevance, price_low, price_high, discount, rating, newest
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});
  
  // Loading states
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const stats = useStats();

  // Hardcoded areas as fallback
  const FALLBACK_AREAS = [
    { id: 1, name: "Hinjewadi", city: "Pune" },
    { id: 2, name: "Wakad", city: "Pune" },
    { id: 3, name: "Baner", city: "Pune" },
    { id: 4, name: "Kothrud", city: "Pune" },
    { id: 5, name: "Viman Nagar", city: "Pune" },
    { id: 6, name: "Kharadi", city: "Pune" },
    { id: 7, name: "Shivajinagar", city: "Pune" },
    { id: 8, name: "Aundh", city: "Pune" },
    { id: 9, name: "Koregaon Park", city: "Pune" },
    { id: 10, name: "Hadapsar", city: "Pune" },
    { id: 11, name: "Magarpatta", city: "Pune" },
    { id: 12, name: "Balewadi", city: "Pune" },
    { id: 13, name: "Pashan", city: "Pune" },
    { id: 14, name: "Sus Road", city: "Pune" },
    { id: 15, name: "Bavdhan", city: "Pune" },
    { id: 16, name: "Katraj", city: "Pune" },
    { id: 17, name: "Kondhwa", city: "Pune" },
    { id: 18, name: "Wanowrie", city: "Pune" },
    { id: 19, name: "Camp", city: "Pune" },
    { id: 20, name: "Deccan", city: "Pune" },
    { id: 21, name: "FC Road", city: "Pune" },
    { id: 22, name: "JM Road", city: "Pune" },
    { id: 23, name: "Senapati Bapat Road", city: "Pune" },
    { id: 24, name: "Kalyani Nagar", city: "Pune" },
    { id: 25, name: "Yerwada", city: "Pune" },
    { id: 26, name: "Lohegaon", city: "Pune" },
    { id: 27, name: "Dhanori", city: "Pune" },
    { id: 28, name: "Wagholi", city: "Pune" },
    { id: 29, name: "Chandan Nagar", city: "Pune" },
    { id: 30, name: "Kharadi Bypass", city: "Pune" },
    { id: 31, name: "Mundhwa", city: "Pune" },
    { id: 32, name: "Keshav Nagar", city: "Pune" },
    { id: 33, name: "NIBM", city: "Pune" },
    { id: 34, name: "Mohammedwadi", city: "Pune" },
    { id: 35, name: "Hadaspar", city: "Pune" },
    { id: 36, name: "Manjri", city: "Pune" },
    { id: 37, name: "Lonikand", city: "Pune" },
    { id: 38, name: "Shivane", city: "Pune" },
    { id: 39, name: "Warje", city: "Pune" },
    { id: 40, name: "Karve Nagar", city: "Pune" },
    { id: 41, name: "Erandwane", city: "Pune" },
    { id: 42, name: "Model Colony", city: "Pune" },
    { id: 43, name: "Aundh Gaon", city: "Pune" },
    { id: 44, name: "Baner Gaon", city: "Pune" },
    { id: 45, name: "Pimple Saudagar", city: "Pune" },
    { id: 46, name: "Rahatani", city: "Pune" },
    { id: 47, name: "Wakad Gaon", city: "Pune" },
    { id: 48, name: "Tathawade", city: "Pune" },
  ];

  const [areas, setAreas] = useState(FALLBACK_AREAS);
  const [filteredAreas, setFilteredAreas] = useState(FALLBACK_AREAS);

  const FALLBACK_CATEGORIES = [
    {
      id: "mock-food",
      name: "Food & Dining",
      banner_image_url: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=1600&auto=format&fit=crop",
      _mock: true,
    },
    {
      id: "mock-fashion",
      name: "Fashion",
      banner_image_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1600&auto=format&fit=crop",
      _mock: true,
    },
    {
      id: "mock-electronics",
      name: "Electronics",
      banner_image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
      _mock: true,
    },
    {
      id: "mock-beauty",
      name: "Beauty & Wellness",
      banner_image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop",
      _mock: true,
    },
  ];

  // Debounced search for category
  const debouncedCategorySearch = useCallback(
    debounce((searchTerm) => {
      if (!searchTerm.trim()) {
        setFilteredCategories(categories);
      } else {
        const sanitized = sanitizeSearchInput(searchTerm);
        const validation = validateSearchQuery(sanitized);
        if (validation.valid) {
          const filtered = categories.filter((cat) =>
            cat.name.toLowerCase().includes(sanitized.toLowerCase())
          );
          setFilteredCategories(filtered);
          setValidationErrors((prev) => ({ ...prev, categorySearch: null }));
        } else {
          setValidationErrors((prev) => ({ ...prev, categorySearch: validation.error }));
        }
      }
    }, 300),
    [categories]
  );

  // Load categories
  useEffect(() => {
    let mounted = true;
    async function loadCats() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/categories");
        if (!mounted) return;
        const list = Array.isArray(data) && data.length ? data : FALLBACK_CATEGORIES;
        setCategories(list);
        setFilteredCategories(list);
        if (list.length) setSelectedCategory(list[0]);
      } catch (e) {
        if (!mounted) return;
        // Use fallback categories when API fails - don't show error since page still works
        setCategories(FALLBACK_CATEGORIES);
        setFilteredCategories(FALLBACK_CATEGORIES);
        setSelectedCategory(FALLBACK_CATEGORIES[0]);
        setError(""); // Clear error - we have fallback data
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadCats();
    return () => {
      mounted = false;
    };
  }, [api]);

  // Filter categories based on search
  useEffect(() => {
    debouncedCategorySearch(categorySearch);
  }, [categorySearch, debouncedCategorySearch]);

  // Load areas
  useEffect(() => {
    let mounted = true;
    async function loadAreas() {
      try {
        const { data } = await api.get("/areas", { params: { city: "Pune" } });
        if (mounted) {
          const areasList = Array.isArray(data) && data.length > 0 ? data : FALLBACK_AREAS;
          setAreas(areasList);
          setFilteredAreas(areasList);
        }
      } catch (e) {
        console.error("Error loading areas:", e);
        if (mounted) {
          setAreas(FALLBACK_AREAS);
          setFilteredAreas(FALLBACK_AREAS);
        }
      }
    }
    loadAreas();
    return () => {
      mounted = false;
    };
  }, [api]);

  // Filter areas based on search
  useEffect(() => {
    if (!searchAreaQuery.trim()) {
      setFilteredAreas(areas);
    } else {
      const sanitized = sanitizeSearchInput(searchAreaQuery);
      const filtered = areas.filter((area) =>
        area.name.toLowerCase().includes(sanitized.toLowerCase())
      );
      setFilteredAreas(filtered);
    }
  }, [searchAreaQuery, areas]);

  // Validate and handle area search
  const handleAreaSearch = () => {
    const sanitized = sanitizeSearchInput(searchAreaQuery);
    if (!sanitized.trim()) {
      setAreaId("");
      setAreaQuery("");
      setSearchAreaQuery("");
      setValidationErrors((prev) => ({ ...prev, areaSearch: null }));
      return;
    }

    const validation = validateSearchQuery(sanitized);
    if (!validation.valid) {
      setValidationErrors((prev) => ({ ...prev, areaSearch: validation.error }));
      return;
    }

    const areaValidation = validateArea(areaId, areas);
    let foundArea = areas.find(
      (a) => a.name.toLowerCase() === sanitized.toLowerCase()
    );
    if (!foundArea) {
      foundArea = areas.find((a) =>
        a.name.toLowerCase().includes(sanitized.toLowerCase())
      );
    }
    
    if (foundArea) {
      setAreaId(foundArea.id.toString());
      setAreaQuery(foundArea.name);
      setSearchAreaQuery(foundArea.name);
      setValidationErrors((prev) => ({ ...prev, areaSearch: null }));
      setSuccessMessage(`Area "${foundArea.name}" selected`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setValidationErrors((prev) => ({ 
        ...prev, 
        areaSearch: `Area "${sanitized}" not found. Please select from the dropdown.` 
      }));
    }
  };

  // Validate advanced filters
  const validateFilters = () => {
    const errors = {};
    
    // Price validation
    if (minPrice || maxPrice) {
      const priceValidation = validatePriceRange(
        minPrice ? parseFloat(minPrice) : null,
        maxPrice ? parseFloat(maxPrice) : null
      );
      if (!priceValidation.valid) {
        errors.price = priceValidation.error;
      }
    }
    
    // Discount validation
    if (minDiscount || maxDiscount) {
      const discountValidation = validateDiscountRange(
        minDiscount ? parseFloat(minDiscount) : null,
        maxDiscount ? parseFloat(maxDiscount) : null
      );
      if (!discountValidation.valid) {
        errors.discount = discountValidation.error;
      }
    }
    
    // Rating validation
    if (minRating) {
      const ratingValidation = validateRatingRange(
        minRating ? parseFloat(minRating) : null,
        null
      );
      if (!ratingValidation.valid) {
        errors.rating = ratingValidation.error;
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Apply filters and sorting
  const applyFiltersAndSort = useCallback((offersList) => {
    let filtered = [...offersList];
    
    // Price filter
    if (minPrice) {
      filtered = filtered.filter((offer) => {
        const offerPrice = offer.price || 0;
        return offerPrice >= parseFloat(minPrice);
      });
    }
    if (maxPrice) {
      filtered = filtered.filter((offer) => {
        const offerPrice = offer.price || 0;
        return offerPrice <= parseFloat(maxPrice);
      });
    }
    
    // Discount filter
    if (minDiscount) {
      filtered = filtered.filter((offer) => {
        const discount = offer.discount || 0;
        return discount >= parseFloat(minDiscount);
      });
    }
    if (maxDiscount) {
      filtered = filtered.filter((offer) => {
        const discount = offer.discount || 0;
        return discount <= parseFloat(maxDiscount);
      });
    }
    
    // Rating filter
    if (minRating) {
      filtered = filtered.filter((offer) => {
        const rating = offer.rating || 0;
        return rating >= parseFloat(minRating);
      });
    }
    
    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return (a.price || 0) - (b.price || 0);
        case "price_high":
          return (b.price || 0) - (a.price || 0);
        case "discount":
          return (b.discount || 0) - (a.discount || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default: // relevance
          if (a.is_trending && !b.is_trending) return -1;
          if (!a.is_trending && b.is_trending) return 1;
          return (b.rating || 0) - (a.rating || 0);
      }
    });
    
    return filtered;
  }, [minPrice, maxPrice, minDiscount, maxDiscount, minRating, sortBy]);

  // Load offers
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (!selectedCategory) return;
      setLoadingOffers(true);
      
      if (selectedCategory._mock) {
        // Mock data logic (same as before)
        const mockShops = [
          {
            id: "mock-shop-1",
            name: "Saras Restaurant",
            area: { id: 9, name: "Koregaon Park" },
            image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop",
            phone: "+91 98765 43210",
            address: "Koregaon Park, Pune",
            map_lat: 18.5345,
            map_lng: 73.9006,
          },
          {
            id: "mock-shop-2",
            name: "Domino's Pizza",
            area: { id: 2, name: "Wakad" },
            image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop",
            phone: "+91 98765 43211",
            address: "Wakad, Pune",
            map_lat: 18.5993,
            map_lng: 73.7625,
          },
          {
            id: "mock-shop-3",
            name: "Cafe Coffee Day",
            area: { id: 1, name: "Hinjewadi" },
            image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop",
            phone: "+91 98765 43212",
            address: "Hinjewadi, Pune",
            map_lat: 18.5912,
            map_lng: 73.7389,
          },
          {
            id: "mock-shop-4",
            name: "Vaishali Restaurant",
            area: { id: 7, name: "Shivajinagar" },
            image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
            phone: "+91 98765 43213",
            address: "Shivajinagar, Pune",
            map_lat: 18.5314,
            map_lng: 73.8446,
          },
          {
            id: "mock-shop-5",
            name: "Pantaloons",
            area: { id: 3, name: "Baner" },
            image_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop",
            phone: "+91 98765 43214",
            address: "Baner, Pune",
            map_lat: 18.5596,
            map_lng: 73.7864,
          },
          {
            id: "mock-shop-6",
            name: "Max Fashion",
            area: { id: 4, name: "Kothrud" },
            image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
            phone: "+91 98765 43215",
            address: "Kothrud, Pune",
            map_lat: 18.5074,
            map_lng: 73.8077,
          },
        ];

        const mockOffers = [
          {
            id: "mock-offer-1",
            title: "Buy 1 Get 1 Free on Thali",
            description: "Pune: Koregaon Park - Valid on all Maharashtrian thalis. Offer valid till month end.",
            image_url: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg",
            is_trending: true,
            shop: mockShops[0],
            categoryId: selectedCategory.id,
            price: 299,
            discount: 50,
            rating: 4.5,
            createdAt: new Date().toISOString(),
          },
          {
            id: "mock-offer-2",
            title: "50% Off on Large Pizzas",
            description: "Pune: Wakad - Weekend special on all large pizzas. Dine-in and delivery.",
            image_url: "https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg",
            is_trending: true,
            shop: mockShops[1],
            categoryId: selectedCategory.id,
            price: 499,
            discount: 50,
            rating: 4.6,
            createdAt: new Date().toISOString(),
          },
          {
            id: "mock-offer-3",
            title: "Flat ₹100 Off on Coffee Combos",
            description: "Pune: Hinjewadi - On all coffee and snack combos. Valid all day.",
            image_url: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg",
            is_trending: false,
            shop: mockShops[2],
            categoryId: selectedCategory.id,
            price: 199,
            discount: 33,
            rating: 4.3,
            createdAt: new Date().toISOString(),
          },
          {
            id: "mock-offer-4",
            title: "30% Off on South Indian Breakfast",
            description: "Pune: Shivajinagar - Morning special from 8 AM to 11 AM. All items included.",
            image_url: "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg",
            is_trending: true,
            shop: mockShops[3],
            categoryId: selectedCategory.id,
            price: 149,
            discount: 30,
            rating: 4.7,
            createdAt: new Date().toISOString(),
          },
          {
            id: "mock-offer-5",
            title: "Upto 70% Off on Summer Collection",
            description: "Pune: Baner - Massive discount on all summer wear. Limited stock.",
            image_url: "https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg",
            is_trending: true,
            shop: mockShops[4],
            categoryId: selectedCategory.id,
            price: 1999,
            discount: 70,
            rating: 4.8,
            createdAt: new Date().toISOString(),
          },
          {
            id: "mock-offer-6",
            title: "Buy 2 Get 1 Free on T-Shirts",
            description: "Pune: Kothrud - Trendy T-Shirts for Men & Women.",
            image_url: "https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg",
            is_trending: false,
            shop: mockShops[5],
            categoryId: selectedCategory.id,
            price: 599,
            discount: 33,
            rating: 4.2,
            createdAt: new Date().toISOString(),
          },
        ];

        let filteredOffers = mockOffers;
        if (areaId) {
          filteredOffers = mockOffers.filter(
            (o) => o.shop.area?.id.toString() === areaId.toString()
          );
        }

        if (!mounted) return;
        const processed = applyFiltersAndSort(filteredOffers.map(normalizeOffer));
        setTrending(processed.filter((m) => m.is_trending));
        setTopOffers(processed.slice(0, 3));
        setOffers(processed);
        setTotalPages(Math.ceil(processed.length / itemsPerPage));
        setLoadingOffers(false);
        return;
      }
      
      try {
        const params = areaId ? { areaId } : {};
        const [t, top, o] = await Promise.all([
          api.get(`/categories/${selectedCategory.id}/trending`, { params }),
          api.get(`/categories/${selectedCategory.id}/top-offers`, { params }),
          api.get(`/categories/${selectedCategory.id}/offers`, { params }),
        ]);
        if (!mounted) return;
        const trendingData = Array.isArray(t.data) ? t.data : [];
        const topData = Array.isArray(top.data) ? top.data : [];
        const offersData = Array.isArray(o.data) ? o.data : [];
        
        const processed = applyFiltersAndSort(offersData.map(normalizeOffer));
        setTrending(processed.filter((m) => m.is_trending));
        setTopOffers(processed.slice(0, 3));
        setOffers(processed);
        setTotalPages(Math.ceil(processed.length / itemsPerPage));
      } catch (e) {
        if (!mounted) return;
        console.error("Error loading offers:", e);
        setTrending([]);
        setTopOffers([]);
        setOffers([]);
        setError("Failed to load offers. Please try again.");
      } finally {
        if (mounted) setLoadingOffers(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [api, selectedCategory, areaId, applyFiltersAndSort, itemsPerPage]);

  // Apply filters when they change
  useEffect(() => {
    if (validateFilters()) {
      const processed = applyFiltersAndSort(offers);
      setFilteredOffers(processed);
      setTotalPages(Math.ceil(processed.length / itemsPerPage));
      setCurrentPage(1); // Reset to first page when filters change
    }
  }, [offers, minPrice, maxPrice, minDiscount, maxDiscount, minRating, sortBy, applyFiltersAndSort, itemsPerPage]);

  // Pagination
  const paginatedOffers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOffers.slice(startIndex, endIndex);
  }, [filteredOffers, currentPage, itemsPerPage]);

  // Clear all filters
  const clearAllFilters = () => {
    setAreaId("");
    setAreaQuery("");
    setSearchAreaQuery("");
    setMinPrice("");
    setMaxPrice("");
    setMinDiscount("");
    setMaxDiscount("");
    setMinRating("");
    setSortBy("relevance");
    setShowAdvancedFilters(false);
    setValidationErrors({});
    setSuccessMessage("All filters cleared");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const hasActiveFilters = areaId || minPrice || maxPrice || minDiscount || maxDiscount || minRating || sortBy !== "relevance";

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading categories...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage("")}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && categories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No categories available.</p>
          <p className="text-gray-400 text-sm mt-2">Try reseeding the backend and refresh.</p>
        </div>
      )}

      {/* Search and Filter Section */}
      {!loading && categories.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Category Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search Categories
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className={`flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.categorySearch ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Search categories by name..."
                  value={categorySearch}
                  onChange={(e) => {
                    const sanitized = sanitizeSearchInput(e.target.value);
                    if (sanitized.length <= 100) {
                      setCategorySearch(sanitized);
                    }
                  }}
                  maxLength={100}
                />
                {categorySearch && (
                  <button
                    onClick={() => {
                      setCategorySearch("");
                      setValidationErrors((prev) => ({ ...prev, categorySearch: null }));
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              {validationErrors.categorySearch && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.categorySearch}
                </p>
              )}
            </div>

            {/* Area Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Filter by Area (Pune)
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <AreaFilter
                      areas={areas}
                      value={areaId}
                      onChange={(val) => {
                        setAreaId(val);
                        if (val) {
                          const selectedArea = areas.find((a) => a.id.toString() === val);
                          if (selectedArea) {
                            setSearchAreaQuery(selectedArea.name);
                            setAreaQuery(selectedArea.name);
                          }
                        } else {
                          setSearchAreaQuery("");
                          setAreaQuery("");
                        }
                      }}
                    />
                  </div>
                  {areaId && (
                    <button
                      onClick={() => {
                        setAreaId("");
                        setSearchAreaQuery("");
                        setAreaQuery("");
                      }}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium whitespace-nowrap"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      className={`border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.areaSearch ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Or search area by name..."
                      value={searchAreaQuery}
                      onChange={(e) => {
                        const sanitized = sanitizeSearchInput(e.target.value);
                        setSearchAreaQuery(sanitized);
                        setValidationErrors((prev) => ({ ...prev, areaSearch: null }));
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAreaSearch();
                        }
                      }}
                      maxLength={50}
                      list="area-suggestions"
                    />
                    <datalist id="area-suggestions">
                      {filteredAreas.map((area) => (
                        <option key={area.id} value={area.name} />
                      ))}
                    </datalist>
                  </div>
                  <button
                    onClick={handleAreaSearch}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors whitespace-nowrap"
                  >
                    <Search className="w-4 h-4 inline mr-1" />
                    Search
                  </button>
                </div>
                {validationErrors.areaSearch && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.areaSearch}
                  </p>
                )}
                {areaId && (
                  <p className="text-sm text-green-600 mt-2 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Showing offers from: <span className="font-bold">
                      {areas.find((a) => a.id.toString() === areaId)?.name || "Selected area"}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="border-t pt-4">
            <button
              onClick={() => {
                setShowAdvancedFilters(!showAdvancedFilters);
                if (!showAdvancedFilters) {
                  validateFilters();
                }
              }}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                  Active
                </span>
              )}
            </button>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                {/* Price Range */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                    <DollarSign className="w-3 h-3" />
                    Price Range (₹)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || (!isNaN(val) && parseFloat(val) >= 0)) {
                          setMinPrice(val);
                          setValidationErrors((prev) => ({ ...prev, price: null }));
                        }
                      }}
                      className={`w-full border rounded px-3 py-2 text-sm ${
                        validationErrors.price ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || (!isNaN(val) && parseFloat(val) >= 0)) {
                          setMaxPrice(val);
                          setValidationErrors((prev) => ({ ...prev, price: null }));
                        }
                      }}
                      className={`w-full border rounded px-3 py-2 text-sm ${
                        validationErrors.price ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {validationErrors.price && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.price}</p>
                  )}
                </div>

                {/* Discount Range */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                    <Percent className="w-3 h-3" />
                    Discount (%)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      placeholder="Min"
                      value={minDiscount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || (!isNaN(val) && parseFloat(val) >= 0 && parseFloat(val) <= 100)) {
                          setMinDiscount(val);
                          setValidationErrors((prev) => ({ ...prev, discount: null }));
                        }
                      }}
                      className={`w-full border rounded px-3 py-2 text-sm ${
                        validationErrors.discount ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      placeholder="Max"
                      value={maxDiscount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || (!isNaN(val) && parseFloat(val) >= 0 && parseFloat(val) <= 100)) {
                          setMaxDiscount(val);
                          setValidationErrors((prev) => ({ ...prev, discount: null }));
                        }
                      }}
                      className={`w-full border rounded px-3 py-2 text-sm ${
                        validationErrors.discount ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {validationErrors.discount && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.discount}</p>
                  )}
                </div>

                {/* Minimum Rating */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                    <Star className="w-3 h-3" />
                    Minimum Rating
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="e.g., 4.0"
                    value={minRating}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || (!isNaN(val) && parseFloat(val) >= 0 && parseFloat(val) <= 5)) {
                        setMinRating(val);
                        setValidationErrors((prev) => ({ ...prev, rating: null }));
                      }
                    }}
                    className={`w-full border rounded px-3 py-2 text-sm ${
                      validationErrors.rating ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {validationErrors.rating && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.rating}</p>
                  )}
                </div>

                {/* Sort By */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                    <ArrowUpDown className="w-3 h-3" />
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="discount">Highest Discount</option>
                    <option value="rating">Highest Rating</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>
            )}

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Selection */}
      {filteredCategories.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Select Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c)}
                className={`relative rounded-lg border-2 overflow-hidden transition-all hover:scale-105 ${
                  selectedCategory?.id === c.id
                    ? "border-blue-600 shadow-lg ring-2 ring-blue-300"
                    : "border-gray-300 hover:border-blue-400"
                }`}
                title={c.name}
              >
                <div className="h-24 w-full overflow-hidden">
                  <SafeImage
                    src={getCategoryBanner(c)}
                    alt={c.name}
                    fallback={DEFAULT_IMAGES.category}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className={`p-3 text-center ${
                    selectedCategory?.id === c.id
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  <p className="text-sm font-semibold">{c.name}</p>
                </div>
                {selectedCategory?.id === c.id && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
          {filteredCategories.length === 0 && categorySearch && (
            <p className="text-gray-500 mt-4 text-center">
              No categories found matching "{categorySearch}"
            </p>
          )}
        </div>
      )}

      {/* Selected Category Banner */}
      {selectedCategory && (
        <TrendingBanner
          image={getCategoryBanner(selectedCategory)}
          title={`${selectedCategory.name} - Best Offers${
            areaId
              ? ` in ${areas.find((a) => a.id.toString() === areaId)?.name || "Selected Area"}`
              : ""
          }`}
          subtitle={
            areaId
              ? `${filteredOffers.length} offers available in ${
                  areas.find((a) => a.id.toString() === areaId)?.name || "selected area"
                }`
              : filteredOffers.length
              ? `${filteredOffers.length} offers available`
              : "Check back soon for hot offers"
          }
        />
      )}

      {/* Top 3 Offers Section */}
      {selectedCategory && topOffers.length > 0 && !loadingOffers && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-sm p-6 border-2 border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🔥 Top 3 Offers</h2>
              <p className="text-gray-600 mt-1">
                Best deals in {selectedCategory.name}
                {areaId
                  ? ` in ${areas.find((a) => a.id.toString() === areaId)?.name || "selected area"}`
                  : " in Pune"}
              </p>
            </div>
            <span className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full font-semibold text-sm">
              Featured
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {topOffers.map((o, index) => (
              <div key={o.id} className="relative">
                {index === 0 && (
                  <span className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg">
                    1
                  </span>
                )}
                <OfferCard
                  offer={o}
                  onLike={async () => {
                    if (stats.isOfferLiked(o.id)) {
                      try { await api.delete(`/offers/${o.id}/like`); } catch {}
                      stats.removeLikedOffer(o.id);
                    } else {
                      try { await api.post(`/offers/${o.id}/like`); } catch {}
                      stats.addLikedOffer(o);
                    }
                  }}
                  onBookmark={async () => {
                    if (stats.isOfferBookmarked(o.id)) {
                      try { await api.delete(`/offers/${o.id}/bookmark`); } catch {}
                      stats.removeBookmarkedOffer(o.id);
                    } else {
                      try { await api.post(`/offers/${o.id}/bookmark`); } catch {}
                      stats.addBookmarkedOffer(o);
                    }
                  }}
                  linkState={{ offer: o, shop: o.shop }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Offers Section */}
      {selectedCategory && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              All Offers in {selectedCategory.name}
              {areaId && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  - {areas.find((a) => a.id.toString() === areaId)?.name || "Selected Area"}
                </span>
              )}
            </h2>
            {filteredOffers.length > 0 && (
              <span className="text-sm text-gray-600">
                Showing {paginatedOffers.length} of {filteredOffers.length} offers
              </span>
            )}
          </div>

          {loadingOffers ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading offers...</span>
            </div>
          ) : paginatedOffers.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-6">
                {paginatedOffers.map((o) => (
                  <OfferCard
                    key={o.id}
                    offer={o}
                    onLike={async () => {
                      if (stats.isOfferLiked(o.id)) {
                        try { await api.delete(`/offers/${o.id}/like`); } catch {}
                        stats.removeLikedOffer(o.id);
                      } else {
                        try { await api.post(`/offers/${o.id}/like`); } catch {}
                        stats.addLikedOffer(o);
                      }
                    }}
                    onBookmark={async () => {
                      if (stats.isOfferBookmarked(o.id)) {
                        try { await api.delete(`/offers/${o.id}/bookmark`); } catch {}
                        stats.removeBookmarkedOffer(o.id);
                      } else {
                        try { await api.post(`/offers/${o.id}/bookmark`); } catch {}
                        stats.addBookmarkedOffer(o);
                      }
                    }}
                    linkState={{ offer: o, shop: o.shop }}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 border rounded-lg ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No offers available{hasActiveFilters ? " matching your filters" : ""}
                {areaId ? " for the selected area" : ""}.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {hasActiveFilters ? (
                  <>
                    Try adjusting your filters or{" "}
                    <button
                      onClick={clearAllFilters}
                      className="text-blue-600 hover:underline"
                    >
                      clear all filters
                    </button>
                  </>
                ) : (
                  "Try selecting a different category or area."
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}