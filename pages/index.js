'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import '@/styles/globals.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [registerForm, setRegisterForm] = useState({
    name: '',
    emailId: '',
    mobileNumber: '',
    password: '',
  });

  const router = useRouter();

  // ✅ Redirect if already logged in
  useEffect(() => {
    const mobile = localStorage.getItem('mobileNumber');
    const role = localStorage.getItem('role');
    if (mobile) {
      router.replace(role === 'admin' ? '/admin' : '/itemspage');
    }
  }, []);

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Login successful!', { autoClose: 2000 });
        localStorage.setItem('role', data.role);
        localStorage.setItem('name', data.name || '');
        localStorage.setItem('image', data.image || '');
        localStorage.setItem('emailId', data.emailId || '');
        if (data.empId) localStorage.setItem('empId', data.empId);
        if (data.mobileNumber) localStorage.setItem('mobileNumber', data.mobileNumber);
        setTimeout(() => router.push(data.destination), 2500);
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const register = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Registered successfully!');
        setRegisterForm({ name: '', password: '', emailId: '', mobileNumber: '' });
        setTimeout(() => window.location.href = '/', 2500);
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch {
      toast.error('Registration failed. Try again.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const attemptsData = JSON.parse(localStorage.getItem('forgotPasswordAttemptsByEmail')) || {};
    const now = new Date();
    const userAttempts = attemptsData[email] || { count: 0, timestamp: null };

    if (userAttempts.timestamp && new Date(userAttempts.timestamp).getTime() > now.getTime()) {
      setMessage('Too many attempts. Try again after 24 hours.');
      setTimeout(() => { window.location.href = '/'; }, 2000);
      return;
    }

    if (userAttempts.count >= 3) {
      const nextDay = new Date();
      nextDay.setHours(now.getHours() + 24);
      attemptsData[email] = { count: 3, timestamp: nextDay };
      localStorage.setItem('forgotPasswordAttemptsByEmail', JSON.stringify(attemptsData));
      setMessage('Too many attempts. Try again after 24 hours.');
      setTimeout(() => { window.location.href = '/'; }, 2000);
      return;
    }

    try {
      const res = await fetch('/api/forgotpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || 'Something went wrong');

      attemptsData[email] = { count: userAttempts.count + 1, timestamp: null };
      localStorage.setItem('forgotPasswordAttemptsByEmail', JSON.stringify(attemptsData));
      setTimeout(() => { window.location.href = '/'; }, 2000);
    } catch {
      setMessage('Failed to send request');
      attemptsData[email] = { count: userAttempts.count + 1, timestamp: null };
      localStorage.setItem('forgotPasswordAttemptsByEmail', JSON.stringify(attemptsData));
      setTimeout(() => { window.location.href = '/'; }, 2000);
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer position="top-right" theme="colored" />

      <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Litties Multi Cuisine Family Restaurant</h1>
          <p className={styles.address}>Shanti Prayag, Lalganj, Sasaram - 821115</p>
        </div>
        <div>
          <button onClick={() => setShowLogin(true)} className={styles.loginButton}>Login</button>
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <>
          <div className={styles.overlay1} onClick={() => setShowLogin(false)} />
          <div className={styles.popup1}>
            <button className={styles.closeButton1} onClick={() => setShowLogin(false)}>&times;</button>
            <div style={{ textAlign: 'center' }}>
              <Image src="/litties.png" alt="Logo" width={60} height={60} />
              <h2>Login</h2>
            </div>
            <form onSubmit={login}>
              <input type="text" placeholder="Employee ID or Mobile Number" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className={styles.input1} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={styles.input1} />
              <button type="submit" className={styles.submitButton1}>Login</button>
              <p style={{ textAlign: 'center' }}>
                <span onClick={() => { setShowLogin(false); setShowRegister(true); }} style={{ color: '#0070f3', cursor: 'pointer' }}>Create New Account</span>
              </p>
              <p style={{ textAlign: 'center' }}>
                <span onClick={() => { setShowLogin(false); setShowForgotPassword(true); }} style={{ color: '#0070f3', cursor: 'pointer' }}>Forgot Password?</span>
              </p>
            </form>
          </div>
        </>
      )}

      {/* Register Modal */}
      {showRegister && (
        <>
          <div className={styles.overlay1} onClick={() => setShowRegister(false)} />
          <div className={styles.popup1}>
            <button className={styles.closeButton1} onClick={() => setShowRegister(false)}>&times;</button>
            <div style={{ textAlign: 'center' }}>
              <Image src="/litties.png" alt="Logo" width={60} height={60} />
              <h2>Register</h2>
            </div>
            <form onSubmit={register}>
              <input type="text" placeholder="Name" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} required className={styles.input1} />
              <input type="email" placeholder="Email" value={registerForm.emailId} onChange={(e) => setRegisterForm({ ...registerForm, emailId: e.target.value })} required className={styles.input1} />
              <input type="text" placeholder="Mobile Number" value={registerForm.mobileNumber} onChange={(e) => setRegisterForm({ ...registerForm, mobileNumber: e.target.value })} required className={styles.input1} />
              <input type="password" placeholder="Password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required className={styles.input1} />
              <button type="submit" className={styles.submitButton1}>Register</button>
            </form>
          </div>
        </>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'linear-gradient(to bottom, #f7941d, #ffffff 30%, #009245)', borderRadius: '20px', padding: '30px', width: '90%', maxWidth: '400px', position: 'relative', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
            <button onClick={() => setShowForgotPassword(false)} style={{ position: 'absolute', top: '10px', right: '15px', background: 'transparent', border: 'none', fontSize: '24px', fontWeight: 'bold', color: '#000', cursor: 'pointer' }}>&times;</button>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <Image src="/litties.png" alt="Logo" width={60} height={60} />
            </div>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Forgot Password</h2>
            <form onSubmit={handleForgotPassword}>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', marginBottom: '15px', border: 'none', borderRadius: '10px', boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)', fontSize: '16px' }} />
              <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(to right, orange, green)', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>Send Password</button>
            </form>
            {message && <p style={{ marginTop: '15px', textAlign: 'center', color: '#000', fontWeight: '500' }}>{message}</p>}
          </div>
        </div>
      )}

      {/* Testimonials */}
       <section className={styles.testimonials}>
        <h2>What Our Customers Say</h2>

        {/* 1st Testimonial: Text left, Image right */}
        <div className={styles.testimonialBox}>
          <div className={styles.testimonialText}>
            <p className={styles.name}>Mithilesh Kumar</p>
            <p className={styles.review}>
              "The ambiance of Litties is unmatched. The food always hits the right spot, and their service makes me feel like royalty. Truly, this place has become my second home for weekend dinners with my family."
            </p>
          </div>
          <img src="/mithilesh.jpg" className={styles.squareImage} alt="Mithilesh Kumar" />
        </div>

        {/* 2nd Testimonial: Image left, Text right */}
        <div className={styles.testimonialBox}>
          <img src="/vikas.png" className={styles.squareImage} alt="Vikas Kumar" />
          <div className={styles.testimonialText}>
            <p className={styles.name}>Vikas Kumar</p>
            <p className={styles.review}>
              "From the moment I stepped into Litties, I was impressed. Their biryani and butter chicken are out of this world. It's a place I now recommend to all my friends."
            </p>
          </div>
        </div>

        {/* 3rd Testimonial: Text left, Image right */}
        <div className={styles.testimonialBox}>
          <div className={styles.testimonialText}>
            <p className={styles.name}>Vishal Kumar</p>
            <p className={styles.review}>
              "Litties stands out because of their consistent quality and innovative flavors. Whether it’s a casual dinner or a celebration, Litties delivers every time."
            </p>
          </div>
          <img src="/vishal.jpg" className={styles.squareImage} alt="Vishal Kumar" />
        </div>

        
        {/* 4th Testimonial: Image left, Text right */}
        <div className={styles.testimonialBox}>
          <img src="/neema.JPG" className={styles.squareImage} alt="Neema kumari" />
          <div className={styles.testimonialText}>
            <p className={styles.name}>Neema Kumari</p>
            <p className={styles.review}>
              "From starters to desserts, everything was on point. The multi-cuisine variety is perfect for our whole family. Clean and cozy seating too!"
            </p>
          </div>
        </div>
        
         {/* 5th Testimonial: Text left, Image right */}
        <div className={styles.testimonialBox}>
          <div className={styles.testimonialText}>
            <p className={styles.name}>Manish Kumar</p>
            <p className={styles.review}>
              "Absolutely loved the food! The flavors were authentic and the portions generous. The service was warm and welcoming. Will definitely come back again with friends!"
            </p>
          </div>
          <img src="/manish.jpg" className={styles.squareImage} alt="Manish Kumar" />
        </div>

         {/* 6th Testimonial: Image left, Text right */}
        <div className={styles.testimonialBox}>
          <img src="/seema.jpg" className={styles.squareImage} alt="Seema Kumari" />
          <div className={styles.testimonialText}>
            <p className={styles.name}>Seema Kumari</p>
            <p className={styles.review}>
              "The biryani here is simply unmatched. Full of flavor, perfectly cooked rice, and tender meat. 10/10 experience every time."
            </p>
          </div>
        </div>

         {/* 7th Testimonial: Text left, Image right */}
        <div className={styles.testimonialBox}>
          <div className={styles.testimonialText}>
            <p className={styles.name}>Reema Kumari</p>
            <p className={styles.review}>
              "Delicious food, quick service, and such a friendly vibe. Litties truly feels like a family restaurant in every sense. Keep it up!"
            </p>
          </div>
          <img src="/reema.jpg" className={styles.squareImage} alt="Reema Kumari" />
        </div>

         {/* 8th Testimonial: Image left, Text right */}
        <div className={styles.testimonialBox}>
          <img src="/renu.jpg" className={styles.squareImage} alt="Renu Kumari" />
          <div className={styles.testimonialText}>
            <p className={styles.name}>Renu Kumari</p>
            <p className={styles.review}>
              "Every visit to Litties feels special. The food is consistently delicious and the menu has something for everyone. Love the Chinese options too!"
            </p>
          </div>
        </div>

       
      </section>
    </div>
  );
}
