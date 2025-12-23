'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import withAuth from '@/lib/withAuth';
import QRCode from 'react-qr-code'; 

function PaymentPage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [utr, setUtr] = useState(''); 
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
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Configuration for your UPI
  const adminUpiId = "vishalraj08it-1@okicici"; 
  const merchantName = "Litties";

  const deliveryCharge = useMemo(() => totalAmount < 399 ? 50 : 0, [totalAmount]);
  const grandTotal = useMemo(() => totalAmount + deliveryCharge, [totalAmount, deliveryCharge]);

  const upiUrl = `upi://pay?pa=${adminUpiId}&pn=${encodeURIComponent(merchantName)}&am=${grandTotal}&cu=INR`;

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

  const goToStep = useCallback((s) => {
    setStep(s);
    localStorage.setItem('checkoutStep', s);
  }, []);

  const fetchAddresses = useCallback(async (mobile) => {
    try {
      const res = await fetch(`/api/address/user?mobile=${mobile}`);
      const data = await res.json();
      if (Array.isArray(data)) setAddresses(data);
    } catch (err) { console.error('Failed to fetch addresses:', err); }
  }, []);

  const handleAddOrUpdateAddress = async () => {
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
  };

  const placeOrder = async () => {
    // 1. Validation
    if (paymentMethod === 'Online Payment') {
      if (!utr || utr.trim().length !== 12) {
        toast.error("Please enter a valid 12-digit UTR number.");
        return;
      }
    }

    setIsPlacingOrder(true);
    const generatedOrderId = 'ORD' + Date.now();

    const orderData = {
      orderId: generatedOrderId,
      userId: selectedAddress?.mobile,
      email: email,
      address: selectedAddress,
      paymentMethod: paymentMethod,
      utr: paymentMethod === 'Online Payment' ? String(utr).trim() : '', 
      items: cartItems,
      quantity: cartItems.reduce((a, i) => a + i.quantity, 0),
      totalAmount: grandTotal,
      mobile: selectedAddress?.mobile,
    };

    try {
      // 2. Save to Database - Note: path is /api/orders per your folder screenshot
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const errorMsg = await res.json();
        toast.error(errorMsg.error || 'Order failed to save.');
        setIsPlacingOrder(false);
        return;
      }

      // 3. Send WhatsApp Notification
      await fetch('/api/sendOrderWhatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          name: selectedAddress.name,
          total: totalAmount,
          deliveryCharge,
          utr: paymentMethod === 'Online Payment' ? utr : 'COD'
        }),
      });

      // 4. Success Handling & Cart Clearing
      localStorage.removeItem('cartItems');
      localStorage.removeItem('checkoutStep');
      
      // CRITICAL: Force the Navbar/Cart Icon to update
      window.dispatchEvent(new Event("storage")); 
      
      setCartItems([]);
      setOrderId(generatedOrderId);
      setShowSuccess(true);

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('✅ Order Successful', { body: 'Your order has been placed.' });
      }

      setTimeout(() => router.push('/profile'), 2000);

    } catch (error) {
      console.error('Place order error:', error);
      toast.error('Something went wrong!');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!isHydrated) return null;

  if (showSuccess) {
    return (
      <div className={styles.successWrapper}>
        <div className={styles.successCard}>
          <Image src="/test.jpg" alt="Thank you" width={200} height={200} className={styles.successImage} />
          <h2>ORDER CONFIRMED</h2>
          <p className={styles.orderId}>{orderId}</p>
          <p>UTR: {utr || 'N/A'}</p>
          <p>Total Amount: ₹{grandTotal.toFixed(2)}</p>
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
      className={`${styles.stepBox} ${styles.centerStep}`}
    >
      {children}
      <button onClick={() => { localStorage.removeItem('checkoutStep'); router.push('/itemspage'); }} className={styles.submitButton4}>Cancel</button>
    </motion.div>
  );

  return (
    <div className={styles.paymentContainer}>
      <ToastContainer />
      <AnimatePresence mode="wait">
        {step === 1 && StepBox(
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Image src="/litties.png" width={60} height={60} alt="Logo" /></div>
            <h2 className={styles.title}>Select Payment Method</h2>
            <div className={styles.paymentOptions}>
                <label className={styles.radioLabel}>
                    <input type="radio" value="Online Payment" checked={paymentMethod === 'Online Payment'} onChange={() => setPaymentMethod('Online Payment')} />
                    Online Payment (Scan QR)
                </label>
                <label className={styles.radioLabel}>
                    <input type="radio" value="Cash on Delivery" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} />
                    Cash on Delivery
                </label>
            </div>
            <div className={styles.summary}>
              <p>Items Total: ₹{totalAmount.toFixed(2)}</p>
              {deliveryCharge > 0 && <p><strong>Home Delivery: ₹{deliveryCharge}</strong></p>}
              <p><strong>Total Payable: ₹{grandTotal.toFixed(2)}</strong></p>
            </div>
            <button disabled={!paymentMethod} onClick={() => goToStep(2)} className={styles.submitButton3}>Continue</button>
          </>
        )}

        {step === 2 && StepBox(
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Image src="/litties.png" width={60} height={60} alt="Logo" /></div>
            <h2 className={styles.title}>Your Addresses</h2>
            {addresses.map((addr) => (
              <div key={addr._id} className={styles.addressBox}>
                <p><strong>{addr.name}</strong></p>
                <p>{addr.address}</p>
                <p>Mobile: {addr.mobile}</p>
                <div className={styles.addressActions}>
                  <button className={styles.submitButton2} onClick={() => { setEditAddress(addr); setFormData(addr); setShowAddressModal(true); }}>Edit</button>
                  <button className={styles.submitButton2} onClick={() => { setSelectedAddress(addr); goToStep(3); }}>Use This Address</button>
                </div>
              </div>
            ))}
            <button className={styles.submitButton2} onClick={() => { setEditAddress(null); setFormData({ name: '', address: '', mobile: '' }); setShowAddressModal(true); }}>Add Address</button>
            <button className={styles.submitButton2} onClick={() => goToStep(1)}>← Back</button>
          </>
        )}

        {step === 3 && StepBox(
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Image src="/litties.png" width={60} height={60} alt="Logo" /></div>
            <h2 className={styles.title}>Final Checkout</h2>
            
            <div className={styles.checkoutDetails}>
              <div className={styles.detailBox}>
                <p className="font-semibold mb-2">Items Summary</p>
                {cartItems.map((item, idx) => (
                  <div key={idx} className={styles.checkoutItem} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>{item.name} (x{item.quantity})</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <hr />
                {deliveryCharge > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivery</span><span>₹{deliveryCharge}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span></div>
              </div>

              <div className={styles.detailBox} style={{ marginTop: '10px' }}>
                <p className="font-semibold">Shipping to:</p>
                <p><strong>{selectedAddress?.name}</strong></p>
                <p style={{ fontSize: '13px' }}>{selectedAddress?.address}</p>
                <p style={{ fontSize: '13px' }}>Ph: {selectedAddress?.mobile}</p>
              </div>

              {paymentMethod === 'Online Payment' && (
                <div style={{ textAlign: 'center', background: '#fff', padding: '15px', borderRadius: '10px', marginTop: '15px', border: '1px solid #eee' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>Scan & Pay ₹{grandTotal.toFixed(2)}</p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <QRCode value={upiUrl} size={140} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter 12-digit UTR Number"
                    value={utr}
                    maxLength={12}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ''); 
                      setUtr(val);
                    }}
                    style={{ width: '100%', padding: '12px', marginTop: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px' }}
                  />
                  <p style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>Check your payment app for the 12-digit Ref No.</p>
                </div>
              )}
            </div>

            <button onClick={placeOrder} className={styles.placeOrder} disabled={isPlacingOrder} style={{ marginTop: '20px' }}>
              {isPlacingOrder ? 'Processing...' : 'Confirm Order'}
            </button>
            <button className={styles.submitButton2} onClick={() => goToStep(2)}>← Back</button>
          </>
        )}
      </AnimatePresence>

      {showAddressModal && (
        <div className={styles.modalOverlay}>
          <motion.div className={styles.addressModal} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <h3>{editAddress ? 'Edit Address' : 'Add Address'}</h3>
            <input placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <textarea placeholder="Full Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            <input placeholder="Mobile" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button onClick={() => setShowAddressModal(false)}>Cancel</button>
              <button onClick={handleAddOrUpdateAddress}>{editAddress ? 'Update' : 'Add'}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default withAuth(PaymentPage);