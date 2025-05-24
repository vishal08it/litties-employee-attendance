import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '../styles/Home.module.css' 
import { useRouter } from 'next/router';

export default function ItemsPage() {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 16;
  const router = useRouter();

  const categories = [
    "Indian Gravy Veg", "Indian Gravy Non-Veg", "Rolls",
    "Chowmeins", "Chinese Dry & Gravy", "Momos & Soups",
    "Biryani", "Rice & Roti"
  ];

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch('/api/items');
      const data = await res.json();
      setAllItems(data);
    };
    fetchItems();
  }, []);

  useEffect(() => {
    let temp = [...allItems];

    if (category) {
      temp = temp.filter((item) => item.category === category);
    }

    if (search) {
      temp = temp.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredItems(temp);
    setPage(1);
  }, [search, category, allItems]);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const logout = () => {
    // Add your logout logic here
   router.push('/');
  };

  return (
    <div style={{ background: 'linear-gradient(orange, white, green)', minHeight: '100vh', padding: '20px' }}>
      {/* Custom Header */}
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

      {/* Search & Filter Controls */}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
        {paginatedItems.map((item) => (
          <div key={item._id} style={{
            background: 'linear-gradient(orange, white, green)',
            borderRadius: '10px',
            padding: '10px',
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <img src={item.image} alt={item.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
            <h3>{item.name}</h3>
            <p>₹{item.price}</p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ marginRight: '10px' }}>Previous</button>
          <span> Page {page} of {totalPages} </span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ marginLeft: '10px' }}>Next</button>
        </div>
      )}
    </div>
  );
}
