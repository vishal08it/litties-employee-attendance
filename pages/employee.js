import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Employee() {
  const [status, setStatus] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');
    const n = localStorage.getItem('name');
    if (role !== 'employee') router.push('/');
    else setName(n);

    checkPunch();
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

  const punch = async () => {
    const empId = localStorage.getItem('empId');
    const res = await fetch('/api/punch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empId }),
    });
    await res.json();
    checkPunch();
  };

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Welcome {name}</h2>
      <button onClick={logout}>Logout</button><br /><br />
      {status === 'punchin' && <button onClick={punch}>Punch In</button>}
      {status === 'punchout' && <button onClick={punch}>Punch Out</button>}
      {status === 'done' && <p>You have completed today's attendance.</p>}
    </div>
  );
}
