
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
    fetchAttendances();
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

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  const uploadImageToCloudinary = async () => {
    debugger
    if (!image) return '';

    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', 'litties_unsigned'); // Your Cloudinary preset
    const cloudName = 'depov4b4l'; // Replace with actual cloud name

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        console.error('Cloudinary upload failed:', data);
        return '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      return '';
    }
  };

  const handleAddEmployee = async (e) => {
    debugger
    e.preventDefault();

    let imageUrl = '';
    if (image) {
      imageUrl = await uploadImageToCloudinary();
    }

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

  const getBase64Image = (url) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = function () {
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

  const generatePDF = async () => {
    const doc = new jsPDF();
    const logoData = await getBase64Image('/litties.png');

    const groupedData = data.reduce((acc, curr) => {
      const key = `${curr.empId}_${curr.name}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {});

    let pageIndex = 0;

    for (const key in groupedData) {
      if (pageIndex > 0) doc.addPage();

      const [empId, empName] = key.split('_');
      const records = groupedData[key].filter((record) => {
        const recDate = new Date(record.date);
        return (!dateFrom || dateFrom <= recDate) && (!dateTo || recDate <= dateTo);
      });

      const rows = records.map((a) => {
        const punchIn = a.punchIn ? new Date(a.punchIn).toLocaleTimeString() : '';
        const punchOut = a.punchOut ? new Date(a.punchOut).toLocaleTimeString() : '';
        let timeDiff = '';
        let dayType = '';

        if (a.punchIn && a.punchOut) {
          const inTime = new Date(a.punchIn);
          const outTime = new Date(a.punchOut);
          const diffMs = outTime - inTime;
          const hours = Math.floor(diffMs / 3600000);
          const minutes = Math.floor((diffMs % 3600000) / 60000);
          timeDiff = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          const timeInHours = diffMs / (1000 * 60 * 60);
          dayType = timeInHours >= 6 ? 1.0 : 0.5;
        } else {
          dayType = 0.0;
        }

        return [a.date, a.empId, a.name, punchIn, punchOut, timeDiff, dayType.toString()];
      });

      const totalDays = rows.reduce((acc, row) => acc + parseFloat(row[6]), 0).toFixed(1);
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

    doc.save('attendance.pdf');
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
                <input value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="Employee ID" required className={styles.input} />
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className={styles.input} />
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className={styles.input} />
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
      </div>
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
                let timeDiff = '';
                let dayType = '';
                if (a.punchIn && a.punchOut) {
                  const inTime = new Date(a.punchIn);
                  const outTime = new Date(a.punchOut);
                  const diffMs = outTime - inTime;
                  const hours = Math.floor(diffMs / 3600000);
                  const minutes = Math.floor((diffMs % 3600000) / 60000);
                  timeDiff = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                  const timeInHours = diffMs / (1000 * 60 * 60);
                  dayType = timeInHours >= 6 ? '1.0' : '0.5';
                } else {
                  dayType = '0.0';
                }

                 return (
                   <tr key={i} className={styles.tableRow}>
                     <td>{a.empId}</td>
                    <td>{a.name}</td>
                    <td>{a.date}</td>
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
  );
}
