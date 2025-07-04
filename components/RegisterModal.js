import Image from 'next/image';
import styles from '../styles/Home.module.css';

export default function RegisterModal({
  setShowRegister,
  register,
  registerForm,
  setRegisterForm,
  handleImageUpload,
  uploading
}) {
  return (
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
          {registerForm.image && (
            <img src={registerForm.image} alt="Preview" style={{ width: 60, height: 60, borderRadius: '50%', margin: '8px auto' }} />
          )}
          <button type="submit" className={styles.submitButton1}>Register</button>
        </form>
      </div>
    </>
  );
}
