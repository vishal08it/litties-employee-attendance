import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { useRouter } from 'next/router';

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
    "Rolls","Chowmeins","Momos","Soups","Rice & Roti","Biryani", "Chinese Dry & Gravy","Indian Gravy Veg", "Indian Gravy Non-Veg","Litties Special" 
  ];

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch('/api/items');
      const data = await res.json();
      setAllItems(data);
    };
    fetchItems();

    const nameFromStorage = localStorage.getItem('name');
    const mobileFromStorage = localStorage.getItem('mobileNumber');
    if (nameFromStorage) setUserName(nameFromStorage);
    if (!mobileFromStorage) localStorage.getItem('mobile');
  }, []);

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

  const logout = () => router.push('/');

  const handleAddToCart = async () => {
    const mobile = localStorage.getItem('mobileNumber');
    if (!mobile) return alert('Mobile number not found');

    const existingIndex = cart.findIndex(item => item._id === selectedItem._id);
    const newCart = [...cart];

    if (existingIndex !== -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({ ...selectedItem, quantity });
    }

    setCart(newCart);
    setSelectedItem(null);

    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          item: {
            _id: selectedItem._id,
            name: selectedItem.name,
            image: selectedItem.image,
            price: selectedItem.price,
          },
          quantity
        })
      });
    } catch (err) {
      console.error('Error saving to cart:', err);
    }
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prev => prev.map(item =>
      item._id === itemId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item._id !== itemId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ background: 'linear-gradient(orange, white, green)', minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Litties Multi Cuisine Family Restaurant</h1>
          <p className={styles.address}>Shanti Prayag, Lalganj, Sasaram - 821115</p>
        </div>
        <div className={styles.rightSection}>
          <span 
            onClick={() => setCartVisible(true)} 
            style={{ marginRight: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
            title="Open Cart"
          >
            🛒 Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </span>
          <span style={{ marginRight: '1rem' }}><strong>{userName}</strong></span>
          <button onClick={logout} className={styles.logoutButton}>Logout</button>
        </div>
      </header>

      {/* Search & Filter */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', marginTop: '2rem' }}>
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '8px', width: '200px' }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '8px' }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
        gap: '20px' 
      }}>
        {paginatedItems.map((item) => (
          <div 
            key={item._id} 
            onClick={() => { setSelectedItem(item); setQuantity(1); }} 
            style={{
              background: 'linear-gradient(to bottom, #ffa500, #ffffff, #4caf50)', 
              padding: '10px',
              textAlign: 'center', 
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
              cursor: 'pointer',
              borderRadius: '12px'
            }}
          >
            <img 
              src={item.image} 
              alt={item.name} 
              style={{ 
                width: '100%', 
                height: '120px', 
                objectFit: 'cover', 
                borderRadius: '40px' 
              }} 
            />
            <h3>{item.name}</h3>
            <p>₹{item.price}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ marginRight: '10px' }}>Previous</button>
          <span> Page {page} of {totalPages} </span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ marginLeft: '10px' }}>Next</button>
        </div>
      )}

      {/* Item Modal */}
      {selectedItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 999
        }}>
          <div style={{
            background: 'linear-gradient(to bottom, #ffa500, #ffffff, #4caf50)', padding: '2rem', borderRadius: '80px',
            width: '70%', maxWidth: '300px', textAlign: 'center'
          }}>
            <img src={selectedItem.image} alt={selectedItem.name} style={{ width: '100%', borderRadius: '80px', marginBottom: '1rem' }} />
            <h2>{selectedItem.name}</h2>
            <p style={{ margin: '1rem 0' }}>₹{selectedItem.price}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '1rem' }}>
              <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button
              onClick={handleAddToCart}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Add to Cart
            </button>
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                marginTop: '1rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#4caf50',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {cartVisible && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 999
        }}>
          <div style={{
            background: 'linear-gradient(to bottom, #ffa500, #ffffff, #4caf50)', padding: '2rem', borderRadius: '80px',
            width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
            </div>

            <h2>🛒 Your Cart</h2>

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item._id} style={{
                    display: 'flex', alignItems: 'center', marginBottom: '1rem',
                    background: 'rgba(255,255,255,0.8)', borderRadius: '12px', padding: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', marginRight: '1rem' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0 }}>{item.name}</h4>
                      <p style={{ margin: '0.2rem 0' }}>₹{item.price} each</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => updateQuantity(item._id, -1)} disabled={item.quantity === 1}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, 1)}>+</button>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                      <p style={{ margin: 0 }}>₹{item.price * item.quantity}</p>
                      <button onClick={() => removeFromCart(item._id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <hr style={{ margin: '1rem 0' }} />

                <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  Total: ₹{totalAmount}
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => setCartVisible(false)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #4caf50',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      color: '#4caf50'
                    }}
                  >
                    Close
                  </button>

                  <button
                    disabled={cart.length === 0}
                    onClick={() => {
                      // Save cart data to localStorage for payment page
                      localStorage.setItem('cartItems', JSON.stringify(cart));
                      // Redirect to payment page
                      router.push('/payment');
                    }}
                    style={{
                      background: cart.length === 0 ? 'gray' : '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Proceed to Buy
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
