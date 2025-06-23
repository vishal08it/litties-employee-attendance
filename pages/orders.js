import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import { toast } from 'react-toastify';

export default function OrdersGet() {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('New');
  const router = useRouter();

  const logout = () => {
    router.push('/');
    toast.success('Logout Successfully');
  };

  const statuses = ['New', 'Accepted', 'Rejected', 'Out for Delivery', 'Delivered'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
  };

  // ✅ Updated to call correct API for status update and email
  const updateOrderStatus = async (orderId, status) => {
    debugger
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

  const filteredOrders = orders.filter(order => order.status === selectedStatus);

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
        {selectedStatus} Orders
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
        <thead
          style={{
            backgroundColor: '#facc15',
            color: '#111827',
            borderRadius: '10px',
          }}
        >
          <tr>
            <th style={{ padding: '10px 15px', borderRadius: '10px 0 0 10px' }}>Order ID</th>
            <th>User ID</th>
            <th>Items</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Status</th>
            <th style={{ borderRadius: '0 10px 10px 0' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                No orders found.
              </td>
            </tr>
          ) : (
            filteredOrders.map((order, i) => (
              <tr
                key={order._id}
                style={{
                  background: i % 2 === 0 ? '#1f2937' : '#374151',
                  borderRadius: '8px',
                  boxShadow: 'inset 2px 2px 5px #111827, inset -2px -2px 5px #4b5563',
                  transition: 'transform 0.2s',
                  textAlign: 'center',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <td style={{ padding: '10px 15px' }}>{order.orderId}</td>
                <td>{order.userId}</td>
                <td><b>{order.items.map(i => i.name).join(', ')}</b></td>
                <td>{order.quantity}</td>
                <td>₹{order.totalAmount}</td>
                <td>{order.status}</td>
                <td>
                  {order.status === 'New' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.orderId, 'Accepted')}
                        style={buttonStyle('#22c55e')}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.orderId, 'Rejected')}
                        style={buttonStyle('#dc2626')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {order.status === 'Accepted' && (
                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'Out for Delivery')}
                      style={buttonStyle('#3b82f6')}
                    >
                      Dispatch
                    </button>
                  )}
                  {order.status === 'Out for Delivery' && (
                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'Delivered')}
                      style={buttonStyle('#000000')}
                    >
                      Delivered
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

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
