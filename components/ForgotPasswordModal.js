import Image from 'next/image';
import styles from '../styles/Home.module.css';

export default function ForgotPasswordModal({
  setShowForgotPassword,
  handleForgotPassword,
  email,
  setEmail,
  message
}) {
  return (
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
  );
}
