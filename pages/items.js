// pages/itemspage.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { toast } from 'react-toastify';
import withAdminAuth from '@/lib/withAdminAuth';
import Footer from '@/components/Footer';

function ItemsPage() {
  const router = useRouter();

  const logout = () => {
    router.push('/');
    toast.success('Logout Successfully');
  };

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

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

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data.map(cat => cat.name));
      } else {
        toast.error('Failed to load categories');
      }
    } catch (err) {
      toast.error('Error loading categories.');
    }
  };

  useEffect(() => {
    let data = [...items];
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(item => item.name.toLowerCase().includes(lower));
    }
    setFilteredItems(data);
    setCurrentPage(1);
  }, [items, searchTerm]);

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
    } catch {
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

      <table style={{ width: '100%', background: '#111827', color: 'white', borderRadius: '10px' }}>
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
          {paginatedItems.map(item => (
            <tr key={item._id} style={{ textAlign: 'center' }}>
              <td>{item.name}</td>
              <td>{item.price}</td>
              <td><img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '6px' }} /></td>
              <td>
                <button
                  onClick={() => toggleStock(item)}
                  style={{ backgroundColor: item.stock === 'In Stock' ? 'green' : 'red', color: 'white', padding: '6px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer' }}>
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

      {totalPages > 1 && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
          <span style={{ margin: '0 1rem' }}>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}

      {showForm && (
        <div className={styles.popup1}>
          <button onClick={resetForm} className={styles.closeButton1}>&times;</button>
          <form onSubmit={handleSubmit}>
            <input className={styles.input1} placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} />
            <input className={styles.input1} placeholder="Price" required type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <select className={styles.input2} required value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select Category</option>
              {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
            </select>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className={styles.input1} />
            {imageUrl && !image && <Image src={imageUrl} alt="Preview" width={80} height={80} />}
            <button type="submit" className={styles.submitButton1}>{isEditing ? 'Update' : 'Add'}</button>
          </form>
        </div>
      )}
      <Footer/>
    </div>
  );
}

export default withAdminAuth(ItemsPage);