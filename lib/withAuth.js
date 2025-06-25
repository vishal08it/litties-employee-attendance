import { useEffect } from 'react';
import { useRouter } from 'next/router';

const withAuth = (WrappedComponent) => {
  return function ProtectedComponent(props) {
    const router = useRouter();

    useEffect(() => {
      const mobile = localStorage.getItem('mobileNumber');
      if (!mobile) {
        router.replace('/'); // redirect to home/login if not logged in
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
