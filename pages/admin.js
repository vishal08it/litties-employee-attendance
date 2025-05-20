import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '../styles/Home.module.css';

export default function Admin() {
  const [data, setData] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [image, setImage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const r = localStorage.getItem('role');
    if (r !== 'admin') router.push('/');
    else fetchAttendances();
  }, []);

  const fetchAttendances = async () => {
    const res = await fetch('/api/attendances');
    const json = await res.json();
    setData(json);
  };

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  const uploadImageToCloudinary = async () => {
    if (!image) return '';
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
      console.error('Cloudinary upload failed:', err);
      return '';
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const imageUrl = await uploadImageToCloudinary();

    const res = await fetch('/api/add-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empId, name, password, role, image: imageUrl }),
    });

    const json = await res.json();
    alert(json.message);
    setEmpId('');
    setName('');
    setPassword('');
    setImage(null);
    setShowForm(false);
    fetchAttendances();
  };

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  const getBase64Image = (url) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const isSameOrAfter = (a, b) => !b || a.setHours(0,0,0,0) >= b.setHours(0,0,0,0);
  const isSameOrBefore = (a, b) => !b || a.setHours(0,0,0,0) <= b.setHours(0,0,0,0);

  const generatePDF = async () => {
    const doc = new jsPDF();
    const logoData = await getBase64Image('/litties.png');

    const grouped = data.reduce((acc, curr) => {
      const key = `${curr.empId}_${curr.name}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {});

    let hasData = false;
    let pageIndex = 0;

    for (const key in grouped) {
      const [empId, empName] = key.split('_');
      const records = grouped[key].filter((record) => {
        const recDate = new Date(record.date);
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;
        return isSameOrAfter(recDate, from) && isSameOrBefore(recDate, to);
      });

      if (records.length === 0) continue;
      hasData = true;
      if (pageIndex > 0) doc.addPage();

      const rows = records.map((r) => {
        const punchIn = r.punchIn ? new Date(r.punchIn).toLocaleTimeString() : '';
        const punchOut = r.punchOut ? new Date(r.punchOut).toLocaleTimeString() : '';
        let timeDiff = '', dayType = '';

        if (r.punchIn && r.punchOut) {
          const inTime = new Date(r.punchIn), outTime = new Date(r.punchOut);
          const diffMs = outTime - inTime;
          const hrs = Math.floor(diffMs / 3600000);
          const mins = Math.floor((diffMs % 3600000) / 60000);
          timeDiff = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
          dayType = diffMs / 3600000 >= 6 ? 1.0 : 0.5;
        } else {
          dayType = 0.0;
        }

        return [formatDate(r.date), r.empId, r.name, punchIn, punchOut, timeDiff, dayType.toString()];
      });

      const totalDays = rows.reduce((acc, r) => acc + parseFloat(r[6]), 0).toFixed(1);
      rows.push(['', '', '', '', '', 'Total Days:', totalDays]);

      doc.addImage(logoData, 'PNG', 14, 10, 20, 20);
      doc.setFontSize(14);
      doc.text('Litties Multi Cuisine Family Restaurant', 40, 16);
      doc.setFontSize(10);
      doc.text('Shanti Prayag, Lalganj, Sasaram - 821115', 40, 22);
      doc.setFontSize(12);
      doc.text(`Attendance for ${empName} (${empId})`, 14, 35);

      autoTable(doc, {
        startY: 40,
        head: [['Date', 'Emp ID', 'Name', 'Punch In', 'Punch Out', 'Time Diff', 'Day Type']],
        body: rows,
      });

      pageIndex++;
    }

    if (!hasData) {
      alert('No attendance records found for selected date range.');
    } else {
      doc.save('attendance.pdf');
    }

    setShowDownloadModal(false);
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

      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ color: '#facc15' }}>Admin Dashboard</h2>
          <div>
            <button onClick={() => setShowForm(true)} className={styles.loginButton}>Add New Employee</button>
            <button onClick={handleDownloadClick} className={styles.loginButton}>Download Attendance</button>
          </div>
        </div>

        {showForm && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Add New Employee</h3>
              <form onSubmit={handleAddEmployee}>
                <input value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="Employee ID" className={styles.input} required />
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={styles.input} required />
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={styles.input} required />
                <select value={role} onChange={(e) => setRole(e.target.value)} className={styles.input}>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className={styles.input} />
                <button type="submit" className={styles.submitButton}>Submit</button>
                <button type="button" onClick={() => setShowForm(false)} className={styles.loginButton}>Cancel</button>
              </form>
            </div>
          </div>
        )}

        {showDownloadModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Select Date Range</h3>
              <DatePicker selected={dateFrom} onChange={(date) => setDateFrom(date)} placeholderText="From" className={styles.input} />
              <DatePicker selected={dateTo} onChange={(date) => setDateTo(date)} placeholderText="To" className={styles.input} />
              <button onClick={generatePDF} className={styles.loginButton}>Download</button>
              <button onClick={() => setShowDownloadModal(false)} className={styles.loginButton}>Cancel</button>
            </div>
          </div>
        )}

        <h2 style={{ color: '#facc15' }}>Attendance Records</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Name</th>
                <th>Date</th>
                <th>Punch In</th>
                <th>Punch Out</th>
                <th>Time Diff</th>
                <th>Day Type</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a, i) => {
                let timeDiff = '', dayType = '';
                if (a.punchIn && a.punchOut) {
                  const inTime = new Date(a.punchIn);
                  const outTime = new Date(a.punchOut);
                  const diff = outTime - inTime;
                  const hrs = Math.floor(diff / 3600000);
                  const mins = Math.floor((diff % 3600000) / 60000);
                  timeDiff = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                  dayType = diff / 3600000 >= 6 ? '1.0' : '0.5';
                } else {
                  dayType = '0.0';
                }
                return (
                  <tr key={i}>
                    <td>{a.empId}</td>
                    <td>{a.name}</td>
                    <td>{formatDate(a.date)}</td>
                    <td>{a.punchIn ? new Date(a.punchIn).toLocaleTimeString() : ''}</td>
                    <td>{a.punchOut ? new Date(a.punchOut).toLocaleTimeString() : ''}</td>
                    <td>{timeDiff}</td>
                    <td>{dayType}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
