
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '../styles/Home.module.css';

export default function Employee() {
  const [status, setStatus] = useState('');
  const [name, setName] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');
    const storedName = localStorage.getItem('name');

    if (role !== 'employee') {
      router.push('/');
    } else {
      setName(storedName);
      startTypingMessage(storedName);
    }

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

    const message = status === 'punchin' ? 'Punched In Successfully!' : 'Punched Out Successfully!';
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(''), 3000);
  };

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  const startTypingMessage = () => {
    const fullText = ` your presence at Litties brings not just your hard work, but also your inspiring spirit. Your consistency, effort, and energy elevate everyone around you. Day after day, your commitment never goes unnoticed. You're not just an employee — you're a valued member of our family. Keep shining, keep pushing, and remember: Litties grows stronger because of people like you. We appreciate your dedication, your time, and most of all — your heart. Thank you for everything you do!`;

    let index = 0;
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

        <div style={{ textAlign: 'center', padding: '2rem' }}>
          {status === 'punchin' && <button className="submitButton" onClick={punch}>Punch In</button>}
          {status === 'punchout' && <button className="submitButton" onClick={punch}>Punch Out</button>}
          {status === 'done' && <p style={{ color: '#fff3e6' }}>You have completed today's attendance.</p>}
        </div>
        <button className="logoutButton" onClick={logout}>Logout</button>
      </header>

      <h2 style={{ color: '#eab308' }}>Welcome, {name}</h2>

      <p style={{
        color: '#fef08a',
        fontSize: '1.1rem',
        padding: '1rem 2rem',
        textAlign: 'center',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        minHeight: '160px',
        fontFamily: 'monospace',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {typedMessage}
      </p>

      {popupMessage && (
        <div className="popupMessage">
          {popupMessage}
        </div>
      )}
    </div>
  );
}
