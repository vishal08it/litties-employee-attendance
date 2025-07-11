import { useState, useEffect } from 'react'; 
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import withAdminAuth from '@/lib/withAdminAuth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import Footer from '@/components/Footer';

function SpecialOfferPage() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [offerType, setOfferType] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const logout = () => {
    router.push('/');
    toast.success('Logout Successfully');
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await fetch('/api/specialoffer/all');
      const json = await res.json();
      setOffers(json.data || []);
    } catch {
      toast.error('Error loading offers');
    }
  };

  const toggleActive = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/specialoffer/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newStatus }),
      });
      const json = await res.json();
      if (json.success) fetchOffers();
      else toast.error('Update failed');
    } catch {
      toast.error('Error updating status');
    }
  };

  const deleteOffer = (id) => {
    setPendingDeleteId(id);
    toast.warn(
      <div>
        Confirm delete? <br />
        <button
          onClick={() => confirmDelete(id)}
          style={{
            background: '#dc2626',
            color: 'white',
            padding: '6px 12px',
            border: 'none',
            borderRadius: '6px',
            marginTop: '6px',
            cursor: 'pointer',
          }}
        >
          Yes, Delete
        </button>
      </div>,
      { autoClose: false }
    );
  };

  const confirmDelete = async (id) => {
    toast.dismiss();
    try {
      const res = await fetch(`/api/specialoffer/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Offer deleted successfully');
        fetchOffers();
      } else {
        toast.error(json.error || 'Delete failed');
      }
    } catch {
      toast.error('Error deleting offer');
    }
    setPendingDeleteId(null);
  };

  const uploadImageToCloudinary = async () => {
    if (!image) return '';
    const form = new FormData();
    form.append('file', image);
    form.append('upload_preset', 'litties_unsigned');
    const cloudName = 'depov4b4l';

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      return data.secure_url || '';
    } catch {
      toast.error('Image upload failed.');
      return '';
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setPrice('');
    setImage(null);
    setOfferType('');
    setDayOfWeek('');
    setStartDateTime('');
    setEndDateTime('');
    setShowForm(false);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || (!image && !editId) || !offerType) {
      toast.error('Please fill all required fields.');
      return;
    }

    setLoading(true);

    let imageUrl = '';
    if (image) {
      imageUrl = await uploadImageToCloudinary();
      if (!imageUrl) return setLoading(false);
    } else if (editId) {
      const existing = offers.find(o => o._id === editId);
      imageUrl = existing?.image || '';
    }

    const payload = {
      name,
      price,
      image: imageUrl,
      offerType,
      dayOfWeek: offerType === 'day' ? dayOfWeek : '',
      startDateTime: offerType === 'time' ? startDateTime : '',
      endDateTime: offerType === 'time' ? endDateTime : '',
    };

    try {
      const method = editId ? 'PUT' : 'POST';
      const endpoint = editId ? `/api/specialoffer/${editId}` : '/api/specialoffer/add';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        resetForm();
        fetchOffers();
        setTimeout(() => {
          toast.success(editId ? 'Offer updated successfully!' : 'Offer created successfully!');
        }, 200);
      } else {
        toast.error(json.error || 'Save failed');
      }

    } catch {
      toast.error('Error saving offer');
    }

    setLoading(false);
  };

  const handleEdit = (o) => {
    setEditId(o._id);
    setName(o.name);
    setPrice(o.price);
    setOfferType(o.offerType);
    setDayOfWeek(o.dayOfWeek || '');
    setStartDateTime(o.startDateTime ? o.startDateTime.slice(0, 16) : '');
    setEndDateTime(o.endDateTime ? o.endDateTime.slice(0, 16) : '');
    setShowForm(true);
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

      <h2 style={{ color: '#facc15', margin: '1rem 0', textAlign: 'left' }}>
        Manage Time-Based or Day-Based Offers
      </h2>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => setShowForm(true)} className={styles.addemployeeButton}>Add Offer</button>
        <button onClick={() => router.push('/admin')} className={styles.addemployeeButton} style={{ backgroundColor: '#1f2937' }}>Admin Dashboard</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', background: '#111827', color: 'white', borderRadius: 8 }}>
          <thead style={{ backgroundColor: '#facc15', color: '#111827' }}>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Image</th>
              <th>Type</th>
              <th>Day/Time</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(o => (
              <tr key={o._id} style={{ textAlign: 'center' }}>
                <td>{o.name}</td>
                <td>{o.price}</td>
                <td><img src={o.image} alt="" style={{ width: 50, height: 50, borderRadius: 6 }} /></td>
                <td>{o.offerType}</td>
                <td>
                  {o.offerType === 'day'
                    ? o.dayOfWeek
                    : `${o.startDateTime?.slice(0,16)} → ${o.endDateTime?.slice(0,16)}`}
                </td>
                <td>
                  <button
                    onClick={() => toggleActive(o._id, !o.active)}
                    style={{
                      backgroundColor: o.active ? 'green' : 'red',
                      color: 'white',
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: 999,
                      cursor: 'pointer'
                    }}
                  >
                    {o.active ? 'Yes' : 'No'}
                  </button>
                </td>
                <td>
                  <button onClick={() => handleEdit(o)} style={styles.actionBtn}>✏️</button>
                  <button onClick={() => deleteOffer(o._id)} style={{ ...styles.actionBtn, backgroundColor: '#dc2626' }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className={styles.popup1}>
          <button onClick={resetForm} className={styles.closeButton1}>&times;</button>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ color: 'white' }}>{editId ? 'Edit' : 'Add'} Offer</h2>
            <input className={styles.input1} placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
            <input className={styles.input1} type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required />
            <select className={styles.input2} value={offerType} onChange={e => setOfferType(e.target.value)} required>
              <option value="">Select Type</option>
              <option value="day">Day Based</option>
              <option value="time">Time Based</option>
            </select>

            {offerType === 'day' && (
              <select className={styles.input2} value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)} required>
                <option value="">Select Day</option>
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}

            {offerType === 'time' && (
              <>
                <label style={{ color: 'white' }}>Start DateTime:</label>
                <input className={styles.input1} type="datetime-local" value={startDateTime} onChange={e => setStartDateTime(e.target.value)} required />
                <label style={{ color: 'white' }}>End DateTime:</label>
                <input className={styles.input1} type="datetime-local" value={endDateTime} onChange={e => setEndDateTime(e.target.value)} required />
              </>
            )}

            <input
              className={styles.input1}
              type="file"
              accept="image/*"
              onChange={e => setImage(e.target.files[0])}
              required={!editId}
            />
            <button type="submit" className={styles.submitButton1} disabled={loading}>
              {loading ? 'Saving...' : editId ? 'Update Offer' : 'Save Offer'}
            </button>
          </form>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={2000} />
      <Footer/>
    </div>
  );
}

export default withAdminAuth(SpecialOfferPage);
