'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '@/lib/withAuth';

function ProfilePage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState({ name: '', email: '', mobile: '', image: '' });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelInfo, setCancelInfo] = useState(null);
  const [viewedOrderId, setViewedOrderId] = useState(null);
  const [hoverCancelId, setHoverCancelId] = useState(null);
  const perPage = 5;

  useEffect(() => {
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('emailId');
    const mobile = localStorage.getItem('mobileNumber');
    const image = localStorage.getItem('image');
    setUser({ name, email, mobile, image });
    if (mobile) fetchOrders(mobile);
  }, []);

  const fetchOrders = async (mobile) => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      const userOrders = data
        .filter(order => order.userId === mobile)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(userOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const requestCancel = (orderId, createdAt) => {
    const timePassed = Date.now() - new Date(createdAt).getTime();
    if (timePassed > 3 * 60 * 1000) {
      toast.error('Order Cancel Only Valid for 3 Minutes!');
      return;
    }
    setCancelInfo({ orderId, createdAt });
  };

  const confirmCancel = async () => {
    const { orderId } = cancelInfo;
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
    } finally {
      setCancelInfo(null);
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

      <div style={{ margin: '2rem' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          border: '2px solid #facc15', borderRadius: '10px', padding: '1rem 2rem',
          background: '#1f2937', marginBottom: '2rem', flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1' }}>
            <h2 style={{ color: '#facc15', marginBottom: '1rem' }}>My Profile</h2>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Mobile:</strong> {user.mobile}</p>
          </div>

          <div style={{
            width: '200px', height: '200px', borderRadius: '12px', overflow: 'hidden',
            border: '2px solid #facc15', marginLeft: '2rem'
          }}>
            <Image
              src={user.image || '/default-user.png'}
              alt="User Profile"
              width={200}
              height={200}
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>

        <input
          type="text"
          placeholder="Search Order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '0.6rem', borderRadius: '8px',
            border: '1px solid #ccc', marginBottom: '1rem'
          }}
        />

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            minWidth: '700px', width: '100%', borderCollapse: 'separate',
            borderSpacing: '0 10px', background: '#111827', borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(250, 204, 21, 0.6), inset 0 0 10px #facc15',
            color: 'white'
          }}>
            <thead style={{ backgroundColor: '#facc15', color: '#111827' }}>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>No orders found.</td>
                </tr>
              ) : paginated.map(order => {
                const timePassed = Date.now() - new Date(order.createdAt).getTime();
                const withinCancelWindow = timePassed < 3 * 60 * 1000;
                return (
                  <>
                    <tr key={order.orderId} style={{
                      background: '#1f2937', textAlign: 'center',
                      boxShadow: 'inset 2px 2px 5px #111827, inset -2px -2px 5px #4b5563',
                      transition: 'transform 0.2s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                      <td>{order.orderId}</td>
                      <td>{order.items.map(i => i.name).join(', ')}</td>
                      <td>₹{order.totalAmount}</td>
                      <td>{order.paymentMethod}</td>
                      <td style={order.status === 'New' ? { fontWeight: 'bold', color: '#BA8E23' } : {}}>
                        {order.status === 'New' ? 'Wait for Accept' : order.status}
                      </td>
                      <td>
                        {order.status === 'New' && withinCancelWindow && (
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={() => requestCancel(order._id, order.createdAt)}
                              onMouseEnter={() => setHoverCancelId(order._id)}
                              onMouseLeave={() => setHoverCancelId(null)}
                              style={{
                                background: '#dc2626', color: 'white', padding: '5px 10px',
                                border: 'none', borderRadius: '4px', cursor: 'pointer'
                              }}>
                              Cancel
                            </button>
                            {hoverCancelId === order._id && (
                              <div style={{
                                position: 'absolute', top: '-30px', left: '50%',
                                transform: 'translateX(-50%)', background: '#333',
                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px', whiteSpace: 'nowrap'
                              }}>
                                After Placed Order Cancel  Within 3 min
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => setViewedOrderId(viewedOrderId === order.orderId ? null : order.orderId)}
                          style={{
                            background: '#facc15', color: '#111827', padding: '5px 12px',
                            border: 'none', borderRadius: '4px', cursor: 'pointer'
                          }}>
                          {viewedOrderId === order.orderId ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {viewedOrderId === order.orderId && (
                      <tr>
                        <td colSpan="7" style={{ background: '#1f2937', padding: '1rem' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                              <tr style={{ color: '#facc15', textAlign: 'left', borderBottom: '1px solid #333' }}>
                                <th style={{ padding: '8px' }}>Image</th>
                                <th style={{ padding: '8px' }}>Name</th>
                                <th style={{ padding: '8px' }}>Qty</th>
                                <th style={{ padding: '8px' }}>Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #2d3748', textAlign: 'left' }}>
                                  <td style={{ padding: '8px' }}>
                                    <Image src={item.image} alt={item.name} width={50} height={50} />
                                  </td>
                                  <td style={{ padding: '8px' }}>{item.name}</td>
                                  <td style={{ padding: '8px' }}>{item.quantity}</td>
                                  <td style={{ padding: '8px' }}>₹{item.price}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={{ padding: '10px 25px', borderRadius: '50px', marginRight: '10px', border: 'none', fontWeight: 'bold', color: 'white', background: 'linear-gradient(to right, #FF9933, white, #138808)' }}>
              Previous
            </button>
            <span style={{ fontWeight: 'bold', margin: '0 10px' }}>Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={{ padding: '10px 25px', borderRadius: '50px', marginLeft: '10px', border: 'none', fontWeight: 'bold', color: 'white', background: 'linear-gradient(to right, #FF9933, white, #138808)' }}>
              Next
            </button>
          </div>
        )}

        {cancelInfo && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: '#1f2937', padding: '20px 30px', borderRadius: '12px', textAlign: 'center', color: 'white', maxWidth: '90%' }}>
              <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Are you sure you want to cancel this order?</p>
              <button
                onClick={confirmCancel}
                style={{ marginRight: '10px', background: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                Yes, Cancel
              </button>
              <button
                onClick={() => setCancelInfo(null)}
                style={{ background: '#4b5563', color: 'white', padding: '8px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                No, Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ProfilePage);
