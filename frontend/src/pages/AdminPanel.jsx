import React, { useState, useEffect } from "react";
import axios from "axios";
import ShopsManagement from "../components/AdminShopsTab";
import UsersManagement from "../components/AdminUsersTab";
import AnalyticsTab from "../components/AdminAnalyticsTab";
import { ClipboardCheck, Star, Store, Users, BarChart3 } from "lucide-react";
import { getOfferImage, DEFAULT_IMAGES } from "../utils/images.js";
import SafeImage from "../components/SafeImage.jsx";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("offers");
  const [pendingOffers, setPendingOffers] = useState([]);
  const [approvedWithPlan, setApprovedWithPlan] = useState([]);
  const [topSelectedIds, setTopSelectedIds] = useState([]);

  // ---------------- FETCH ----------------
  const fetchPending = async () => {
    const res = await axios.get(
      "http://localhost:8080/api/admin/offers/pending",
    );
    setPendingOffers(res.data || []);
  };

  //const fetchApprovedWithPlan = async () => {
  // const res = await axios.get(
  //"http://localhost:8080/api/admin/offers/${id}/approve"
  //);//
  //setApprovedWithPlan(res.data || []);
  // };

  const fetchTop = async () => {
    const res = await axios.get("http://localhost:8080/api/offers/top");
    setTopSelectedIds(res.data.map((o) => o.id));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  useEffect(() => {
    if (activeTab === "top5") {
      fetchApprovedWithPlan();
      fetchTop();
    }
  }, [activeTab]);

  // ---------------- ACTIONS ----------------
  const handleApprove = async (id) => {
    await axios.put(`http://localhost:8080/api/admin/offers/${id}/approve`);
    fetchPending();
  };

  const handleReject = async (id) => {
    await axios.put(`http://localhost:8080/api/admin/offers/${id}/reject`);
    fetchPending();
  };
  const fetchApprovedWithPlan = async () => {
    const res = await axios.get(
      "http://localhost:8080/api/admin/offers/approved-with-plan",
    );
    setApprovedWithPlan(res.data || []);
  };

  // ---------------- TOP LOGIC ----------------
  const toggleTop = (offerId, remainingTop) => {
    setTopSelectedIds((prev) => {
      if (prev.includes(offerId)) {
        return prev.filter((id) => id !== offerId);
      }
      if (remainingTop <= 0) {
        alert("Top limit reached");
        return prev;
      }
      return [...prev, offerId];
    });
  };

  const saveTop = async () => {
    await axios.put(
      "http://localhost:8080/api/offers/admin/top5",
      topSelectedIds,
    );

    alert("Top offers updated");
    fetchTop();
    fetchApprovedWithPlan();
  };

   return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-lg p-5 space-y-4">
        <h1 className="text-2xl font-bold text-blue-600">Admin</h1>

        <button
          onClick={() => setActiveTab("offers")}
          className={`flex items-center gap-2 p-2 rounded ${activeTab === "offers" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
        >
          <ClipboardCheck size={18} /> Offers
        </button>

        <button
          onClick={() => setActiveTab("top5")}
          className={`flex items-center gap-2 p-2 rounded ${activeTab === "top5" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
        >
          <Star size={18} /> Top Offers
        </button>

        <button
          onClick={() => setActiveTab("shops")}
          className={`flex items-center gap-2 p-2 rounded ${activeTab === "shops" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
        >
          <Store size={18} /> Shops
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 p-2 rounded ${activeTab === "users" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
        >
          <Users size={18} /> Users
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 p-2 rounded ${activeTab === "analytics" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
        >
          <BarChart3 size={18} /> Analytics
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">
        {/* ---------------- PENDING ---------------- */}
        {activeTab === "offers" && (
          <div className="space-y-4">
            {pendingOffers.length === 0 && (
              <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
                ✅ All offers are approved. No pending requests.
              </div>
            )}

            {pendingOffers.map((item) => {
              const offer = item;

              return (
                <div
                  key={offer.id}
                  className="border p-4 rounded flex justify-between items-center bg-white"
                >
                  {/* LEFT */}
                  <div>
                    <h3 className="font-bold">{offer.title}</h3>
                    <p>Shop: {offer.shopName}</p>
                    <p>Area: {offer.area}</p>
                  </div>

                  {/* RIGHT BUTTONS */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(offer.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(offer.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ---------------- TOP OFFERS ---------------- */}
        {activeTab === "top5" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">⭐ Manage Top Offers</h2>

        <div className="mb-6">
  <h3 className="text-lg font-semibold mb-3">Currently Selected Top Offers</h3>

  <div className="grid gap-3">
    {approvedWithPlan
      .filter((item) => topSelectedIds.includes(item.offer.id))
      .map((item) => (
        <div
          key={item.offer.id}
          className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex justify-between items-center"
        >
          <div>
            <h4 className="font-bold">{item.offer.title}</h4>
            <p className="text-sm text-gray-600">{item.offer.shopName}</p>
          </div>

          <button
            onClick={() =>
              setTopSelectedIds((prev) =>
                prev.filter((id) => id !== item.offer.id),
              )
            }
            className="px-4 py-1 bg-red-500 text-white rounded"
          >
            Remove
          </button>
        </div>
      ))}
  </div>
</div>

<h3 className="text-lg font-semibold mb-3">Available Offers</h3>

<div className="grid gap-4">
  {approvedWithPlan
    .filter((item) => !topSelectedIds.includes(item.offer.id))
    .map((item) => {
                const offer = item.offer;

                const plan =
                  item.plan || item.subscriptionPackage?.name || "FREE";

                const limit =
                  item.topOfferLimit ??
                  item.subscriptionPackage?.monthlyOfferLimit ??
                  0;

                const used = item.used ?? item.offersUsedThisPeriod ?? 0;

                const remaining = item.remainingTopOffers ?? limit - used;

                const selected = topSelectedIds.includes(offer.id);

                return (
                  <div
                    key={offer.id}
                    className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                  >
                    <div className="flex gap-4">
                      <SafeImage
                        src={offer?.image_url || offer?.imageUrl || offer?.image}
                        alt={offer.title}
                        fallback={DEFAULT_IMAGES.offer}
                        className="w-40 h-28 object-cover rounded-lg"
                      />

                      <div>
                        <h3 className="font-bold">{offer.title}</h3>
                        <p>Shop: {offer.shopName}</p>

                        <p className="text-blue-600 text-sm">Plan: {plan}</p>

                        <p className="text-green-600 text-sm">
                          Limit: {limit} | Remaining: {remaining}
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleTop(offer.id, remaining)}
                      className="w-5 h-5"
                    />
                  </div>
                );
              })}
            </div>

            <button
              onClick={saveTop}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Save Top Offers
            </button>
          </div>
        )}

        {activeTab === "shops" && <ShopsManagement />}
        {activeTab === "users" && <UsersManagement />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
};

export default AdminPanel;
