import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useApi } from "../api/client";
import { Search, Eye, Trash2, MapPin, ShoppingBag, History, FileText, X } from "lucide-react";

export default function UsersManagement() {
  const api = useApi();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [stats, setStats] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsTab, setDetailsTab] = useState("overview"); // overview, shops, offers, visits
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Demo hardcoded data (used when admin APIs aren't accessible)
  const demoUserDetails = {
    id: 999,
    name: "Demo User",
    email: "demo.user@example.com",
    role: "user",
    createdAt: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
    accountVisits: 42,
    profileViews: 128,
    likesCount: 27,
    bookmarksCount: 12,
    shopsVisited: 9,
    engagementScore: 76,
    connectedShopsCount: 4,
    bookmarkedShops: [
      {
        id: 1,
        shopName: "Local Pizza",
        ownerName: "Ahmed Khan",
        email: "pizza@example.com",
        area: "Downtown",
        category: "Food",
        address: "123 Main St",
        registrationStatus: "APPROVED",
        mobileNumber: "+911234567890"
      },
      {
        id: 2,
        shopName: "Fashion Hub",
        ownerName: "Sarah Ahmed",
        email: "fashion@example.com",
        area: "Business District",
        category: "Clothing",
        address: "45 Market Rd",
        registrationStatus: "APPROVED",
        mobileNumber: "+919876543210"
      }
    ],
    viewedOffers: [
      { id: 11, title: "50% Pizza Discount", shopName: "Local Pizza", area: "Downtown", category: "Food" },
      { id: 12, title: "BOGO Fashion Sale", shopName: "Fashion Hub", area: "Business District", category: "Clothing" }
    ],
    pastOffers: [
      { id: 21, title: "Early Bird Breakfast", shopName: "Local Cafe", expiryDate: new Date().toISOString() }
    ]
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/users")
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await  api.get("/admin/users/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUserDetails = async (userId) => {
    setLoadingDetails(true);
    try {
      const response = await api.get("/admin/users/stats");
      setUserDetails(response.data);
      setDetailsTab("overview");
    } catch (error) {
      console.error("Error fetching user details, using demo data:", error);
      // Fallback to demo data so admin UI can be previewed without login/backend
      setUserDetails(demoUserDetails);
      setDetailsTab("overview");
    } finally {
      setLoadingDetails(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (roleFilter !== "all") {
      filtered = filtered.filter(
        (user) => user.role && user.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    setFilteredUsers(filtered);
  };

  const getRoleBadgeColor = (role) => {
    const r = (role || "").toLowerCase();
    switch (r) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "shopkeeper":
      case "shop_owner":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role) => {
    const r = (role || "").toLowerCase();
    switch (r) {
      case "admin":
        return "👑";
      case "shopkeeper":
      case "shop_owner":
        return "🏪";
      case "user":
        return "👤";
      default:
        return "❓";
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-semibold opacity-90">Total Users</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalUsers || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-semibold opacity-90">Regular Users</h3>
          <p className="text-3xl font-bold mt-2">{stats.regularUsers || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-semibold opacity-90">Shopkeepers</h3>
          <p className="text-3xl font-bold mt-2">{stats.shopkeepers || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-semibold opacity-90">Admins</h3>
          <p className="text-3xl font-bold mt-2">{stats.admins || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Filters & Search</h3>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Role Filter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              User Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="user">Regular Users</option>
              <option value="shopkeeper">Shopkeepers</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Results Info */}
          <div className="col-span-2 md:col-span-3 flex items-end">
            <div className="w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                Showing <span className="font-bold text-blue-600">{filteredUsers.length}</span> of{" "}
                <span className="font-bold">{users.length}</span> users
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Role
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No users found matching your filters
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)} {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center space-x-2 flex justify-center items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetails(true);
                          fetchUserDetails(user.id);
                        }}
                        className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Details Modal */}
      {showDetails && (selectedUser || userDetails) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold">{(userDetails && userDetails.name) || (selectedUser && selectedUser.name)}</h3>
                <Link
                  to={`/admin/users/${(userDetails && userDetails.id) || (selectedUser && selectedUser.id)}`}
                  className="text-sm text-white/90 underline"
                >
                  Open Full Page
                </Link>
              </div>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setUserDetails(null);
                  setSelectedUser(null);
                }}
                className="text-2xl hover:text-gray-200 transition"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 flex">
              <button
                onClick={() => setDetailsTab("overview")}
                className={`flex-1 py-3 px-4 text-sm font-semibold transition ${
                  detailsTab === "overview"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                👤 Overview
              </button>
              <button
                onClick={() => setDetailsTab("shops")}
                className={`flex-1 py-3 px-4 text-sm font-semibold transition ${
                  detailsTab === "shops"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                🏪 Connected Shops
              </button>
              <button
                onClick={() => setDetailsTab("offers")}
                className={`flex-1 py-3 px-4 text-sm font-semibold transition ${
                  detailsTab === "offers"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📋 Offers
              </button>
              <button
                onClick={() => setDetailsTab("visits")}
                className={`flex-1 py-3 px-4 text-sm font-semibold transition ${
                  detailsTab === "visits"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ⏱️ Activity
              </button>
            </div>

            {/* Content Area */}
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {loadingDetails ? (
                <div className="flex justify-center items-center py-8">
                  <p className="text-gray-500">Loading details...</p>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {detailsTab === "overview" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wide">User ID</label>
                          <p className="font-semibold text-gray-900">#{selectedUser.id}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
                          <p className="font-semibold text-gray-900">{selectedUser.email}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide">Role</label>
                        <p className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getRoleBadgeColor(selectedUser.role)}`}>
                          {getRoleIcon(selectedUser.role)} {selectedUser.role}
                        </p>
                      </div>
                      {userDetails && userDetails.createdAt && (
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wide">Joined Date</label>
                          <p className="font-semibold text-gray-900">
                            {new Date(userDetails.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {userDetails && (
                        <>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-xs text-gray-600">Connected Shops</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {userDetails.connectedShopsCount || 0}
                              </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <p className="text-xs text-gray-600">Account Visits</p>
                              <p className="text-2xl font-bold text-green-600">
                                {userDetails.accountVisits || 0}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <p className="text-xs text-gray-600">Active Bookmarks</p>
                              <p className="text-2xl font-bold text-purple-600">
                                {userDetails.bookmarkedShops?.length || 0}
                              </p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                              <p className="text-xs text-gray-600">Viewed Offers</p>
                              <p className="text-2xl font-bold text-orange-600">
                                {userDetails.viewedOffers?.length || 0}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Connected Shops Tab */}
                  {detailsTab === "shops" && (
                    <div className="space-y-3">
                      {userDetails && userDetails.bookmarkedShops && userDetails.bookmarkedShops.length > 0 ? (
                        <>
                          <p className="text-sm text-gray-600 font-semibold">📍 Bookmarked Shops ({userDetails.bookmarkedShops.length})</p>
                          {userDetails.bookmarkedShops.map((shop) => (
                            <div key={shop.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900">{shop.shopName}</p>
                                  <p className="text-sm text-gray-600">Owner: {shop.ownerName}</p>
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <MapPin className="w-3 h-3" /> {shop.area}
                                  </div>
                                  <p className="text-xs text-gray-500">📧 {shop.email}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  shop.registrationStatus === "APPROVED" 
                                    ? "bg-green-100 text-green-800"
                                    : shop.registrationStatus === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {shop.registrationStatus}
                                </span>
                              </div>
                              {shop.category && (
                                <p className="text-xs mt-2 text-blue-600">🏷️ {shop.category}</p>
                              )}
                              <div className="mt-2 flex justify-end">
                                <Link to={`/admin/shops/${shop.id}`} className="text-sm text-blue-600">Open Shop</Link>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <p className="text-gray-500 text-sm">No bookmarked shops</p>
                      )}
                    </div>
                  )}

                  {/* Offers Tab */}
                  {detailsTab === "offers" && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">✨ Active Offers Viewed ({userDetails?.viewedOffers?.length || 0})</p>
                        {userDetails && userDetails.viewedOffers && userDetails.viewedOffers.length > 0 ? (
                          <div className="mt-2 space-y-2">
                            {userDetails.viewedOffers.slice(0, 5).map((offer) => (
                              <div key={offer.id} className="border border-gray-200 rounded p-2 text-sm">
                                <p className="font-semibold text-gray-900">{offer.title}</p>
                                <p className="text-xs text-gray-600">From: {offer.shopName}</p>
                                <p className="text-xs text-gray-500">📍 {offer.area}</p>
                              </div>
                            ))}
                            {userDetails.viewedOffers.length > 5 && (
                              <p className="text-xs text-gray-500 italic">+{userDetails.viewedOffers.length - 5} more offers</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-xs mt-2">No offers viewed</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">📜 Past Offers History ({userDetails?.pastOffers?.length || 0})</p>
                        {userDetails && userDetails.pastOffers && userDetails.pastOffers.length > 0 ? (
                          <div className="mt-2 space-y-2">
                            {userDetails.pastOffers.slice(0, 3).map((offer) => (
                              <div key={offer.id} className="border border-gray-200 rounded p-2 text-sm bg-gray-50">
                                <p className="font-semibold text-gray-700">{offer.title}</p>
                                <p className="text-xs text-gray-500">Expired: {new Date(offer.expiryDate).toLocaleDateString()}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-xs mt-2">No past offers</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Activity Tab */}
                  {detailsTab === "visits" && (
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-semibold">⏱️ Account Visit Metrics</p>
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Total Visits:</span>
                            <span className="font-bold text-gray-900">{userDetails?.accountVisits || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Last Visit:</span>
                            <span className="font-bold text-gray-900">
                              {userDetails?.lastLoginDate 
                                ? new Date(userDetails.lastLoginDate).toLocaleDateString()
                                : "Never"
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Profile Views:</span>
                            <span className="font-bold text-gray-900">{userDetails?.profileViews || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-semibold">📊 Engagement Score</p>
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all" 
                              style={{width: `${Math.min((userDetails?.engagementScore || 0), 100)}%`}}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">Score: {userDetails?.engagementScore || 0}/100</p>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-semibold">🎯 Activity Summary</p>
                        <div className="mt-3 text-sm space-y-1">
                          <p className="text-gray-700">• Likes Given: <span className="font-bold">{userDetails?.likesCount || 0}</span></p>
                          <p className="text-gray-700">• Bookmarks Created: <span className="font-bold">{userDetails?.bookmarksCount || 0}</span></p>
                          <p className="text-gray-700">• Shops Visited: <span className="font-bold">{userDetails?.shopsVisited || 0}</span></p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
