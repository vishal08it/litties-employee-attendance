// pages/add-category.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAdminAuth from '@/lib/withAdminAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function AddCategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
      else throw new Error();
    } catch {
      toast.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.warning('Enter category name');

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Category added!');
      setName('');
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to add');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
       <Header logout={() => router.push('/')} showLogoutOnly={true} />
        <div style={{ marginTop: '120px' }}></div>

      {/* <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/litties.png" alt="Logo" width={60} height={60} />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Litties Multi Cuisine Family Restaurant</h1>
          <p className={styles.address}>Shanti Prayag, Lalganj, Sasaram - 821115</p>
        </div>
        <button onClick={() => router.push('/')} className={styles.logoutButton}>Logout</button>
      </header> */}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => setShowForm(true)} className={styles.addemployeeButton}>Add Category</button>
        <button onClick={() => router.push('/admin')} className={styles.addemployeeButton} style={{ backgroundColor: '#1f2937' }}>Admin Dashboard</button>
      </div>

      <h1 style={{ color: '#facc15', marginBottom: '1rem' }}>Category Management</h1>

      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', background: '#111827', borderRadius: '10px', boxShadow: '0 4px 15px rgba(250, 204, 21, 0.6), inset 0 0 10px #facc15', color: 'white' }}>
        <thead style={{ backgroundColor: '#facc15', color: '#111827' }}>
          <tr>
            <th>SL.No</th>
            <th>Category Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, i) => (
            <tr key={cat._id} style={{ background: i % 2 === 0 ? '#1f2937' : '#374151', textAlign: 'center' }}>
              <td>{i + 1}</td>
              <td>{cat.name}</td>
              <td>
                <button onClick={() => handleDelete(cat._id)} style={{ backgroundColor: '#dc2626', color: 'white', padding: '4px 12px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <>
          <div className={styles.overlay1} onClick={(e) => e.target === e.currentTarget && setShowForm(false)} />
          <div className={styles.popup1}>
            <button className={styles.closeButton1} onClick={() => setShowForm(false)}>&times;</button>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Image src="/litties.png" alt="Logo" width={60} height={60} />
            </div>
            <h2>Add New Category</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Category Name"
                className={styles.input1}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="submit" className={styles.submitButton1}>Add</button>
                <button type="button" onClick={() => setShowForm(false)} className={styles.submitButton1} style={{ backgroundColor: '#999' }}>Cancel</button>
              </div>
            </form>
          </div>
        </>
      )}
      <Footer/>
    </div>
  );
}

export default withAdminAuth(AddCategoryPage);