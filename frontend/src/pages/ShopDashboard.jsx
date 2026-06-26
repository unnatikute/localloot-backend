import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ShopDashboard = () => {
  const [offers, setOffers] = useState([]);
  const [shop, setShop] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    area: "",
    googleMapUrl: "",
    imageFile: null,
    price: "",
    originalPrice: "",
    discount: "",
    validFrom: "",
    validUntil: "",
    durationType: "DAYS",
    durationValue: "",
    attachmentUrls: "",
    shopkeeper: { id: user?.id },
  });

  useEffect(() => {
    if (user?.id) {
      axios
        .get(`http://localhost:8080/api/offers/shopkeeper/${user.id}`)
        .then((res) => setOffers(res.data))
        .catch((err) => console.log(err));

      axios
        .get(`http://localhost:8080/api/shops/by-user/${user.id}`)
        .then((res) => setShop(res.data[0] || null))
        .catch((err) => console.log(err));
    }
  }, [user?.id]);

  const getValidityLabel = (offer) => {
    const now = new Date();
    const from = offer.validFrom ? new Date(offer.validFrom) : null;
    const until = offer.validUntil ? new Date(offer.validUntil) : null;

    if (offer.status !== "APPROVED") return null;

    if (from && now < from) {
      return `Starts from ${from.toLocaleString()}`;
    }

    if (until) {
      if (now > until) {
        return "Expired";
      }
      const diffMs = until - now;
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      return `Active for ${days}d ${hours}h more`;
    }

    return "Active";
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.imageFile) {
        alert("Please select an image");
        return;
      }

      const formDataToSend = new FormData();

      formDataToSend.append("image", formData.imageFile);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("area", formData.area);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("googleMapUrl", formData.googleMapUrl);
      formDataToSend.append("shopkeeperId", user.id);
      formDataToSend.append("validFrom", formData.validFrom);
formDataToSend.append("validUntil", formData.validUntil);


      const res = await axios.post(
        "http://localhost:8080/api/offers/create",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      // ✅ Add new offer to UI instantly
      const newOffer = {
        ...res.data,
        status: "PENDING", // default
      };

      setOffers([newOffer, ...offers]);

      alert("Offer submitted! Status: PENDING");

      setShowForm(false);
    } catch (err) {
  console.error(err);

  if (err.response?.data) {
    alert(err.response.data);
  } else {
    alert("Error submitting offer");
  }
}
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* ✅ TITLE */}
      <h1 className="text-3xl font-bold mb-4">Shop Dashboard</h1>

      {/* ✅ SHOP STATUS */}
      {shop && (
        <div className="mb-6 p-4 rounded-lg border bg-white shadow-sm flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">{shop.shopName}</h2>
            <p className="text-sm text-gray-600">{shop.category}</p>
          </div>

          <span
            className={`px-4 py-1 rounded text-sm font-semibold ${
              shop.registrationStatus === "APPROVED"
                ? "bg-green-100 text-green-700"
                : shop.registrationStatus === "PENDING"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {shop.registrationStatus}
          </span>
        </div>
      )}

      {/* ✅ BUTTONS */}
      <div className="flex justify-end gap-3 mb-8">
        <Link
          to="/shopkeeper-subscription"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
        >
          Subscription History
        </Link>

        <button
          onClick={() => setShowForm(!showForm)}
          disabled={shop?.registrationStatus !== "APPROVED"}
          className={`px-4 py-2 rounded ${
            shop?.registrationStatus !== "APPROVED"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white"
          }`}
        >
          {showForm ? "Close Form" : "+ Add New Offer"}
        </button>
      </div>

      {/* ✅ FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 p-6 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            placeholder="Offer Title"
            className="p-2 border rounded"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Category"
            className="p-2 border rounded"
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Area"
            className="p-2 border rounded"
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            required
          />
         <div className="md:col-span-2">
  <button
    type="button"
    className="bg-blue-600 text-white px-4 py-2 rounded"
    onClick={() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude},${position.coords.longitude}`;

          setFormData({
            ...formData,
            googleMapUrl: coords,
          });

          alert("Location captured successfully!");
        },
        (error) => {
          alert("Unable to get location");
          console.error(error);
        }
      );
    }}
  >
    Get Current Location
  </button>

  {formData.googleMapUrl && (
    <p className="mt-2 text-sm text-green-600">
      Location: {formData.googleMapUrl}
    </p>
  )}
</div>
          <input
  type="datetime-local"
  className="p-2 border rounded"
  onChange={(e) =>
    setFormData({ ...formData, validFrom: e.target.value })
  }
/>

<input
  type="datetime-local"
  className="p-2 border rounded"
  onChange={(e) =>
    setFormData({ ...formData, validUntil: e.target.value })
  }
/>
          <input
            type="file"
            accept="image/*"
            className="p-2 border rounded md:col-span-2"
            onChange={(e) =>
              setFormData({ ...formData, imageFile: e.target.files[0] })
            }
          />

          <button
            type="submit"
            className="bg-green-600 text-white p-2 rounded md:col-span-2"
          >
            Submit for Approval
          </button>
        </form>
      )}

      {/* ✅ OFFERS */}
      <h2 className="text-xl font-semibold mb-4">My Offers Status</h2>

      <div className="grid grid-cols-1 gap-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="border p-4 rounded flex justify-between items-center bg-white shadow-sm"
          >
            <div>
              <h3 className="font-bold">{offer.title}</h3>
              <p className="text-sm text-gray-600">
                {offer.shopName} - {offer.area}
              </p>

              {getValidityLabel(offer) && (
                <p className="text-xs text-blue-600 mt-1">
                  {getValidityLabel(offer)}
                </p>
              )}
            </div>

            <span
              className={`px-3 py-1 rounded text-sm ${
                offer.status === "APPROVED"
                  ? "bg-green-100 text-green-700"
                  : offer.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {offer.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopDashboard;
