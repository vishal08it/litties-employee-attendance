'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import '@/styles/globals.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [registerForm, setRegisterForm] = useState({
    name: '',
    emailId: '',
    mobileNumber: '',
    password: '',
  });

  const router = useRouter();

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

        setTimeout(() => {
          router.push(data.destination);
        }, 2500);
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    }
  };

 const register = async (e) => {
  e.preventDefault();

  const body = {
    name: registerForm.name,
    password: registerForm.password,
    emailId: registerForm.emailId,
    mobileNumber: registerForm.mobileNumber,
  };

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success('Registered successfully!');
      setRegisterForm({
        name: '',
        password: '',
        emailId: '',
        mobileNumber: '',
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 2500);
    } else {
      toast.error(data.message || 'Registration failed');
    }
  } catch (err) {
    console.error('Frontend Registration Error:', err);
    toast.error('Registration failed. Try again.');
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
          <button onClick={() => setShowRegister(true)} className={styles.loginButton}>Register</button>
        </div>
      </header>

      {/* Login Popup */}
      {showLogin && (
        <>
          <div className={styles.overlay1} onClick={() => setShowLogin(false)} />
          <div className={styles.popup1}>
            <button className={styles.closeButton1} onClick={() => setShowLogin(false)}>&times;</button>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
            </div>
            <h2>Login</h2>
            <form onSubmit={login}>
              <input
                type="text"
                placeholder="Employee ID or Mobile Number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className={styles.input1}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input1}
              />
              <button type="submit" className={styles.submitButton1}>Login</button>
            </form>
          </div>
        </>
      )}

      {/* Register Popup */}
      {showRegister && (
        <>
          <div className={styles.overlay1} onClick={() => setShowRegister(false)} />
          <div className={styles.popup1}>
            <button className={styles.closeButton1} onClick={() => setShowRegister(false)}>&times;</button>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
            </div>
            <h2>Register</h2>
            <form onSubmit={register}>
              <input
                type="text"
                placeholder="Name"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                required
                className={styles.input1}
              />
              <input
                type="email"
                placeholder="Email"
                value={registerForm.emailId}
                onChange={(e) => setRegisterForm({ ...registerForm, emailId: e.target.value })}
                required
                className={styles.input1}
              />
              <input
                type="text"
                placeholder="Mobile Number"
                value={registerForm.mobileNumber}
                onChange={(e) => setRegisterForm({ ...registerForm, mobileNumber: e.target.value })}
                required
                className={styles.input1}
              />
              <input
                type="password"
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
                className={styles.input1}
              />
              <button type="submit" className={styles.submitButton1}>Register</button>
            </form>
          </div>
        </>
      )}

      {/* Testimonials (unchanged) */}
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
