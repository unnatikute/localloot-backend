import React, { useState, useEffect } from "react";
import axios from "axios";
import { useApi } from "../api/client";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";

export default function AnalyticsTab() {
  const api = useApi();
  const [analytics, setAnalytics] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchEngagement();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/admin/analytics");
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
  };

  const fetchEngagement = async () => {
    try {
      const response = await api.get("/admin/analytics/engagement");
      setEngagement(response.data);
    } catch (error) {
      console.error("Error fetching engagement:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold opacity-90">Total Users</h3>
              <p className="text-3xl font-bold mt-2">
                {analytics?.totalUsers || 0}
              </p>
            </div>
            <Users className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold opacity-90">Total Shops</h3>
              <p className="text-3xl font-bold mt-2">
                {analytics?.totalShops || 0}
              </p>
            </div>
            <ShoppingBag className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold opacity-90">Total Offers</h3>
              <p className="text-3xl font-bold mt-2">
                {analytics?.totalOffers || 0}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold opacity-90">
                Pending Approvals
              </h3>
              <p className="text-3xl font-bold mt-2">
                {(analytics?.offersByStatus?.pending || 0) +
                  (analytics?.shopsByStatus?.pending || 0)}
              </p>
            </div>
            <MessageCircle className="w-12 h-12 opacity-30" />
          </div>
        </div>
      </div>

      {/* Subscriptions & Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <p className="text-sm text-gray-600">Active Subscriptions</p>
          <p className="text-3xl font-bold mt-2 text-indigo-700">
            {analytics?.subscriptions?.active || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Total: {analytics?.subscriptions?.total || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <p className="text-sm text-gray-600">Revenue (Last 30 Days)</p>
          <p className="text-3xl font-bold mt-2 text-green-700">
            ₹{Math.round(analytics?.revenue?.last30Days || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Payments marked COMPLETED
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-3xl font-bold mt-2 text-blue-700">
            ₹{Math.round(analytics?.revenue?.total || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Last 365 days: ₹{Math.round(analytics?.revenue?.last365Days || 0)}
          </p>
        </div>
      </div>

      {/* Detailed Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            User Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="text-sm text-gray-600">Regular Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics?.totalUsersByRole?.users || 0}
                </p>
              </div>
              <div className="text-4xl opacity-30">👤</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div>
                <p className="text-sm text-gray-600">Shopkeepers</p>
                <p className="text-2xl font-bold text-orange-600">
                  {analytics?.totalUsersByRole?.shopkeepers || 0}
                </p>
              </div>
              <div className="text-4xl opacity-30">🏪</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div>
                <p className="text-sm text-gray-600">
                  Active Users (Engagement)
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {engagement?.activeUsers || 0}
                </p>
              </div>
              <div className="text-4xl opacity-30">⭐</div>
            </div>
          </div>
        </div>

        {/* Shop Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-green-600" />
            Shop Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="text-sm text-gray-600">Approved Shops</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics?.shopsByStatus?.approved || 0}
                </p>
              </div>
              <div className="text-4xl opacity-30">✓</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="text-sm text-gray-600">Pending Shops</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {analytics?.shopsByStatus?.pending || 0}
                </p>
              </div>
              <div className="text-4xl opacity-30">⏳</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <p className="text-sm text-gray-600">Rejected Shops</p>
                <p className="text-2xl font-bold text-red-600">
                  {analytics?.shopsByStatus?.rejected || 0}
                </p>
              </div>
              <div className="text-4xl opacity-30">✕</div>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          Offer Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 mb-2">Total Offers</p>
            <p className="text-3xl font-bold text-purple-600">
              {analytics?.totalOffers || 0}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-2">Approved Offers</p>
            <p className="text-3xl font-bold text-green-600">
              {analytics?.offersByStatus?.approved || 0}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-600 mb-2">Pending Offers</p>
            <p className="text-3xl font-bold text-yellow-600">
              {analytics?.offersByStatus?.pending || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Platform Engagement */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Platform Engagement & Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Active Shopkeepers</p>
            <p className="text-2xl font-bold text-blue-600">
              {engagement?.activeShopkeepers || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">Registered in system</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-2">Active Users</p>
            <p className="text-2xl font-bold text-green-600">
              {engagement?.activeUsers || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">Using the platform</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 mb-2">Live Offers</p>
            <p className="text-2xl font-bold text-purple-600">
              {engagement?.totalOffers || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">Available for browsing</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <p className="text-sm text-gray-600 mb-2">Approved Offers</p>
            <p className="text-2xl font-bold text-orange-600">
              {engagement?.approvedOffers || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">Live & active</p>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg shadow-md border border-indigo-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Platform Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">🎯 Platform Growth</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span>{analytics?.totalUsers || 0} total registered users</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                <span>
                  {analytics?.shopsByStatus?.approved || 0} approved shops
                  operational
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                <span>
                  {analytics?.offersByStatus?.approved || 0} active offers for
                  customers
                </span>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">⚠️ Pending Actions</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                <span>
                  {analytics?.shopsByStatus?.pending || 0} shop registrations
                  awaiting approval
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                <span>
                  {analytics?.offersByStatus?.pending || 0} offers pending
                  review
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                <span>
                  Rejection count: {analytics?.shopsByStatus?.rejected || 0}{" "}
                  shops
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div className="text-center text-sm text-gray-600 mt-4">
        Last updated:{" "}
        {analytics?.generatedAt
          ? new Date(analytics.generatedAt).toLocaleString()
          : "N/A"}
      </div>
    </div>
  );
}
