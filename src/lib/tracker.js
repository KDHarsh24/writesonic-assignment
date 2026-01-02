const TRACK_ENDPOINT = process.env.NEXT_PUBLIC_TRACK_ENDPOINT || 'https://visitstracker.vercel.app/track';

export const trackUser = async (opts = {}) => {
  try {
    if (typeof window === 'undefined') return; // Guard for SSR
    if (sessionStorage.getItem('tracked')) return;

    const payload = {
      userAgent: navigator.userAgent || '',
      url: window.location.href,
      referrer: document.referrer || null,
      language: navigator.language || null,
      timestamp: new Date().toISOString(),
      ...(opts.meta || {}),
    };

    await fetch(TRACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // help send on page unload
    });

    sessionStorage.setItem('tracked', 'true');
    // keep logs quiet in production; useful during development
    // if (process.env.NODE_ENV !== 'production') console.log('✅ trackUser sent', payload);
  } catch (err) {
    console.warn('trackUser error', err);
  }
};
