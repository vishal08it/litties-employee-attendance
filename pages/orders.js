import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function OrdersGet() {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('New');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const router = useRouter();

  const logout = () => {
    router.push('/');
    toast.success('Logout Successfully');
  };

  const statuses = ['New', 'Accepted', 'Rejected', 'Out for Delivery', 'Delivered'];

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
  };

  const updateOrderStatus = async (orderId, status) => {
    const res = await fetch('/api/order', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    });

    if (res.ok) {
      toast.success(`Order ${status}`);
      fetchOrders();
    } else {
      toast.error('Failed to update order');
    }
  };

  const filteredOrders =
    selectedStatus === 'Rejected'
      ? orders.filter(order => order.status === 'Rejected' || order.status === 'Cancelled')
      : orders.filter(order => order.status === selectedStatus);

  const buttonStyle = (bg) => ({
    backgroundColor: bg,
    border: 'none',
    cursor: 'pointer',
    color: 'white',
    fontSize: '14px',
    padding: '5px 10px',
    margin: '2px',
    borderRadius: '4px',
  });

  const getStatusLabel = (order) => {
    if (order.status === 'Cancelled') {
      const created = new Date(order.createdAt).getTime();
      const updated = new Date(order.updatedAt).getTime();
      const isUserCancelled = updated - created <= 3 * 60 * 1000;
      return isUserCancelled ? 'Cancelled (By User)' : 'Cancelled';
    }
    return order.status;
  };

  return (
    <div className={styles.ordersContainer}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Litties Multi Cuisine Family Restaurant</h1>
          <p className={styles.address}>Shanti Prayag, Lalganj, Sasaram - 821115</p>
        </div>
        <button onClick={logout} className={styles.logoutButton}>Logout</button>
      </header>

      <div>
        <h1 className={styles.ordersTitle}>
          Order <span className={styles.ordersHighlight}>Management</span>
        </h1>

        <div className={styles.ordersHeaderRight}>
          <button onClick={() => router.push('/admin')} className={styles.adminButton}>
            Admin Dashboard
          </button>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.dropdown}
          >
            {statuses.map(status => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>
        {selectedStatus === 'Rejected' ? 'Rejected + Cancelled' : selectedStatus} Orders
      </h2>

      <table
        style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: '0 10px',
          background: '#111827',
          borderRadius: '10px',
          boxShadow: '0 4px 15px rgba(250, 204, 21, 0.6), inset 0 0 10px #facc15',
          color: 'white',
          marginTop: '2rem',
        }}
      >
        <thead style={{ backgroundColor: '#facc15', color: '#111827' }}>
          <tr>
            <th style={{ padding: '10px 15px', borderRadius: '10px 0 0 10px' }}>Order ID</th>
            <th>Mobile</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Status</th>
            {!(selectedStatus === 'Rejected' || selectedStatus === 'Delivered') && (
              <th>Actions</th>
            )}
            <th style={{ borderRadius: '0 10px 10px 0' }}>View</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                No orders found.
              </td>
            </tr>
          ) : (
            filteredOrders.map((order, i) => (
              <React.Fragment key={order._id}>
                <tr
                  style={{
                    background: i % 2 === 0 ? '#1f2937' : '#374151',
                    borderRadius: '8px',
                    boxShadow: 'inset 2px 2px 5px #111827, inset -2px -2px 5px #4b5563',
                    transition: 'transform 0.2s',
                    textAlign: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <td style={{ padding: '10px 15px' }}>{order.orderId}</td>
                  <td>{order.userId}</td>
                  <td>{order.quantity}</td>
                  <td>₹{order.totalAmount}</td>
                  <td>{getStatusLabel(order)}</td>

                  {!(selectedStatus === 'Rejected' || selectedStatus === 'Delivered') && (
                    <td>
                      {order.status === 'New' && (
                        <>
                          <button onClick={() => updateOrderStatus(order.orderId, 'Accepted')} style={buttonStyle('#22c55e')}>Accept</button>
                          <button onClick={() => updateOrderStatus(order.orderId, 'Rejected')} style={buttonStyle('#dc2626')}>Reject</button>
                        </>
                      )}
                      {order.status === 'Accepted' && (
                        <button onClick={() => updateOrderStatus(order.orderId, 'Out for Delivery')} style={buttonStyle('#3b82f6')}>Dispatch</button>
                      )}
                      {order.status === 'Out for Delivery' && (
                        <button onClick={() => updateOrderStatus(order.orderId, 'Delivered')} style={buttonStyle('#000000')}>Delivered</button>
                      )}
                    </td>
                  )}

                  <td>
                    <button
                      onClick={() =>
                        setExpandedOrderId(expandedOrderId === order._id ? null : order._id)
                      }
                      style={buttonStyle('#facc15')}
                    >
                      {expandedOrderId === order._id ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>

                {expandedOrderId === order._id && (
                  <tr>
                    <td colSpan="7" style={{ padding: '10px 30px', background: '#1e293b' }}>
                      <table style={{ width: '100%', marginTop: '10px' }}>
                        <thead>
                          <tr style={{ textAlign: 'left', color: '#facc15' }}>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, idx) => (
                            <tr key={idx} style={{ color: '#e5e7eb' }}>
                              <td>
                                <img src={item.image} width={40} style={{ borderRadius: '4px' }} />
                              </td>
                              <td>{item.name}</td>
                              <td>{item.quantity}</td>
                              <td>₹{item.price}</td>
                              <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
