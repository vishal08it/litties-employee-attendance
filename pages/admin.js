import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '../styles/Home.module.css';

export default function Admin() {
  const [data, setData] = useState([]);
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [showForm, setShowForm] = useState(false);
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

  const addEmployee = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/add-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empId, name, password, role }),
    });

    const json = await res.json();
    alert(json.message);
    setEmpId('');
    setName('');
    setPassword('');
    setShowForm(false);
  };

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
        </div>
        <h1 className={styles.title}>Litties Multi Cuisine Family Restaurant</h1>
        <button
          onClick={logout}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: 'bold',
            border: 'none'
          }}
        >
          Logout
        </button>
      </header>

      <div style={{ padding: '2rem' }}>
        <h2 style={{ color: '#facc15' }}>Admin Dashboard</h2>
        <button onClick={() => setShowForm(true)} className={styles.loginButton}>
          Add New Employee
        </button>

        {showForm && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%',
            height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 999
          }}>
            <div style={{
              background: '#2e2a27', color: '#fff3e6', padding: '2rem', borderRadius: '12px', minWidth: '300px',
              boxShadow: '0 0 10px rgba(0,0,0,0.3)'
            }}>
              <h3 style={{ color: '#facc15' }}>Add New Employee</h3>
              <form onSubmit={addEmployee}>
                <input
                  placeholder="Employee ID"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  required
                  className={styles.input}
                /><br /><br />
                <input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={styles.input}
                /><br /><br />
                <input
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.input}
                /><br /><br />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={styles.input}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select><br /><br />
                <button type="submit" className={styles.submitButton}>Submit</button>{' '}
                <button type="button" onClick={() => setShowForm(false)} className={styles.loginButton}>Cancel</button>
              </form>
            </div>
          </div>
        )}

        <h2 style={{ color: '#facc15' }}>Attendance Records</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', backgroundColor: '#2e2a27', color: '#fff3e6', borderCollapse: 'collapse' ,textAlign: 'center'}}>
            <thead>
              <tr style={{ backgroundColor: '#3f3f46' }}>
                <th style={{ padding: '10px', border: '1px solid #555' }}>Emp ID</th>
                <th style={{ padding: '10px', border: '1px solid #555' }}>Date</th>
                <th style={{ padding: '10px', border: '1px solid #555' }}>Punch In</th>
                <th style={{ padding: '10px', border: '1px solid #555' }}>Punch Out</th>
                <th style={{ padding: '10px', border: '1px solid #555' }}>Time Diff</th>
                <th style={{ padding: '10px', border: '1px solid #555' }}>Day Type</th>
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
                  if (timeInHours >= 6) dayType = 'Full Day';
                  else if (timeInHours > 0) dayType = 'Half Day';
                } else {
                  dayType = 'Absent';
                }

                return (
                  <tr key={i} style={{ borderTop: '1px solid #444' }}>
                    <td style={{ padding: '8px', border: '1px solid #444' }}>{a.empId}</td>
                    <td style={{ padding: '8px', border: '1px solid #444' }}>{a.date}</td>
                    <td style={{ padding: '8px', border: '1px solid #444' }}>{a.punchIn ? new Date(a.punchIn).toLocaleTimeString() : ''}</td>
                    <td style={{ padding: '8px', border: '1px solid #444' }}>{a.punchOut ? new Date(a.punchOut).toLocaleTimeString() : ''}</td>
                    <td style={{ padding: '8px', border: '1px solid #444' }}>{timeDiff}</td>
                    <td style={{ padding: '8px', border: '1px solid #444' }}>{dayType}</td>
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
