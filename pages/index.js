"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Footer from '@/components/Footer';
import Header from '../components/Header';

import styles from '../styles/Home.module.css';
import 'react-toastify/dist/ReactToastify.css';

const ToastContainer = dynamic(() => import('react-toastify').then(mod => mod.ToastContainer), { ssr: false });
import { toast } from 'react-toastify';

export async function getServerSideProps() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/getFeedbacks`);
    const data = await res.json();
    return { props: { initialFeedbacks: data.feedbacks || [] } };
  } catch {
    return { props: { initialFeedbacks: [] } };
  }
}

export default function Home({ initialFeedbacks }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [feedbackList, setFeedbackList] = useState(initialFeedbacks);
  const [uploading, setUploading] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    name: '', emailId: '', mobileNumber: '', password: '', image: ''
  });

  const router = useRouter();

  const initialsFromName = useCallback((name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  }, []);

  useEffect(() => {
    const mobile = localStorage.getItem('mobileNumber');
    const role = localStorage.getItem('role');
    if (mobile) {
      router.replace(role === 'admin' ? '/admin' : '/itemspage');
    }
  }, [router]);

  const login = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();

    if (res.ok) {
      toast.success('Login successful!', { autoClose: 1500 });

      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name || '');
      localStorage.setItem('image', data.image || '');
      localStorage.setItem('emailId', data.emailId || '');
      localStorage.setItem('mobileNumber', data.mobileNumber || '');

      if (data.mobileNumber) {
        localStorage.removeItem(`specialOfferSeen_${data.mobileNumber}`);
      }

      router.push(data.destination);
    } else {
      toast.error(data.message || 'Login failed');
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'litties_unsigned');
    setUploading(true);
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/depov4b4l/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setRegisterForm(prev => ({ ...prev, image: data.secure_url }));
        toast.success('Image uploaded!');
      } else {
        toast.error('Image upload failed');
      }
    } catch {
      toast.error('Upload error');
    } finally {
      setUploading(false);
    }
  };

  const register = async (e) => {
    e.preventDefault();
    if (!registerForm.image) return toast.error('Please upload an image.');
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerForm),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success('Registered successfully!');
      setRegisterForm({ name: '', emailId: '', mobileNumber: '', password: '', image: '' });
      router.replace('/');
    } else {
      toast.error(data.message || 'Registration failed');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/forgotpassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(data.message);
  };

  const FeedbackBoxes = useMemo(() =>
    feedbackList.map((fb, i) => (
      <div className={styles.testimonialBox} key={i} style={{ flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}>
        <div className={styles.testimonialText}>
          <p className={styles.name}>
            {fb.name}
            <span style={{ marginLeft: 8 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} style={{ color: s <= fb.rating ? 'gold' : '#ccc', fontSize: 18, marginLeft: 2 }}>★</span>
              ))}
            </span>
          </p>
          <p className={styles.review}>“{fb.feedback}”</p>
        </div>
        {fb.image ? (
          <img
            src={`${fb.image}?w=120&h=120&c_fill&q_auto`}
            className={styles.squareImage}
            alt={fb.name}
            loading="lazy"
            onError={(e) => (e.currentTarget.src = '/litties.png')}
          />
        ) : (
          <div className={styles.squareImage} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#ccc', color: '#fff', fontWeight: 'bold', fontSize: '20px'
          }}>
            {initialsFromName(fb.name)}
          </div>
        )}
      </div>
    )), [feedbackList, initialsFromName]);

  return (
    <div className={styles.container}>
      <ToastContainer position="top-right" theme="colored" />
 <Header onLoginClick={() => setShowLogin(true)} />
  <div style={{ marginTop: '70px' }}></div>
      {/* <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/litties.png" alt="Logo" width={60} height={60} priority />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Litties Multi Cuisine Family Restaurant</h1>
          <p className={styles.address}>Shanti Prayag, Lalganj, Sasaram - 821115</p>
        </div>
        <button onClick={() => setShowLogin(true)} className={styles.loginButton}>Login</button>
      </header> */}

      {/* === Login Modal === */}
      {showLogin && (
        <>
          <div className={styles.overlay1} onClick={() => setShowLogin(false)} />
          <div className={styles.popup1}>
            <Image src="/litties.png" alt="Logo" width={60} height={60} style={{ display: 'block', margin: '0 auto 10px auto' }} />
            <button className={styles.closeButton1} onClick={() => setShowLogin(false)}>&times;</button>
            <h2>Login</h2>
            <form onSubmit={login}>
              <input className={styles.input1} placeholder="ID or Mobile" value={identifier} onChange={e => setIdentifier(e.target.value)} required />
              <input className={styles.input1} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="submit" className={styles.submitButton1}>Login</button>
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span style={{ cursor: 'pointer', color: '#0070f3' }} onClick={() => { setShowLogin(false); setShowRegister(true); }}>Register</span> |{' '}
                <span style={{ cursor: 'pointer', color: '#0070f3' }} onClick={() => { setShowLogin(false); setShowForgotPassword(true); }}>Forgot?</span>
              </div>
            </form>
          </div>
        </>
      )}

      {/* === Register Modal === */}
      {showRegister && (
        <>
          <div className={styles.overlay1} onClick={() => setShowRegister(false)} />
          <div className={styles.popup1}>
            <Image src="/litties.png" alt="Logo" width={60} height={60} style={{ display: 'block', margin: '0 auto 10px auto' }} />
            <button className={styles.closeButton1} onClick={() => setShowRegister(false)}>&times;</button>
            <h2>Register</h2>
            <form onSubmit={register}>
              <input className={styles.input1} placeholder="Name" value={registerForm.name} onChange={e => setRegisterForm(prev => ({ ...prev, name: e.target.value }))} required />
              <input className={styles.input1} type="email" placeholder="Email" value={registerForm.emailId} onChange={e => setRegisterForm(prev => ({ ...prev, emailId: e.target.value }))} required />
              <input className={styles.input1} placeholder="Mobile" value={registerForm.mobileNumber} onChange={e => setRegisterForm(prev => ({ ...prev, mobileNumber: e.target.value }))} required />
              <input className={styles.input1} type="password" placeholder="Password" value={registerForm.password} onChange={e => setRegisterForm(prev => ({ ...prev, password: e.target.value }))} required />
              <input type="file" className={styles.input1} accept="image/*" onChange={e => handleImageUpload(e.target.files[0])} />
              {uploading && <p>Uploading image...</p>}
              {registerForm.image && <img src={registerForm.image} alt="Preview" style={{ width: 60, height: 60, borderRadius: '50%', margin: '8px auto' }} />}
              <button type="submit" className={styles.submitButton1}>Register</button>
            </form>
          </div>
        </>
      )}

      {/* === Forgot Password Modal === */}
      {showForgotPassword && (
        <div className={styles.overlay1}>
          <div className={styles.popup1}>
            <Image src="/litties.png" alt="Logo" width={60} height={60} style={{ display: 'block', margin: '0 auto 10px auto' }} />
            <button className={styles.closeButton1} onClick={() => setShowForgotPassword(false)}>&times;</button>
            <h2>Forgot Password</h2>
            <form onSubmit={handleForgotPassword}>
              <input className={styles.input1} type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} required />
              <button type="submit" className={styles.submitButton1}>Send Password</button>
            </form>
            {message && <p style={{ textAlign: 'center', marginTop: 10 }}>{message}</p>}
          </div>
        </div>
      )}

      {/* === Testimonials Section === */}
      <section className={styles.testimonials}>
        <h2 className={styles.testimonialTitle}>What Our Customers Say</h2>
        <div className={styles.testimonialViewport}>
          <div className={styles.testimonialScroller}>
            {FeedbackBoxes}
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
}
