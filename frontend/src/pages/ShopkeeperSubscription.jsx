import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Package,
  DollarSign,
  Calendar,
  TrendingUp,
  FileText,
  History,
} from "lucide-react";

const ShopkeeperSubscription = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("overview");

  const [subscriptionInfo, setSubscriptionInfo] = useState({
    subscription: null,
    package: null,
    offersUsed: 0,
    offersLimit: 0,
    daysRemaining: null,
  });
  const [shop, setShop] = useState(null);
  const [packages, setPackages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [offerHistory, setOfferHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSubscription(),
        fetchPackages(),
        fetchPayments(),
        fetchOfferHistory(),
        fetchShop(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/subscriptions/my-subscription?shopkeeperId=${user.id}`,
      );

      setSubscriptionInfo({
        subscription: res.data.subscription || null,
        package: res.data.package || null,
        offersUsed: res.data.offersUsed ?? 0,
        offersLimit: res.data.offersLimit ?? 0,
        daysRemaining: res.data.daysRemaining ?? null,
      });
    } catch (err) {
      console.log("No subscription yet"); // ✅ IMPORTANT

      setSubscriptionInfo({
        subscription: null,
        package: null,
        offersUsed: 0,
        offersLimit: 0,
        daysRemaining: null,
      });
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/subscriptions/packages?active=true",
      );
      setPackages(res.data);
    } catch (err) {
      console.error("Error fetching packages:", err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/subscriptions/payments?shopkeeperId=${user.id}`,
      );
      setPayments(res.data);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  const fetchShop = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/shops/by-user/${user.id}`,
      );
      setShop(res.data[0] || null);
    } catch (err) {
      setShop(null); // no shop
    }
  };
  const fetchOfferHistory = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/offers/history/${user.id}`,
      );
      setOfferHistory(res.data);
    } catch (err) {
      console.error("Error fetching offer history:", err);
    }
  };

  const subscribeToPackage = async (packageId, durationType) => {
    try {
      await axios.post("http://localhost:8080/api/subscriptions/subscribe", {
        shopkeeperId: user.id,
        packageId: packageId,
        durationType: durationType,
      });
      alert("Subscription activated successfully!");
      fetchData();
    } catch (err) {
      alert(
        "Failed to subscribe: " + (err.response?.data?.error || err.message),
      );
    }
  };

  const payWithStripe = async (packageId, durationType) => {
    try {
      const res = await axios.post("/api/payments/stripe/checkout-session", {
        packageId,
        durationType,
        successUrl: `${window.location.origin}/shopkeeper-subscription?payment=stripe_success`,
        cancelUrl: `${window.location.origin}/shopkeeper-subscription?payment=stripe_cancel`,
      });
      const stripeResponse = JSON.parse(res.data.stripeResponse);
      if (stripeResponse.url) {
        window.location.href = stripeResponse.url;
        return;
      }
      alert("Stripe session created, but URL was not returned. Check console.");
      console.log("Stripe response:", stripeResponse);
    } catch (err) {
      alert(
        "Stripe payment setup failed: " +
          (err.response?.data?.error || err.message),
      );
      console.error(err.response?.data || err);
    }
  };

  const payWithRazorpay = async (packageId, durationType) => {
    try {
      const res = await axios.post("/api/payments/razorpay/order", {
        packageId,
        durationType,
      });
      // For full Razorpay Checkout, we’d load Razorpay Checkout JS and open the payment modal.
      // For now we expose the order payload to confirm backend integration works.
      alert("Razorpay order created. Open console to see order details.");
      console.log("Razorpay payload:", res.data);
    } catch (err) {
      alert(
        "Razorpay payment setup failed: " +
          (err.response?.data?.error || err.message),
      );
      console.error(err.response?.data || err);
    }
  };

  const renewSubscription = async (durationType) => {
    try {
      const currentPkgId =
        subscriptionInfo.package?.id ||
        subscriptionInfo.subscription?.subscriptionPackage?.id;
      await axios.post("http://localhost:8080/api/subscriptions/renew", {
        shopkeeperId: user.id,
        packageId: currentPkgId || null,
        durationType,
      });
      alert("Subscription renewed successfully!");
      fetchData();
    } catch (err) {
      alert("Failed to renew: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">Loading...</div>
    );
  }

  // ✅ ADD HERE 👇
  if (!shop) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold mb-4">
          Please register your shop first
        </h2>
        <button
          onClick={() => (window.location.href = "/register-shop")}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Register Shop
        </button>
      </div>
    );
  }

  if (shop.registrationStatus === "PENDING") {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-yellow-600">
          Your shop is under admin approval
        </h2>
      </div>
    );
  }

  if (shop.registrationStatus === "REJECTED") {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-red-600">
          Your shop was rejected. Contact admin.
        </h2>
      </div>
    );
  }

  const isActive = !!subscriptionInfo.subscription;
  const isExpired =
    subscriptionInfo.daysRemaining !== null &&
    subscriptionInfo.daysRemaining <= 0;

  const isExpiringSoon =
    subscriptionInfo.daysRemaining !== null &&
    subscriptionInfo.daysRemaining <= 7;

  const offersUsed = subscriptionInfo.offersUsed || 0;
  const offersLimit = subscriptionInfo.offersLimit || 0;
  const usagePercentage =
    offersLimit > 0 ? (offersUsed / offersLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
          <Package className="w-10 h-10" />
          Subscription & Offers Management
        </h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 font-semibold whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("packages")}
              className={`px-6 py-4 font-semibold whitespace-nowrap ${
                activeTab === "packages"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Subscribe
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-6 py-4 font-semibold whitespace-nowrap ${
                activeTab === "payments"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Payment History
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-4 font-semibold whitespace-nowrap ${
                activeTab === "history"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Offer History
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Current Subscription Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Current Subscription</h2>
              {subscriptionInfo.subscription ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Package</p>
                      <p className="text-xl font-bold">
                        {subscriptionInfo.package?.name || "N/A"}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-xl font-bold text-green-600">
                        {subscriptionInfo.subscription.status || "ACTIVE"}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Valid Until</p>
                      <p className="text-xl font-bold">
                        {subscriptionInfo.subscription.endDate
                          ? new Date(
                              subscriptionInfo.subscription.endDate,
                            ).toLocaleDateString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">
                        Offers Used This Period
                      </span>
                      <span className="font-bold">
                        {offersUsed} / {offersLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all ${
                          usagePercentage >= 90
                            ? "bg-red-500"
                            : usagePercentage >= 70
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {offersLimit - offersUsed} offers remaining
                    </p>
                  </div>

                  {subscriptionInfo.daysRemaining !== null && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-sm">
                        <strong>Days Remaining:</strong>{" "}
                        {subscriptionInfo.daysRemaining} days
                      </p>
                      {isExpiringSoon && (
                        <p className="text-sm text-red-600 mt-1">
                          ⚠️ Your subscription expires soon! Renew to continue
                          displaying offers.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => renewSubscription("MONTHLY")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Renew Monthly
                    </button>
                    <button
                      onClick={() => renewSubscription("YEARLY")}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Renew Yearly
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">No active subscription</p>
                  <button
                    onClick={() => setActiveTab("packages")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Subscribe Now
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Payments</p>
                    <p className="text-2xl font-bold">{payments.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <History className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Offer Actions</p>
                    <p className="text-2xl font-bold">{offerHistory.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Usage Rate</p>
                    <p className="text-2xl font-bold">
                      {Math.round(usagePercentage)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === "packages" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">
              Available Subscription Packages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition"
                >
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-4">{pkg.description}</p>
                  <div className="space-y-2 mb-4">
                    <p>
                      <strong>Monthly:</strong> {pkg.monthlyOfferLimit} offers -
                      ₹{pkg.monthlyPrice}
                    </p>
                    <p>
                      <strong>Yearly:</strong> {pkg.yearlyOfferLimit} offers - ₹
                      {pkg.yearlyPrice}
                    </p>
                    <p>
                      <strong>Top Offer Limit:</strong> {pkg.topOffersAllowed}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={isActive && !isExpired}
                      onClick={() => subscribeToPackage(pkg.id, "MONTHLY")}
                      className={`flex-1 px-4 py-2 rounded font-semibold ${
                        isActive && !isExpired
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      Subscribe Monthly
                    </button>
                    <button
                      disabled={isActive && !isExpired}
                      onClick={() => subscribeToPackage(pkg.id, "YEARLY")}
                      className={`flex-1 px-4 py-2 rounded font-semibold ${
                        isActive && !isExpired
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      Subscribe Yearly
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">
              Payment History & Invoices
            </h2>
            {payments.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No payment history found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Invoice #</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Package</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Period</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Invoice PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3 font-mono text-sm">
                          {payment.invoiceNumber}
                        </td>
                        <td className="p-3">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          {payment.subscriptionPackage?.name || "N/A"}
                        </td>
                        <td className="p-3 font-bold">₹{payment.amount}</td>
                        <td className="p-3 text-sm">
                          {payment.periodStart && payment.periodEnd
                            ? `${new Date(payment.periodStart).toLocaleDateString()} - ${new Date(payment.periodEnd).toLocaleDateString()}`
                            : "N/A"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              payment.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <a
                            className="text-blue-600 hover:underline text-sm font-semibold"
                            href={`/api/subscriptions/payments/${payment.id}/invoice.pdf`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Offer Approval History</h2>
            {offerHistory.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No offer history found
              </p>
            ) : (
              <div className="space-y-4">
                {offerHistory.map((history) => (
                  <div
                    key={history.id}
                    className="border-2 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">
                          {history.offer?.title || "N/A"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(history.actionDate).toLocaleString()}
                        </p>
                        <div className="space-y-1 text-sm text-gray-600 mt-2">
  {history.offer?.description && <p>{history.offer.description}</p>}

  {(history.offer?.startDate || history.offer?.endDate) && (
    <p>
      Valid:{" "}
      {history.offer?.startDate
        ? new Date(history.offer.startDate).toLocaleDateString("en-IN")
        : "N/A"}{" "}
      -{" "}
      {history.offer?.endDate
        ? new Date(history.offer.endDate).toLocaleDateString("en-IN")
        : "N/A"}
    </p>
  )}

  {history.offer?.discountValue && (
    <p>Discount: {history.offer.discountValue}</p>
  )}
</div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          history.action === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : history.action === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {history.action}
                      </span>
                    </div>
                    {history.comment && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Comment:</strong> {history.comment}
                      </p>
                    )}
                    {history.admin && (
                      <p className="text-xs text-gray-500 mt-1">
                        Processed by: {history.admin.name || "Admin"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopkeeperSubscription;
