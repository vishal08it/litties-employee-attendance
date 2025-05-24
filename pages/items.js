import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '../styles/Home.module.css';



export default function ItemsPage() {
  const router = useRouter();

  // Header logout handler (update with your logout logic)
  const logout = () => {
    
    router.push('/'); // adjust to your login route
  };

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Search & sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // UI messages state
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterSortPaginate();
  }, [items, searchTerm, sortField, sortOrder, currentPage]);

  // Fetch all items from API
  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      const data = await res.json();
      setItems(data);
      setMessage({ type: '', text: '' });
    } catch (err) {
      console.error('Error loading items:', err);
      setMessage({ type: 'error', text: 'Error loading items.' });
    }
  };

  // Filter, sort, and paginate the items for display
  const filterSortPaginate = () => {
    let data = [...items];

    // Search filter
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(item => item.name.toLowerCase().includes(lower));
    }

    // Sort
    if (sortField) {
      data.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === 'name') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredItems(data);
  };

  // Pagination helpers
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uploadImageToCloudinary = async () => {
    if (!image) return imageUrl;

    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', 'litties_unsigned');
    const cloudName = 'depov4b4l';

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.secure_url || '';
    } catch (err) {
      console.error('Cloudinary Error:', err);
      setMessage({ type: 'error', text: 'Image upload failed.' });
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const uploadedUrl = await uploadImageToCloudinary();
    if (!uploadedUrl) {
      // Image upload failed, message set in uploadImageToCloudinary
      return;
    }

    const method = isEditing ? 'PUT' : 'POST';
    const endpoint = isEditing ? `/api/items/${editId}` : '/api/items';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: parseFloat(price), category,image: uploadedUrl }),
      });

      if (!res.ok) throw new Error('Save failed');

      setMessage({ type: 'success', text: isEditing ? 'Item updated!' : 'Item added!' });
      resetForm();
      fetchItems();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error saving item.' });
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item._id);
    setName(item.name);
    setPrice(item.price.toString());
    setImageUrl(item.image);
    setImage(null);
    setShowForm(true);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setMessage({ type: 'success', text: 'Item deleted!' });
      fetchItems();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error deleting item.' });
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setPrice('');
    setImage(null);
    setImageUrl('');
    setShowForm(false);
    setMessage({ type: '', text: '' });
  };

  const handleSortChange = (field) => {
    if (sortField === field) {
      // toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '1rem' }}>
        <button onClick={() => setShowForm(true)} className={styles.addemployeeButton}>
          Add New Item
        </button>
        <button
          onClick={() => router.push('/admin')}
          className={styles.addemployeeButton}
          style={{ backgroundColor: '#1f2937' }}
        >
          Admin Dashboard
        </button>
      </div>

      <h1 style={{ color: '#facc15', marginBottom: '1rem' }}>Menu Item Management</h1>

      {/* Message UI */}
      {message.text && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '10px',
            borderRadius: '6px',
            color: message.type === 'error' ? '#b91c1c' : '#166534',
            backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5',
            border: `1px solid ${message.type === 'error' ? '#fca5a5' : '#4ade80'}`,
            fontWeight: 'bold',
          }}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {/* Search and Sort Controls */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset page on search
          }}
          style={{
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            flexGrow: 1,
          }}
          aria-label="Search menu items by name"
        />
        
      </div>

      {/* Item List */}
      {paginatedItems.length === 0 ? (
        <p>No items found.</p>
      ) : (
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
  <thead style={{ backgroundColor: '#facc15', color: '#111827', borderRadius: '10px' }}>
    <tr>
      <th style={{ padding: '10px 15px', borderRadius: '10px 0 0 10px' }}>Name</th>
      <th>Price</th>
      <th>Image</th>
      <th style={{ borderRadius: '0 10px 10px 0' }}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {paginatedItems.length === 0 ? (
      <tr>
        <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
          No items found.
        </td>
      </tr>
    ) : (
      paginatedItems.map((item, i) => (
        <tr
          key={item._id}
          style={{
            background: i % 2 === 0 ? '#1f2937' : '#374151',
            borderRadius: '8px',
            boxShadow: 'inset 2px 2px 5px #111827, inset -2px -2px 5px #4b5563',
            transition: 'transform 0.2s',
            textAlign: 'center',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <td style={{ padding: '10px 15px' }}>{item.name}</td>
          <td>{item.price}</td>
          <td>
            <img
              src={item.image}
              alt={item.name}
              style={{ width: '50px', height: '50px', borderRadius: '6px' }}
            />
          </td>
          <td>
            <button
              onClick={() => handleEdit(item)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#facc15',
                fontSize: '16px',
                marginRight: '10px',
              }}
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={() => handleDelete(item._id)}
              style={{
                backgroundColor: '#dc2626',
                border: 'none',
                cursor: 'pointer',
                color: 'white',
                fontSize: '16px',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
              title="Delete"
            >
              🗑️
            </button>
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>

      )}

      {/* Pagination Controls */}
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          Prev
        </button>
        <span aria-live="polite" aria-atomic="true">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          Next
        </button>
      </div>

      {/* Add/Edit Item Form */}
      {showForm && (
  <>
    <div className={styles.overlay1} onClick={(e) => e.target === e.currentTarget && resetForm()} />
    <div className={styles.popup1}>
      <button className={styles.closeButton1} onClick={resetForm}>&times;</button>
       <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',  // Optional: for vertical centering
        width: '100%'    // Optional: for horizontal centering
      }}>
        <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
      </div>
      <h2>{isEditing ? 'Edit Item' : 'Add New Item'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          className={styles.input1}
          placeholder="Name"
          id="name"
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <input
          className={styles.input1}
          placeholder="Price"
          id="price"
          required
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <select
          className={styles.input2}
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="Rolls">Rolls</option>
          <option value="Chowmeins">Chowmeins</option>
          <option value="Momos">Momos</option>
          <option value="Soups">Soups</option>
          <option value="Rice & Roti">Rice & Roti</option>
          <option value="Biryani">Biryani</option>
          <option value="Chinese Dry & Gravy">Chinese Dry & Gravy</option>
          <option value="Indian Gravy Veg">Indian Gravy Veg</option>
          <option value="Indian Gravy Non-Veg">Indian Gravy Non-Veg</option>
          <option value="Litties Special">Litties Special</option>
          </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className={styles.input1}
        />

        {imageUrl && !image && (
          <div style={{ marginBottom: '1rem' }}>
            <Image src={imageUrl} alt="Current Image" width={80} height={80} />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="submit" className={styles.submitButton1}>
            {isEditing ? 'Update' : 'Add'}
          </button>
          <button type="button" onClick={resetForm} className={styles.submitButton1} style={{ backgroundColor: '#999' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  


  </>
)}

        
      
    </div>
  );
}
