import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const login = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empId, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('role', data.role);
      localStorage.setItem('empId', empId);
      localStorage.setItem('name', data.name || '');
      router.push(data.role === 'admin' ? '/admin' : '/employee');
    } else {
      alert(data.message || 'Login failed');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login</h2>
      <form onSubmit={login}>
        <input
          type="text"
          placeholder="Employee ID"
          value={empId}
          onChange={(e) => setEmpId(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
