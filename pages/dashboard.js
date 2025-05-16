import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [buttonLabel, setButtonLabel] = useState('');
  const router = useRouter();

  const empId = typeof window !== 'undefined' ? localStorage.getItem('empId') : '';
  const name = typeof window !== 'undefined' ? localStorage.getItem('name') : '';

  useEffect(() => {
    if (!empId) {
      router.push('/');
      return;
    }

    const checkPunch = async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/attendances');
      const data = await res.json();
      const record = data.find(a => a.empId === empId && a.date === today);

      if (!record) setButtonLabel('Punch In');
      else if (!record.punchOut) setButtonLabel('Punch Out');
      else setButtonLabel('Done for Today');
    };
    checkPunch();
  }, [empId, router]);

  const handlePunch = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const res = await fetch('/api/punch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ empId, latitude, longitude }),
        });
        const data = await res.json();
        alert(data.message);
        location.reload();
      },
      () => alert('Could not get your location')
    );
  };

  return (
    <div>
      <h2>Welcome {name}</h2>
      {buttonLabel !== 'Done for Today' ? (
        <button onClick={handlePunch}>{buttonLabel}</button>
      ) : (
        <p>You have already punched in and out today.</p>
      )}
    </div>
  );
}
