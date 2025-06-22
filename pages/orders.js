import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import Image from 'next/image';

export default function OrdersGet() {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('New');
  const router = useRouter();
  const logout = () => {
    
    router.push('/');
     toast.success('Logout Sucessfully') // adjust to your login route
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

  const updateOrderStatus = async (id, status) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const filteredOrders = orders.filter(order => order.status === selectedStatus);

  return (
    <div className={styles.ordersContainer}>
      {/* Header */}
      
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
          <button
            onClick={() => router.push('/admin')}
            className={styles.adminButton}
          >
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

      {/* Table */}
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
                  onClick={() => updateOrderStatus(order._id, 'Accepted')}
                  style={{
                    backgroundColor: '#22c55e',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '14px',
                    padding: '5px 10px',
                    marginRight: '5px',
                    borderRadius: '4px',
                  }}
                >
                  Accept
                </button>
                <button
                  onClick={() => updateOrderStatus(order._id, 'Rejected')}
                  style={{
                    backgroundColor: '#dc2626',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '14px',
                    padding: '5px 10px',
                    borderRadius: '4px',
                  }}
                >
                  Reject
                </button>
              </>
            )}
            {order.status === 'Accepted' && (
              <button
                onClick={() => updateOrderStatus(order._id, 'Out for Delivery')}
                style={{
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '14px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                }}
              >
                Dispatch
              </button>
            )}
            {order.status === 'Out for Delivery' && (
              <button
                onClick={() => updateOrderStatus(order._id, 'Delivered')}
                style={{
                  backgroundColor: '#000000',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '14px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                }}
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
