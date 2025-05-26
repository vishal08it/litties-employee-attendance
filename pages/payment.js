'use client';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function PaymentPage() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    _id: "",
    name: "",
    streetNumber: "",
    wardNo: "",
    place: "",
    pinCode: "",
    mobileNumber: "",
  });

  const baseAmount = 220;
  const deliveryCharge = baseAmount >= 299 ? 0 : 50;
  const deliveryMessage =
    baseAmount < 299 ? "(Order more than ₹299 for free delivery)" : "";
  const totalAmount = baseAmount + deliveryCharge;

  // Fetch addresses from API when step is 2 or modal closes
  useEffect(() => {
    if (step === 2) {
      const mobileNumber =
        modalData.mobileNumber || localStorage.getItem("userMobile") || "";

      if (mobileNumber) {
        fetch("/api/address/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobileNumber }),
        })
          .then((res) => res.json())
          .then((data) => {
            setAddresses(data);
          })
          .catch(console.error);
      }
    }
  }, [step]);

  const openAddModal = () => {
    setModalData({
      _id: "",
      name: "",
      streetNumber: "",
      wardNo: "",
      place: "",
      pinCode: "",
      mobileNumber: localStorage.getItem("userMobile") || "",
    });
    setShowModal(true);
  };

  const openEditModal = (address) => {
    setModalData(address);
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();

    const { name, streetNumber, wardNo, place, pinCode, mobileNumber } = modalData;
    if (!name || !streetNumber || !wardNo || !place || !pinCode || !mobileNumber) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/address/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modalData),
      });

      const savedAddress = await res.json();

      if (!res.ok) {
        alert(savedAddress.message || "Error saving address");
        return;
      }

      const updatedAddresses = addresses.filter((a) => a._id !== savedAddress._id);
      setAddresses([savedAddress, ...updatedAddresses]);

      setShowModal(false);
    } catch (err) {
      alert("Error saving address");
      console.error(err);
    }
  };

  const handleUseAddress = (address) => {
    setSelectedAddress(address);
    localStorage.setItem("selectedAddress", JSON.stringify(address));
    setStep(3);
  };

  const handleProceedPayment = () => {
    localStorage.setItem("paymentMode", paymentMethod);
    localStorage.setItem("finalAmount", totalAmount.toString());
    setStep(2);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-r from-orange-200 via-white to-green-300 flex items-center justify-center px-4">
        <div className="flex gap-6 overflow-x-auto max-w-screen-lg py-10">

          {/* Step 1: Payment Method */}
          <motion.div
            className="w-[350px] p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
            animate={{
              scale: step === 1 ? 1 : 0.95,
              opacity: step === 1 ? 1 : 0.4,
              filter: step === 1 ? "blur(0px)" : "blur(2px)",
            }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-center mb-4">Select Payment Method</h2>
            <div className="space-y-3">
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="Online Payment"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  checked={paymentMethod === "Online Payment"}
                />{" "}
                Online Payment
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  checked={paymentMethod === "Cash on Delivery"}
                />{" "}
                Cash on Delivery
              </label>
              <button
                onClick={handleProceedPayment}
                disabled={!paymentMethod}
                className={`w-full py-2 rounded mt-4 font-bold ${
                  paymentMethod
                    ? "bg-yellow-400 text-black"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Use this Payment Method
              </button>
            </div>

            <div className="mt-6 text-sm border-t pt-4 space-y-1">
              <p className="font-semibold">Items: ₹{baseAmount.toFixed(2)}</p>
              <p className="font-semibold">
                Delivery: ₹{deliveryCharge.toFixed(2)}{" "}
                {deliveryMessage && (
                  <span className="block text-xs text-red-600">{deliveryMessage}</span>
                )}
              </p>
              <p className="font-bold">Total: ₹{totalAmount.toFixed(2)}</p>
            </div>
          </motion.div>

          {/* Step 2: Select Address */}
          <motion.div
            className="w-[350px] p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
            animate={{
              scale: step === 2 ? 1 : 0.95,
              opacity: step === 2 ? 1 : 0.4,
              filter: step === 2 ? "blur(0px)" : "blur(2px)",
            }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-center mb-4">Select Address</h2>
            {addresses.length === 0 && <p>No addresses found for your mobile number.</p>}
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="mb-4 p-3 bg-gray-100 rounded shadow text-sm"
              >
                <p className="font-bold">{addr.name}</p>
                <p>{`${addr.streetNumber}, Ward No: ${addr.wardNo}`}</p>
                <p>{addr.place}</p>
                <p>Pin Code: {addr.pinCode}</p>
                <p>Mobile: {addr.mobileNumber}</p>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="px-2 py-1 bg-orange-400 text-white rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleUseAddress(addr)}
                    className="px-2 py-1 bg-yellow-400 text-black rounded text-xs"
                  >
                    Use This Address
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(1)}
                className="text-blue-600 underline"
              >
                ← Back
              </button>
              <button
                onClick={openAddModal}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm"
              >
                Add Address
              </button>
            </div>
          </motion.div>

          {/* Step 3: Checkout */}
          <motion.div
            className="w-[350px] p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
            animate={{
              scale: step === 3 ? 1 : 0.95,
              opacity: step === 3 ? 1 : 0.4,
              filter: step === 3 ? "blur(0px)" : "blur(2px)",
            }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-center mb-4">Checkout</h2>
            <div className="mb-4 text-sm">
              <p className="font-semibold">Item Details</p>
              <ul className="list-disc ml-6">
                <li>Samosa x2 – ₹60</li>
                <li>Paneer Biryani x1 – ₹370</li>
              </ul>
            </div>
            <div className="mb-4 text-sm">
              <p className="font-semibold">Shipping Address</p>
              <p>{selectedAddress?.name}</p>
              <p>{`${selectedAddress?.streetNumber}, Ward No: ${selectedAddress?.wardNo}`}</p>
              <p>{selectedAddress?.place}</p>
              <p>Pin Code: {selectedAddress?.pinCode}</p>
              <p>Mobile: {selectedAddress?.mobileNumber}</p>
            </div>
            <div className="mb-4 text-sm">
              <p className="font-semibold">Payment Method</p>
              <p>{paymentMethod}</p>
            </div>
            <div className="mb-4 text-sm font-bold">
              <p>Total Amount: ₹{totalAmount.toFixed(2)}</p>
            </div>
            <button
              onClick={() => alert("Proceeding to Payment...")}
              className="w-full py-2 bg-yellow-400 text-black rounded font-bold"
            >
              Proceed to Payment
            </button>
            <button
              onClick={() => setStep(2)}
              className="mt-2 w-full py-1 bg-gray-200 text-black rounded"
            >
              ← Back
            </button>
          </motion.div>
        </div>
      </div>

      {/* Modal for Add/Edit Address */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              {modalData._id ? "Edit Address" : "Add New Address"}
            </h3>
            <form onSubmit={handleModalSubmit} className="space-y-3 text-sm">
              <input
                name="name"
                placeholder="Name"
                value={modalData.name}
                onChange={handleModalChange}
                className="w-full border border-gray-300 rounded px-3 py-1"
              />
              <input
                name="streetNumber"
                placeholder="Street Number"
                value={modalData.streetNumber}
                onChange={handleModalChange}
                className="w-full border border-gray-300 rounded px-3 py-1"
              />
              <input
                name="wardNo"
                placeholder="Ward No"
                value={modalData.wardNo}
                onChange={handleModalChange}
                className="w-full border border-gray-300 rounded px-3 py-1"
              />
              <input
                name="place"
                placeholder="Place"
                value={modalData.place}
                onChange={handleModalChange}
                className="w-full border border-gray-300 rounded px-3 py-1"
              />
              <input
                name="pinCode"
                placeholder="Pin Code"
                value={modalData.pinCode}
                onChange={handleModalChange}
                className="w-full border border-gray-300 rounded px-3 py-1"
              />
              <input
                name="mobileNumber"
                placeholder="Mobile Number"
                value={modalData.mobileNumber}
                onChange={handleModalChange}
                className="w-full border border-gray-300 rounded px-3 py-1"
                readOnly
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
