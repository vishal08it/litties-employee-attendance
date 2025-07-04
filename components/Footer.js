// components/Footer.js
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import styles from '@/styles/Home.module.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setStatus(data.message);
      setEmail('');
      setTimeout(() => setStatus(''), 3000);
    } catch {
      setStatus('Subscription failed');
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.iconBlock}>
        <h4 className={styles.footerTitle}>Follow us</h4>
        <div className={styles.iconContainer}>
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
      </div>

      <div className={styles.subscribeCorner}>
        <h4 className={styles.footerTitle1}>Subscribe for Special Offers</h4>

        <form className={styles.subscribeForm} onSubmit={handleSubscribe}>
          <input
            className={styles.subscribeInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <button className={styles.subscribeButton}>Subscribe</button>
        </form>
        {status && <p className={styles.subscribeStatus}>{status}</p>}
      </div>

      <p className={styles.copyright}>Litties Multi Cuisine Family Restaurant</p>
    </footer>
  );
}
