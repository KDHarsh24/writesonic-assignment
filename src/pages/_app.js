import '../styles/globals.css';
import { useEffect } from 'react';
import { trackUser } from '../lib/tracker';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    trackUser();
  }, []);

  return <Component {...pageProps} />;
}
