'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ProfilePage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState({ name: '', email: '', mobile: '' });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('emailId');
    const mobile = localStorage.getItem('mobileNumber');
    setUser({ name, email, mobile });
    if (mobile) fetchOrders(mobile);
  }, []);

  const fetchOrders = async (mobile) => {
    try {
      const res = await fetch('/api/orders'); // optional: change to `/api/orders?userId=${mobile}`
      const data = await res.json();
      const userOrders = data
        .filter(order => order.userId === mobile)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(userOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleCancel = async (orderId, createdAt) => {
  const timePassed = Date.now() - new Date(createdAt).getTime();
  const cancelWindow = 3 * 60 * 1000;

  if (timePassed > cancelWindow) {
    toast.error('Cancel window expired (3 minutes)');
    return;
  }

  if (!window.confirm('Are you sure you want to cancel this order?')) return;

  try {
    const res = await fetch(`/api/order/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Cancelled', cancelledBy: 'user' }),
    });

    const result = await res.json();

    if (res.ok) {
      toast.success('Order cancelled. Confirmation email sent.');
      fetchOrders(user.mobile);
    } else {
      toast.error(result.message || 'Cancel failed');
    }
  } catch (err) {
    toast.error('Server error');
  }
};


  const filteredOrders = orders.filter(order =>
    order.orderId.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filteredOrders.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filteredOrders.length / perPage);

  return (
    <div style={{ background: '#111827', minHeight: '100vh', color: 'white', paddingBottom: '2rem' }}>
      <ToastContainer />
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Litties Multi Cuisine Family Restaurant</h1>
          <p className={styles.address}>Shanti Prayag, Lalganj, Sasaram - 821115</p>
        </div>
        <div className={styles.rightSection}>
          <button onClick={() => router.push('/itemspage')} className={styles.logoutButton}>
            Back to Menu
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', margin: '2rem' }}>
        <div style={{
          border: '2px solid #facc15',
          borderRadius: '10px',
          padding: '1rem 2rem',
          background: '#1f2937',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#facc15', marginBottom: '1rem' }}>My Profile</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Mobile:</strong> {user.mobile}</p>
        </div>

        <input
          type="text"
          placeholder="Search Order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginBottom: '1rem'
          }}
        />

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{
            minWidth: '700px',
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0 10px',
            background: '#111827',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(250, 204, 21, 0.6), inset 0 0 10px #facc15',
            color: 'white'
          }}>
            <thead style={{ backgroundColor: '#facc15', color: '#111827' }}>
              <tr>
                <th style={{ padding: '10px 15px', whiteSpace: 'nowrap' }}>Order ID</th>
                <th style={{ whiteSpace: 'nowrap' }}>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>
                    No orders found.
                  </td>
                </tr>
              ) : paginated.map(order => (
                <tr key={order.orderId} style={{
                  background: '#1f2937',
                  textAlign: 'center',
                  boxShadow: 'inset 2px 2px 5px #111827, inset -2px -2px 5px #4b5563',
                  transition: 'transform 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>{order.orderId}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{order.items.map(i => i.name).join(', ')}</td>
                  <td>₹{order.totalAmount}</td>
                  <td>{order.paymentMethod}</td>
                  <td>{order.status}</td>
                  <td>
                    {order.status === 'New' && (
                      <button
                        onClick={() => handleCancel(order._id, order.createdAt)}
                        style={{
                          background: '#dc2626',
                          color: 'white',
                          padding: '5px 10px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  background: currentPage === i + 1 ? '#facc15' : '#1f2937',
                  color: currentPage === i + 1 ? '#111827' : 'white',
                  margin: '0 5px',
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
