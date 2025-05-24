'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function PaymentPage() {
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const addresses = [
    {
      id: 1,
      name: 'Vishal Kumar',
      address: 'Flat A-202, Gaurakshini, Near Patel chokh, Sasaram, Bihar, 821115',
      mobile: '7541037802',
    },
    {
      id: 2,
      name: 'Akash',
      address: '202, Gaurakshni, Near Patel chokh, Bhopal, Madhya Pradesh, 821115',
      mobile: '9241741961',
    },
  ];

  const containerClass = 'w-[350px] p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto';

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-200 via-white to-green-300 flex items-center justify-center px-4">
      <div className="flex gap-6 overflow-x-auto max-w-screen-lg py-10">

        {/* Step 1: Payment Method */}
        <motion.div
          className={containerClass}
          animate={{
            scale: step === 1 ? 1 : 0.95,
            opacity: step === 1 ? 1 : 0.4,
            filter: step === 1 ? 'blur(0px)' : 'blur(2px)',
          }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-bold text-center mb-4">Select Payment Method</h2>
          <div className="space-y-3">
            <label><input type="radio" name="payment" /> Online Payment</label>
            <label><input type="radio" name="payment" /> Cash on Delivery</label>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-yellow-400 text-black py-2 rounded mt-4 font-bold"
            >
              Use this Payment Method
            </button>
          </div>
          <div className="mt-6 text-sm border-t pt-4">
            <p className="font-semibold">Items: ₹430.00</p>
            <p className="font-bold">Total: ₹430.00</p>
          </div>
        </motion.div>

        {/* Step 2: Select Address */}
        <motion.div
          className={containerClass}
          animate={{
            scale: step === 2 ? 1 : 0.95,
            opacity: step === 2 ? 1 : 0.4,
            filter: step === 2 ? 'blur(0px)' : 'blur(2px)',
          }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-bold text-center mb-4">Select Address</h2>
          {addresses.map((addr) => (
            <div key={addr.id} className="mb-4 p-3 bg-gray-100 rounded shadow text-sm">
              <p className="font-bold">{addr.name}</p>
              <p>{addr.address}</p>
              <p>Mobile: {addr.mobile}</p>
              <div className="flex justify-between mt-2">
                <button className="px-2 py-1 bg-orange-400 text-white rounded text-xs">Edit</button>
                <button
                  onClick={() => {
                    setSelectedAddress(addr);
                    setStep(3);
                  }}
                  className="px-2 py-1 bg-yellow-400 text-black rounded text-xs"
                >
                  Use This Address
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(1)} className="text-blue-600 underline">← Back</button>
            <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">Add Address</button>
          </div>
        </motion.div>

        {/* Step 3: Checkout */}
        <motion.div
          className={containerClass}
          animate={{
            scale: step === 3 ? 1 : 0.95,
            opacity: step === 3 ? 1 : 0.4,
            filter: step === 3 ? 'blur(0px)' : 'blur(2px)',
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
            <p>{selectedAddress?.address}</p>
            <p>Mobile: {selectedAddress?.mobile}</p>
          </div>
          <button className="w-full bg-green-500 text-white py-2 rounded font-bold hover:bg-green-600">
            Place Order
          </button>
          <button
            onClick={() => setStep(2)}
            className="mt-4 text-sm text-blue-600 underline"
          >
            ← Back
          </button>
        </motion.div>

      </div>
    </div>
  );
}
