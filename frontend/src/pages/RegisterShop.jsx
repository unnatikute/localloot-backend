import React, { useState, useEffect } from "react";
import { useApi } from "../api"; // ✅ use hook-based API (no localhost risk)

const RegisterShop = () => {
  const api = useApi(); // ✅ correct usage

  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    name: "",
    address: "",
    category: "",
    description: "",
    phone: "",
    email: "",
  });

  const [document, setDocument] = useState(null);

  const [existingShop, setExistingShop] = useState(null);
  const [loading, setLoading] = useState(true);

  // CHECK IF SHOP EXISTS
  useEffect(() => {
    if (user?.id) {
      api
        .get(`/shops/by-user/${user.id}`)
        .then((res) => {
          if (res.data?.length > 0) {
            setExistingShop(res.data[0]);
          }
        })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setDocument(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        shopName: form.name,
        address: form.address,
        category: form.category,
        description: form.description,
        mobileNumber: form.phone,
        email: form.email,
      };

      const formData = new FormData();
      formData.append("shop", JSON.stringify(data));
      formData.append("userId", user.id);

      if (document) {
        formData.append("document", document);
      }

      await api.post("/shops", formData); // ✅ FIXED (await added)

      alert("Shop registered successfully! Waiting for admin approval.");

      window.location.reload();
    } catch (err) {
      alert("Error: " + (err.response?.data || err.message));
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (existingShop) {
    return (
      <div className="max-w-xl mx-auto bg-white p-6 mt-10 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Shop Status</h2>

        <div className="p-4 border rounded">
          <h3 className="font-bold text-lg">{existingShop.shopName}</h3>
          <p className="text-gray-600">{existingShop.category}</p>

          <span
            className={`mt-3 inline-block px-4 py-1 rounded text-sm font-semibold ${
              existingShop.registrationStatus === "APPROVED"
                ? "bg-green-100 text-green-700"
                : existingShop.registrationStatus === "PENDING"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {existingShop.registrationStatus}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 mt-10 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register Your Shop</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Shop Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border p-2"
        />

        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
          className="w-full border p-2"
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
          className="w-full border p-2"
        />

        <input
          name="phone"
          placeholder="Contact Number"
          value={form.phone}
          onChange={handleChange}
          required
          className="w-full border p-2"
        />

        <input
          name="email"
          placeholder="Shop Email (optional)"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-2"
        />

        <input
          type="file"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.pdf"
          required
          className="w-full border p-2"
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Register Shop
        </button>
      </form>
    </div>
  );
};

export default RegisterShop;