import Image from 'next/image';
import styles from '../styles/Home.module.css';

export default function LoginModal({
  setShowLogin,
  setShowRegister,
  setShowForgotPassword,
  login,
  identifier,
  setIdentifier,
  password,
  setPassword
}) {
  return (
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
  );
}
