import React, { useState, useEffect } from "react";
import { useApi } from "../api/client";
import axios from "axios";
import { Search, Download, Check, X, Eye } from "lucide-react";

export default function ShopsManagement() {
  const api = useApi();
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [monthlyStats, setMonthlyStats] = useState({});
  const [stats, setStats] = useState({});
  const [selectedShop, setSelectedShop] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
    fetchStats();
    fetchMonthlyStats();
  }, []);

  useEffect(() => {
    filterShops();
  }, [shops, search, statusFilter, monthFilter]);

  const fetchShops = async () => {
    try {
      const response = await api.get("/admin/shops");
      setShops(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching shops:", error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/shops/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const response = await api.get("/admin/shops/by-month");
      setMonthlyStats(response.data);
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
    }
  };

  const filterShops = () => {
    let filtered = [...shops];

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (shop) => shop.registrationStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (monthFilter) {
      filtered = filtered.filter(
        (shop) =>
          shop.registrationDate &&
          shop.registrationDate.startsWith(monthFilter)
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (shop) =>
          shop.shopName.toLowerCase().includes(searchLower) ||
          shop.email.toLowerCase().includes(searchLower) ||
          shop.ownerName.toLowerCase().includes(searchLower)
      );
    }

    setFilteredShops(filtered);
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/shops/${id}/approve`);
      alert("Shop approved successfully!");
      fetchShops();
      fetchStats();
    } catch (error) {
      alert("Error approving shop");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/shops/${id}/reject`);
      alert("Shop rejected!");
      fetchShops();
      fetchStats();
    } catch (error) {
      alert("Error rejecting shop");
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <h3 className="text-sm font-semibold opacity-90">Total Shops</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalShops || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-semibold opacity-90">Approved</h3>
          <p className="text-3xl font-bold mt-2">{stats.approvedShops || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-semibold opacity-90">Pending</h3>
          <p className="text-3xl font-bold mt-2">{stats.pendingShops || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-semibold opacity-90">Rejected</h3>
          <p className="text-3xl font-bold mt-2">{stats.rejectedShops || 0}</p>
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
            placeholder="Search by shop name, email, or owner name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Registration Month
            </label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Months</option>
              {Object.keys(monthlyStats).map((month) => (
                <option key={month} value={month}>
                  {month} ({monthlyStats[month]} shops)
                </option>
              ))}
            </select>
          </div>

          {/* Results Info */}
          <div className="col-span-2 md:col-span-2 flex items-end">
            <div className="w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                Showing <span className="font-bold text-blue-600">{filteredShops.length}</span> of{" "}
                <span className="font-bold">{shops.length}</span> shops
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shops Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Shop Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Registered
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredShops.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No shops found matching your filters
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => (
                  <tr
                    key={shop.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {shop.shopName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {shop.ownerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {shop.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {shop.area}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(shop.registrationStatus)}`}>
                        {shop.registrationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(shop.registrationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center space-x-2 flex justify-center items-center">
                      <button
                        onClick={() => {
                          setSelectedShop(shop);
                          setShowDetails(true);
                        }}
                        className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {shop.registrationStatus === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(shop.id)}
                            className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(shop.id)}
                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold">{selectedShop.shopName}</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-2xl hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Owner Name</label>
                  <p className="font-semibold text-gray-900">{selectedShop.ownerName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-semibold text-gray-900">{selectedShop.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Mobile</label>
                  <p className="font-semibold text-gray-900">{selectedShop.mobileNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <p className={`font-semibold inline-block px-3 py-1 rounded-full text-xs ${getStatusBadgeColor(selectedShop.registrationStatus)}`}>
                    {selectedShop.registrationStatus}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Area</label>
                  <p className="font-semibold text-gray-900">{selectedShop.area}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <p className="font-semibold text-gray-900">{selectedShop.category}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Address</label>
                <p className="font-semibold text-gray-900">{selectedShop.address}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Documents</label>
                <div className="space-y-2">
                  {selectedShop.shopRegistrationDoc && (
                    <p className="text-sm text-blue-600 flex items-center gap-2">
                      <Download className="w-4 h-4" /> Shop Registration Doc
                    </p>
                  )}
                  {selectedShop.gstDoc && (
                    <p className="text-sm text-blue-600 flex items-center gap-2">
                      <Download className="w-4 h-4" /> GST Document
                    </p>
                  )}
                  {selectedShop.ownerIdDoc && (
                    <p className="text-sm text-blue-600 flex items-center gap-2">
                      <Download className="w-4 h-4" /> Owner ID
                    </p>
                  )}
                  {selectedShop.addressProofDoc && (
                    <p className="text-sm text-blue-600 flex items-center gap-2">
                      <Download className="w-4 h-4" /> Address Proof
                    </p>
                  )}
                </div>
              </div>
              <div className="pt-4 border-t">
                <label className="text-sm text-gray-600">Registered Date</label>
                <p className="font-semibold text-gray-900">
                  {new Date(selectedShop.registrationDate).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
