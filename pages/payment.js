'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import withAuth from '@/lib/withAuth';

function PaymentPage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '', mobile: '' });
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');

  const deliveryCharge = totalAmount < 399 ? 50 : 0;
  const grandTotal = totalAmount + deliveryCharge;

  useEffect(() => {
    setIsHydrated(true);
    const storedStep = localStorage.getItem('checkoutStep');
    setStep(storedStep && !isNaN(storedStep) ? parseInt(storedStep) : 1);

    const storedCart = localStorage.getItem('cartItems');
    const storedEmail = localStorage.getItem('emailId');
    const mobile = localStorage.getItem('mobileNumber');

    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      setCartItems(parsed);
      setTotalAmount(parsed.reduce((a, i) => a + i.total, 0));
    }
    if (storedEmail) setEmail(storedEmail);
    if (mobile) fetchAddresses(mobile);

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const goToStep = (s) => {
    setStep(s);
    localStorage.setItem('checkoutStep', s);
  };

  async function fetchAddresses(mobile) {
    try {
      const res = await fetch(`/api/address/user?mobile=${mobile}`);
      const data = await res.json();
      if (Array.isArray(data)) setAddresses(data);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  }

  async function handleAddOrUpdateAddress() {
    const method = editAddress ? 'PUT' : 'POST';
    const url = editAddress ? `/api/address/${editAddress._id}` : '/api/address';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      toast.success(editAddress ? 'Address updated' : 'Address added');
      const mobile = localStorage.getItem('mobileNumber');
      if (mobile) await fetchAddresses(mobile);
      setShowAddressModal(false);
      setFormData({ name: '', address: '', mobile: '' });
      setEditAddress(null);
    } else toast.error('Failed to save address');
  }

  async function deleteAddress(id) {
    if (!confirm('Delete this address?')) return;
    const res = await fetch(`/api/address/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Address deleted');
      const mobile = localStorage.getItem('mobileNumber');
      if (mobile) await fetchAddresses(mobile);
    } else toast.error('Failed to delete');
  }

  async function placeOrder() {
  const generatedOrderId = 'ORD' + Date.now();

  const res = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: generatedOrderId,
      userId: selectedAddress?.mobile,
      email,
      address: selectedAddress,
      paymentMethod,
      items: cartItems,
      quantity: cartItems.reduce((a, i) => a + i.quantity, 0),
      totalAmount: grandTotal,
      mobile: selectedAddress?.mobile,
    }),
  });

  const result = await res.json();
  console.log('ORDER RESPONSE:', result);

  if (res.ok) {
    localStorage.removeItem('cartItems');
    localStorage.removeItem('checkoutStep');
    setCartItems([]);
    setOrderId(generatedOrderId);
    setShowSuccess(true);

    try {
      // 🔍 Fetch FCM tokens for user and admin
      const tokenRes = await fetch('/api/getTokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMobile: selectedAddress?.mobile,
          adminMobile: '9999999999', // Replace with real admin number
        }),
      });

      const { tokens } = await tokenRes.json();

      if (tokens?.length > 0) {
        // 🚀 Send push notification
        await fetch('/api/sendNotification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: '✅ Order Placed',
            body: `Order ${generatedOrderId} has been placed successfully.`,
            tokens,
          }),
        });
      }
    } catch (error) {
      console.error('Push notification error:', error);
    }

    // Web browser desktop notification (optional)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('✅ Order Successful', {
        body: 'Your order has been placed. Please check your email for details.',
      });
    }

    setTimeout(() => router.push('/profile'), 3000);
  } else {
    toast.error('Order failed. Please check your email for more info.');
  }
}


  if (!isHydrated) return null;

  if (showSuccess) {
    return (
      <div className={styles.successWrapper}>
        <ToastContainer />
        <div className={styles.successCard}>
          <div className={styles.successImageSection}>
            <Image
              src="/test.jpg"
              alt="Thank you"
              width={400}
              height={400}
              className={styles.successImage}
            />
          </div>
          <div className={styles.successInfoSection}>
            <h2>ORDER CONFIRMED</h2>
            <p>Hello, <strong>{localStorage.getItem('name') || ''}</strong></p>
            <p>Your order has been confirmed and will be sent to your email shortly.</p>
            <p style={{ fontWeight: 'bold', marginTop: '10px' }}>Order Number</p>
            <p className={styles.orderId}>{orderId}</p>
            {cartItems.map((item, i) => (
              <div key={i} className={styles.cartRow}>
                <p>{item.quantity} × {item.name}</p>
                <p>₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <hr className={styles.divider} />
            <div className={styles.totalRow}>
              <p>Total Amount</p>
              <p>₹{grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const StepBox = (children) => (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className={`${styles.stepBox} ${styles.centerStep}`}
    >
      {children}
      <button onClick={() => {
        localStorage.removeItem('checkoutStep');
        router.push('/itemspage');
      }} className={styles.submitButton4}>
        Cancel
      </button>
    </motion.div>
  );

  return (
    <div className={styles.paymentContainer}>
      <ToastContainer />
      <AnimatePresence mode="wait">
        {step === 1 && StepBox(
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Image src="/litties.png" width={60} height={60} alt="Logo" />
            </div>
            <h2 className={styles.title}>Select Payment Method</h2>
            <div className={styles.paymentOptions}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="payment"
                  value="Online Payment"
                  checked={paymentMethod === 'Online Payment'}
                  onChange={() => setPaymentMethod('Online Payment')}
                />
                Online Payment
              </label>
              <label className={`${styles.radioLabel} ${styles.cod}`}>
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                />
                Cash on Delivery
              </label>
            </div>
            <div className={styles.summary}>
              <p>Items Total: ₹{totalAmount.toFixed(2)}</p>
              {deliveryCharge > 0 && <p><strong>Home Delivery: ₹{deliveryCharge}</strong></p>}
              <p><strong>Total Payable: ₹{grandTotal.toFixed(2)}</strong></p>
            </div>
            <button
              disabled={!paymentMethod}
              onClick={() => goToStep(2)}
              className={styles.submitButton3}
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && StepBox(
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Image src="/litties.png" width={60} height={60} alt="Logo" />
            </div>
            <h2 className={styles.title}>Your Addresses</h2>
            {addresses.map((addr) => (
              <div key={addr._id} className={styles.addressBox}>
                <p><strong>{addr.name}</strong></p>
                <p>{addr.address}</p>
                <p>Mobile: {addr.mobile}</p>
                <div className={styles.addressActions}>
                  <button className={styles.submitButton2} onClick={() => {
                    setEditAddress(addr);
                    setFormData(addr);
                    setShowAddressModal(true);
                  }}>Edit</button>
                  <button className={styles.submitButton2} onClick={() => deleteAddress(addr._id)}>Delete</button>
                  <button className={styles.submitButton2} onClick={() => {
                    setSelectedAddress(addr);
                    goToStep(3);
                  }}>Use This Address</button>
                </div>
              </div>
            ))}
            <button className={styles.submitButton2} onClick={() => {
              setEditAddress(null);
              setFormData({ name: '', address: '', mobile: '' });
              setShowAddressModal(true);
            }}>Add Address</button>
            <button className={styles.submitButton2} onClick={() => goToStep(1)}>← Back</button>
          </>
        )}

        {step === 3 && StepBox(
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Image src="/litties.png" width={60} height={60} alt="Logo" />
            </div>
            <h2 className={styles.title}>Checkout</h2>
            <div className={styles.checkoutDetails}>
              <div>
                <p className="font-semibold mb-1">Item Details</p>
                <div className={styles.detailBox}>
                  {cartItems.map((item, idx) => (
                    <div key={idx} className={styles.checkoutItem}>
                      <img src={item.image} alt={item.name} className={styles.checkoutImage} />
                      <div className={styles.checkoutInfo}>
                        <p><strong>{item.name}</strong></p>
                        <p>₹{item.price} × {item.quantity}</p>
                      </div>
                      <div className={styles.checkoutSubtotal}>₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                  {deliveryCharge > 0 && (
                    <div className={styles.checkoutItem}>
                      <div />
                      <div className={styles.checkoutInfo}>
                        <p><strong>Delivery Charge</strong></p>
                      </div>
                      <div className={styles.checkoutSubtotal}><strong>₹{deliveryCharge}</strong></div>
                    </div>
                  )}
                  <div className={`${styles.checkoutItem} ${styles.totalRow}`}>
                    <div />
                    <div className={styles.checkoutInfo}>
                      <p><strong>Total Amount</strong></p>
                    </div>
                    <div className={styles.checkoutSubtotal}><strong>₹{grandTotal.toFixed(2)}</strong></div>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-1">Shipping Address</p>
                <div className={styles.detailBox}>
                  <p>{selectedAddress?.name}</p>
                  <p>{selectedAddress?.address}</p>
                  <p>Mobile: {selectedAddress?.mobile}</p>
                </div>
              </div>
            </div>
            <button onClick={placeOrder} className={styles.placeOrder}>Place Order</button>
            <button className={styles.submitButton2} onClick={() => goToStep(2)}>← Back</button>
          </>
        )}
      </AnimatePresence>

      {showAddressModal && (
        <div className={styles.modalOverlay}>
          <motion.div className={styles.addressModal} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <Image src="/litties.png" width={60} height={60} alt="Logo" style={{ margin: '0 auto' }} />
            <h3>{editAddress ? 'Edit Address' : 'Add Address'}</h3>
            <input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <textarea
              placeholder="Full Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <input
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button className={styles.submitButton2} onClick={() => setShowAddressModal(false)}>Cancel</button>
              <button className={styles.submitButton2} onClick={handleAddOrUpdateAddress}>
                {editAddress ? 'Update' : 'Add'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default withAuth(PaymentPage);