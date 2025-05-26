import { useState, useEffect } from "react";

export default function AddressModal({ isOpen, onClose, onSave, editAddress }) {
  const [form, setForm] = useState({
    name: "",
    streetNumber: "",
    wardNo: "",
    place: "",
    pinCode: "",
    mobileNumber: "",
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (editAddress) {
      setForm(editAddress);
    } else {
      setForm({
        name: "",
        streetNumber: "",
        wardNo: "",
        place: "",
        pinCode: "",
        mobileNumber: "",
      });
    }
  }, [editAddress, isOpen]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const url = editAddress ? "/api/address/edit" : "/api/address/add";
    const method = editAddress ? "PUT" : "POST";

    const payload = editAddress ? { ...form, _id: editAddress._id } : form;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed");

      const saved = await res.json();

      alert("Address saved!");
      onSave(saved);
      onClose();
    } catch {
      alert("Error saving address.");
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        onClick={() => setShowModal(true)}
        className="bg-white rounded p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">
          {editAddress ? "Edit Address" : "Add New Address"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            required
            name="streetNumber"
            placeholder="Street Number"
            value={form.streetNumber}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            required
            name="wardNo"
            placeholder="Ward No"
            value={form.wardNo}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            required
            name="place"
            placeholder="Place"
            value={form.place}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            required
            name="pinCode"
            placeholder="Pin Code"
            maxLength={6}
            value={form.pinCode}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            required
            name="mobileNumber"
            placeholder="Mobile Number"
            maxLength={10}
            value={form.mobileNumber}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
              {editAddress ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
