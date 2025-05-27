import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../styles/Home.module.css';

export default function Employee() {
  const [status, setStatus] = useState('');
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [records, setRecords] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');
    const storedName = localStorage.getItem('name');
    const imageUrl = localStorage.getItem('image');

    if (role !== 'employee') {
      router.push('/');
    } else {
      setName(storedName);
      if (imageUrl) setPhotoUrl(imageUrl);
    }

    checkPunch();
    fetchRecords();
  }, []);

  const checkPunch = async () => {
    try {
      const empId = localStorage.getItem('empId');
      const today = new Date().toISOString().split('T')[0];

      const res = await fetch('/api/attendances');
      const all = await res.json();
      const todayRecord = all.find(a => a.empId === empId && a.date === today);

      if (!todayRecord) setStatus('punchin');
      else if (todayRecord && !todayRecord.punchOut) setStatus('punchout');
      else setStatus('done');
    } catch (error) {
      toast.error('Failed to check attendance status.');
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/attendances');
      const all = await res.json();
      const empId = localStorage.getItem('empId');
      const filtered = all.filter(record => record.empId === empId);
      setRecords(filtered);
    } catch (error) {
      toast.error('Failed to fetch attendance records.');
    }
  };
  

  const punch = async () => {
    try {
      const empId = localStorage.getItem('empId');
      const name = localStorage.getItem('name');

      const res = await fetch('/api/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empId, name }),
      });

      const result = await res.json();

      if (res.ok) {
        checkPunch();
        fetchRecords();
        const message = status === 'punchin' ? 'Punched In Successfully!' : 'Punched Out Successfully!';
        toast.success(message);
      } else {
        toast.error(result.message || 'Punch action failed.');
      }
    } catch (error) {
      toast.error('An error occurred while punching.');
    }
  };

  const logout = () => {
    localStorage.clear();
    router.push('/');
     toast.success('Logout successfully!', { autoClose: 2000 });
  };

  const tableHeader = {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '1px solid #444',
    color: '#facc15',
    fontSize: '1rem',
    fontWeight: 'bold',
    boxShadow: 'inset 0 -1px 0 #00000030'
  };

  const tableCell = {
    padding: '12px',
    borderBottom: '1px solid #374151',
    fontSize: '0.95rem',
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  const getDayType = (duration) => {
    if (!duration || duration === '0') return 'Absent';
    const hours = parseFloat(duration);
    if (hours > 6) return '1';
    if (hours > 0) return '0.5';
    return 'Absent';
  };

  return (
    <div className={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Litties Multi Cuisine Family Restaurant</h1>
          <p className={styles.address}>Shanti Prayag, Lalganj, Sasaram - 821115</p>
          {status === 'done' && (
            <p style={{ color: '#eab308', marginTop: '0.5rem', fontWeight: 'bold' }}>
              You have completed today's attendance.
            </p>
          )}
        </div>
        {status === 'punchin' && <button className={styles.punchin} onClick={punch}>Punch In</button>}
        {status === 'punchout' && <button className={styles.logoutButton} onClick={punch}>Punch Out</button>}
        <button onClick={logout} className={styles.logoutButton}>Logout</button>
      </header>

      <div style={{ marginTop: '1rem', textAlign: 'left', maxWidth: '1200px', margin: '0 auto', paddingLeft: '2rem' }}>
        <h2 style={{ color: '#eab308', margin: 0, fontSize: '1.5rem' }}>
          Welcome, {name}
        </h2>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '2rem',
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        justifyContent: 'left'
      }}>
        {photoUrl && (
          <div style={{
            width: '100%',
            maxWidth: '200px',
            height: '200px',
            borderRadius: '140px',
            overflow: 'hidden',
            border: '2px solid #444'
          }}>
            <Image
              src={photoUrl}
              alt={`${name}'s photo`}
              width={400}
              height={400}
              style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
            />
          </div>
        )}

        <div style={{
          flexGrow: 1,
          maxWidth: '1000px',
          overflowX: 'auto',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          borderRadius: '1rem',
          background: '#1f2937',
          border: '1px solid #374151',
          padding: '1rem',
        }}>
          <h2 style={{ color: '#facc15', fontSize: '1.5rem', marginBottom: '1rem' }}>Your Attendance Records</h2>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            color: '#fefce8',
            background: '#111827',
            borderRadius: '0.75rem',
            overflow: 'hidden'
          }}>
            <thead style={{ backgroundColor: '#27272a' }}>
              <tr>
                <th style={tableHeader}>Date</th>
                <th style={tableHeader}>Punch In</th>
                <th style={tableHeader}>Punch Out</th>
                <th style={tableHeader}>Day Type</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="4" style={tableCell}>No records found.</td>
                </tr>
              ) : (
                records.map((rec, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 ? '#1f2937' : '#111827' }}>
                    <td style={tableCell}>{formatDate(rec.date)}</td>
                    <td style={tableCell}>{formatTime(rec.punchIn)}</td>
                    <td style={tableCell}>{rec.punchOut ? formatTime(rec.punchOut) : '—'}</td>
                    <td style={tableCell}>{getDayType(rec.timeDiff)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
