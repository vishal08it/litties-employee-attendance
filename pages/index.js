"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Footer from '@/components/Footer';
import styles from '../styles/Home.module.css';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const ToastContainer = dynamic(() => import('react-toastify').then(mod => mod.ToastContainer), { ssr: false });
const LoginModal = dynamic(() => import('@/components/LoginModal'), { ssr: false });
const RegisterModal = dynamic(() => import('@/components/RegisterModal'), { ssr: false });
const ForgotPasswordModal = dynamic(() => import('@/components/ForgotPasswordModal'), { ssr: false });

export async function getServerSideProps() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/getFeedbacks`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
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
  const [clientReady, setClientReady] = useState(false);

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

  useEffect(() => {
    setClientReady(true);
  }, []);

  const login = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();

    if (res.ok) {
      toast.success('Login successful!', { autoClose: 500 });

      localStorage.setItem('role', data.role);
      localStorage.setItem('empId', data.empId);
      localStorage.setItem('name', data.name || '');
      localStorage.setItem('image', data.image || '');
      localStorage.setItem('emailId', data.emailId || '');
      localStorage.setItem('mobileNumber', data.mobileNumber || '');

      if (data.mobileNumber) {
        localStorage.removeItem(`specialOfferSeen_${data.mobileNumber}`);
      }

      setTimeout(() => {
        router.push(data.destination);
      }, 600);
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
       // toast.success('Image uploaded!');
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

  if (!registerForm.image) {
    alert('Please upload an image.');
    return;
  }

  const cleanMobile = registerForm.mobileNumber.replace(/\D/g, '').slice(-10);

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...registerForm, mobileNumber: cleanMobile }),
  });

  const data = await res.json();
  

  if (res.ok) {
    // ✅ Show success toast
    toast.success('Registered successfully!', { autoClose: 500 });

    // ✅ Send WhatsApp message silently
    try {
      await fetch('/api/sendWhatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: registerForm.name,
          userPhone: cleanMobile,
          userId:registerForm.mobileNumber,
          userPassword:registerForm.password
        }),
      });
    } catch (err) {
      console.error('❌ WhatsApp error:', err.message);
    }

    // ✅ Refresh page after short delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } else {
    alert(data.message || 'Registration failed');
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
          <Image
            src={`${fb.image}?w=120&h=120&c_fill&q_auto`}
            width={120}
            height={120}
            alt={fb.name}
            className={styles.squareImage}
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

      <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/litties.png" alt="Logo" width={60} height={60} priority />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Litties Multi Cuisine Family Restaurant</h1>
          <p className={styles.address}>Shanti Prayag, Lalganj, Sasaram - 821115</p>
        </div>
        <button onClick={() => setShowLogin(true)} className={styles.loginButton}>Login</button>
      </header>

      {showLogin && (
        <LoginModal
          {...{
            setShowLogin,
            setShowRegister,
            setShowForgotPassword,
            login,
            identifier,
            setIdentifier,
            password,
            setPassword
          }}
        />
      )}

      {showRegister && (
        <RegisterModal
          {...{
            setShowRegister,
            register,
            registerForm,
            setRegisterForm,
            handleImageUpload,
            uploading
          }}
        />
      )}

      {showForgotPassword && (
        <ForgotPasswordModal
          {...{
            setShowForgotPassword,
            handleForgotPassword,
            email,
            setEmail,
            message
          }}
        />
      )}

      {clientReady && (
        <section className={styles.testimonials}>
          <h2 className={styles.testimonialTitle}>What Our Customers Say</h2>
          <div className={styles.testimonialViewport}>
            <div className={styles.testimonialScroller}>
              {FeedbackBoxes}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}