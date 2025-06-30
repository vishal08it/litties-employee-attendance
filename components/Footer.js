import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/Home.module.css';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setStatus(data.message);
      setEmail('');
      setTimeout(() => setStatus(''), 2000);
    } catch (err) {
      setStatus('Subscription failed');
    }
  };

  return (
    <footer className={styles.footer}>
  <div className={styles.footerWrapper}>

    {/* Single Row: Follow us + icons */}
    <div className={styles.followRow}>
      <h3 className={styles.followText}>Follow us</h3>
      <Link href="https://www.youtube.com/@Litties-v5h" target="_blank">
        <Image src="/youtube.avif" alt="YouTube" width={36} height={36} className={styles.iconImage} />
      </Link>
      <Link href="https://www.facebook.com/profile.php?id=61558178916251" target="_blank">
        <Image src="/facebook.png" alt="Facebook" width={36} height={36} className={styles.iconImage} />
      </Link>
      <Link href="https://wa.me/your-number" target="_blank">
        <Image src="/whatsapp.jpg" alt="WhatsApp" width={36} height={36} className={styles.iconImage} />
      </Link>
      <Link href="https://www.instagram.com/litties_restaurant/" target="_blank">
        <Image src="/instagram.png" alt="Instagram" width={36} height={36} className={styles.iconImage} />
      </Link>
    </div>

    {/* Right side: Subscribe box */}
    <div className={styles.subscribeCorner}>
      <h4>Subscribe for Special Offers</h4>
      <form onSubmit={handleSubscribe} className={styles.subscribeForm}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={styles.subscribeInput}
          required
        />
        <button type="submit" className={styles.subscribeButton}>Subscribe</button>
      </form>
      {status && <p className={styles.subscribeStatus}>{status}</p>}
    </div>
  </div>

  <p className={styles.copyright}>
    <strong>Litties Multi Cuisine Family Restaurant</strong></p>
  </footer>

  );
}
