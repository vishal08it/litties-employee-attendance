// lib/withAdminAuth.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const withAdminAuth = (WrappedComponent) => {
  return function ProtectedComponent(props) {
    const router = useRouter();

    useEffect(() => {
      const role = localStorage.getItem('role');
      if (role !== 'admin') {
        router.replace('/');
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
};

export default withAdminAuth;
