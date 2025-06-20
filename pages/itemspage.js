import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { useRouter } from 'next/router';
import dbConnect from '@/lib/mongodb'; // if you need server-side fetch

export default function ItemsPage() {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [userName, setUserName] = useState('');
  const [cartVisible, setCartVisible] = useState(false);

  const ITEMS_PER_PAGE = 16;
  const router = useRouter();

  const categories = [
    "Rolls","Chowmeins","Momos","Soups","Rice & Roti","Biryani",
    "Chinese Dry & Gravy","Indian Gravy Veg","Indian Gravy Non-Veg","Litties Special"
  ];

  const mobile = typeof window !== 'undefined' ? localStorage.getItem('mobileNumber') : null;

  // 1️⃣ Fetch items & user info
  useEffect(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => setAllItems(data));

    const name = localStorage.getItem('name');
    if (name) setUserName(name);
  }, []);

  // 2️⃣ Load cart from DB on mount (once)
  useEffect(() => {
    if (!mobile) return;
    fetch(`/api/cart?mobile=${mobile}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setCart(json.items);
      });
  }, [mobile]);

  // 3️⃣ Sync filteredItems when search/category/allItems change
  useEffect(() => {
    let temp = [...allItems];
    if (category) temp = temp.filter(item => item.category === category);
    if (search) temp = temp.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
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

  const syncCartToDB = async (newCart) => {
    setCart(newCart);
    if (!mobile) return;
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, items: newCart })
      });
    } catch (err) {
      console.error('Cart save failed', err);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedItem || !quantity) return;
    const idx = cart.findIndex(c => c._id === selectedItem._id);
    let newCart = [...cart];

    if (idx !== -1) {
      newCart[idx].quantity += quantity;
    } else {
      newCart.push({ ...selectedItem, quantity });
    }

    setSelectedItem(null);
    syncCartToDB(newCart);
  };

  const updateQuantity = (itemId, delta) => {
    const newCart = cart.map(item =>
      item._id === itemId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    syncCartToDB(newCart);
  };

  const removeFromCart = (itemId) => {
    const newCart = cart.filter(item => item._id !== itemId);
    syncCartToDB(newCart);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ background: 'linear-gradient(orange, white, green)', minHeight: '100vh', padding: '20px' }}>
      <header className={styles.header}>
        <div className={styles.logo}><Image src="/litties.png" alt="Litties Logo" width={60} height={60} /></div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Litties Multi Cuisine Family Restaurant</h1>
          <p className={styles.address}>Shanti Prayag, Lalganj, Sasaram - 821115</p>
        </div>
        <div className={styles.rightSection}>
          <span onClick={() => setCartVisible(true)} style={{ marginRight: '1rem', cursor: 'pointer' }}>
            🛒 Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
          </span>
          <span style={{ marginRight: '1rem' }}><strong>{userName}</strong></span>
          <button onClick={logout} className={styles.logoutButton}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', marginTop: '2rem' }}>
        <input type="text" placeholder="Search by name" value={search}
               onChange={e => setSearch(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', width: '200px' }} />
        <select value={category} onChange={e => setCategory(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '8px' }}>
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
        {paginatedItems.map(item => (
          <div key={item._id} onClick={() => { setSelectedItem(item); setQuantity(1); }}
               style={{
                 background: 'linear-gradient(to bottom, #ffa500, #ffffff, #4caf50)',
                 padding: '10px', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                 cursor: 'pointer', borderRadius: '12px'
               }}>
            <img src={item.image} alt={item.name}
                 style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '40px' }} />
            <h3>{item.name}</h3>
            <p>₹{item.price}</p>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ marginRight: '10px' }}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ marginLeft: '10px' }}>Next</button>
        </div>
      )}

      {selectedItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 999
        }}>
          <div style={{
            background: 'linear-gradient(to bottom, #ffa500, #ffffff, #4caf50)',
            padding: '2rem', borderRadius: '80px',
            width: '70%', maxWidth: '300px', textAlign: 'center'
          }}>
            <img src={selectedItem.image} alt={selectedItem.name}
                 style={{ width: '100%', borderRadius: '80px', marginBottom: '1rem' }} />
            <h2>{selectedItem.name}</h2>
            <p style={{ margin: '1rem 0' }}>₹{selectedItem.price}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '1rem' }}>
              <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button onClick={handleAddToCart}
                    style={{ background: 'orange', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Add to Cart
            </button>
            <br />
            <button onClick={() => setSelectedItem(null)}
                    style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: 'red' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {cartVisible && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 999
        }}>
          <div style={{
            background: 'linear-gradient(to bottom, #ffa500, #ffffff, #4caf50)',
            padding: '2rem', borderRadius: '80px',
            width: '90%', maxWidth: '500px'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'
            }}>
              <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
            </div>
            <h2>🛒 Your Cart</h2>
            {cart.length === 0 ? (
              <p>No items in cart.</p>
            ) : cart.map(item => (
              <div key={item._id} style={{
                display: 'flex', alignItems: 'center', marginBottom: '1rem',
                borderBottom: '1px solid #ccc', paddingBottom: '0.5rem'
              }}>
                <img src={item.image} alt={item.name} width={60} height={60}
                     style={{ borderRadius: '8px', marginRight: '10px' }} />
                <div style={{ flex: 1 }}>
                  <h4>{item.name}</h4>
                  <p>₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</p>
                  <div>
                    <button onClick={() => updateQuantity(item._id, -1)}>-</button>
                    <button onClick={() => updateQuantity(item._id, 1)}>+</button>
                    <button onClick={() => removeFromCart(item._id)}
                            style={{ color: 'red', marginLeft: '10px' }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
            <h3>Total: ₹{totalAmount}</h3>
            <button style={{
              background: 'green', color: 'white', padding: '0.5rem 1rem',
              border: 'none', borderRadius: '8px', cursor: 'pointer', marginRight: '10px'
            }}>
              Proceed to Payment
            </button>
            <button onClick={() => setCartVisible(false)}
                    style={{ padding: '0.5rem 1rem', background: 'gray', color: 'white', border: 'none', borderRadius: '8px' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
