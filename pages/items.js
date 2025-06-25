// pages/itemspage.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { toast } from 'react-toastify';
import withAdminAuth from '@/lib/withAdminAuth';

function ItemsPage() {
  const router = useRouter();

  const logout = () => {
    router.push('/');
    toast.success('Logout Successfully');
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterSortPaginate();
  }, [items, searchTerm]);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      toast.error('Error loading items.');
    }
  };

  const filterSortPaginate = () => {
    let data = [...items];
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(item => item.name.toLowerCase().includes(lower));
    }
    setFilteredItems(data);
    setCurrentPage(1); // Reset to first page on new filter
  };

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
      const data = await res.json();
      return data.secure_url || '';
    } catch (err) {
      toast.error('Image upload failed.');
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uploadedUrl = await uploadImageToCloudinary();
    if (!uploadedUrl) return;

    const method = isEditing ? 'PUT' : 'POST';
    const endpoint = isEditing ? `/api/items/${editId}` : '/api/items';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: parseFloat(price), category, image: uploadedUrl, stock: isEditing ? undefined : 'In Stock' }),
      });

      if (!res.ok) throw new Error('Save failed');
      toast.success(isEditing ? 'Item updated!' : 'Item added!');
      resetForm();
      fetchItems();
    } catch {
      toast.error('Error saving item.');
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item._id);
    setName(item.name);
    setPrice(item.price.toString());
    setImageUrl(item.image);
    setImage(null);
    setCategory(item.category || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' });
      toast.success('Item deleted!');
      fetchItems();
    } catch {
      toast.error('Error deleting item.');
    }
  };

  const toggleStock = async (item) => {
    const newStatus = item.stock === 'In Stock' ? 'Out of Stock' : 'In Stock';
    try {
      await fetch(`/api/items/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStatus }),
      });
      fetchItems();
    } catch {
      toast.error('Failed to update stock status');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setPrice('');
    setImage(null);
    setImageUrl('');
    setCategory('');
    setShowForm(false);
  };

  return (
    <div className={styles.container}>
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
        <button onClick={() => setShowForm(true)} className={styles.addemployeeButton}>Add New Item</button>
        <button onClick={() => router.push('/admin')} className={styles.addemployeeButton} style={{ backgroundColor: '#1f2937' }}>Admin Dashboard</button>
      </div>

      <h1 style={{ color: '#facc15', marginBottom: '1rem' }}>Menu Item Management</h1>

      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', width: '100%', marginBottom: '1rem' }}
      />

      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', background: '#111827', borderRadius: '10px', boxShadow: '0 4px 15px rgba(250, 204, 21, 0.6), inset 0 0 10px #facc15', color: 'white' }}>
        <thead style={{ backgroundColor: '#facc15', color: '#111827' }}>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Image</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedItems.map((item, i) => (
            <tr key={item._id} style={{ background: i % 2 === 0 ? '#1f2937' : '#374151', textAlign: 'center' }}>
              <td>{item.name}</td>
              <td>{item.price}</td>
              <td><img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '6px' }} /></td>
              <td>
                <button
                  onClick={() => toggleStock(item)}
                  style={{
                    backgroundColor: item.stock === 'In Stock' ? 'green' : 'red',
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {item.stock}
                </button>
              </td>
              <td>
                <button onClick={() => handleEdit(item)} style={{ backgroundColor: '#facc15', color: '#000', padding: '4px 12px', borderRadius: '9999px', marginRight: '10px', border: 'none', cursor: 'pointer' }}>✏️</button>
                <button onClick={() => handleDelete(item._id)} style={{ backgroundColor: '#dc2626', color: 'white', padding: '4px 12px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Tricolor Oval Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '10px 25px',
              borderRadius: '999px',
              border: 'none',
              fontWeight: 'bold',
              color: 'black',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(to right, #FF9933, white, #138808)',
              opacity: currentPage === 1 ? 0.6 : 1
            }}
          >
            Previous
          </button>

          <span style={{ fontWeight: 'bold', color: 'white' }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '10px 25px',
              borderRadius: '999px',
              border: 'none',
              fontWeight: 'bold',
              color: 'black',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(to right, #FF9933, white, #138808)',
              opacity: currentPage === totalPages ? 0.6 : 1
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal for Add/Edit */}
      {showForm && (
        <>
          <div className={styles.overlay1} onClick={(e) => e.target === e.currentTarget && resetForm()} />
          <div className={styles.popup1}>
            <button className={styles.closeButton1} onClick={resetForm}>&times;</button>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
            </div>
            <h2>{isEditing ? 'Edit Item' : 'Add New Item'}</h2>
            <form onSubmit={handleSubmit}>
              <input className={styles.input1} placeholder="Name" required type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              <input className={styles.input1} placeholder="Price" required type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
              <select className={styles.input2} required value={category} onChange={(e) => setCategory(e.target.value)}>
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
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className={styles.input1} />
              {imageUrl && !image && <Image src={imageUrl} alt="Current Image" width={80} height={80} />}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="submit" className={styles.submitButton1}>{isEditing ? 'Update' : 'Add'}</button>
                <button type="button" onClick={resetForm} className={styles.submitButton1} style={{ backgroundColor: '#999' }}>Cancel</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
export default withAdminAuth(ItemsPage); 