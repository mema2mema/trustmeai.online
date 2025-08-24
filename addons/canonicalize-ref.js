(function () {
  try {
    const url = new URL(window.location.href);
    let ref = url.searchParams.get('ref');
    if (!ref && window.location.hash.includes('?')) {
      const hashQ = new URLSearchParams(window.location.hash.split('?')[1] || '');
      ref = hashQ.get('ref');
    }
    if (ref) {
      try { localStorage.setItem('tm_ref', ref); } catch (e) {}
    }
    const onReg = url.pathname.replace(/\/+$, '') === '/reg';
    const hasHash = !!window.location.hash;
    if (onReg || !hasHash) {
      const target = `${url.origin}/#home`;
      if (window.location.href !== target) window.location.replace(target);
    }
  } catch (e) {
    console.warn('canonicalize-ref.js error', e);
  }
})();
