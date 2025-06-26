// pages/itemspage.js
import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import withAuth from '@/lib/withAuth';

function ItemsPage() {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [userName, setUserName] = useState('');
  const [cartVisible, setCartVisible] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  const ITEMS_PER_PAGE = 18;
  const router = useRouter();
  const mobile = typeof window !== 'undefined' ? localStorage.getItem('mobileNumber') : null;

  useEffect(() => {
    setScreenWidth(window.innerWidth);
    const onResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetch('/api/items').then(r => r.json()).then(setAllItems);
    fetch('/api/categories').then(r => r.json()).then(json => {
      if (json.success) setCategories(json.data.map(c => c.name));
    });
    const name = localStorage.getItem('name');
    if (name) setUserName(name);
  }, []);

  useEffect(() => {
    if (!mobile) return;
    fetch(`/api/cart?mobile=${mobile}`).then(r => r.json()).then(json => {
      if (json.success) setCart(json.items);
    });
  }, [mobile]);

  useEffect(() => {
    let temp = [...allItems];
    if (category) temp = temp.filter(i => i.category === category);
    if (search) temp = temp.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    setFilteredItems(temp);
    setPage(1);
  }, [search, category, allItems]);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const logout = () => {
    localStorage.removeItem('mobileNumber');
    localStorage.removeItem('name');
    router.push('/');
  };

  const syncCart = newCart => {
    setCart(newCart);
    if (mobile) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, items: newCart })
      });
    }
  };

  const handleAddToCart = () => {
    if (!selectedItem || selectedItem.stock === 'Out of Stock') return;
    const idx = cart.findIndex(c => c._id === selectedItem._id);
    const newCart = [...cart];
    idx >= 0
      ? (newCart[idx].quantity += quantity)
      : newCart.push({ ...selectedItem, quantity });
    setSelectedItem(null);
    syncCart(newCart);
  };

  const updateQuantity = (id, delta) => {
    const newCart = cart.map(it =>
      it._id === id ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it
    );
    syncCart(newCart);
  };

  const removeFromCart = id => syncCart(cart.filter(it => it._id !== id));

  const totalAmount = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);

  const handleProceed = () => {
    if (!cart.length) return;
    const data = cart.map(it => ({
      name: it.name,
      image: it.image,
      price: it.price,
      quantity: it.quantity,
      total: it.price * it.quantity
    }));
    localStorage.setItem('cartItems', JSON.stringify(data));
    router.push('/payment');
  };

  return (
    <div style={{ background: 'linear-gradient(orange, white, green)', minHeight: '100vh', padding: 20 }}>
      <header className={styles.header}>
        <div className={styles.logo}><Image src="/litties.png" alt="Litties" width={60} height={60} /></div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Litties Multi Cuisine Family Restaurant</h1>
          <p className={styles.address}>Shanti Prayag, Lalganj, Sasaram - 821115</p>
        </div>
        <div className={styles.rightSection}>
          <span onClick={() => setCartVisible(true)} style={{ marginRight: '1rem', cursor: 'pointer' }}>
            🛒 Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
          </span>
          <Link href="/profile"><strong>{userName}</strong></Link>
          <button onClick={logout} className={styles.logoutButton}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '1rem 0' }}>
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 8, width: 200 }}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ padding: 8, borderRadius: 8 }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
        {paginatedItems.map(item => (
          <div
            key={item._id}
            onClick={() => item.stock === 'In Stock' && (setSelectedItem(item), setQuantity(1))}
            style={{
              background: 'linear-gradient(to bottom, #ffa500, #ffffff, #4caf50)',
              padding: 10,
              textAlign: 'center',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              borderRadius: 12,
              cursor: item.stock === 'In Stock' ? 'pointer' : 'not-allowed',
              opacity: item.stock === 'In Stock' ? 1 : 0.6,
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 40 }}
            />
            <h3>{item.name}</h3>
            <p>₹{item.price}</p>
            {item.stock === 'Out of Stock' && (
              <p style={{
                backgroundColor: 'red',
                color: 'white',
                padding: '4px 8px',
                borderRadius: 40,
                display: 'inline-block'
              }}>
                Out of Stock
              </p>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            onClick={() => page > 1 && setPage(p => p - 1)}
            disabled={page === 1}
            style={{
              margin: '0 10px',
              padding: '10px 25px',
              borderRadius: 50,
              border: 'none',
              background: 'linear-gradient(to right, #FF9933, white, #138808)',
              color: 'black',
              fontWeight: 'bold',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => page < totalPages && setPage(p => p + 1)}
            disabled={page === totalPages}
            style={{
              margin: '0 10px',
              padding: '10px 25px',
              borderRadius: 50,
              border: 'none',
              background: 'linear-gradient(to right, #FF9933, white, #138808)',
              color: 'black',
              fontWeight: 'bold',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Item Modal */}
      {selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 999
        }}>
          <div style={{
            background: 'linear-gradient(to bottom, #ffa500, #ffffff, #4caf50)',
            padding: '2rem',
            borderRadius: 80,
            width: '70%',
            maxWidth: 300,
            textAlign: 'center',
          }}>
            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              style={{ width: '100%', borderRadius: 80, marginBottom: '1rem' }}
            />
            <h2>{selectedItem.name}</h2>
            <p style={{ margin: '1rem 0' }}>₹{selectedItem.price}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: '1rem' }}>
              <button onClick={() => quantity > 1 && setQuantity(q => q - 1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={selectedItem.stock !== 'In Stock'}
              style={{
                background: selectedItem.stock === 'In Stock' ? 'orange' : 'gray',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                cursor: selectedItem.stock === 'In Stock' ? 'pointer' : 'not-allowed',
              }}
            >
              {selectedItem.stock === 'In Stock' ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <br />
            <button
              onClick={() => setSelectedItem(null)}
              style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: 'red' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cart Popup */}
      {cartVisible && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 999, padding: '1rem',
        }}>
          <div style={{
            background: 'linear-gradient(to bottom, #ffa500, #ffffff, #4caf50)',
            padding: '1.5rem',
            borderRadius: 30,
            width: '100%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
            </div>
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>🛒 Your Cart</h2>
            {cart.length === 0 ? (
              <p style={{ textAlign: 'center' }}>No items in cart.</p>
            ) : (
              cart.map(item => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
                  <img src={item.image} alt={item.name} width={60} height={60} style={{ borderRadius: 8, marginRight: 10 }} />
                  <div style={{ flex: 1 }}>
                    <h4>{item.name}</h4>
                    <p>₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</p>
                    <div>
                      <button onClick={() => updateQuantity(item._id, -1)}>-</button>
                      <button onClick={() => updateQuantity(item._id, +1)}>+</button>
                      <button onClick={() => removeFromCart(item._id)} style={{ marginLeft: 10, color: 'red' }}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))
            )}
            <h3 style={{ textAlign: 'center', margin: '1rem 0' }}>Total: ₹{totalAmount}</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleProceed}
                disabled={cart.length === 0}
                style={{
                  background: cart.length === 0 ? 'gray' : 'green',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: cart.length === 0 ? 0.6 : 1,
                }}
              >
                Proceed to Payment
              </button>
              <button onClick={() => setCartVisible(false)} style={{ padding: '0.5rem 1rem', background: 'gray', border: 'none', borderRadius: 8, color: 'white' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(ItemsPage);
