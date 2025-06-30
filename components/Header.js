import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '@/styles/Home.module.css';

export default function Header({
  userName,
  cart = [],
  setCartVisible,
  logout,
  onLoginClick,
  showBackButton = false,
  backButtonText = 'Back to Menu',
  backButtonLink = '/itemspage',
  showLogoutOnly = false // ✅ New flag for just Logout button layout
}) {
  const router = useRouter();
  const isLoggedIn = !!userName;

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Image src="/litties.png" alt="Litties Logo" width={60} height={60} priority />
      </div>

      <div className={styles.headerText}>
        <h1 className={styles.title}>Litties Multi Cuisine Family Restaurant</h1>
        <p className={styles.address}>Shanti Prayag, Lalganj, Sasaram - 821115</p>
      </div>

      <div className={styles.rightSection}>
        {showLogoutOnly ? (
          <button onClick={logout} className={styles.logoutButton}>Logout</button>
        ) : showBackButton ? (
          <button onClick={() => router.push(backButtonLink)} className={styles.logoutButton}>
            {backButtonText}
          </button>
        ) : isLoggedIn ? (
          <>
            <span
              onClick={() => setCartVisible(true)}
              style={{ marginRight: '1rem', cursor: 'pointer' }}
            >
              🛒 Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
            </span>
            <Link href="/profile"><strong>{userName}</strong></Link>
            <button onClick={logout} className={styles.logoutButton}>Logout</button>
          </>
        ) : (
          <button onClick={onLoginClick} className={styles.loginButton}>Login</button>
        )}
      </div>
    </header>
  );
}
