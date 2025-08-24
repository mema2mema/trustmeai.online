(function () {
  function getRef() {
    try { return localStorage.getItem('tm_ref') || ''; } catch (e) { return ''; }
  }
  function prefillRegister() {
    const ref = getRef();
    if (!ref) return;
    const input =
      document.querySelector('#registerInviteCode') ||
      document.querySelector('[name="invite_code"]') ||
      document.querySelector('[data-invite-input]');
    if (input && !input.value) {
      input.value = ref;
      input.setAttribute('data-autofilled', 'true');
    }
  }
  function setupInvitePage() {
    let ref = '';
    try { ref = localStorage.getItem('tm_invite_code') || getRef() || 'TMI8K'; } catch (e) { ref = 'TMI8K'; }
    const link = `${location.origin}/reg?ref=${encodeURIComponent(ref)}`;
    const linkInput = document.querySelector('[data-invite-link]');
    if (linkInput) linkInput.value = link;
    const codeInput = document.querySelector('[data-invite-code]');
    if (codeInput) codeInput.value = ref;
    const qrCanvas = document.querySelector('#inviteQr, [data-invite-qr]');
    if (qrCanvas) {
      if (window.QRCode && typeof QRCode.toCanvas === 'function') {
        QRCode.toCanvas(qrCanvas, link, { width: 220 }, () => {});
      } else {
        try {
          const ctx = qrCanvas.getContext('2d');
          ctx.clearRect(0,0,qrCanvas.width,qrCanvas.height);
          ctx.fillStyle = '#1f2937'; ctx.fillRect(0,0,qrCanvas.width,qrCanvas.height);
          ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif';
          ctx.fillText('QR library not loaded.', 10, 25);
          ctx.fillText('Link:', 10, 50);
          ctx.fillText(link, 10, 70);
        } catch(e) {}
        console.warn('QRCode library not found. Load vendor/qrcode.min.js or CDN.');
      }
    }
  }
  document.addEventListener('DOMContentLoaded', () => { prefillRegister(); setupInvitePage(); });
})();
