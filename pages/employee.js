import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '../styles/Home.module.css';

export default function Employee() {
  const [status, setStatus] = useState('');
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
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
      if (storedName) startTypingMessage(storedName);
    }

    checkPunch();
    fetchRecords();
  }, []);

  const checkPunch = async () => {
    const empId = localStorage.getItem('empId');
    const today = new Date().toISOString().split('T')[0];

    const res = await fetch('/api/attendances');
    const all = await res.json();
    const todayRecord = all.find(a => a.empId === empId && a.date === today);

    if (!todayRecord) setStatus('punchin');
    else if (todayRecord && !todayRecord.punchOut) setStatus('punchout');
    else setStatus('done');
  };

  const fetchRecords = async () => {
    const res = await fetch('/api/attendances');
    const all = await res.json();
    const empId = localStorage.getItem('empId');
    const filtered = all.filter(record => record.empId === empId);
    setRecords(filtered);
  };

  const punch = async () => {
    const empId = localStorage.getItem('empId');
    const name = localStorage.getItem('name');

    const res = await fetch('/api/punch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empId, name }),
    });
    await res.json();
    checkPunch();
    fetchRecords();

    const message = status === 'punchin' ? 'Punched In Successfully!' : 'Punched Out Successfully!';
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(''), 3000);
  };

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  const startTypingMessage = (employeeName) => {
    const fullText = ` your presence at Litties brings not just your hard work, but also your inspiring spirit. Your consistency, effort, and energy elevate everyone around you. Day after day, your commitment never goes unnoticed. You're not just an employee — you're a valued member of our family. Keep shining, keep pushing, and remember: Litties grows stronger because of people like you. We appreciate your dedication, your time, and most of all — your heart. Thank you for everything you do!`;

    let index = 0;
    setTypedMessage('');
    const speed = 40;

    const type = () => {
      if (index < fullText.length) {
        setTypedMessage(prev => prev + fullText.charAt(index));
        index++;
        setTimeout(type, speed);
      }
    };

    type();
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
        justifyContent: 'center'
      }}>
        {photoUrl && (
          <div style={{
            width: '100%',
            maxWidth: '400px',
            height: 'auto',
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
          maxHeight: '400px',
          overflowY: 'auto',
          paddingRight: '1rem',
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '600px'
        }}>
          <p style={{
            color: '#fef08a',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            margin: 0
          }}>
            {typedMessage}
          </p>
        </div>
      </div>

      {/* Attendance Table */}
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ color: '#facc15', fontSize: '1.8rem', marginBottom: '1rem' }}>Your Attendance Records</h2>
        <div style={{
          overflowX: 'auto',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          borderRadius: '1rem',
          background: '#1f2937',
          border: '1px solid #374151',
          padding: '1rem'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            color: '#fefce8',
            background: '#111827',
            borderRadius: '0.75rem',
            boxShadow: 'inset 0 0 10px #00000050',
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

      {popupMessage && (
        <div className="popupMessage">
          {popupMessage}
        </div>
      )}
    </div>
  );
}
