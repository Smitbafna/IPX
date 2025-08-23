import { useEffect, useState } from 'react';
import { getPrincipal, isAuthenticated, login, logout } from './auth';

export function useInternetIdentity() {
  const [principal, setPrincipal] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    async function fetchIdentity() {
      setLoading(true);
      const auth = await isAuthenticated();
      setAuthenticated(auth);
      if (auth) {
        const principalVal = await getPrincipal();
        if (mounted) setPrincipal(principalVal);
      } else {
        if (mounted) setPrincipal(null);
      }
      setLoading(false);
    }
    fetchIdentity();
    return () => { mounted = false; };
  }, []);

  const doLogin = async () => {
    await login();
    const auth = await isAuthenticated();
    setAuthenticated(auth);
    if (auth) {
      const principalVal = await getPrincipal();
      setPrincipal(principalVal);
    }
  };

  const doLogout = async () => {
    await logout();
    setAuthenticated(false);
    setPrincipal(null);
  };

  return {
    principal,
    isAuthenticated: authenticated,
    loading,
    login: doLogin,
    logout: doLogout,
  };
}
