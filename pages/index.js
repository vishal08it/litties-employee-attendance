
import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import Image from 'next/image';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
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
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
        </div>
        <h1 className={styles.title}>Litties Multi Cuisine Family Restaurant</h1>
        <button onClick={() => setShowLogin(true)} className={styles.loginButton}>Login</button>
      </header>

      {showLogin && (
        <>
          <div className={styles.overlay} onClick={() => setShowLogin(false)} />
          <div className={styles.popup}>
            <button className={styles.closeButton} onClick={() => setShowLogin(false)}>&times;</button>
            <h2>Login</h2>
            <form onSubmit={login}>
              <input type="text" placeholder="Employee ID" value={empId} onChange={(e) => setEmpId(e.target.value)} required className={styles.input} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={styles.input} />
              <button type="submit" className={styles.submitButton}>Login</button>
            </form>
          </div>
        </>
      )}

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
          <img src="/vikas.jpg" className={styles.squareImage} alt="Vikas Kumar" />
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
          <img src="/vishal.jpeg" className={styles.squareImage} alt="Vishal Kumar" />
        </div>
      </section>
    </div>
  );
}
