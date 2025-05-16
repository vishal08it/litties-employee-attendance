import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

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
    <div style={{ padding: '2rem', position: 'relative' }}>
      <h2>Admin Dashboard</h2>
      <button onClick={logout} style={{ position: 'absolute', right: 20, top: 20 }}>
        Logout
      </button>

      <button onClick={() => setShowForm(true)} style={{ margin: '1rem 0' }}>
        Add New Employee
      </button>

      {/* Modal Form */}
      {showForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%',
          height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
          justifyContent: 'center', alignItems: 'center',
        }}>
          <div style={{
            background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '300px',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)'
          }}>
            <h3>Add New Employee</h3>
            <form onSubmit={addEmployee}>
              <input
                placeholder="Employee ID"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                required
              /><br /><br />
              <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              /><br /><br />
              <input
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              /><br /><br />
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select><br /><br />
              <button type="submit">Submit</button>{' '}
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <h3>Attendance Records</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Emp ID</th>
            <th>Date</th>
            <th>Punch In</th>
            <th>Punch Out</th>
            <th>Time Diff</th>
          </tr>
        </thead>
        <tbody>
          {data.map((a, i) => (
            <tr key={i}>
              <td>{a.empId}</td>
              <td>{a.date}</td>
              <td>{a.punchIn ? new Date(a.punchIn).toLocaleTimeString() : ''}</td>
              <td>{a.punchOut ? new Date(a.punchOut).toLocaleTimeString() : ''}</td>
              <td>{a.timeDiff || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
